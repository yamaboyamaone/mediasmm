import React, { useState } from 'react';
import { 
  Terminal, 
  Key, 
  Copy, 
  Check, 
  Play, 
  Code2, 
  Layers, 
  Send, 
  RefreshCw,
  FileJson,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { SMM_SERVICES } from '../data/servicesData';

interface ApiDocsSectionProps {
  balance: number;
}

export const ApiDocsSection: React.FC<ApiDocsSectionProps> = ({ balance }) => {
  const [apiKey, setApiKey] = useState<string>('ms_live_84f92a10be7492c140938da');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'python' | 'php' | 'node'>('curl');
  
  // Interactive Console
  const [consoleAction, setConsoleAction] = useState<string>('balance');
  const [consoleOrderId, setConsoleOrderId] = useState<string>('MS-928401');
  const [consoleResponse, setConsoleResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const regenerateKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`ms_live_${randomHex}`);
  };

  const handleTestApi = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      let res: any = {};
      if (consoleAction === 'balance') {
        res = {
          status: 'success',
          balance: balance.toFixed(2),
          currency: 'USD'
        };
      } else if (consoleAction === 'services') {
        res = SMM_SERVICES.slice(0, 3).map(s => ({
          service: s.id,
          name: s.name,
          type: 'Default',
          category: s.category,
          rate: s.ratePer1000.toFixed(3),
          min: s.min,
          max: s.max,
          refill: s.guarantee !== 'None',
          cancel: false
        }));
      } else if (consoleAction === 'status') {
        res = {
          charge: '10.75',
          start_count: '1420',
          status: 'Completed',
          remains: '0',
          currency: 'USD'
        };
      } else if (consoleAction === 'refill') {
        res = {
          refill: 'RF-81920',
          status: 'Refilling started'
        };
      }
      setConsoleResponse(JSON.stringify(res, null, 2));
    }, 400);
  };

  const getCodeSnippet = () => {
    switch (selectedLanguage) {
      case 'curl':
        return `curl -X POST https://mediasmm.com/api/v2 \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "key=${apiKey}" \\
  -d "action=add" \\
  -d "service=101" \\
  -d "link=https://www.tiktok.com/@username" \\
  -d "quantity=1000"`;

      case 'python':
        return `import requests

url = "https://mediasmm.com/api/v2"
payload = {
    "key": "${apiKey}",
    "action": "add",
    "service": 101,
    "link": "https://www.tiktok.com/@username",
    "quantity": 1000
}

response = requests.post(url, data=payload)
print(response.json())`;

      case 'php':
        return `<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://mediasmm.com/api/v2");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'key' => '${apiKey}',
    'action' => 'add',
    'service' => 101,
    'link' => 'https://www.tiktok.com/@username',
    'quantity' => 1000
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
echo $response;
?>`;

      case 'node':
        return `const response = await fetch("https://mediasmm.com/api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    key: "${apiKey}",
    action: "add",
    service: "101",
    link: "https://www.tiktok.com/@username",
    quantity: "1000"
  })
});

const data = await response.json();
console.log(data);`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Reseller API V2 Specification</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Connect your own SMM panel, custom software, or WHMCS modules directly to mediasmm's automated delivery network.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Endpoint:</span>
            <code className="bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg text-emerald-400 font-mono font-bold">
              https://mediasmm.com/api/v2
            </code>
          </div>
        </div>

        {/* API Key Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Unique Reseller API Secret Key</span>
            </label>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Active & Verified</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 font-mono text-xs text-blue-300 truncate">
              {apiKey}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyKey}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={regenerateKey}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Regenerate API Key"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippets & Interactive Tester Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Code Generators */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Integration Code Snippets</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              {(['curl', 'python', 'php', 'node'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase font-bold transition-colors ${
                    selectedLanguage === lang 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {getCodeSnippet()}
          </pre>

          {/* Parameters Table */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Supported Parameters</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                    <th className="py-2 px-2">Param</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 text-[11px]">
                  <tr>
                    <td className="py-2 px-2 text-blue-400 font-bold">key</td>
                    <td className="py-2 px-2 text-slate-400">string</td>
                    <td className="py-2 px-2 font-sans">Your account API secret key</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-blue-400 font-bold">action</td>
                    <td className="py-2 px-2 text-slate-400">string</td>
                    <td className="py-2 px-2 font-sans">services, add, status, refill, balance</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-blue-400 font-bold">service</td>
                    <td className="py-2 px-2 text-slate-400">integer</td>
                    <td className="py-2 px-2 font-sans">Service ID from catalog</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-blue-400 font-bold">link</td>
                    <td className="py-2 px-2 text-slate-400">string</td>
                    <td className="py-2 px-2 font-sans">Target profile, post, or channel link</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-blue-400 font-bold">quantity</td>
                    <td className="py-2 px-2 text-slate-400">integer</td>
                    <td className="py-2 px-2 font-sans">Quantity to deliver</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live API Playground / Interactive Console */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <FileJson className="w-4 h-4 text-emerald-400" />
              <span>Interactive API Playground</span>
            </div>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              LIVE 200 OK
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Select Action to Test</label>
              <select
                value={consoleAction}
                onChange={(e) => setConsoleAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono cursor-pointer"
              >
                <option value="balance">action: balance (Check balance)</option>
                <option value="services">action: services (Get service catalog)</option>
                <option value="status">action: status (Check order status)</option>
                <option value="refill">action: refill (Request order refill)</option>
              </select>
            </div>

            {consoleAction === 'status' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Order ID</label>
                <input
                  type="text"
                  value={consoleOrderId}
                  onChange={(e) => setConsoleOrderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            )}

            <button
              onClick={handleTestApi}
              disabled={isSending}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isSending ? 'Sending POST Request...' : 'Send Test Request'}</span>
            </button>

            {/* Live Response Viewer */}
            {consoleResponse && (
              <div className="space-y-1 pt-1 animate-in fade-in">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Server Response (application/json):</span>
                  <span className="text-emerald-400 font-mono">Status: 200 OK</span>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed">
                  {consoleResponse}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
