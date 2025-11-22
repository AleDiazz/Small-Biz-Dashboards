# Service Level Agreement (SLA)

**LedgerAI**  
Alejandro Díaz (Sole Proprietor)

**Physical Address:**  
Urb. Monte Atenas, Calle Acropolis C-13  
San Juan, PR 00926

**PO Box:**  
Urb. Monte Atenas, Calle Atenas 1300 Box 26  
San Juan, PR 00926

**Contact Email:** contact.ledgerai@gmail.com

**Effective Date: November 22, 2025**

---

## 1. Introduction

This Service Level Agreement ("SLA") defines the service level commitments and remedies for LedgerAI ("Service," "we," "us," or "our"). This SLA is incorporated into and forms part of our Terms of Service.

By subscribing to LedgerAI, you agree to the service levels and remedies described in this SLA.

## 2. Service Availability Commitment

### 2.1 Uptime Commitment

We commit to maintaining **99.5% Monthly Uptime** for the Service.

**Monthly Uptime** is calculated as:
```
Monthly Uptime = (Total Minutes in Month - Downtime) / Total Minutes in Month × 100%
```

### 2.2 Measurement Period

Service availability is measured on a monthly basis, from the first day of the calendar month to the last day of the calendar month.

### 2.3 Service Availability

The Service is considered "Available" when:
- Users can successfully authenticate and log in
- Core features (revenue tracking, expense tracking, dashboards) are accessible
- Data can be saved and retrieved
- Reports can be generated

The Service is considered "Unavailable" (Downtime) when:
- Users cannot authenticate or log in
- Core features are inaccessible due to our error
- Data cannot be saved or retrieved due to our error
- The Service returns errors for more than 5 consecutive minutes

## 3. Exclusions from Downtime

The following are **excluded** from Downtime calculations:

### 3.1 Scheduled Maintenance
- Planned maintenance windows (with advance notice)
- Regular updates and upgrades
- Maintenance announced at least 24 hours in advance

### 3.2 Force Majeure Events
- Natural disasters
- War, terrorism, or civil unrest
- Internet or telecommunications failures
- Third-party service outages (Stripe, Firebase, etc.)
- Government actions or regulations

### 3.3 User-Caused Issues
- User errors or misconfiguration
- Issues caused by user's network or devices
- Account suspensions or terminations
- Violations of Terms of Service or Acceptable Use Policy

### 3.4 Third-Party Services
- Outages of third-party services (Stripe, Firebase, Google Cloud Platform)
- Issues caused by third-party integrations
- Payment processor outages

### 3.5 Beta or Preview Features
- Features labeled as "beta," "preview," or "experimental"
- New features during initial rollout periods

## 4. Service Level Remedies

### 4.1 Service Credits

If we fail to meet the Monthly Uptime commitment, you may be eligible for a **Service Credit** as follows:

| Monthly Uptime | Service Credit |
|----------------|----------------|
| Less than 99.5% but equal to or greater than 99.0% | 10% of monthly subscription fee |
| Less than 99.0% but equal to or greater than 95.0% | 25% of monthly subscription fee |
| Less than 95.0% | 50% of monthly subscription fee |

### 4.2 Service Credit Calculation

Service Credits are calculated as a percentage of your monthly subscription fee for the affected month.

**Example:**
- Monthly subscription: $30
- Monthly Uptime: 98.5%
- Service Credit: 10% × $30 = $3.00

### 4.3 Maximum Service Credits

- Service Credits are capped at **50% of your monthly subscription fee**
- Service Credits cannot exceed the amount you paid for the affected month
- Service Credits are applied to your next billing cycle
- Service Credits are non-refundable and non-transferable

### 4.4 Requesting Service Credits

To request a Service Credit:
1. Contact us at contact.ledgerai@gmail.com within 30 days of the end of the affected month
2. Include your account email and the affected month
3. We will review your request and respond within 10 business days

## 5. Performance Metrics

### 5.1 Response Time

We strive to maintain:
- **Page Load Time:** Under 3 seconds for 95% of requests
- **API Response Time:** Under 1 second for 95% of requests
- **Report Generation:** Under 10 seconds for standard reports

