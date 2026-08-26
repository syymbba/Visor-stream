import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Smartphone,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../data/mockData';
import { getAuthHeaders } from '../firebase';

export interface PaymentTransaction {
  id: string;
  merchantReference: string;
  orderTrackingId?: string;
  type: 'subscription' | 'tip' | 'topup' | 'cashout' | string;
  planId?: string;
  userId?: string;
  creatorId?: string;
  streamId?: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'INVALID' | string;
  paymentMethod?: string;
  description?: string;
  email?: string;
  phone?: string;
  creatorEarnings?: number;
  platformEarnings?: number;
  confirmationCode?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentHistoryProps {
  currentCurrency?: Currency;
  userId?: string;
  onSelectTransaction?: (tx: PaymentTransaction) => void;
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  currentCurrency = 'UGX',
  userId,
  onSelectTransaction,
  className = '',
}) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [simulatingIpn, setSimulatingIpn] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleReconcile = async (merchantRef: string, trackingId?: string) => {
    try {
      setReconcilingId(merchantRef);
      const res = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({
          merchantReference: merchantRef,
          orderTrackingId: trackingId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Reconciled ${merchantRef}: ${data.reconciledStatus}`);
        fetchHistory();
      } else {
        setActionNotice(`Reconcile note: ${data.error || 'No change'}`);
      }
    } catch (err: any) {
      setActionNotice(`Reconcile failed: ${err.message}`);
    } finally {
      setReconcilingId(null);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleSimulateIpn = async () => {
    try {
      setSimulatingIpn(true);
      const res = await fetch('/api/payments/simulate-ipn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
        body: JSON.stringify({
          amount: 25000,
          currency: currentCurrency === 'USD' ? 'USD' : 'UGX',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Simulated IPN Confirmed! Ref: ${data.merchantReference}`);
        fetchHistory();
      }
    } catch (err: any) {
      setActionNotice(`Simulation failed: ${err.message}`);
    } finally {
      setSimulatingIpn(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleVerify = async (trackingId: string) => {
    try {
      const res = await fetch(`/api/payments/status/${encodeURIComponent(trackingId)}`, {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      setActionNotice(res.ok
        ? `Payment status: ${data.status?.payment_status_description || data.order?.status || 'Unknown'}`
        : data.error || 'Unable to verify payment');
    } catch (err: any) {
      setActionNotice(`Verification failed: ${err.message}`);
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = userId
        ? `/api/payments/history?userId=${encodeURIComponent(userId)}`
        : '/api/payments/history';
      const res = await fetch(url, { headers: await getAuthHeaders() });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && Array.isArray(data.history)) {
          setTransactions(data.history);
        } else {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      console.warn('Payment history fetch error:', err);
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchQuery ||
      tx.merchantReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.orderTrackingId && tx.orderTrackingId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.email && tx.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          <span>COMPLETED</span>
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3 animate-pulse" />
          <span>PENDING</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <XCircle className="w-3 h-3" />
        <span>FAILED</span>
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Sparkles className="w-4 h-4 text-sky-400" />;
      case 'tip':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'cashout':
        return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Pesapal v3 Payment History</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono-code">
                {filteredTransactions.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live audit ledger of mobile money tips, subscriptions, and payouts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSimulateIpn}
            disabled={simulatingIpn}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Simulate Pesapal IPN Webhook"
          >
            <Sparkles className={`w-3.5 h-3.5 ${simulatingIpn ? 'animate-spin' : ''}`} />
            <span>Test IPN Webhook</span>
          </button>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Action Toast Notice */}
      {actionNotice && (
        <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white text-xs font-bold">Dismiss</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 my-5">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order ref, tracking ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-400"
          >
            <option value="all">All Types (Tips & Subs)</option>
            <option value="subscription">Subscriptions</option>
            <option value="tip">Live Stream Tips</option>
            <option value="cashout">Wallet Cashouts</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-400"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Transaction List / Table */}
      {loading && transactions.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto mb-3" />
          <p className="text-xs font-bold">Synchronizing with Pesapal Ledger...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-400 text-center">
          <p className="font-bold mb-1">Failed to load payment records</p>
          <p>{error}</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800/80 p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-300">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Transactions made via Pesapal (MTN MoMo, Airtel, M-Pesa, or Visa/Mastercard) will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono-code text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Transaction Ref</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Gross Amount</th>
                <th className="pb-3">Creator (70%)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3 pr-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Ref & Tracking ID */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white tracking-tight">{tx.merchantReference}</span>
                      <button
                        onClick={() => handleCopy(tx.merchantReference, tx.id)}
                        className="text-slate-500 hover:text-sky-400 transition-colors"
                        title="Copy Reference"
                      >
                        {copiedId === tx.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {tx.orderTrackingId && (
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                        ID: {tx.orderTrackingId}
                      </span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5">
                      {getTypeIcon(tx.type)}
                      <span className="capitalize text-slate-300 font-bold text-xs">{tx.type}</span>
                    </div>
                    {tx.paymentMethod && (
                      <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                        {tx.paymentMethod}
                      </span>
                    )}
                  </td>

                  {/* Gross Amount */}
                  <td className="py-3.5">
                    <span className="font-black text-white text-xs">
                      {tx.currency} {tx.amount.toLocaleString()}
                    </span>
                  </td>

                  {/* 70% Share */}
                  <td className="py-3.5">
                    <span className="text-emerald-400 font-bold text-xs">
                      {tx.currency}{' '}
                      {(tx.creatorEarnings || (tx.type === 'tip' ? tx.amount : tx.amount * 0.7)).toLocaleString()}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5">{getStatusBadge(tx.status)}</td>

                  {/* Date */}
                  <td className="py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>

                  {/* Actions / Details */}
                  <td className="py-3.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {tx.status === 'PENDING' && (
                        <button
                          onClick={() => handleReconcile(tx.merchantReference, tx.orderTrackingId)}
                          disabled={reconcilingId === tx.merchantReference}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition-colors disabled:opacity-50"
                          title="Force Reconcile with Pesapal IPN"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${reconcilingId === tx.merchantReference ? 'animate-spin' : ''}`} />
                          <span>Reconcile</span>
                        </button>
                      )}
                      {tx.orderTrackingId && (
                        <button
                          onClick={() => handleVerify(tx.orderTrackingId!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] font-bold transition-colors"
                        >
                          <span>Verify</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
