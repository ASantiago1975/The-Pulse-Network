// verifyProductionMesh.js - Nostr Relay & External Domain Reachability Tester
// NOTE: Verifies network reachability only; does not test merchant API keys or payment settlement.
const { Relay, useWebSocketImplementation } = require('nostr-tools/relay');
const WebSocket = require('ws');
const https = require('https');

// Polyfill WebSocket for Node.js CLI environments
useWebSocketImplementation(WebSocket);

const MESH_CONFIG = {
  primaryRelay: 'wss://relay.damus.io',
  backupRelays: ['wss://relay.nostr.band', 'wss://nos.lol'],
  paypalDomain: 'https://www.paypal.com',
  amazonDomain: 'https://www.amazon.com'
};

/**
 * Checks HTTPS domain reachability via GET with a User-Agent header.
 * Passes on valid 2xx/3xx HTTP responses.
 */
function probeDomainReachability(url) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      timeout: 6000,
      headers: {
        'User-Agent': 'ThePulseNetwork-ReachabilityCheck/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      res.resume();
      resolve(res.statusCode !== undefined && res.statusCode < 400);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function runReachabilityAudit() {
  console.log('=========================================================');
  console.log('⚡ THE PULSE NETWORK: NETWORK & DOMAIN REACHABILITY CHECK ⚡');
  console.log('=========================================================');

  const auditLogs = [];
  let allEndpointsReachable = true;

  // 1. Verify Nostr Relay WebSocket Connectivity (Damus strfry primary relay)
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
      allEndpointsReachable = false;
    }
  }

  // 2. Verify External Reference Domains Respond Over HTTPS
  const [payPalReachable, amazonReachable] = await Promise.all([
    probeDomainReachability(MESH_CONFIG.paypalDomain),
    probeDomainReachability(MESH_CONFIG.amazonDomain)
  ]);

  auditLogs.push(
    payPalReachable
      ? '✅ HTTPS REACHABILITY: paypal.com responded over HTTPS (domain reachable; API keys not tested).'
      : '❌ HTTPS REACHABILITY: paypal.com unreachable.'
  );
  auditLogs.push(
    amazonReachable
      ? '✅ HTTPS REACHABILITY: amazon.com responded over HTTPS (domain reachable; API keys not tested).'
      : '❌ HTTPS REACHABILITY: amazon.com unreachable.'
  );

  if (!payPalReachable || !amazonReachable) {
    allEndpointsReachable = false;
  }

  // 3. Output Final Report
  console.log('\n=========================================================');
  auditLogs.forEach((logLine) => console.log(logLine));
  console.log('=========================================================');

  if (allEndpointsReachable) {
    console.log('🎉 NETWORK & DOMAIN REACHABILITY CHECK PASSED.');
    process.exit(0);
  } else {
    console.error('❌ REACHABILITY FAULT: ONE OR MORE ENDPOINTS UNREACHABLE.');
    process.exit(1);
  }
}

runReachabilityAudit();
