# Shimeji Factory

Open an intergalactic portal to meet an animated desktop companion.

Shimeji Factory lets you reserve a portal, set an intention, and receive a handcrafted shimeji that lives on your screen, follows your cursor, and wanders around while you browse. Wallet connection is handled through Stellar (Freighter).

## How It Works

1. **Connect Freighter** at the factory website
2. **Reserve a portal** and set an intention
3. **Artist crafts the sprite** based on your intention
4. **Install the Chrome extension** and see your mascot come to life

## Project Structure

```
shimeji/
├── web/                 # Next.js factory frontend
└── chrome-extension/    # Browser extension (displays mascots)
```

## Quick Start

**Web app:**
```bash
cd web
pnpm install
pnpm dev
```

**Chrome extension:** Load `chrome-extension/` as unpacked extension in Chrome (Developer mode).

## Documentation

- [DEV.md](DEV.md) - Developer guide and roadmap
- [MARKETING.md](MARKETING.md) - Designer and marketing guide
- [MVP.md](MVP.md) - MVP feature specification
