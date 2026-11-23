# Fractional Real Estate book checkout integration

## Current state

- Live approved Stripe product: `prod_VgH25yDPFEnN69`; approved one-time GBP 20 price: `price_1UeuU2EU4e8KdkuN0HfdtuBF`.
- Existing live book Payment Link: `plink_1Uewm1EU4e8KdkuNsRwwuvit`. Do not use the separate Payment Link for *The Test*.
- GHL book product: `6b0434e9a066ead3be7598dc`; its existing price is linked to the approved Stripe price.
- Xero organisation: Property Wealth Corporation Ltd, `6f73b05e-086f-4fd0-b0c0-34a9602e14d7`. Sales account code `200` is the approved book revenue mapping per the owner's go-ahead.
- GBP 20 is the book price. Shipping is free worldwide. Finance confirmed that no tax is to be collected by this checkout.
- Test-mode book price: `price_1UexavEU4e8KdkuNLUJnm1aR` for the existing test product `prod_VgJDfmwxHcN9he`. This is isolated from live payments.

## Webhook contract

`api/stripe-webhook.js` verifies the Stripe signature against the **raw** body with a five-minute tolerance, filters to payment lifecycle events, and passes only order/customer fields to a dedicated n8n webhook. It deliberately omits payment method and card data. Stripe receives a non-2xx response when n8n is unavailable, so Stripe can retry.

Environment variables for the future Vercel deployment:

- `STRIPE_WEBHOOK_SECRET`: signing secret from the Stripe webhook endpoint for the corresponding mode. Test and live secrets must never be mixed.
- `PWC_N8N_WEBHOOK_URL`: dedicated book order workflow webhook URL.
- `PWC_N8N_WEBHOOK_TOKEN`: shared secret that the n8n workflow must validate before processing. The workflow must reject missing or mismatched tokens.

The endpoint is **not ready for live traffic** until the dedicated n8n workflow and its authenticated webhook exist. The site must not be deployed with this route as a substitute for completed CRM/accounting synchronization.

## Required n8n order workflow

1. Authenticate the `x-pwc-webhook-token` header. Reject invalid requests before any write.
2. Verify `livemode`, the book Payment Link or product code, and event type. For `charge.refunded`, resolve the payment intent against an existing book order before changing anything.
3. Use Stripe event ID to prevent reprocessing and Stripe payment intent ID as the stable order/transaction key. Do not rely on email as the order key. A completed Checkout Session with `payment_status != paid` is pending; create a paid order only after a paid event.
4. On paid events, upsert the GHL contact by email and attach name, phone, billing/delivery addresses, product, transaction ID and paid status. Do not overwrite unrelated lead-capture fields or trigger unrelated PWC workflows.
5. Upsert the Xero contact. Create one sales record with an invoice/reference uniquely derived from the Stripe payment intent ID, book line item GBP 20 to Sales account `200`, zero tax, and zero shipping. Repeated events must find and update the same record, never create a second paid sale.
6. Record cancellation, failure, full refund and partial refund against the existing order. A refund must update/reconcile the corresponding Xero sale or credit note; never create another sale.
7. Persist processing state and errors for retries and reconciliation. A transient GHL or Xero error must fail the workflow response so Stripe retries; no event may be acknowledged as complete before both systems are consistent.

## Validation gate before any live site change

- Create the authenticated n8n workflow without altering existing PWC workflows.
- Connect a **test-mode** Stripe webhook endpoint to a nonproduction deployment of `/api/stripe-webhook`.
- Submit the test Checkout with a UK address and a Nigeria address, checking required name, email, phone, billing and delivery fields and zero delivery charge.
- Confirm one paid transaction reaches GHL and Xero with matching Stripe IDs; replay the same event and confirm no duplicates.
- Exercise pending, failed, expired, full and partial refund paths; verify accurate CRM and accounting states.
- Confirm existing top-right “Get book updates” capture still works.
- Only after those checks, configure the existing live Payment Link for collection of name, phone, required billing and supported worldwide delivery addresses, with a free shipping option. Update stale `pwc_xero_account` metadata to `200`, configure the live Stripe webhook and Vercel secrets, then request final publication approval.

Run the local signature and data-minimization checks with `node --test tests/stripe-webhook.test.js`.
