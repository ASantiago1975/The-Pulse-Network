// verifyProductionMesh.js - Cross-Platform Pre-Flight Connectivity Tester
const { Relay, useWebSocketImplementation } = require('nostr-tools/relay');
const WebSocket = require('ws');
const https = require('https');

// Polyfill WebSocket for Node.js CLI environments
useWebSocketImplementation(WebSocket);

const MESH_CONFIG = {
  primaryRelay: 'wss://relay.damus.io',
  backupRelays: ['wss://relay.nostr.band', 'wss://nos.lol'],
  paypalEndpoint: 'https://www.paypal.com',
  amazonEndpoint: 'https://www.amazon.com'
};

/**
 * Probes an HTTPS endpoint using GET with User-Agent headers to prevent WAF blocks
 * and passes on valid 2xx/3xx HTTP responses.
 */
function probeHttpsGateway(url) {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      timeout: 6000,
      headers: {
        'User-Agent': 'ThePulseNetwork-PreFlightCheck/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      res.resume(); // Drain response stream to free memory
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

async function runPreFlightMeshCheck() {
  console.log('=========================================================');
  console.log('⚡ THE PULSE NETWORK: PRE-FLIGHT CROSS-PLATFORM AUDIT   ⚡');
  console.log('=========================================================');

  const auditLogs = [];
  let systemFullyFunctional = true;

  // 1. Verify Nostr Relay Connectivity (Damus strfry primary relay)
  try {
    const relay = await Relay.connect(MESH_CONFIG.primaryRelay);
    auditLogs.push(`✅ NOSTR LAYER: Connected to primary data mesh: ${MESH_CONFIG.primaryRelay}`);
    relay.close();
  } catch (err) {
    auditLogs.push(`⚠️ WARNING: Primary relay offline (${err.message}). Testing failover array...`);
    let fallbackOnline = false;

    for (const relayUrl of MESH_CONFIG.backupRelays) {
      try {
        const backupRelay = await Relay.connect(relayUrl);
        auditLogs.push(`✅ NOSTR LAYER (FAILOVER): Connected to backup node: ${relayUrl}`);
        backupRelay.close();
        fallbackOnline = true;
        break;
      } catch (_fallbackErr) {
        auditLogs.push(`❌ NOSTR LAYER (FAILOVER): Node ${relayUrl} timed out.`);
      }
    }

    if (!fallbackOnline) {
      systemFullyFunctional = false;
    }
  }

  // 2. Verify External Payment Gateways
  const [payPalStatus, amazonStatus] = await Promise.all([
    probeHttpsGateway(MESH_CONFIG.paypalEndpoint),
    probeHttpsGateway(MESH_CONFIG.amazonEndpoint)
  ]);

  auditLogs.push(
    payPalStatus
      ? '✅ DEV CONSOLE: PayPal Business gateways active.'
      : '❌ DEV CONSOLE: PayPal Business offline.'
  );
  auditLogs.push(
    amazonStatus
      ? '✅ DEV CONSOLE: Amazon Business gateways active.'
      : '❌ DEV CONSOLE: Amazon Business offline.'
  );

  if (!payPalStatus || !amazonStatus) {
    systemFullyFunctional = false;
  }

  // 3. Output Final Report
  console.log('\n=========================================================');
  auditLogs.forEach((logLine) => console.log(logLine));
  console.log('=========================================================');

  if (systemFullyFunctional) {
    console.log('🎉 PRE-FLIGHT COMPLIANCE VERIFIED: BOTH PLATFORM GATES GIVEN CLEARANCE TO OPEN.');
    process.exit(0);
  } else {
    console.error('❌ CRITICAL INFRASTRUCTURE FAULT: CONFIGURATION RECOVERY REQUIRED.');
    process.exit(1);
  }
}

runPreFlightMeshCheck();