These are target metrics and are not guaranteed service levels.

### 5.2 Data Availability

We commit to:
- **Data Durability:** 99.999999999% (11 nines) through Firebase/Google Cloud Platform
- **Backup Frequency:** Daily automated backups
- **Recovery Time Objective (RTO):** 4 hours for data recovery
- **Recovery Point Objective (RPO):** 24 hours (data loss window)

## 6. Support Response Times

### 6.1 Support Tiers

**Basic Plan:**
- Email support: Response within 48 business hours
- No priority support

**Pro Plan:**
- Email support: Response within 24 business hours
- Priority support during business hours

**Unlimited Plan:**
- Email support: Response within 12 business hours
- Priority support during business hours

### 6.2 Business Hours

Support is provided during:
- **Monday - Friday:** 9:00 AM - 5:00 PM Atlantic Standard Time (AST)
- **Weekends and Holidays:** Limited support availability

### 6.3 Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | Service completely unavailable | 4 hours |
| High | Major feature unavailable | 12 hours |
| Medium | Minor feature issue | 24 hours |
| Low | General inquiry or feature request | 48 hours |

## 7. Maintenance Windows

### 7.1 Scheduled Maintenance

We may perform scheduled maintenance:
- **Frequency:** As needed, typically during low-usage periods
- **Advance Notice:** At least 24 hours via email or Service notification
- **Duration:** Typically 1-4 hours
- **Impact:** May result in temporary service unavailability

### 7.2 Emergency Maintenance

We may perform emergency maintenance:
- **Notice:** As soon as reasonably possible
- **Duration:** As short as possible
- **Impact:** May result in temporary service unavailability

## 8. Monitoring and Reporting

### 8.1 Service Monitoring

We continuously monitor:
- Service availability and uptime
- Response times and performance
- Error rates and system health
- Security events and threats

### 8.2 Status Page

We maintain a status page (if available) showing:
- Current service status
- Known issues and incidents
- Scheduled maintenance
- Historical uptime statistics

### 8.3 Incident Communication

In the event of significant service disruptions:
- We will post updates on our status page (if available)
- We may send email notifications to affected users
- We will provide regular updates until the issue is resolved

## 9. Limitations and Exclusions

### 9.1 No Guarantee of Uninterrupted Service

While we strive for high availability, we do not guarantee:
- Uninterrupted or error-free service
- That the Service will meet your specific requirements
- That all features will be available at all times

### 9.2 Sole Remedy

Service Credits are your **sole and exclusive remedy** for our failure to meet the Monthly Uptime commitment. We are not liable for:
- Indirect, incidental, or consequential damages
- Loss of profits, revenue, or data
- Business interruption
- Costs of substitute services

### 9.3 Maximum Liability

Our total liability under this SLA is limited to the Service Credits described in Section 4, subject to the limitations in our Terms of Service.

## 10. Service Improvements

### 10.1 Continuous Improvement

We are committed to:
- Continuously improving service reliability
- Investing in infrastructure and technology
- Learning from incidents and improving processes
- Proactively addressing potential issues

### 10.2 Service Enhancements

We may:
- Add new features and functionality
- Improve performance and reliability
- Update security measures
- Enhance user experience

## 11. Changes to This SLA

We may update this SLA from time to time. When we make changes:
- We will post the updated SLA on this page
- We will update the "Effective Date" at the top
- For material changes, we will notify you via email or through the Service

Your continued use of the Service after changes become effective constitutes acceptance of the updated SLA.

## 12. Dispute Resolution

Any disputes regarding this SLA will be resolved in accordance with the dispute resolution provisions in our Terms of Service.

## 13. Contact Us

For questions about this SLA or to request Service Credits:

**Email:** contact.ledgerai@gmail.com

**Physical Address:**  
Urb. Monte Atenas, Calle Acropolis C-13  
San Juan, PR 00926

**PO Box:**  
Urb. Monte Atenas, Calle Atenas 1300 Box 26  
San Juan, PR 00926

---

*Last Updated: November 22, 2025*

