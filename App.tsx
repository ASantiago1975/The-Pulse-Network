import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import QRCode from 'react-native-qrcode-svg';
import PulseLogo from './PulseLogo';
import { ledgerExporter } from './exportLedger';

const LEGAL_USER_AGREEMENT = `THE PULSE NETWORK — MASTER CROSS-PLATFORM TERMS OF SERVICE

1. DECENTRALIZED INTERFACE INDEMNIFICATION
The Pulse Network operates strictly as a neutral, decentralized client software interface utilizing peer-to-peer communication routing over open protocols. By finalizing registration, the User explicitly confirms that all spatial intent broadcasts and financial contracts occur strictly within User-to-User bounds. The network architecture and developer maintain zero custodial access or oversight over these processing fields. The User holds the developer entirely free from any civil or criminal liability, financial damages, losses, or legal friction arising from user-to-user agreements.`;

const PAYPAL_BUSINESS_HANDLE = 'YourBusinessHandle';

export default function App() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PAY' | 'TREASURY' | 'CONSOLE'>('PAY');

  const [amountInput, setAmountInput] = useState<string>('100.00');
  const [invoice, setInvoice] = useState<string>(
    `https://paypal.com{PAYPAL_BUSINESS_HANDLE}/107.20`
  );
  const [loading] = useState<boolean>(false);
  const [isConsoleUnlocked, setIsConsoleUnlocked] = useState<boolean>(false);
  const [csvPreview, setCsvPreview] = useState<string>('');

  const [feeBreakdown, setFeeBreakdown] = useState({
    baseAmount: 100.0,
    developerNetProfit: 3.0,
    processorSurcharge: 4.2,
    grossTotalChargedToUser: 107.2,
  });

  const [treasury, setTreasury] = useState({
    totalEcosystemFloatUSD: 4500000,
    annualizedYieldRate: 4.5,
    accumulatedYieldUSD: 1245.8,
  });

  const [devProfile, setDevProfile] = useState({
    corporateEntity: 'The Pulse Network LLC',
    einNumber: 'PENDING_REGISTRATION',
    dunsNumber: 'PENDING_REGISTRATION',
  });

  const [inputEIN, setInputEIN] = useState('');
  const [inputDUNS, setInputDUNS] = useState('');

  useEffect(() => {
    const parsedBase = parseFloat(amountInput);
    const validBase = Number.isFinite(parsedBase) && parsedBase > 0 ? parsedBase : 0;
    const devProfit = validBase * 0.03;
    const surcharge = validBase * 0.042;
    const grossTotal = validBase + devProfit + surcharge;

    setFeeBreakdown({
      baseAmount: validBase,
      developerNetProfit: devProfit,
      processorSurcharge: surcharge,
      grossTotalChargedToUser: grossTotal,
    });

    setInvoice(
      grossTotal > 0
        ? `https://paypal.com{PAYPAL_BUSINESS_HANDLE}/${grossTotal.toFixed(2)}`
        : `https://paypal.com{PAYPAL_BUSINESS_HANDLE}`
    );
  }, [amountInput]);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setAmountInput(`${parts[0]}.${parts.slice(1).join('')}`);
    } else {
      setAmountInput(cleaned);
    }
  };

  const handleUserSignUp = () => {
    if (!hasAcceptedTerms) {
      Alert.alert(
        'Agreement Mandatory',
        'You must click to read and accept the Terms of Service to initialize your account.'
      );
      return;
    }
    setIsRegistered(true);
    Alert.alert(
      'Account Initialized',
      'Local cryptographic node profile registered successfully on-device.'
    );
  };

  const handleSecureConsoleUnlock = async () => {
    const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardwareSupport || !isEnrolled) {
      Alert.alert(
        'Hardware Security Required',
        'Biometric or device passcode authentication is not enrolled on this device. Console access remains locked.'
      );
      return;
    }

    const scanResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify Identity to Unlock Console',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (scanResult.success) {
      setIsConsoleUnlocked(true);
      setActiveTab('CONSOLE');
    } else {
      Alert.alert('Authentication Failed', 'Console access remains locked.');
    }
  };

  const handleSaveDeveloperFields = () => {
    if (inputDUNS.length > 0 && inputDUNS.length < 9) {
      Alert.alert(
        'Validation Error',
        'D-U-N-S entry must match standard 9-digit formatting rules.'
      );
      return;
    }
    setDevProfile((prev) => ({
      ...prev,
      einNumber: inputEIN || prev.einNumber,
      dunsNumber: inputDUNS || prev.dunsNumber,
    }));
    Alert.alert('Local Sync Success', 'Data cache updated. Live balances unaffected.');
  };

  const handleExportCsvAction = async () => {
    const result = await ledgerExporter.exportRevenueLogToCSV();
    if (result.success) {
      setCsvPreview(result.csvString);
      await Clipboard.setStringAsync(result.csvString);
      Alert.alert('Ledger Exported', `${result.logMessage}\n\nCopied to clipboard.`);
    } else {
      Alert.alert('Export Error', result.logMessage);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'PayPal.me payment link copied to clipboard.');
  };

  const openPayPalPortal = async () => {
    if (PAYPAL_BUSINESS_HANDLE === 'YourBusinessHandle') {
      Alert.alert(
        'Configuration Required',
        'Replace YourBusinessHandle in App.tsx with your live PayPal.me username before launching.'
      );
      return;
    }
    const supported = await Linking.canOpenURL(invoice);
    if (supported) {
      await Linking.openURL(invoice);
    } else {
      Alert.alert('Portal Error', 'Unable to open external PayPal.me link.');
    }
  };

  useEffect(() => {
    if (!isRegistered) return;
    const yieldInterval = setInterval(() => {
      setTreasury((prev) => {
        const yieldPerSecond =
          (prev.totalEcosystemFloatUSD * (prev.annualizedYieldRate / 100)) /
          (365 * 24 * 3600);
        return { ...prev, accumulatedYieldUSD: prev.accumulatedYieldUSD + yieldPerSecond };
      });
    }, 1000);
    return () => clearInterval(yieldInterval);
  }, [isRegistered]);

  if (!isRegistered) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.registrationContainer}>
          <PulseLogo size={76} />
          <Text style={styles.registrationTitle}>The Pulse Network</Text>
          <Text style={styles.registrationSubtitle}>Cross-Platform Node Registry Protocol</Text>
          <ScrollView style={styles.legalScrollView} nestedScrollEnabled={true}>
            <Text style={styles.legalBodyText}>{LEGAL_USER_AGREEMENT}</Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.checkboxRow, hasAcceptedTerms && styles.checkboxActive]}
            onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}
          >
            <Text style={styles.checkboxText}>
              {hasAcceptedTerms
                ? '✓ TERMS ACCEPTED • DEVELOPER INDEMNIFIED'
                : '☐ Read and accept terms & legal conditions'}
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
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'PAY' && styles.activeTab]}
            onPress={() => setActiveTab('PAY')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'PAY' && styles.activeTabText]}>
              Pay
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'TREASURY' && styles.activeTab]}
            onPress={() => setActiveTab('TREASURY')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'TREASURY' && styles.activeTabText]}>
              Yield View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'CONSOLE' && styles.activeTab]}
            onPress={() => handleSecureConsoleUnlock()}
          >
            <Text style={[styles.tabButtonText, activeTab === 'CONSOLE' && styles.activeTabText]}>
              Dev Console
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'PAY' && (
          <View style={styles.card}>
            <Text style={styles.title}>⚡ PayPal.me Checkout Gateway</Text>
            <Text style={styles.amount}>
              ${feeBreakdown.grossTotalChargedToUser.toFixed(2)} USD
            </Text>

            <View style={styles.amountInputWrapper}>
              <Text style={styles.inputLabel}>Enter Base Amount (USD)</Text>
              <TextInput
                style={styles.amountInputField}
                value={amountInput}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="100.00"
                placeholderTextColor="#4b5563"
              />
            </View>

