# Dynamic Characters

Enable unlimited custom shimeji characters without bloating extension size. Characters are delivered per portal and hosted remotely, cached locally for offline use.

## Architecture

Portal completion triggers sprite delivery:

```
Portal Ready  ──▶  Sprite Storage  ──▶  Extension Cache
```

## Sprite Metadata Schema

```json
{
  "id": "portal_123",
  "name": "Nebula Shimeji",
  "description": "Companion inspired by your intention: focus",
  "assets": {
    "spritesheet": "https://cdn.shimeji.dev/portal_123/sprite.png",
    "atlas": "https://cdn.shimeji.dev/portal_123/atlas.json"
  }
}
```

## Implementation Notes

- Store portal ownership by Freighter public key.
- On wallet connect, fetch available portal characters for the user.
- Cache assets locally for fast load and offline use.
- If a portal is revoked or refunded, remove its character on next sync.

## TODO

1. Build `fetchOwnedShimejis(publicKey)` endpoint.
2. Add asset caching + eviction.
3. Add UI markers for new portal arrivals.
