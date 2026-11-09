import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Clipboard, ScrollView, TextInput, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as LocalAuthentication from 'expo-local-authentication';
import PulseLogo from './PulseLogo';

const USER_AGREEMENT_TEXT = `THE PULSE NETWORK — MASTER TERMS OF SERVICE & LIABILITY WAIVER

1. DECENTRALIZED INFRASTRUCTURE INDEMNIFICATION
The Pulse Network operates strictly as a decentralized client software interface layer utilizing peer-to-peer open communication routing. By creating a local cryptographic profile registry, the User explicitly acknowledges that all transactions, intent broadcasts, and contract swaps occur directly between User-to-User or User-to-Merchant boundaries. The developer and the network architecture hold zero custodial management, mediation access, or oversight over these processing loops. The User agrees to hold the developer completely free from any civil or criminal liability, financial damages, losses, or legal friction arising from user-to-user agreements or interactions.

2. FEES AND THE DEVELOPER CONSOLE CONTROL PIPELINE
To sustain the underlying state-channel frameworks, an immutable 3% platform dividend is collected natively on all transactional operations. By utilizing this gateway interface, the User agrees to the Dynamic Overhead Mitigation Model (DOMM), where any external clearing processing network surcharges (4.2%) are programmatically calculated and allocated directly onto the checkout block. All platform dividends and accrued developer revenues are locked, managed, and awarded strictly through the secure, developer-controlled administrative console backend pipelines.

3. DATA CUSTODY LIMITATIONS
Account identities are anchored to devices via local public keys. If private recovery keys or local text data logs are lost, the platform has no mechanical ability to restore profiles. Users hold 100% liability for managing their own regulatory capital gains tax disclosures under IRS Notice 2014-21 metrics.`;

