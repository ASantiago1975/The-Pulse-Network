// App.tsx - Cross-Platform Master Application Engine for Google Play & Apple App Store
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, Clipboard, ScrollView, TextInput, Alert, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as LocalAuthentication from 'expo-local-authentication'; // Cross-platform native hardware authentication bridge
import PulseLogo from './PulseLogo';

const LEGAL_USER_AGREEMENT = `THE PULSE NETWORK — MASTER CROSS-PLATFORM TERMS OF SERVICE

1. DECENTRALIZED INTERFACE INDEMNIFICATION
The Pulse Network operates exclusively as a neutral, decentralized client software interface utilizing peer-to-peer communication routing over open protocols. By finalizing registration, the User explicitly confirms that all spatial intent broadcasts and financial contracts occur strictly within User-to-User bounds. The network architecture and developer maintain zero custodial access or oversight over these processing fields. The User holds the developer entirely free from any civil or criminal liability, financial damages, losses, or legal friction arising from user-to-user agreements.

2. SINGLE-OWNER REVENUE PIPELINES
To preserve infrastructure integrity, an un-alterable 3% platform dividend is collected natively on all transactional operations. All platform revenues, subscription packages, and developer distributions are safely awarded and managed strictly through the secure, developer-controlled console backend pipelines. Surcharges are auto-allocated directly onto the customer checkout block.`;

