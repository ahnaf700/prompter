<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/168901bc-664b-4f75-b8b0-5bb200623684

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Produksi

```
npm run build
npm start        # NODE_ENV=production node server.ts (butuh Node >= 22.18)
```

Opsional: `GEMINI_MODEL` mengganti model default (`gemini-4-hydrogen`).
Di balik satu reverse proxy (mis. Cloud Run) server otomatis memakai `trust proxy`
agar batas 20 permintaan/menit/IP dihitung per pengguna, bukan per proxy.

## Tes

```
npm test
```
