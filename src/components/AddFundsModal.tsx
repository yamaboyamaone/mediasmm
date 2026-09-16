import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  CreditCard, 
  Smartphone, 
  Zap, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Building2, 
  Globe, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Edit3,
  Save,
  Settings,
  MessageCircle,
  RotateCcw
} from 'lucide-react';
import { Currency, OwnerBankDetails } from '../types';
import { PAYMENT_GATEWAYS, CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onDeposit: (amount: number, gatewayName: string) => void;
  balance: number;
  initialEditBank?: boolean;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onDeposit,
  balance,
  initialEditBank = false
}) => {
  // Region filter: 'africa' or 'global' or 'all'
  const isAfricanUser = currency === 'NGN' || currency === 'GHS' || currency === 'XAF' || currency === 'XOF';
  const [activeTab, setActiveTab] = useState<'africa' | 'global'>(isAfricanUser ? 'africa' : 'africa');
  
  // Deposit currency mode: either depositing in local currency or USD
  const [depositCurrency, setDepositCurrency] = useState<Currency>(
    isAfricanUser ? currency : 'NGN'
  );

  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(
    isAfricanUser ? 'paystack' : 'paystack'
  );

  // Raw amount entered in the selected depositCurrency
  const [localInputAmount, setLocalInputAmount] = useState<number>(() => {
    if (depositCurrency === 'NGN') return 15500;
    if (depositCurrency === 'GHS') return 150;
    if (depositCurrency === 'XAF' || depositCurrency === 'XOF') return 10000;
    return 25;
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<{ 
    amountUSD: number; 
    creditedUSD: number; 
    localAmount: number;
    localCurrency: Currency;
    txId: string;
    gatewayName: string;
  } | null>(null);

  // Virtual bank account state for Nigerian transfer
  const [copiedBankInfo, setCopiedBankInfo] = useState<string | null>(null);
  const [momoPhone, setMomoPhone] = useState<string>('');
  const [momoNetwork, setMomoNetwork] = useState<string>('MTN');

  // Personal Local Bank Configuration (Saved in localStorage)
  const DEFAULT_OWNER_BANK: OwnerBankDetails = {
    bankName: 'Moniepoint MFB',
    accountNumber: '6054182456',
    accountName: 'Yasir Mustapha Aliyu',
    country: 'Nigeria',
    instructions: 'Use your username or order reference as transfer narration.',
    whatsappNumber: '+2348149204891'
  };

  const POPULAR_NIGERIAN_BANKS = [
    'OPay',
    'PalmPay',
    'Moniepoint MFB',
    'Kuda Bank',
    'GTBank (Guaranty Trust)',
    'Zenith Bank',
    'Access Bank',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Stanbic IBTC Bank',
    'Fidelity Bank',
    'FCMB',
    'Wema Bank / ALAT'
  ];

  const [ownerBank, setOwnerBank] = useState<OwnerBankDetails>(() => {
    try {
      const saved = localStorage.getItem('mediasmm_owner_bank');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was the previous placeholder account number or default, migrate to Yasir's real account
        if (parsed.accountNumber === '8149204891' || !parsed.accountName || parsed.accountName.includes('mediasmm')) {
          localStorage.setItem('mediasmm_owner_bank', JSON.stringify(DEFAULT_OWNER_BANK));
          return DEFAULT_OWNER_BANK;
        }
        return parsed;
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_OWNER_BANK;
  });

  const [isEditingBank, setIsEditingBank] = useState<boolean>(false);
  const [tempBankName, setTempBankName] = useState<string>(ownerBank.bankName);
  const [tempAccountNumber, setTempAccountNumber] = useState<string>(ownerBank.accountNumber);
  const [tempAccountName, setTempAccountName] = useState<string>(ownerBank.accountName);
  const [tempInstructions, setTempInstructions] = useState<string>(ownerBank.instructions || '');
  const [tempWhatsapp, setTempWhatsapp] = useState<string>(ownerBank.whatsappNumber || '');
  const [bankSaveSuccess, setBankSaveSuccess] = useState<boolean>(false);

  // Customer transfer submission
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState<boolean>(false);
  const [senderAccountName, setSenderAccountName] = useState<string>('');
  const [senderBankName, setSenderBankName] = useState<string>('');
  const [transferSubmitted, setTransferSubmitted] = useState<boolean>(false);

  const handleOpenBankEditor = () => {
    setTempBankName(ownerBank.bankName);
    setTempAccountNumber(ownerBank.accountNumber);
    setTempAccountName(ownerBank.accountName);
    setTempInstructions(ownerBank.instructions || '');
    setTempWhatsapp(ownerBank.whatsappNumber || '');
    setIsEditingBank(true);
  };

  const handleSaveOwnerBank = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OwnerBankDetails = {
      bankName: tempBankName.trim() || 'Moniepoint MFB',
      accountNumber: tempAccountNumber.trim() || '6054182456',
      accountName: tempAccountName.trim() || 'Yasir Mustapha Aliyu',
      country: 'Nigeria',
      instructions: tempInstructions.trim() || 'Use your username as transfer remark.',
      whatsappNumber: tempWhatsapp.trim() || '+2348149204891'
    };
    try {
      localStorage.setItem('mediasmm_owner_bank', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setOwnerBank(updated);
    setBankSaveSuccess(true);
    setTimeout(() => {
      setBankSaveSuccess(false);
      setIsEditingBank(false);
    }, 1000);
  };

  const handleResetOwnerBank = () => {
    try {
      localStorage.setItem('mediasmm_owner_bank', JSON.stringify(DEFAULT_OWNER_BANK));
    } catch (err) {
      console.error(err);
    }
    setOwnerBank(DEFAULT_OWNER_BANK);
    setTempBankName(DEFAULT_OWNER_BANK.bankName);
    setTempAccountNumber(DEFAULT_OWNER_BANK.accountNumber);
    setTempAccountName(DEFAULT_OWNER_BANK.accountName);
    setTempInstructions(DEFAULT_OWNER_BANK.instructions || '');
    setTempWhatsapp(DEFAULT_OWNER_BANK.whatsappNumber || '');
    setIsEditingBank(false);
  };

  // Sync deposit currency if user changes it or initial open
  useEffect(() => {
    if (isOpen) {
      if (currency === 'NGN' || currency === 'GHS' || currency === 'XAF' || currency === 'XOF') {
        setDepositCurrency(currency);
        setActiveTab('africa');
      }
      if (initialEditBank) {
        setSelectedGatewayId('nigeria_bank');
        setDepositCurrency('NGN');
        setActiveTab('africa');
        handleOpenBankEditor();
      }
    }
  }, [isOpen, currency, initialEditBank]);

  // Adjust preset amounts when deposit currency changes
  useEffect(() => {
    if (depositCurrency === 'NGN') setLocalInputAmount(15500);
    else if (depositCurrency === 'GHS') setLocalInputAmount(150);
    else if (depositCurrency === 'XAF' || depositCurrency === 'XOF') setLocalInputAmount(10000);
    else setLocalInputAmount(50);
  }, [depositCurrency]);

  if (!isOpen) return null;

  const curConfig = CURRENCY_CONFIGS[depositCurrency] || CURRENCY_CONFIGS.USD;
  const selectedGateway = PAYMENT_GATEWAYS.find(g => g.id === selectedGatewayId) || PAYMENT_GATEWAYS[0];

  // Calculate equivalent USD
  const equivalentUSD = depositCurrency === 'USD' 
    ? localInputAmount 
    : Number((localInputAmount / curConfig.rate).toFixed(2));

  const bonusAmountUSD = Number(((equivalentUSD * selectedGateway.bonusPercentage) / 100).toFixed(2));
  const totalCreditedUSD = Number((equivalentUSD + bonusAmountUSD).toFixed(2));

  const filteredGateways = PAYMENT_GATEWAYS.filter(g => {
    if (activeTab === 'africa') return g.region === 'africa';
    return g.region === 'global';
  });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equivalentUSD < selectedGateway.minDeposit) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onDeposit(totalCreditedUSD, selectedGateway.name);
      setDepositSuccess({
        amountUSD: equivalentUSD,
        creditedUSD: totalCreditedUSD,
        localAmount: localInputAmount,
        localCurrency: depositCurrency,
        txId: 'MS-' + Math.floor(100000 + Math.random() * 900000),
        gatewayName: selectedGateway.name
      });
    }, 1200);
  };

  const getGatewayIcon = (id: string) => {
    switch (id) {
      case 'paystack': return <CreditCard className="w-5 h-5 text-teal-400" />;
      case 'flutterwave': return <Globe className="w-5 h-5 text-amber-400" />;
      case 'nigeria_bank': return <Building2 className="w-5 h-5 text-emerald-400" />;
      case 'mobile_money': return <Smartphone className="w-5 h-5 text-orange-400" />;
      case 'crypto': return <Coins className="w-5 h-5 text-yellow-400" />;
      case 'card': return <CreditCard className="w-5 h-5 text-blue-400" />;
      case 'apple_google': return <Smartphone className="w-5 h-5 text-slate-200" />;
      case 'binance': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <DollarSign className="w-5 h-5 text-emerald-400" />;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedBankInfo(label);
    setTimeout(() => setCopiedBankInfo(null), 2000);
  };

  // Quick preset amount buttons for the active deposit currency
  const getPresets = () => {
    switch (depositCurrency) {
      case 'NGN':
        return [5000, 10000, 15500, 31000, 77500, 155000];
      case 'GHS':
        return [50, 100, 150, 300, 750, 1500];
      case 'XAF':
      case 'XOF':
        return [3000, 6000, 12000, 30000, 60000, 150000];
      default:
        return [15, 25, 50, 100, 250, 500];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-6 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Add Funds to mediasmm Wallet</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Instant Auto-Credit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Current Balance: <strong className="text-emerald-400 font-mono">${balance.toFixed(2)} USD</strong> ({formatCurrencyAmount(balance, currency)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {depositSuccess ? (
          <div className="text-center space-y-5 py-4 animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Payment Received & Credited!</h3>
              <p className="text-xs text-slate-300">
                Your mediasmm account balance has been automatically credited and is ready for boosting.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left font-mono text-xs space-y-2.5 max-w-md mx-auto shadow-inner">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Payment Method:</span>
                <span className="text-white font-semibold truncate max-w-[220px]">{depositSuccess.gatewayName.split('(')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Transaction Ref:</span>
                <span className="text-blue-400 font-bold">{depositSuccess.txId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Amount Paid:</span>
                <span className="text-white font-bold">
                  {CURRENCY_CONFIGS[depositSuccess.localCurrency].symbol}{depositSuccess.localAmount.toLocaleString()} {depositSuccess.localCurrency}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 font-sans">USD Value:</span>
                <span>${depositSuccess.amountUSD.toFixed(2)} USD</span>
              </div>
              {depositSuccess.creditedUSD > depositSuccess.amountUSD && (
                <div className="flex justify-between text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                  <span className="font-sans font-medium">Deposit Bonus Added:</span>
                  <span className="font-bold">+${(depositSuccess.creditedUSD - depositSuccess.amountUSD).toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                <span className="text-slate-300 font-sans">New Total Balance:</span>
                <span className="text-emerald-400 font-mono">${(balance + depositSuccess.creditedUSD).toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={() => {
                setDepositSuccess(null);
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              Start Ordering Social Services Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleDepositSubmit} className="space-y-5">
            
            {/* Region Filter Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>1. Choose Gateway Region</span>
                <span className="text-[11px] text-blue-400 font-normal">Supports Nigeria, Ghana, Cameroon, Niger & Global</span>
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('africa');
                    setSelectedGatewayId('paystack');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'africa'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🌍</span>
                  <span>West & Central Africa (🇳🇬 🇬🇭 🇨🇲 🇳🇪)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('global');
                    setSelectedGatewayId('crypto');
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'global'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🌐</span>
                  <span>Global & Crypto (USDT, Cards, Binance)</span>
                </button>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                2. Select Payment Gateway
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredGateways.map(gateway => {
                  const isSelected = selectedGatewayId === gateway.id;
                  return (
                    <button
                      key={gateway.id}
                      type="button"
                      onClick={() => {
                        setSelectedGatewayId(gateway.id);
                        if (gateway.id === 'nigeria_bank') {
                          setDepositCurrency('NGN');
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 shadow-md shadow-blue-500/10' 
                          : 'bg-slate-950/80 border-slate-800 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                        {getGatewayIcon(gateway.id)}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">
                            {gateway.name.split('(')[0]}
                          </span>
                          {gateway.bonusPercentage > 0 && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                              +{gateway.bonusPercentage}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {gateway.description.split('.')[0]}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-emerald-400">{gateway.fee}</span>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-[10px] text-slate-400">Min: ${gateway.minDeposit}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Section for Nigerian Bank Transfer (With Personal Bank Account Customization) */}
            {selectedGatewayId === 'nigeria_bank' && (
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-4">
                
                {/* Header with Edit Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Building2 className="w-4 h-4" />
                    <span>Direct Nigerian Bank Transfer</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Verified Account ({ownerBank.bankName})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={isEditingBank ? () => setIsEditingBank(false) : handleOpenBankEditor}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingBank ? 'Close Editor' : '⚙️ Set Your Personal Bank'}</span>
                    </button>
                  </div>
                </div>

                {/* Bank Editing Panel */}
                {isEditingBank ? (
                  <form onSubmit={handleSaveOwnerBank} className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 space-y-3.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Configure Your Personal Bank Account Details</span>
                      </h4>
                      {bankSaveSuccess && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Saved!
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Put your personal Nigerian bank account (OPay, PalmPay, Kuda, GTBank, etc.). When customers choose Bank Transfer, they will transfer money directly to your account.
                    </p>

                    {/* Quick Bank Presets */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold block">Quick Bank Presets:</label>
                      <div className="flex flex-wrap gap-1">
                        {POPULAR_NIGERIAN_BANKS.map(bank => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setTempBankName(bank)}
                            className={`px-2 py-0.5 text-[10px] rounded-md border font-medium transition-colors ${
                              tempBankName === bank 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' 
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1 font-semibold">Bank Name *</label>
                        <input
                          type="text"
                          required
                          value={tempBankName}
                          onChange={(e) => setTempBankName(e.target.value)}
                          placeholder="e.g. OPay, PalmPay, GTBank"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1 font-semibold">Account Number (NUBAN) *</label>
                        <input
                          type="text"
                          required
                          value={tempAccountNumber}
                          onChange={(e) => setTempAccountNumber(e.target.value)}
                          placeholder="e.g. 6054182456"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1 font-semibold">Account Holder / Beneficiary *</label>
                        <input
                          type="text"
                          required
                          value={tempAccountName}
                          onChange={(e) => setTempAccountName(e.target.value)}
                          placeholder="e.g. Yasir Mustapha Aliyu"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1 font-semibold">Transfer Remark / Narration Instruction</label>
                        <input
                          type="text"
                          value={tempInstructions}
                          onChange={(e) => setTempInstructions(e.target.value)}
                          placeholder="e.g. Use your username as remark"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1 font-semibold">WhatsApp Number (For Receipts)</label>
                        <input
                          type="tel"
                          value={tempWhatsapp}
                          onChange={(e) => setTempWhatsapp(e.target.value)}
                          placeholder="e.g. +2348149204891"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleResetOwnerBank}
                        className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Default</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingBank(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save My Bank Account</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Live Bank Display Card */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Transfer the exact Naira amount to this account via your mobile banking app (OPay, PalmPay, Kuda, Moniepoint, GTBank, Zenith, Access, etc.):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Bank Name</span>
                        <strong className="text-white text-xs block">{ownerBank.bankName}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Account Number (NUBAN)</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-emerald-400 text-sm font-bold tracking-wider">{ownerBank.accountNumber}</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ownerBank.accountNumber, 'acc')}
                            className="text-slate-400 hover:text-white p-1"
                            title="Copy Account Number"
                          >
                            {copiedBankInfo === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Beneficiary Name</span>
                        <strong className="text-white text-xs truncate block">{ownerBank.accountName}</strong>
                      </div>
                    </div>

                    {ownerBank.instructions && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <strong className="text-slate-300">Remark / Narration:</strong> {ownerBank.instructions}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>3% bonus automatically credited on direct bank transfers!</span>
                      </div>

                      {/* WhatsApp receipt button */}
                      {ownerBank.whatsappNumber && (
                        <a
                          href={`https://wa.me/${ownerBank.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello mediasmm, I just made a direct bank transfer of ${curConfig.symbol}${localInputAmount.toLocaleString()} to your ${ownerBank.bankName} account (${ownerBank.accountNumber}). Please confirm and credit my account.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Send Proof on WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Customer Transfer Confirmation Form */}
                    <div className="pt-2 border-t border-slate-800/80">
                      {transferSubmitted ? (
                        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Transfer Receipt Submitted Successfully!</span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Your transaction from <strong className="text-white">{senderAccountName || 'your bank'}</strong> is being verified. Your wallet will reflect shortly.
                          </p>
                        </div>
                      ) : isConfirmingTransfer ? (
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-xs font-bold text-white block">Submit Your Payment Receipt Details:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Sender Account Name</label>
                              <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={senderAccountName}
                                onChange={(e) => setSenderAccountName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5">Sender Bank / Session ID</label>
                              <input
                                type="text"
                                placeholder="e.g. OPay / Ref #123456"
                                value={senderBankName}
                                onChange={(e) => setSenderBankName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsConfirmingTransfer(false)}
                              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTransferSubmitted(true);
                                onDeposit(totalCreditedUSD, `Direct Transfer (${ownerBank.bankName})`);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                            >
                              Confirm & Submit Transfer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsConfirmingTransfer(true)}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs text-slate-300 hover:text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>I Have Sent The Money — Submit Transfer Proof</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}

              </div>
            )}

            {/* Special Section for Mobile Money (Ghana, Cameroon, Niger) */}
            {selectedGatewayId === 'mobile_money' && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-white font-semibold">
                  <div className="flex items-center gap-2 text-orange-400">
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Money Direct Checkout</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Ghana, Cameroon & Niger</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Select Network / Telecom</label>
                    <select
                      value={momoNetwork}
                      onChange={(e) => setMomoNetwork(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-blue-500 text-xs"
                    >
                      <option value="MTN_GH">Ghana - MTN Mobile Money</option>
                      <option value="VODA_GH">Ghana - Telecel / Vodafone Cash</option>
                      <option value="MTN_CM">Cameroon - MTN MoMo (FCFA)</option>
                      <option value="ORANGE_CM">Cameroon - Orange Money (FCFA)</option>
                      <option value="ORANGE_NE">Niger - Orange Money (CFA)</option>
                      <option value="MOOV_NE">Niger - Moov Money (CFA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Mobile Money Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +233 55 123 4567"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Currency and Amount Input */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-semibold text-slate-300">
                  3. Enter Deposit Amount
                </label>
                
                {/* Deposit Currency selector toggle */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 px-1.5 font-medium">Currency:</span>
                  {(['NGN', 'GHS', 'XAF', 'XOF', 'USD'] as Currency[]).map((c) => {
                    const cfg = CURRENCY_CONFIGS[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDepositCurrency(c)}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded flex items-center gap-1 transition-all ${
                          depositCurrency === c 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{cfg.flag}</span>
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 font-mono font-bold text-base">
                  <span>{curConfig.flag}</span>
                  <span>{curConfig.symbol}</span>
                </div>
                <input
                  type="number"
                  required
                  value={localInputAmount}
                  onChange={(e) => setLocalInputAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-16 pr-28 py-3 text-lg font-bold text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 font-mono">
                  {depositCurrency}
                </div>
              </div>

              {/* Conversion indicator */}
              <div className="flex items-center justify-between px-1 text-xs">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Converted Value: <strong className="text-white font-mono">${equivalentUSD.toFixed(2)} USD</strong>
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    (@ $1 = {curConfig.symbol}{curConfig.rate.toLocaleString()} {depositCurrency})
                  </span>
                </div>
                {selectedGateway.bonusPercentage > 0 && (
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    +{selectedGateway.bonusPercentage}% Bonus: +${bonusAmountUSD.toFixed(2)} USD
                  </span>
                )}
              </div>

              {/* Quick preset amount chips */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {getPresets().map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setLocalInputAmount(val)}
                    className={`py-1.5 px-2 text-xs font-mono font-bold rounded-lg border transition-colors truncate ${
                      localInputAmount === val 
                        ? 'bg-blue-600 text-white border-blue-500' 
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {curConfig.symbol}{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit Summary Card */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Gateway:</span>
                <span className="font-semibold text-slate-200">{selectedGateway.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>You Pay:</span>
                <span className="font-mono text-white font-bold">
                  {curConfig.symbol}{localInputAmount.toLocaleString()} {depositCurrency}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>USD Wallet Conversion:</span>
                <span className="font-mono text-slate-200">${equivalentUSD.toFixed(2)} USD</span>
              </div>
              {bonusAmountUSD > 0 && (
                <div className="flex justify-between text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
                  <span>Gateway Promotion Bonus ({selectedGateway.bonusPercentage}%):</span>
                  <span className="font-mono font-bold">+${bonusAmountUSD.toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 text-white">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Total Credited to Balance:</span>
                </span>
                <span className="font-mono text-emerald-400 text-base font-bold">
                  ${totalCreditedUSD.toFixed(2)} USD
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing || equivalentUSD < selectedGateway.minDeposit}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Secure Payment & Crediting Wallet...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    Pay {curConfig.symbol}{localInputAmount.toLocaleString()} {depositCurrency} (Credit ${totalCreditedUSD.toFixed(2)} USD)
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Instant automated webhook verification. Supports Nigerian Debit Cards, USSD, OPay, MoMo, Orange & Crypto.
              </span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

