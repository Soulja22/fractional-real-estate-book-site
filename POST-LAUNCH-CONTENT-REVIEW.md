# Post-launch book website: editorial review

This draft presents *Fractional Real Estate* by Dr Daniel Moses as an officially launched book. It is prepared for review and must not be published until the existing live Stripe checkout collects fulfilment details and the GHL/Xero order synchronization has passed end-to-end tests.

| Area | Before | Draft after |
| --- | --- | --- |
| Homepage hero | Generic book announcement and an updates CTA | “Officially launched · Available now,” a present-tense description, and “Buy the Book” |
| Book cover | “THE BOOK” badge | “AVAILABLE NOW” badge |
| Educational and author sections | Update/information buttons | Book purchase buttons; educational copy and disclaimers retained |
| Purchase question | Asked how to get more information | Explains the £20 Stripe checkout and distinguishes it from the separate updates form |
| Final homepage section and footer | Registration-led CTA | Purchase-led CTA and checkout link; updates link remains available |
| Opt-in page | “Register interest” and general availability messaging | Published-book news and educational updates; a separate purchase link |
| Thank-you page | Registration acknowledgement only | Registration acknowledgement plus post-launch purchase option |
| Privacy policy | Described only the registration form | Describes Stripe checkout, order and delivery data, CRM/accounting providers and purchase records |
| SEO and sharing descriptions | Framed the site around updates | Describe the launched book and the £20 purchase route |

The top-right homepage **Get book updates** button, its `opt-in/` destination, the GHL iframe URL and existing lead-capture form are unchanged. Every purchase link in the draft uses the existing approved Stripe URL: `https://buy.stripe.com/8x228r2u41ne5BU0bfcAo0d`.

Review the local preview at `http://127.0.0.1:8765/` while the preview server is running. The HTML, CSS, all four page routes and book-cover asset returned HTTP 200 in local checks. A source audit found no remaining “coming soon,” “first to hear,” launch-period date or release-update language. Desktop and mobile visual approval remains to be completed in the preview.

## Publication gate

The live Stripe Payment Link is active but, at the time of this review, has phone collection disabled, billing collection set to automatic, no shipping-address collection and no shipping option. The verified webhook and GHL/Xero order synchronization have not passed an end-to-end purchase test. The purchase CTAs in this draft must remain off the production site until checkout collection, worldwide free shipping, order records, duplicate protection and refund handling are verified and Dr Daniel Moses approves the preview.
