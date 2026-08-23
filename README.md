# VISOR Stream - Gaming Video Streaming & Creator Platform

Visor Stream is an Africa-first gaming video streaming and community platform. It allows gamers to stream, upload clips, host esports tournaments, and monetize content with localized African payment gateways (Pesapal, M-Pesa, MTN Mobile Money, Airtel Money) alongside global cards and wallet systems.

---

## 🚀 How to Export or Clone the Codebase

You can download or export this clean codebase at any time directly through Google AI Studio:

1. **Export via Settings Menu**:
   - Click on the **Settings** / **Options** menu in the top-right corner of Google AI Studio.
   - Select **Export to GitHub** (to push to your personal repository) or **Download ZIP** (for a clean local archive).
2. **Safe from Leaked Secrets**:
   - The codebase does **not** contain any hardcoded API keys or credentials.
   - All secret variables are safely read through environment variables or user-level configuration templates (`.env.example`).

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your own credentials:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Gemini AI API key for AI chat, stream moderation, and insights |
| `PESAPAL_CONSUMER_KEY` | Pesapal v3 Consumer Key for mobile money & card checkout |
| `PESAPAL_CONSUMER_SECRET` | Pesapal v3 Consumer Secret |
| `PESAPAL_ENV` | `sandbox` for development or `live` for production |
| `APP_URL` | Your public app deployment URL |

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