export default function App() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PAY' | 'TREASURY' | 'CONSOLE'>('PAY');
  
  const [invoice, setInvoice] = useState<string>('https://paypal.com');
  const [amountSats] = useState<number>(50000);
  const [loading, setLoading] = useState<boolean>(false);
  const [isConsoleUnlocked, setIsConsoleUnlocked] = useState<boolean>(false);

  const [networkLedger, setNetworkLedger] = useState({
    totalFloatSats: 450000000,
    annualizedYieldRate: 4.5,
    accumulatedInterestSats: 124580,
    developerNetProfitSats: 1500
  });

  const [devProfile, setDevProfile] = useState({
    corporateEntity: "The Pulse Network LLC",
    description: "The Pulse Network operates as an advanced decentralized spatial intent processing layout. Built on asset-sovereign models, it features an integrated Sovereign Trust treasury framework that programmatically sweeps cash float parameters into low-risk tokenized short-term U.S. Debt securities, collecting yield margins directly into developer console custody rails with zero external middle-fee drag.",
    einNumber: "12-3456789",
    dunsNumber: "012345678"
  });

  const [inputEIN, setInputEIN] = useState(devProfile.einNumber);
  const [inputDUNS, setInputDUNS] = useState(devProfile.dunsNumber);

  const handleUserSignUp = () => {
    if (!hasAcceptedTerms) {
      Alert.alert("Agreement Required", "You must scroll through and accept the Terms of Service and Liability Waiver to initialize registration.");
      return;
    }
    setIsRegistered(true);
    Alert.alert("Registration Complete", "Sovereign local profile generated on-device. Network loop active.");
  };

  const handleTabNavigationExchange = async (targetTab: 'PAY' | 'TREASURY' | 'CONSOLE') => {
    if (targetTab === 'CONSOLE' && !isConsoleUnlocked) {
      const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardwareSupport || !isEnrolled) {
        Alert.alert("Security Error", "Biometric authentication is unconfigured on this mobile device terminal.");
        return;
      }

      const biometricScanResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authorize Owner Biometrics to Unlock Developer Console Dashboard',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false
      });

      if (biometricScanResult.success) {
        setIsConsoleUnlocked(true);
        setActiveTab('CONSOLE');
      } else {
        Alert.alert("Access Denied", "Owner presence verification rejected.");
      }
    } else {
      setActiveTab(targetTab);
    }
  };

  const handleUpdateDeveloperData = () => {
    if (inputDUNS.length < 9) {
      Alert.alert("Error", "D-U-N-S number must be exactly 9 digits.");
      return;
    }
    setDevProfile(prev => ({ ...prev, einNumber: inputEIN, dunsNumber: inputDUNS }));
    Alert.alert("Developer Console Sync", "Corporate database records updated safely. Financial balances remain isolated.");
  };

  useEffect(() => {
    if (!isRegistered) return;
    const yieldInterval = setInterval(() => {
      setNetworkLedger(prev => ({
        ...prev,
        accumulatedInterestSats: prev.accumulatedInterestSats + (prev.totalFloatSats * (prev.annualizedYieldRate / 100)) / (365 * 24 * 3600)
      }));
    }, 1000);
    return () => clearInterval(yieldInterval);
  }, [isRegistered]);

  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.registrationContainer}>
          <PulseLogo size={80} />
          <Text style={styles.registrationTitle}>Welcome to The Pulse Network</Text>
          <Text style={styles.registrationSubtitle}>Decentralized Device-Level Profile Setup</Text>
          <ScrollView style={styles.legalScrollView} nestedScrollEnabled={true}>
            <Text style={styles.legalBodyText}>{USER_AGREEMENT_TEXT}</Text>
          </ScrollView>
          <TouchableOpacity style={[styles.checkboxRow, hasAcceptedTerms && styles.checkboxActive]} onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}>
            <Text style={styles.checkboxText}>
              {hasAcceptedTerms ? "✓ TERMS ACCEPTED • DEVELOPER COMPLETELY INDEMNIFIED" : "☐ Click to read and accept terms & legal conditions"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton} onPress={handleUserSignUp}>
            <Text style={styles.signUpButtonText}>Initialize Secure Account Sign-Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navHeader}>
        <PulseLogo size={42} />
        <View style={styles.tabButtons}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'PAY' && styles.activeTab]} onPress={() => handleTabNavigationExchange('PAY')}>
            <Text style={[styles.tabButtonText, activeTab === 'PAY' && styles.activeTabText]}>Sovereign Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'TREASURY' && styles.activeTab]} onPress={() => handleTabNavigationExchange('TREASURY')}>
            <Text style={[styles.tabButtonText, activeTab === 'TREASURY' && styles.activeTabText]}>RWA Yield</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'CONSOLE' && styles.activeTab]} onPress={() => handleTabNavigationExchange('CONSOLE')}>
            <Text style={[styles.tabButtonText, activeTab === 'CONSOLE' && styles.activeTabText]}>Dev Console</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'PAY' && (
          <View style={styles.card}>
            <Text style={styles.title}>⚡ Instant Zero-Fee Settlement Gateway</Text>
            <Text style={styles.amount}>$107.20 USD</Text>
            <View style={styles.qrContainer}>
              <QRCode value={invoice} size={180} color="#FAFAFA" backgroundColor="#18181B" />
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={() => Clipboard.setString(invoice)}>
              <Text style={styles.actionButtonText}>Copy Secure Checkout Link</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'TREASURY' && (
          <View style={styles.card}>
            <Text style={styles.shieldTitle}>THE PULSE NETWORK CORE LEDGER</Text>
            <Text style={styles.mainBalance}>{Math.floor(networkLedger.accumulatedInterestSats).toLocaleString()} SATS</Text>
            <Text style={styles.yieldLabel}>💎 Live Compounding Treasury Interest</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statRow}><Text style={styles.statKey}>Total Float Capital Pool:</Text><Text style={styles.statValue}>{networkLedger.totalFloatSats.toLocaleString()} Sats</Text></View>
              <View style={styles.statRow}><Text style={styles.statKey}>Ecosystem Return Capture:</Text><Text style={styles.statValueHost}>{networkLedger.annualizedYieldRate}% APY</Text></View>
              <View style={styles.statRow}><Text style={styles.statKey}>Developer Console Profits:</Text><Text style={styles.statValueSecured}>+{networkLedger.developerNetProfitSats.toLocaleString()} Sats</Text></View>
            </View>
          </View>
        )}

        {activeTab === 'CONSOLE' && isConsoleUnlocked && (
          <View style={styles.card}>
