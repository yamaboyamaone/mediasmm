import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Zap, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Currency, SmmOrder } from '../types';
import { SMM_SERVICES, CURRENCY_CONFIGS, formatCurrencyAmount } from '../data/servicesData';

interface MassOrderSectionProps {
  currency: Currency;
  balance: number;
  onBatchOrders: (orders: Omit<SmmOrder, 'id' | 'createdAt' | 'currentCount' | 'remains' | 'status' | 'refillAvailable'>[]) => { success: boolean; count: number; error?: string };
  openDepositModal: () => void;
  onViewOrders: () => void;
}

interface ParsedLine {
  lineNum: number;
  raw: string;
  serviceId?: number;
  serviceName?: string;
  platform?: any;
  link?: string;
  quantity?: number;
  ratePer1000?: number;
  cost?: number;
  isValid: boolean;
  error?: string;
}

export const MassOrderSection: React.FC<MassOrderSectionProps> = ({
  currency,
  balance,
  onBatchOrders,
  openDepositModal,
  onViewOrders
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [resultSummary, setResultSummary] = useState<{ count: number; totalCharge: number } | null>(null);

  const curConfig = CURRENCY_CONFIGS[currency];

  const parsedLines = useMemo<ParsedLine[]>(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return { lineNum: idx + 1, raw: line, isValid: false, error: 'Empty line' };
      }

      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length < 3) {
        return {
          lineNum: idx + 1,
          raw: trimmed,
          isValid: false,
          error: 'Format must be: service_id | link | quantity'
        };
      }

      const serviceId = Number(parts[0]);
      const link = parts[1];
      const quantity = Number(parts[2]);

      const service = SMM_SERVICES.find(s => s.id === serviceId);
      if (!service) {
        return {
          lineNum: idx + 1,
          raw: trimmed,
          isValid: false,
          error: `Service #${serviceId} not found in catalog`
        };
      }

      if (isNaN(quantity) || quantity <= 0) {
        return {
          lineNum: idx + 1,
          raw: trimmed,
          isValid: false,
          error: 'Quantity must be a positive number'
        };
      }

      if (quantity < service.min || quantity > service.max) {
        return {
          lineNum: idx + 1,
          raw: trimmed,
          isValid: false,
          error: `Quantity out of range (Min: ${service.min}, Max: ${service.max})`
        };
      }

      const cost = (service.ratePer1000 * quantity) / 1000;

      return {
        lineNum: idx + 1,
        raw: trimmed,
        serviceId,
        serviceName: service.name,
        platform: service.platform,
        link,
        quantity,
        ratePer1000: service.ratePer1000,
        cost,
        isValid: true
      };
    });
  }, [inputText]);

  const validLines = parsedLines.filter(l => l.isValid);
  const totalBatchCost = validLines.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const hasSufficientFunds = balance >= totalBatchCost;

  const loadExample = () => {
    setInputText(
      `101 | https://www.tiktok.com/@growth_creator | 2000\n` +
      `201 | https://www.instagram.com/aesthetic_label | 5000\n` +
      `401 | https://t.me/cryptosignals_alpha | 1000\n` +
      `103 | https://www.tiktok.com/@growth_creator/video/123456 | 3000`
    );
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validLines.length === 0) return;
    if (!hasSufficientFunds) return;

    const ordersToCreate = validLines.map(line => ({
      serviceId: line.serviceId!,
      serviceName: line.serviceName!,
      platform: line.platform!,
      link: line.link!,
      quantity: line.quantity!,
      charge: line.cost!,
      startCount: Math.floor(Math.random() * 400) + 100
    }));

    const result = onBatchOrders(ordersToCreate);
    if (result.success) {
      setResultSummary({
        count: result.count,
        totalCharge: totalBatchCost
      });
      setInputText('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Mass Order Batch Submission</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Submit hundreds of orders in bulk using the standard reseller format.
            </p>
          </div>

          <button
            type="button"
            onClick={loadExample}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Batch</span>
          </button>
        </div>

        {/* Syntax instructions banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <Info className="w-4 h-4" />
            <span>Format Guidelines (One order per line):</span>
          </div>
          <code className="block bg-slate-900 px-3 py-2 rounded-lg font-mono text-emerald-400 text-xs">
            service_id | link | quantity
          </code>
          <p className="text-[11px] text-slate-400">
            Example: <code className="text-slate-300">101 | https://www.tiktok.com/@username | 5000</code>
          </p>
        </div>

        <form onSubmit={handleBatchSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Input Mass Orders:</span>
              <span className="text-slate-400 font-mono">
                {validLines.length} Valid / {parsedLines.length} Lines
              </span>
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="101 | https://www.tiktok.com/@username | 1000&#10;201 | https://www.instagram.com/username | 2000"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Real-time Line Validation Table */}
          {parsedLines.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Batch Validation Preview:
              </span>
              <div className="space-y-1 text-xs font-mono">
                {parsedLines.map(line => (
                  <div
                    key={line.lineNum}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      line.isValid 
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                        : 'bg-red-950/30 border-red-800/40 text-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-500 font-sans text-[10px]">#{line.lineNum}</span>
                      {line.isValid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{line.raw}</span>
                    </div>

                    <div className="whitespace-nowrap pl-2">
                      {line.isValid ? (
                        <span className="font-bold text-emerald-400">
                          {formatCurrencyAmount(line.cost || 0, currency)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-400">{line.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch Cost & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Total Batch Cost ({validLines.length} valid orders)</span>
              <span className="text-2xl font-black text-white font-mono">
                {formatCurrencyAmount(totalBatchCost, currency)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {hasSufficientFunds ? (
                <button
                  type="submit"
                  disabled={validLines.length === 0}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute {validLines.length} Orders</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openDepositModal}
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Deposit Funds ({formatCurrencyAmount(totalBatchCost, currency)} needed)</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {resultSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Batch Orders Created!</h3>
            <p className="text-xs text-slate-300">
              Successfully placed <strong className="text-white">{resultSummary.count}</strong> orders for a total charge of <strong className="text-emerald-400">${resultSummary.totalCharge.toFixed(2)} USD</strong>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setResultSummary(null);
                  onViewOrders();
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                View Orders History
              </button>
              <button
                onClick={() => setResultSummary(null)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
