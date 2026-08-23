import React, { useState, useEffect } from 'react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { getAuthHeaders } from '../firebase';
import {
  Receipt,
  Download,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';

interface PayoutsLedgerProps {
  currentCurrency: Currency;
  onOpenNewPayout?: () => void;
  refreshTrigger?: number;
}

export const PayoutsLedger: React.FC<PayoutsLedgerProps> = ({
  currentCurrency,
  onOpenNewPayout,
  refreshTrigger,
}) => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  const rate = CURRENCY_RATES[currentCurrency]?.rate || 3750;
  const symbol = CURRENCY_RATES[currentCurrency]?.symbol || 'UGX';

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payouts/history', { headers: await getAuthHeaders() });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.payouts)) {
          setPayouts(data.payouts);
        } else {
          setPayouts([]);
        }
      } else {
        setPayouts([]);
      }
    } catch (e) {
      console.warn('Error fetching payouts history:', e);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [refreshTrigger]);

  const handleDownloadProof = (p: any) => {
    const content = `
========================================
       VISOR STREAM CREATOR PAYOUT
========================================
Receipt No: ${p.receiptNumber || 'VSR-PAY-' + p.id}
Reference: ${p.reference}
Date: ${new Date(p.createdAt).toLocaleString()}

Recipient: ${p.recipientName}
Payment Rail: ${p.provider}
Destination: ${p.phone}
KYC Tier: ${p.kycTier || 'Tier 2 (Verified)'}

Gross Amount: $${p.amountUsd} (${p.currency} ${parseFloat(p.localAmount || '0').toLocaleString()})
Processing Fee: $${p.feeUsd}
Net Disbursed: $${p.netPayoutUsd} (${p.currency} ${Math.round(parseFloat(p.netPayoutUsd) * rate).toLocaleString()})

Status: ${p.status}
========================================
    Powered by Visor Stream Direct Ingest
========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Visor_Payout_${p.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPayouts = payouts.filter((p) => {
    const matchesSearch =
      (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.recipientName && p.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.phone && p.phone.includes(searchTerm));
    const matchesProvider = selectedProvider === 'all' || p.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search reference, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Rails</option>
            <option value="MTN MoMo">MTN MoMo</option>
            <option value="Airtel Money">Airtel Money</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Bank Transfer">Bank</option>
          </select>
        </div>

        {onOpenNewPayout && (
          <button
            onClick={onOpenNewPayout}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Request Mobile Money Payout</span>
          </button>
        )}
      </div>

      {/* Payouts Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading withdrawal records...</span>
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-300">No Withdrawal History Found</p>
            <p className="text-[11px] text-slate-500">
              When you withdraw stream earnings to MTN MoMo or Airtel Money, your official disbursal records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono-code text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Reference & Rail</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Gross USD</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-code">
                {filteredPayouts.map((p) => (
                  <tr key={p.id || p.reference} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{p.reference}</div>
                      <div className="text-[10px] text-purple-400">{p.provider} • {p.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      <div>{p.recipientName}</div>
                      <div className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-bold">
                      ${p.amountUsd}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      ${p.netPayoutUsd}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {p.currency} {Math.round(parseFloat(p.netPayoutUsd) * rate).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadProof(p)}
                        title="Download Payout Proof Receipt"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
