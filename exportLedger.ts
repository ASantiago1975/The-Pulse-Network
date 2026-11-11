// exportLedger.ts - Cross-Platform Bitcoin Lightning Local CSV Revenue Exporter
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LedgerDataType = 'LOCAL_STORED' | 'SIMULATED_DEMO';

export interface LiveRevenueRow {
  txId: string;
  grossAmountUSD: number;
  developerProfitUSD: number;
  paymentRail: 'BITCOIN_LIGHTNING' | 'BITCOIN_LIGHTNING_DEMO';
  timestamp: string;
  dataType?: LedgerDataType;
}

export interface ExportResult {
  success: boolean;
  csvString: string;
  logMessage: string;
  isDemoData: boolean;
}

export class ProductionLedgerExporter {
  private readonly STORAGE_KEY = '@ThePulseNetwork:RevenueLedger';

  /**
   * Compiles on-device developer console dividend records into a standardized CSV string
   * when explicitly invoked by a developer console action.
   */
  async exportRevenueLogToCSV(): Promise<ExportResult> {
    try {
      const serializedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const hasStoredLedger = Boolean(serializedData);

      const activeRows: LiveRevenueRow[] = serializedData
        ? (JSON.parse(serializedData) as LiveRevenueRow[])
        : [
            {
              txId: 'TX_PULSE_LN_SIM_001',
              grossAmountUSD: 107.2,
              developerProfitUSD: 3.0,
              paymentRail: 'BITCOIN_LIGHTNING_DEMO',
              timestamp: '2026-11-11T02:14:00Z',
              dataType: 'SIMULATED_DEMO',
            },
            {
              txId: 'TX_PULSE_LN_SIM_002',
              grossAmountUSD: 250.0,
              developerProfitUSD: 7.5,
              paymentRail: 'BITCOIN_LIGHTNING_DEMO',
              timestamp: '2026-11-11T03:45:12Z',
              dataType: 'SIMULATED_DEMO',
            },
            {
              txId: 'TX_PULSE_LN_SIM_003',
              grossAmountUSD: 15.5,
              developerProfitUSD: 0.46,
              paymentRail: 'BITCOIN_LIGHTNING_DEMO',
              timestamp: '2026-11-11T04:01:55Z',
              dataType: 'SIMULATED_DEMO',
            },
          ];

      const header =
        'Transaction_ID,Gross_Volume_USD,Developer_Net_Profit_USD,Payment_Rail,Data_Type,Timestamp_UTC\n';

      const rows = activeRows
        .map((row) => {
          const resolvedType: LedgerDataType =
            row.dataType ?? (hasStoredLedger ? 'LOCAL_STORED' : 'SIMULATED_DEMO');
          return `${row.txId},${row.grossAmountUSD.toFixed(2)},${row.developerProfitUSD.toFixed(2)},${row.paymentRail},${resolvedType},${row.timestamp}`;
        })
        .join('\n');

      const csvOutput = `${header}${rows}\n`;
      const modeLabel = hasStoredLedger
        ? 'local stored Bitcoin Lightning records'
        : 'simulated Bitcoin Lightning demo rows (no stored transactions found)';

      return {
        success: true,
        csvString: csvOutput,
        logMessage: `Export complete. Compiled ${activeRows.length} ${modeLabel} into CSV format.`,
        isDemoData: !hasStoredLedger,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown storage export error';
      return {
        success: false,
        csvString: '',
        logMessage: `Export fault: ${message}`,
        isDemoData: false,
      };
    }
  }
}

export const ledgerExporter = new ProductionLedgerExporter();
