import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, TextInput, Alert, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import QRCode from 'react-native-qrcode-svg';
import PulseLogo from './PulseLogo';

const LEGAL_USER_AGREEMENT = `THE PULSE NETWORK — MASTER CROSS-PLATFORM TERMS OF SERVICE

1. DECENTRALIZED INTERFACE INDEMNIFICATION
The Pulse Network operates strictly as a neutral, decentralized client software interface utilizing peer-to-peer communication routing over open protocols. By finalizing registration, the User explicitly confirms that all spatial intent broadcasts and financial contracts occur strictly within User-to-User bounds. The network architecture and developer maintain zero custodial access or oversight over these processing fields. The User holds the developer entirely free from any civil or criminal liability, financial damages, losses, or legal friction arising from user-to-user agreements.`;

export default function App() {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'PAY' | 'TREASURY' | 'CONSOLE'>('PAY');
  
  const [invoice] = useState<string>('https://paypal.com');
  const [amountFiat] = useState<number>(100.00);
  const [loading] = useState<boolean>(false);
  const [isConsoleUnlocked, setIsConsoleUnlocked] = useState<boolean>(false);

  const [feeBreakdown, setFeeBreakdown] = useState({
    baseAmount: 100.00,
    developerNetProfit: 3.00,      
    processorSurcharge: 4.20,      
    grossTotalChargedToUser: 107.20
  });

  const [treasury, setTreasury] = useState({
    totalEcosystemFloatUSD: 4500000,
    annualizedYieldRate: 4.5,
    accumulatedYieldUSD: 1245.80,
  });

  const [devProfile, setDevProfile] = useState({
    corporateEntity: "The Pulse Network LLC (Demo Configuration)",
    einNumber: "PENDING_REGISTRATION",
    dunsNumber: "PENDING_REGISTRATION"
  });

  const [inputEIN, setInputEIN] = useState('');
  const [inputDUNS, setInputDUNS] = useState('');

  useEffect(() => {
    const devProfit = amountFiat * 0.03;
    const surcharge = amountFiat * 0.042;
    setFeeBreakdown({
      baseAmount: amountFiat,
      developerNetProfit: devProfit,
      processorSurcharge: surcharge,
      grossTotalChargedToUser: amountFiat + devProfit + surcharge
    });
  }, [amountFiat]);

  const handleSecureConsoleUnlock = async () => {
    const hasHardwareSupport = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardwareSupport || !isEnrolled) {
      setIsConsoleUnlocked(true);
      setActiveTab('CONSOLE');
      return;
    }

    const scanResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify Identity to Unlock Console',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false
    });

    if (scanResult.success) {
      setIsConsoleUnlocked(true);
      setActiveTab('CONSOLE');
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Simulation link copied to local clipboard.");
  };

  useEffect(() => {
    if (!isRegistered) return;
    const yieldInterval = setInterval(() => {
      setTreasury(prev => {
        const yieldPerSecond = (prev.totalEcosystemFloatUSD * (prev.annualizedYieldRate / 100)) / (365 * 24 * 3600);
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
          <TouchableOpacity style={[styles.checkboxRow, hasAcceptedTerms && styles.checkboxActive]} onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}>
            <Text style={styles.checkboxText}>
              {hasAcceptedTerms ? "✓ TERMS ACCEPTED • DEVELOPER INDEMNIFIED" : "☐ Read and accept terms & legal conditions"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton} onPress={() => setIsRegistered(true)}>
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
            <Text style={[styles.tabButtonText, activeTab === 'TREASURY' && styles.activeTabText]}>Yield View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'CONSOLE' && styles.activeTab]} onPress={() => handleSecureConsoleUnlock()}>
            <Text style={[styles.tabButtonText, activeTab === 'CONSOLE' && styles.activeTabText]}>Dev Console</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'PAY' && (
          <View style={styles.card}>
            <Text style={styles.title}>⚡ Simulated Gateway Interface</Text>
            <Text style={styles.amount}>${feeBreakdown.grossTotalChargedToUser.toFixed(2)} USD</Text>
            <View style={styles.qrContainer}>
              {loading ? <ActivityIndicator size="large" color="#6366F1" /> : <QRCode value={invoice} size={180} color="#FAFAFA" backgroundColor="#18181B" />}
            </View>
            <View style={styles.feeBreakdownBox}>
              <Text style={styles.feeText}>[Demo Base Amount]: ${feeBreakdown.baseAmount.toFixed(2)}</Text>
              <Text style={styles.feeText}>[Simulated Surcharge]: ${feeBreakdown.processorSurcharge.toFixed(2)}</Text>
              <Text style={styles.devFeeText}>[Projected Net Dividend (3%)]: +${feeBreakdown.developerNetProfit.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton} onPress={() => copyToClipboard(invoice)}>
              <Text style={styles.actionButtonText}>Copy Simulation Link</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'TREASURY' && (
          <View style={styles.card}>
            <Text style={styles.shieldTitle}>📈 SIMULATED REAL-TIME BALANCES INDEX</Text>
            <Text style={styles.mainBalance}>${treasury.accumulatedYieldUSD.toFixed(4)}</Text>
            <Text style={styles.yieldLabel}>💎 Demonstration Value Compounding Tracking</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statRow}><Text style={styles.statKey}>Simulated Pool:</Text><Text style={styles.statValue}>${treasury.totalEcosystemFloatUSD.toLocaleString()}</Text></View>
              <View style={styles.statRow}><Text style={styles.statKey}>Target Performance APY:</Text><Text style={styles.statValueHost}>{treasury.annualizedYieldRate}%</Text></View>
              <View style={styles.statRow}><Text style={styles.statKey}>Execution Mode:</Text><Text style={styles.statValueSecured}>TESTING_SANDBOX</Text></View>
            </View>
          </View>
        )}

        {activeTab === 'CONSOLE' && isConsoleUnlocked && (
          <View style={styles.card}>
            <Text style={styles.title}>🏛️ Developer Console Sandbox</Text>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Corporate Identifier</Text>
              <Text style={styles.dataValueText}>{devProfile.corporateEntity}</Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Input Target EIN for Registry Integration</Text>
              <TextInput style={styles.inputField} value={inputEIN} onChangeText={setInputEIN} placeholder="12-3456789" placeholderTextColor="#4b5563" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Input Target D-U-N-S for Verification Link</Text>
              <TextInput style={styles.inputField} value={inputDUNS} onChangeText={setInputDUNS} keyboardType="numeric" placeholder="012345678" placeholderTextColor="#4b5563" />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={() => Alert.alert("Local Sync Success", "Data cache parsed. Live balances unaffected.")}>
              <Text style={styles.saveButtonText}>Update Local Fields</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  registrationContainer: { width: '100%', padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  registrationTitle: { color: '#FAFAFA', fontSize: 20, fontWeight: 'bold', marginTop: 12 },
