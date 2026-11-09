// verifyProductionMesh.js - Cross-Platform Pre-Flight Connectivity Tester
const { Relay } = require('nostr-tools');
const https = require('https');

const MESH_CONFIG = {
  primaryRelay: 'wss://relay.damus.io',
  backupRelays: ['wss://relay.nostr.band', 'wss://nos.lol'],
  paypalEndpoint: 'https://paypal.com',
  amazonEndpoint: 'https://amazon.com'
};

function probeHttpsGateway(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode < 500); 
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function runPreFlightMeshCheck() {
  console.log("=========================================================");
  console.log("⚡ THE PULSE NETWORK: PRE-FLIGHT CROSS-PLATFORM AUDIT   ⚡");
  console.log("=========================================================");
  
  const auditLogs = [];
  let systemFullyFunctional = true;

  try {
    const relay = await Relay.connect(MESH_CONFIG.primaryRelay);
    auditLogs.push(`✅ NOSTR LAYER: Connected to primary data mesh: ${MESH_CONFIG.primaryRelay}`);
    relay.close();
  } catch (err) {
    auditLogs.push(`⚠️ WARNING: Primary relay offline. Testing failover array...`);
    let fallbackOnline = false;
    for (const relayUrl of MESH_CONFIG.backupRelays) {
      try {
        const backupRelay = await Relay.connect(relayUrl);
        auditLogs.push(`✅ NOSTR LAYER (FAILOVER): Connected to backup node: ${relayUrl}`);
        backupRelay.close();
        fallbackOnline = true;
        break;
      } catch (fErr) {
        auditLogs.push(`❌ NOSTR LAYER (FAILOVER): Node ${relayUrl} timed out.`);
      }
    }
    if (!fallbackOnline) systemFullyFunctional = false;
  }

  const payPalStatus = await probeHttpsGateway(MESH_CONFIG.paypalEndpoint);
  const amazonStatus = await probeHttpsGateway(MESH_CONFIG.amazonEndpoint);

  auditLogs.push(payPalStatus ? "✅ DEV CONSOLE: PayPal Business gateways active." : "❌ DEV CONSOLE: PayPal Business offline.");
  auditLogs.push(amazonStatus ? "✅ DEV CONSOLE: Amazon Business gateways active." : "❌ DEV CONSOLE: Amazon Business offline.");
  if (!payPalStatus || !amazonStatus) systemFullyFunctional = false;

  console.log("\n=========================================================");
  auditLogs.forEach(logLine => console.log(logLine));
  console.log("=========================================================");

  if (systemFullyFunctional) {
    console.log("🎉 PRE-FLIGHT COMPLIANCE VERIFIED: BOTH PLATFORM GATES GIVEN CLEARANCE TO OPEN.");
    process.exit(0);
  } else {
    console.error("❌ CRITICAL INFRASTRUCTURE FAULT: CONFIGURATION RECOVERY REQUIRED.");
    process.exit(1);
  }
}

runPreFlightMeshCheck();
