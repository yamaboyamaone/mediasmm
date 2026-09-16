import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  LifeBuoy, 
  Sparkles,
  Plus
} from 'lucide-react';
import { SupportTicket, SmmOrder } from '../types';

interface SupportSectionProps {
  orders: SmmOrder[];
}

export const SupportSection: React.FC<SupportSectionProps> = ({ orders }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TCK-88192',
      subject: 'Refill check for Instagram followers',
      type: 'Order Refill',
      orderId: 'MS-928402',
      status: 'Answered',
      createdAt: '2026-09-15 14:30',
      lastReply: '2026-09-15 14:38',
      messages: [
        {
          sender: 'user',
          text: 'Hi, I noticed a tiny drop of about 150 followers on MS-928402. Can you trigger a refill?',
          timestamp: '14:30'
        },
        {
          sender: 'support',
          text: 'Hello! We have inspected your account and triggered our automated 365-day refill protocol. You should see 300+ additional followers within 15 minutes. Thank you for choosing mediasmm!',
          timestamp: '14:38'
        }
      ]
    }
  ]);

  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [ticketType, setTicketType] = useState<SupportTicket['type']>('Order Refill');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [messageText, setMessageText] = useState<string>('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [newReplyText, setNewReplyText] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is mediasmm and how does it boost my accounts?',
      a: 'mediasmm is the industry-leading wholesale SMM (Social Media Marketing) reseller panel. We connect directly with high-capacity server clusters and automated promotional networks to deliver real views, likes, followers, subscribers, and comments to TikTok, Instagram, YouTube, Telegram, Twitter, and Facebook at direct supplier rates.'
    },
    {
      q: 'How fast do orders start after submission?',
      a: 'Over 90% of our services start instantly within 30 to 90 seconds. Services marked with the "INSTANT ⚡" badge trigger immediate server nodes. Complex packages (like YouTube 4000 Watch Hours or Monetizable Subscribers) begin within 1 to 3 hours to ensure 100% organic-looking algorithmic pacing.'
    },
    {
      q: 'What is the "Auto-Refill Guarantee" and how does it work?',
      a: 'Social media platforms periodically purge inactive accounts. When you purchase a service with a 30-Day or 365-Day Refill Guarantee, our system automatically tracks your count. If a drop occurs below the ordered amount, simply click "Refill" in your dashboard and our server restores the missing amount for free!'
    },
    {
      q: 'Can my social media account get banned or restricted?',
      a: 'No. All mediasmm services strictly utilize safe delivery velocity thresholds that comply with platform algorithmic guidelines. We never ask for your account password or sensitive login credentials—only public profile handles or post links are required.'
    },
    {
      q: 'What is Drip-Feed and when should I enable it?',
      a: 'Drip-Feed splits your order into smaller batches over time. For example, if you want 10,000 TikTok views, you can drip-feed 2,000 views every 60 minutes across 5 runs. This creates a completely natural growth curve that boosts organic algorithmic recommendation.'
    },
    {
      q: 'Can I resell your services on my own website via API?',
      a: 'Yes! mediasmm is fully API V2 compatible. You can connect your custom website, WordPress/WooCommerce, WHMCS, or SMM reseller script directly to our API endpoint to automate 100% of your customer fulfillment.'
    }
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !messageText.trim()) return;

    const newTicket: SupportTicket = {
      id: 'TCK-' + Math.floor(10000 + Math.random() * 90000),
      subject: subject.trim(),
      type: ticketType,
      orderId: selectedOrderId || undefined,
      status: 'Open',
      createdAt: 'Just now',
      lastReply: 'Just now',
      messages: [
        {
          sender: 'user',
          text: messageText.trim(),
          timestamp: 'Just now'
        }
      ]
    };

    setTickets([newTicket, ...tickets]);
    setActiveTicketId(newTicket.id);
    setIsCreatingTicket(false);
    setSubject('');
    setMessageText('');

    // Simulate quick automated response from support bot
    setTimeout(() => {
      setTickets(prev => prev.map(t => {
        if (t.id === newTicket.id) {
          return {
            ...t,
            status: 'Answered',
            messages: [
              ...t.messages,
              {
                sender: 'support',
                text: 'Hello! Thank you for contacting mediasmm 24/7 Priority Support. A Senior Dispatch Technician has received your request regarding ' + newTicket.subject + ' and is expediting resolution.',
                timestamp: 'Just now'
              }
            ]
          };
        }
        return t;
      }));
    }, 1500);
  };

  const handleSendReply = (ticketId: string) => {
    if (!newReplyText.trim()) return;
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'Open',
          messages: [
            ...t.messages,
            {
              sender: 'user',
              text: newReplyText.trim(),
              timestamp: 'Just now'
            }
          ]
        };
      }
      return t;
    }));
    setNewReplyText('');
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId) || tickets[0];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-blue-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">Support Desk & FAQ Knowledge Base</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Need assistance with an order, API setup, or custom enterprise volume? Our 24/7 team is here to assist.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingTicket(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Open New Support Ticket</span>
          </button>
        </div>

        {/* 24/7 Support SLA Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">Avg Response Time</span>
              <span className="text-slate-400 text-[11px]">&lt; 8 Minutes</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <div>
              <span className="font-bold text-white block">Automated Refills</span>
              <span className="text-slate-400 text-[11px]">Direct via 1-Click</span>
            </div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold text-white block">24/7/365 Desk</span>
              <span className="text-slate-400 text-[11px]">Always Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets & Support Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Ticket List */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Your Support Tickets ({tickets.length})</span>
          </h3>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {tickets.map(ticket => {
              const isSelected = activeTicket?.id === ticket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setActiveTicketId(ticket.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    isSelected 
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500' 
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">{ticket.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'Answered' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{ticket.subject}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{ticket.type}</span>
                    <span>{ticket.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Ticket Conversation Thread */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[420px]">
          {activeTicket ? (
            <div className="space-y-4 flex flex-col flex-1">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                    <span>{activeTicket.id}</span>
                    <span>•</span>
                    <span>Type: {activeTicket.type}</span>
                    {activeTicket.orderId && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400">Order: {activeTicket.orderId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-64 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {activeTicket.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs max-w-[85%] space-y-1 ${
                      m.sender === 'user'
                        ? 'ml-auto bg-blue-600 text-white rounded-br-sm'
                        : 'mr-auto bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-75">
                      <span className="font-bold">{m.sender === 'user' ? 'You' : 'mediasmm Support'}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply(activeTicket.id)}
                  placeholder="Type a message or follow-up reply..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => handleSendReply(activeTicket.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 text-slate-500 text-xs">
              Select or open a support ticket to view correspondence.
            </div>
          )}
        </div>

      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="divide-y divide-slate-800/80">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-1 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Create Ticket */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Submit New Support Ticket</h3>
              <button
                onClick={() => setIsCreatingTicket(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Ticket Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Order speed up or payment question"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    <option value="Order Refill">Order Refill</option>
                    <option value="Speed Up">Speed Up</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="API Question">API Question</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Related Order ID (Optional)</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer font-mono"
                  >
                    <option value="">None / General</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} ({o.serviceName.slice(0, 20)}...)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Describe your issue with order link, usernames, or any questions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
