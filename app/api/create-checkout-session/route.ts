import { NextRequest, NextResponse } from 'next/server';
import { stripe, getPriceIdForTier } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { tier, userId, userEmail } = await req.json();

    // Validate inputs
    if (!tier || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the price ID for the tier
    const priceId = getPriceIdForTier(tier);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: userId, // Store user ID for webhook
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/dashboard/settings?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard/settings?canceled=true`,
      metadata: {
        userId,
        tier,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

