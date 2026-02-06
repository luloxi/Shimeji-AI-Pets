# MVP Specification

Minimum Viable Product for Shimeji Factory.

## Core Features

### 1. Pre-made Sample Mascots

The Chrome extension ships with selectable mascots:

| Mascot | Availability |
|--------|--------------|
| Bunny | Always available |
| Ghost | Always available |
| Kitten | Always available |
| Blob | Always available |

Users can switch between these mascots in the extension popup.

### 2. Mascot Behaviors

Each mascot can:
- **Wander** - Move randomly along the bottom of the screen
- **Follow cursor** - Track mouse movement when active
- **Idle** - Stand still with breathing/blinking animation

Size options: small, medium, large.

### 3. Portal Reservation + Intention

Users open an intergalactic portal to request a custom shimeji:

**Portal flow:**
1. User connects Freighter on the Factory website
2. User reserves a portal and writes an intention
3. Status shows as "Pending" until artist completes the sprite
4. User receives email updates as the portal progresses

### 4. Completed Portals in Extension

Once a portal is complete:
1. Artist uploads sprite sheet to asset storage (IPFS or CDN)
2. Backend marks the portal as ready and links the sprite data
3. Extension syncs the user unlocks on wallet connect
4. Custom mascots appear in the character selection list
5. User can select and display their custom shimeji

## What's NOT in MVP

- Automated sprite generation
- Multiple mascots on screen simultaneously
- Real-time portal status updates inside the extension
- Marketplace / secondary trading

## Launch Checklist

- [ ] Implement Stellar payment flow for portal purchases
- [ ] Store portal reservations + intentions in backend
- [ ] Create placeholder sprite (for pending portals)
- [ ] Create 3-4 sample mascots
- [ ] Update web app with live pricing
- [ ] Update extension with portal unlock sync
- [ ] Test full flow: reserve -> pay -> pending -> complete -> see in extension
- [ ] Publish extension to Chrome Web Store