export default function App() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PAY' | 'TREASURY' | 'CONSOLE'>('PAY');
  
  const [invoice] = useState<string>('https://paypal.com');
  const [amountSats] = useState<number>(50000);
  const [loading] = useState<boolean>(false);
  const [isConsoleUnlocked, setIsConsoleUnlocked] = useState<boolean>(false);

  const [networkLedger, setNetworkLedger] = useState({
    totalFloatSats: 450000000,
    annualizedYieldRate: 4.5,
    accumulatedInterestSats: 124580,
    developerNetProfitSats: 1500
  });

  const [devProfile, setDevProfile] = useState({
    corporateEntity: "The Pulse Network LLC",
    einNumber: "12-3456789",
    dunsNumber: "012345678"
  });

  const [inputEIN, setInputEIN] = useState(devProfile.einNumber);
  const [inputDUNS, setInputDUNS] = useState(devProfile.dunsNumber);

  /**
   * Universal Onboarding Registration Sequence
   */
  const handleUserSignUp = () => {
    if (!hasAcceptedTerms) {
      Alert.alert("Agreement Mandatory", "You must scroll through and accept the Terms of Service to initialize account setup.");
      return;
    }
    setIsRegistered(true);
    Alert.alert("Account Matrix Online", `Sovereign local profile generated on-device via ${Platform.OS === 'ios' ? 'Apple iOS' : 'Android'} frameworks.`);
  };

  /**
   * Cross-Platform Hardware Biometric Check Enforcer
   */
  const handleSecureConsoleUnlock = async () => {
    console.log(`[Security System] Initializing ${Platform.OS.toUpperCase()} hardware biometric verification check...`);
    
    const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardwareSupport || !isEnrolled) {
      Alert.alert("Security Restriction", `Biometric verification (${Platform.OS === 'ios' ? 'FaceID/TouchID' : 'Fingerprint Enclave'}) is unconfigured on this phone terminal.`);
      return;
    }

    const scanResult = await LocalAuthentication.authenticateAsync({
      promptMessage: Platform.OS === 'ios' ? 'FaceID Verification Required' : 'Authenticate Fingerprint to Unlock Console',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    if (scanResult.success) {
      setIsConsoleUnlocked(true);
      setActiveTab('CONSOLE');
    } else {
      Alert.alert("Access Denied", "Cryptographic signature validation rejected.");
    }
  };

  const handleUpdateDeveloperData = () => {
    if (inputDUNS.length < 9) {
      Alert.alert("Error", "D-U-N-S entry must match standard 9-digit formatting rules.");
      return;
    }
    setDevProfile(prev => ({ ...prev, einNumber: inputEIN, dunsNumber: inputDUNS }));
    Alert.alert("Console Sync", "Corporate database records updated safely. Network balances remain isolated.");
  };

  // Real-time compound interest tracker ticking loop
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
          <PulseLogo size={76} />
          <Text style={styles.registrationTitle}>The Pulse Network</Text>
          <Text style={styles.registrationSubtitle}>Cross-Platform Protocol Node Registry</Text>
          <ScrollView style={styles.legalScrollView} nestedScrollEnabled={true}>
            <Text style={styles.legalBodyText}>{LEGAL_USER_AGREEMENT}</Text>
          </ScrollView>
          <TouchableOpacity style={[styles.checkboxRow, hasAcceptedTerms && styles.checkboxActive]} onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}>
            <Text style={styles.checkboxText}>
              {hasAcceptedTerms ? "✓ TERMS ACCEPTED • DEVELOPER FULLY INDEMNIFIED" : "☐ Click to read and accept terms & legal conditions"}
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
        <PulseLogo size={40} />
        <View style={styles.tabButtons}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'PAY' && styles.activeTab]} onPress={() => setActiveTab('PAY')}>
            <Text style={[styles.tabButtonText, activeTab === 'PAY' && styles.activeTabText]}>Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'TREASURY' && styles.activeTab]} onPress={() => setActiveTab('TREASURY')}>
            <Text style={[styles.tabButtonText, activeTab === 'TREASURY' && styles.activeTabText]}>RWA Yield</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'CONSOLE' && styles.activeTab]} onPress={() => handleSecureConsoleUnlock()}>
            <Text style={[styles.tabButtonText, activeTab === 'CONSOLE' && styles.activeTabText]}>Dev Console</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'PAY' && (
          <View style={styles.card}>
            <Text style={styles.title}>⚡ Universal P2P Settlement Rails</Text>
            <Text style={styles.amount}>$107.20 USD</Text>
            <View style={styles.qrContainer}>
              {loading ? <ActivityIndicator size="large" color="#6366F1" /> : <QRCode value={invoice} size={180} color="#FAFAFA" backgroundColor="#18181B" />}
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={() => Clipboard.setString(invoice)}>
              <Text style={styles.actionButtonText}>Copy Secure Settlement Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'TREASURY' && (
          <View style={styles.card}>
            <Text style={styles.shieldTitle}>UNIFIED REAL-TIME BALANCES INDEX</Text>
            <Text style={styles.mainBalance}>{Math.floor(networkLedger.accumulatedInterestSats).toLocaleString()} SATS</Text>
            <Text style={styles.yieldLabel}>💎 Live Compounding Treasury Float Yield</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statRow}><Text style={styles.statKey}>Total Float Capital Pool:</Text><Text style={styles.statValue}>{networkLedger.totalFloatSats.toLocaleString()} Sats</Text></View>
              <View style={styles.statRow}><Text style={styles.statKey}>Ecosystem Return Capture:</Text><Text style={styles.statValueHost}>{networkLedger.annualizedYieldRate}% APY</Text></View>
              <View style={styles.statRow}><Text style={styles.statKey}>Active Device Architecture:</Text><Text style={styles.statValueSecured}>{Platform.OS.toUpperCase()} Core Native</Text></View>
            </View>
          </View>
        )}

        {activeTab === 'CONSOLE' && isConsoleUnlocked && (
          <View style={styles.card}>
            <Text style={styles.title}>🏛️ Developer Console Database Control</Text>
            <Text style={styles.successBadge}>● CONSOLE PRIVILEGES EXTRACTED SECURELY</Text>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Update Employer Identification Number (EIN)</Text>
              <TextInput style={styles.inputField} value={inputEIN} onChangeText={setInputEIN} placeholder="12-3456789" placeholderTextColor="#4b5563" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Update D-U-N-S Profile Identifier</Text>
