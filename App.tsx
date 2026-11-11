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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import QRCode from 'react-native-qrcode-svg';
import PulseLogo from './PulseLogo';
import { ledgerExporter } from './exportLedger';

const LEGAL_USER_AGREEMENT = `THE PULSE NETWORK — MASTER CROSS-PLATFORM TERMS OF SERVICE

1. NON-CUSTODIAL PEER-TO-PEER ARCHITECTURE
The Pulse Network operates strictly as a neutral, non-custodial client software interface routing direct Bitcoin Lightning peer-to-peer transfers. All user funds, receiving addresses, and external banking off-ramp selections remain private to the individual user on their own device. Neither the network nor the developer ever holds, pools, or accesses user capital.

2. DEVELOPER PLATFORM DIVIDEND
A 3.0% network protocol fee routes independently to the Developer Console's designated Lightning destination. Users hold the developer entirely free from any civil or criminal liability, financial damages, losses, or legal friction arising from peer-to-peer agreements.`;

const USER_PROFILE_KEY = '@ThePulseNetwork:UserPrivateProfile';
const DEV_CONSOLE_KEY = '@ThePulseNetwork:DevConsoleConfig';
const LEDGER_STORAGE_KEY = '@ThePulseNetwork:RevenueLedger';

export default function App() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PAY' | 'TREASURY' | 'CONSOLE'>('PAY');

  // Private User P2P State (Stored locally on user's device only)
  const [userLightningAddress, setUserLightningAddress] = useState<string>('');
  const [userPreferredBank, setUserPreferredBank] = useState<string>('');
  const [peerRecipientAddress, setPeerRecipientAddress] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('100.00');
  const [settlementMode, setSettlementMode] = useState<'PEER' | 'FEE'>('PEER');

  // Biometric-Locked Developer Console State (Isolated from User Data)
  const [isConsoleUnlocked, setIsConsoleUnlocked] = useState<boolean>(false);
  const [devProfile, setDevProfile] = useState({
    corporateEntity: 'The Pulse Network LLC',
    einNumber: 'PENDING_REGISTRATION',
    dunsNumber: 'PENDING_REGISTRATION',
    devLightningAddress: 'developer@thepulsenetwork.com',
    devOffRampBank: 'Corporate LLC Checking (Private)',
  });

  const [inputEIN, setInputEIN] = useState('');
  const [inputDUNS, setInputDUNS] = useState('');
  const [inputDevLightning, setInputDevLightning] = useState('');
  const [inputDevBank, setInputDevBank] = useState('');
  const [csvPreview, setCsvPreview] = useState<string>('');
  const [loading] = useState<boolean>(false);

  // Reference BTC/USD conversion rate for satoshi display
  const BTC_USD_REFERENCE = 90000;

  const [feeBreakdown, setFeeBreakdown] = useState({
    baseAmount: 100.0,
    developerNetProfit: 3.0,
    routingSurcharge: 4.2,
    grossTotalUSD: 107.2,
    peerSats: 111111,
    devFeeSats: 3333,
  });

  const [treasury, setTreasury] = useState({
    totalEcosystemFloatUSD: 4500000,
    annualizedYieldRate: 4.5,
    accumulatedYieldUSD: 1245.8,
  });

  // Load saved local profiles on startup
  useEffect(() => {
    const loadSavedProfiles = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(USER_PROFILE_KEY);
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUserLightningAddress(parsedUser.lightningAddress || '');
          setUserPreferredBank(parsedUser.preferredBank || '');
        }
        const savedDev = await AsyncStorage.getItem(DEV_CONSOLE_KEY);
        if (savedDev) {
          setDevProfile((prev) => ({ ...prev, ...JSON.parse(savedDev) }));
        }
      } catch {
        // Ignore storage read errors on initial boot
      }
    };
    loadSavedProfiles();
  }, []);

  // Recalculate P2P and Developer Dividend splits dynamically
  useEffect(() => {
    const parsedBase = parseFloat(amountInput);
    const validBase = Number.isFinite(parsedBase) && parsedBase > 0 ? parsedBase : 0;
    const devProfit = validBase * 0.03;
    const surcharge = validBase * 0.042;
    const grossTotal = validBase + devProfit + surcharge;

    const peerSats = Math.round((validBase / BTC_USD_REFERENCE) * 100_000_000);
    const devFeeSats = Math.round((devProfit / BTC_USD_REFERENCE) * 100_000_000);

    setFeeBreakdown({
      baseAmount: validBase,
      developerNetProfit: devProfit,
      routingSurcharge: surcharge,
      grossTotalUSD: grossTotal,
      peerSats,
      devFeeSats,
    });
  }, [amountInput]);

  const activeLightningTarget =
    settlementMode === 'PEER'
      ? peerRecipientAddress.trim() || userLightningAddress.trim() || 'peer@lightning.wallet'
      : devProfile.devLightningAddress;

  const activeLightningUri = `lightning:${activeLightningTarget}`;

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setAmountInput(`${parts[0]}.${parts.slice(1).join('')}`);
    } else {
      setAmountInput(cleaned);
    }
  };

  const handleUserSignUp = async () => {
    if (!hasAcceptedTerms) {
      Alert.alert(
        'Agreement Mandatory',
        'You must click to read and accept the Terms of Service to initialize your account.'
      );
      return;
    }
    await AsyncStorage.setItem(
      USER_PROFILE_KEY,
      JSON.stringify({
        lightningAddress: userLightningAddress.trim(),
        preferredBank: userPreferredBank.trim(),
      })
    );
    setIsRegistered(true);
    Alert.alert(
      'Private Account Initialized',
      'Your Lightning receiving address and off-ramp preferences are stored privately on your device.'
    );
  };

  const handleSaveUserPrivateSettings = async () => {
    await AsyncStorage.setItem(
      USER_PROFILE_KEY,
      JSON.stringify({
        lightningAddress: userLightningAddress.trim(),
        preferredBank: userPreferredBank.trim(),
      })
    );
    Alert.alert(
      'User Privacy Saved',
      'Your personal P2P Lightning Address and off-ramp institution are saved locally on your device only.'
    );
  };

  const handleSecureConsoleUnlock = async () => {
    const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardwareSupport || !isEnrolled) {
      Alert.alert(
        'Hardware Security Required',
        'Biometric or device passcode authentication is not enrolled on this device. Developer Console remains locked.'
      );
      return;
    }

    const scanResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify Developer Identity to Unlock Console',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (scanResult.success) {
      setIsConsoleUnlocked(true);
      setActiveTab('CONSOLE');
    } else {
      Alert.alert('Authentication Failed', 'Developer Console remains locked.');
    }
  };

  const handleSaveDeveloperFields = async () => {
    if (inputDUNS.length > 0 && inputDUNS.length < 9) {
      Alert.alert(
        'Validation Error',
        'D-U-N-S entry must match standard 9-digit formatting rules.'
      );
      return;
    }
    const updatedDev = {
      ...devProfile,
      einNumber: inputEIN.trim() || devProfile.einNumber,
      dunsNumber: inputDUNS.trim() || devProfile.dunsNumber,
      devLightningAddress: inputDevLightning.trim() || devProfile.devLightningAddress,
      devOffRampBank: inputDevBank.trim() || devProfile.devOffRampBank,
    };
    setDevProfile(updatedDev);
    await AsyncStorage.setItem(DEV_CONSOLE_KEY, JSON.stringify(updatedDev));
    Alert.alert(
      'Developer Console Updated',
      'Developer payout Lightning destination and off-ramp institution saved securely.'
    );
  };

  const handleRecordSimulatedSettlement = async () => {
    try {
      const existing = await AsyncStorage.getItem(LEDGER_STORAGE_KEY);
      const rows = existing ? JSON.parse(existing) : [];
      rows.push({
        txId: `TX_LN_${Date.now()}`,
        grossAmountUSD: feeBreakdown.grossTotalUSD,
        developerProfitUSD: feeBreakdown.developerNetProfit,
        paymentRail: 'BITCOIN_LIGHTNING',
        timestamp: new Date().toISOString(),
        dataType: 'LOCAL_STORED',
      });
      await AsyncStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(rows));
      Alert.alert(
        'Settlement Logged Locally',
        `Recorded $${feeBreakdown.developerNetProfit.toFixed(2)} developer dividend to your local console ledger.`
      );
    } catch {
      Alert.alert('Ledger Error', 'Could not write local ledger record.');
    }
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
    Alert.alert('Copied', 'Bitcoin Lightning payment URI copied to clipboard.');
  };

  const openLightningWallet = async () => {
    const supported = await Linking.canOpenURL(activeLightningUri);
    if (supported) {
      await Linking.openURL(activeLightningUri);
    } else {
      Alert.alert(
        'Lightning Wallet Required',
