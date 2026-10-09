# Cypherenclave v1.0

Zero-Knowledge Security for Autonomous AI & Multimodal Workspaces.

Privacy-first AI OS prototype — Landing page + Secure Workspace dashboard.

---

## Requirements

- **Node.js 18+** (recommended: 20 LTS)
- npm 9+ or pnpm / yarn

---

## Setup (Local) — ধাপে ধাপে

```bash
# 1. ZIP আনজিপ করো, তারপর ফোল্ডারে ঢুকো
cd cypherenclave   # অথবা যে নামে ফোল্ডার আছে

# 2. Dependencies ইনস্টল
npm install

# 3. Development server চালাও
npm run dev
```

Browser-এ খুলবে: **http://localhost:3000**

### অন্যান্য কমান্ড

```bash
npm run build      # Production build → dist/
npm run preview    # Build প্রিভিউ
npm run lint       # ESLint
```

---

## Project Structure

```
app/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── main.tsx              # Entry
│   ├── App.tsx               # Landing ↔ Workspace switch + boot
│   ├── index.css             # Design system (cyber theme)
│   ├── pages/
│   │   ├── Landing.tsx       # Public marketing page
│   │   └── Workspace.tsx     # Secure AI workspace
│   └── components/
│       ├── HexBubble.tsx     # Cipher-masked chat bubbles
│       ├── ThreatMap.tsx     # Live threat visualization
│       ├── CommandPalette.tsx# ⌘K command menu
│       ├── Onboarding.tsx    # First-run tour
│       └── ui/               # shadcn components
```

---

## Features to Test

| Feature | How |
|---------|-----|
| Waitlist | Landing → "Join Waitlist" → email |
| Launch | Passkey-style boot → Workspace |
| Onboarding | First visit only (clear `localStorage` to see again) |
| Private Lock | Toggle in sidebar / chat header · hover AI bubbles |
| RPA Guardrail | Type: `send email to board` |
| Compliance block | Type something harmful |
| Command Palette | `⌘K` or `Ctrl+K` |
| File Sanitizer | Attach icon or Files tab |
| Mobile nav | Resize browser / phone |

Reset onboarding:
```js
localStorage.removeItem('ce_onboarded')
```

---

## Deploy / Upload — কোন সিরিয়ালে কী করবে

### Option A: Vercel (সবচেয়ে সহজ — recommend)

1. [vercel.com](https://vercel.com) এ account খোলো (GitHub দিয়ে)
2. GitHub-এ নতুন repo বানাও → এই ফোল্ডারের সব file push করো
3. Vercel → **Add New Project** → সেই repo সিলেক্ট
4. Framework: **Vite** (auto-detect)
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. **Deploy**

Live URL পাবে কয়েক মিনিটে।

### Option B: Netlify

1. [netlify.com](https://netlify.com) → Add new site → Import from Git  
   **অথবা** drag & drop `dist` folder (build করার পর)
2. Build command: `npm run build`
3. Publish directory: `dist`

### Option C: Cloudflare Pages

1. Cloudflare Dashboard → Pages → Create
2. Connect Git repo অথবা direct upload
3. Build: `npm run build` · Output: `dist`

### Option D: শুধু static host (cPanel / shared hosting)

```bash
npm run build
```

`dist/` ফোল্ডারের **সব content** public_html / www-তে upload করো।  
(SPA হলে server-এ সব route `index.html`-এ redirect করতে হবে)

---

## Git-এ প্রথমবার push (Vercel/Netlify এর আগে)

```bash
cd cypherenclave
git init
git add .
git commit -m "Cypherenclave v1 — zero-knowledge AI workspace"
# GitHub-এ repo বানিয়ে:
git remote add origin https://github.com/YOUR_USERNAME/cypherenclave.git
git branch -M main
git push -u origin main
```

---

## Notes

- এটা **frontend prototype** — real backend, Stripe, WebAuthn Passkeys এখনো নেই
- Waitlist emails `localStorage`-এ সেভ হয় (demo)
- Production-এ backend + email service (Resend) + Stripe লাগবে

---

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- cmdk (command palette)
- sonner (toasts)
- lucide-react

---

© 2026 Cypherenclave — Limited Profit · Absolute User Trust
