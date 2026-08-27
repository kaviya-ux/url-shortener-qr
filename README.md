# 🔗 URL Shortener & QR Code Generator

A URL shortener with an instant QR code generator, built with HTML, Tailwind CSS, and vanilla JavaScript — split into separate structure, style, and logic files. Paste in any long link, get a short link back, and a scannable QR code alongside it. Every link you shorten is saved locally so you can revisit, copy, or delete it later.

## Live Demo

Keep `index.html`, `style.css`, and `script.js` in the same folder and open `index.html` in any browser. No installation, no build step, no API key required.

## Features

- Shorten any valid URL using a free public API (no signup, no key)
- Instant QR code generated for the shortened link
- Copy-to-clipboard button for the shortened URL
- Download button for the QR code image
- Input validation with clear error messages (empty field, invalid URL, API failure)
- Loading state while the request is in flight
- Local history of every link you've shortened (saved with `localStorage`, persists across browser sessions)
- Each history entry shows its own mini QR code, with individual Copy and Delete buttons
- "Clear All" button to wipe the entire history
- Press **Enter** in the input field to shorten, no need to click the button

## Tech Stack

- HTML5
- [Tailwind CSS](https://tailwindcss.com/) (via CDN, for layout and styling)
- Plain CSS (`style.css`, for the loading spinner and scrollbar styling)
- Vanilla JavaScript (`script.js`, no frameworks, no build tools)
- [CleanURI API](https://cleanuri.com/) — free URL shortening, no API key required
- [QR Server API](https://goqr.me/api/) — free QR code image generation, no API key required

## How It Works

- **Shortening:** the app sends the URL you enter to the free CleanURI API (`POST https://cleanuri.com/api/v1/shorten`) and reads back the shortened link from the JSON response. No account or key is needed for this endpoint.
- **QR codes:** rather than calling a JS library, the app builds an image URL from the free QR Server API (`https://api.qrserver.com/v1/create-qr-code/?data=...`) and drops it straight into an `<img>` tag. Since it's just an image request, there's no CORS or library dependency involved — it works the same way a normal `<img src="...">` does.
- **History:** every successful shorten is saved as `{ original, shortened, createdAt }` in `localStorage` under the key `url-shortener-history`, capped at the most recent 20 entries. The list re-renders from `localStorage` on every page load, so your history survives closing the tab or restarting your browser.

## Project Structure

```
url-shortener-qr/
├── index.html   # markup only — structure and Tailwind utility classes
├── style.css    # small custom styles (spinner animation, scrollbar)
├── script.js    # all logic: validation, API calls, QR building, history
└── README.md
```

## Running Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/kaviya-ux/url-shortener-qr.git
   ```
2. Make sure `index.html`, `style.css`, and `script.js` stay in the same folder.
3. Open `index.html` in your browser.

## A Note on the Free APIs

This project intentionally uses two APIs that require **no signup and no API key**, so it works immediately after downloading — nothing to configure. That said, both are free third-party services, which means:

- If the CleanURI shortening service is temporarily down or rate-limited, the app will show a friendly error message rather than breaking — QR generation and history browsing are unaffected since they don't depend on it.
- If you outgrow the free tier or want more control (custom domains, click analytics, etc.), you can swap in another shortening API by editing the `shortenUrl()` function in `script.js` — the rest of the app doesn't need to change.

## Possible Improvements

- Custom short-link aliases (if using a paid/authenticated API)
- Click analytics per shortened link
- Export history as CSV or JSON
- Dark mode toggle

## License

Free to use for learning or personal projects.
