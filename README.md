# fractional-real-estate-book-site

Four-page website promoting Dr Daniel Moses’s *Fractional Real Estate* book, with a HighLevel opt-in form and Property Wealth Corporation branding.

## Pages

- `/` — book homepage
- `/opt-in/` — book registration and embedded HighLevel form
- `/thank-you/` — submission confirmation page
- `/privacy-policy/` — book campaign privacy policy

This is a static site. Serve the repository root with a static web host that supports directory index pages. For local review, run `python -m http.server 8765` from the repository root and open `http://localhost:8765/`.

Before publishing or running ads, read [DEPLOYMENT-NOTES.md](DEPLOYMENT-NOTES.md). The supplied HighLevel form needs its legal links and success redirect configured in HighLevel.
