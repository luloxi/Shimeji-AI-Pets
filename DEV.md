# Developer Guide

## Current Status

### Completed

- **Web app** - Factory UI with Freighter wallet connection and portal reservation flow
- **Chrome extension** - Mascot rendering, multiple characters, wander/follow behaviors
- **Wallet bridge** - Vercel-hosted connector page wired to the extension

### Pending (MVP Blockers)

| Task | Priority |
|------|----------|
| Stellar payment flow for portal purchases | BLOCKER |
| Persist portal reservations + intentions in backend | HIGH |
| Admin workflow for portal fulfillment + sprite delivery | HIGH |
| Character unlock sync between web + extension | MEDIUM |

## Roadmap

### Phase 1: Portal Commerce

1. Define portal pricing + checkout requirements
2. Implement Stellar payment flow (Freighter signing)
3. Store portal purchases + intentions in database
4. Send confirmation + status emails

### Phase 2: Fulfillment

1. Admin dashboard for managing portal requests
2. Sprite upload workflow (IPFS or asset storage)
3. Notify users when shimeji is ready

### Phase 3: Extension Updates

1. Load sprites dynamically from hosted assets
2. Cache loaded sprites locally
3. Refresh unlocks on wallet connect
4. Publish to Chrome Web Store

## Development Commands

**Web app:**
```bash
cd web
pnpm install
pnpm dev             # Development server
pnpm build           # Production build
```

**Extension:** Load `chrome-extension/` folder as unpacked extension in `chrome://extensions` (Developer mode).

## Key Files

| File | Purpose |
|------|---------|
| `web/app/factory/page.tsx` | Factory portal flow + intention input |
| `web/components/freighter-provider.tsx` | Freighter connection state |
| `web/components/freighter-connect-button.tsx` | Freighter connect UI |
| `chrome-extension/background.js` | Extension state + wallet sync |
| `chrome-extension/index.js` | Wallet connect page logic |
| `chrome-extension/content.js` | Mascot rendering |

## Environment Variables

**Web app (.env.local):**
```
PINATA_JWT=your_pinata_jwt_here
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=Shimeji Factory <noreply@shimeji.dev>
FEEDBACK_TO_EMAIL=dev.shimeji@gmail.com
RESEND_AUDIENCE_UPDATES=xxxxx-xxxx-xxxx-xxxxxxx
RESEND_AUDIENCE_SHIMEJI=xxxxx-xxxx-xxxx-xxxxxxx
RESEND_AUDIENCE_COLLECTION=xxxxx-xxxx-xxxx-xxxxxxx
NEXT_PUBLIC_BASE_URL=https://shimeji.dev
```
