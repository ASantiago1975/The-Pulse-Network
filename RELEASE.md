# Release v1.0.0-production — Unified Non-Custodial Bitcoin Lightning Core

This release finalizes the single-network cross-platform architecture for **The Pulse Network**, establishing day-one compliance for both **Google Play Console** and **Apple App Store Connect** from one unified repository.

### Structural Updates in This Tag Build
- **[Non-Custodial Bitcoin Lightning Settlement]:** Configured peer-to-peer Bitcoin Lightning (`lightning:` URI / Lightning Address) settlement exclusively, removing all third-party fiat gateways. User P2P payment preferences and off-ramp bank selections remain private on-device.
- **[Isolated Biometric Developer Console]:** Secured the Developer Console behind hardware biometric and device passcode verification (`expo-local-authentication`) with zero embedded client passphrases, keeping the 3.0% protocol dividend and CSV ledger exports private to the platform owner.
- **[Cross-Platform Build Map]:** Configured `eas.json` with local versioning (`appVersionSource: "local"`) to compile Android App Bundles (`.aab`) and iOS store archives (`.ipa`) from a single repository.
- **[App Store & Play Store Manifests]:** Updated `app.json` for Expo SDK 54 with iOS Face ID usage descriptions, `LSApplicationQueriesSchemes` (`lightning`) wallet deep-linking, non-exempt encryption declarations, and Android adaptive icon assets.
- **[Nostr Mesh Telemetry]:** Updated `verifyProductionMesh.js` to validate WebSocket connectivity across decentralized Nostr relays (`wss://relay.damus.io`, `wss://relay.nostr.band`, and `wss://nos.lol`).
