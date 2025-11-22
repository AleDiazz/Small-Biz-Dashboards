import { NextRequest, NextResponse } from 'next/server';
import { stripe, getTierFromPriceId } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Disable body parsing for webhook
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  const tier = session.metadata?.tier;

  if (!userId) {
    console.error('No userId in checkout session');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Create customer mapping for quick lookup
  await adminDb.collection('stripe_customers').doc(customerId).set({
    userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update user document in Firestore
  await adminDb.collection('users').doc(userId).update({
    subscriptionTier: tier || 'basic',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionStatus: 'active',
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Subscription activated for user ${userId}, tier: ${tier}`);
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const userId = await findUserByCustomerId(customerId);
  
  if (!userId) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  const tier = getTierFromPriceId(priceId);

  // Update user document
  await adminDb.collection('users').doc(userId).update({
    subscriptionTier: tier,
    subscriptionStatus: subscription.status,
    stripeSubscriptionId: subscription.id,
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Subscription updated for user ${userId}, status: ${subscription.status}`);
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const userId = await findUserByCustomerId(customerId);
  
  if (!userId) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Downgrade to basic tier (free)
  await adminDb.collection('users').doc(userId).update({
    subscriptionTier: 'basic',
    subscriptionStatus: 'canceled',
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Subscription canceled for user ${userId}`);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await findUserByCustomerId(customerId);
  
  if (!userId) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Update last payment date
  await adminDb.collection('users').doc(userId).update({
    lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
    subscriptionStatus: 'active',
  });

  console.log(`Payment succeeded for user ${userId}`);
}

// Handle failed payment
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const userId = await findUserByCustomerId(customerId);
  
  if (!userId) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Update subscription status
  await adminDb.collection('users').doc(userId).update({
    subscriptionStatus: 'past_due',
    subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Payment failed for user ${userId}`);
}

// Helper function to find user by Stripe customer ID
async function findUserByCustomerId(customerId: string): Promise<string | null> {
  try {
    const mappingDoc = await adminDb.collection('stripe_customers').doc(customerId).get();
    
    if (mappingDoc.exists) {
      return mappingDoc.data()?.userId || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by customer ID:', error);
    return null;
  }
}

