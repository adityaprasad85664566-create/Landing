# M PARIVAHAN independent app page — Vercel version

This project replaces the PHP uploader with Vercel serverless API routes and Vercel Blob for persistent APK storage.

## Deploy

1. Create a GitHub repository and upload the **contents** of this folder.
2. In Vercel, choose **Add New → Project**, import the repository, and deploy. Framework preset: **Other** (Vite build).
3. In the Vercel project, open **Storage → Blob → Create Store**. Connect the Blob store to this Vercel project. This adds `BLOB_READ_WRITE_TOKEN`.
4. Open **Settings → Environment Variables** and add:
   - `ADMIN_PASSWORD` — a strong, unique admin password.
   - `SESSION_SECRET` — a random secret with at least 32 characters. Generate one with `openssl rand -hex 32`.
   Apply to Production (and Preview only if needed), then redeploy.
5. Open `https://YOUR-DOMAIN/admin.html`, sign in, and upload an APK.
6. The public landing page is `https://YOUR-DOMAIN/`. Its Download APK button always redirects to the most recently uploaded APK.

## Local development

```bash
npm install
npm run dev
```

The Vercel API routes and Blob storage require deployment / Vercel environment variables to work. For local API testing use `vercel dev` after linking the project and pulling environment variables (`vercel env pull .env.local`).

## How uploads work

The browser uploads directly to Vercel Blob using the official `@vercel/blob/client` flow. The server authorizes each upload only when the admin session is valid. The APK itself is stored persistently in Blob; it is not written to the serverless function filesystem. The latest blob under `apks/` is used for public downloads.

## Security notes

- Use HTTPS and a long unique admin password.
- Keep `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, and `SESSION_SECRET` private. Never commit `.env` files or tokens to GitHub.
- Blob files are **public** so visitors can download the APK. Anyone with a blob URL can access that uploaded file.
- Upload only APKs you own or are explicitly authorized to distribute. Scan and test every APK before making it public.
- This is an independent demo page and is not an official Government of India, MoRTH, NIC, or Google Play website. Do not use it to mislead visitors or collect OTPs, passwords, identity documents, or payment details.
- The three preview panels are illustrative placeholders; replace them with screenshots you have permission to use.
