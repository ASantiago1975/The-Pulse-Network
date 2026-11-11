# ⚡ The Pulse Network: Unified Cross-Platform Sovereign Core

The Pulse Network is a decentralized, non-custodial client software interface designed to operate with $0.00 infrastructure hosting overhead under a single owner. It deploys simultaneously to the **Google Play Store** and the **Apple App Store** from a single cross-platform codebase repository.

## 🛠️ Cross-Platform Stack Metrics
- **Core Visual Framework:** React Native, Expo SDK 54, and TypeScript Mobile Shell.
- **Data Ingestion Rails:** Decentralized Nostr relays (`wss://relay.damus.io`, `wss://relay.nostr.band`, `wss://nos.lol`) with local geohash boundary sorting.
- **Persistence Storage Matrix:** Sandboxed on-device AsyncStorage ($0.00 cloud database overhead).
- **Settlement Rail:** Non-custodial **Bitcoin Lightning** (`lightning:` URI / LNURL-Pay Lightning Addresses) exclusively.

## 🔒 Privacy, Custody & App Store Compliance
1. **Strict Non-Custodial User Privacy:** All user payment details, personal Lightning receiving addresses, and external off-ramp financial institution choices remain private on the individual user's device. Peer-to-peer transfers settle directly between users, allowing users to off-ramp funds to their chosen financial institution at any time.
2. **Isolated Developer Console Earnings:** The 3.0% protocol dividend routes independently to the Developer Console's designated Lightning destination. Console settings and CSV revenue exports remain locked behind hardware biometric verification (Apple Face ID / Touch ID and Android Biometrics) so the developer can transfer earnings to their chosen financial institution privately.
3. **Dynamic Overhead Mitigation Model (DOMM):** Transparently calculates routing surcharges at checkout, preserving the 3.0% developer protocol dividend without touching peer-to-peer principal amounts.
4. **Cross-Platform Manifest Mapping:** Uses `app.json` to supply iOS privacy descriptions (`NSFaceIDUsageDescription`), Lightning wallet URL query schemes (`LSApplicationQueriesSchemes`), and Android adaptive icon configurations from a single repository.
