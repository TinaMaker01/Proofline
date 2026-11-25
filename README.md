# Proofline

Automated testing, security verification, and plain-English fixes for AI-generated apps.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set your API key:
   ```bash
   AI_API_KEY="your_api_key_here"
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — Start the development server (`server.ts`)
- `npm run build` — Build the production frontend bundle
- `npm run lint` — Run TypeScript type-checking (`tsc --noEmit`)
