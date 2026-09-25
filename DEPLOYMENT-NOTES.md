# Book site deployment notes

Upload the contents of this folder to the chosen web host, preserving the `opt-in/`, `thank-you/`, `privacy-policy/` and `assets/` paths. The site uses static HTML and CSS. No build step is required.

## Before advertising

1. In HighLevel, replace the form's current `example.com` Privacy Policy and Terms of Service links with live, accurate links. The privacy link should point to the published `/privacy-policy/` page.
2. The supplied form asks about possible property co-ownership, UK property and capital level. Confirm that these questions belong in this book campaign; update the form in HighLevel if the campaign should collect book interest only. The website cannot change fields inside the third-party iframe.
3. Set the form's successful submission redirect in HighLevel to the published `/thank-you/` URL. The thank-you page exists, but the form controls whether visitors reach it.
4. Review the privacy policy against the final form, email automations, hosting, analytics and ad measurement setup. It currently describes the provided form and a site with no analytics or ad tags.
5. Test all four live URLs, the embedded form, mobile layout, email delivery and redirect before running ads. Ensure the live site is accessible to Google AdsBot in the locations you target.

The site intentionally describes registration as a request for updates. No price, checkout or copy reservation mechanism was supplied, so it does not claim that submitting the form buys or reserves a book.

The embedded GHL form did not render inside the local in-app browser preview, although its direct URL loaded and its response permits framing. The opt-in page includes a prominent direct-form link. Verify the iframe on the final hosted domain before ads go live.
