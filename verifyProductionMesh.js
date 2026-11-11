// verifyProductionMesh.js - Nostr Relay Mesh Connectivity Tester
// NOTE: Verifies decentralized Nostr relay WebSocket reachability only;
// all Bitcoin Lightning P2P payments settle directly between user wallets.
const { Relay, useWebSocketImplementation } = require('nostr-tools/relay');
const WebSocket = require('ws');

// Polyfill WebSocket for Node.js CLI environments
useWebSocketImplementation(WebSocket);

const MESH_CONFIG = {
  primaryRelay: 'wss://relay.damus.io',
  backupRelays: ['wss://relay.nostr.band', 'wss://nos.lol'],
};

async function runRelayMeshAudit() {
  console.log('=========================================================');
  console.log('⚡ THE PULSE NETWORK: NOSTR RELAY MESH CONNECTIVITY AUDIT ⚡');
  console.log('=========================================================');

  const auditLogs = [];
  let relayMeshReachable = true;

  // Verify Nostr Relay WebSocket Connectivity (Damus strfry primary relay + failover nodes)
  try {
    const relay = await Relay.connect(MESH_CONFIG.primaryRelay);
    auditLogs.push(`✅ NOSTR RELAY: Connected to primary relay (${MESH_CONFIG.primaryRelay})`);
    relay.close();
  } catch (err) {
    auditLogs.push(`⚠️ WARNING: Primary relay unreachable (${err.message}). Testing backups...`);
    let fallbackOnline = false;

    for (const relayUrl of MESH_CONFIG.backupRelays) {
      try {
        const backupRelay = await Relay.connect(relayUrl);
        auditLogs.push(`✅ NOSTR RELAY (FAILOVER): Connected to backup relay (${relayUrl})`);
        backupRelay.close();
        fallbackOnline = true;
        break;
      } catch (_fallbackErr) {
        auditLogs.push(`❌ NOSTR RELAY (FAILOVER): Relay ${relayUrl} timed out.`);
      }
    }

    if (!fallbackOnline) {
      relayMeshReachable = false;
    }
  }

  // Output Final Report
  console.log('\n=========================================================');
  auditLogs.forEach((logLine) => console.log(logLine));
  console.log('=========================================================');

  if (relayMeshReachable) {
    console.log('🎉 NOSTR RELAY MESH CONNECTIVITY PASSED.');
    process.exit(0);
  } else {
    console.error('❌ RELAY FAULT: ALL CONFIGURED NOSTR RELAYS UNREACHABLE.');
    process.exit(1);
  }
}

runRelayMeshAudit();
