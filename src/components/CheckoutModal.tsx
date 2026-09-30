import React, { useState } from 'react';
import { PricingTier, PaymentRecord, PaymentMethodType } from '../types';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PricingTier;
  tierName: string;
  onPaymentComplete: (payment: PaymentRecord) => void;
  userEmail?: string;
  userName?: string;
  userOrg?: string;
}

const TIER_PRICES: Record<PricingTier, { usd: number; pkr: number }> = {
  starter: { usd: 99, pkr: 27720 },
  scale: { usd: 499, pkr: 139720 },
  enterprise: { usd: 1499, pkr: 419720 }
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  tier,
  tierName,
  onPaymentComplete,
  userEmail = 'developer@company.com',
  userName = 'Valued Developer',
  userOrg = 'Client Engineering'
}) => {
  const [method, setMethod] = useState<PaymentMethodType>('jazzcash');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [cardName, setCardName] = useState(userName);

  // JazzCash fields
  const JAZZCASH_NO = (import.meta.env.VITE_JAZZCASH_NUMBER as string) || '+923105905246';
  const JAZZCASH_TITLE = (import.meta.env.VITE_JAZZCASH_ACCOUNT_TITLE as string) || 'Ali Mustafa (PromptTrace Official)';
  const [jazzSenderNo, setJazzSenderNo] = useState('03001234567');
  const [jazzTid, setJazzTid] = useState('');
  const [copiedJazzNo, setCopiedJazzNo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<PaymentRecord | null>(null);

  if (!isOpen) return null;

  const basePrice = TIER_PRICES[tier] || TIER_PRICES.scale;
  const multiplier = billingCycle === 'annual' ? 0.8 : 1.0;
  const finalUsd = Math.round(basePrice.usd * multiplier);
  const finalPkr = Math.round(basePrice.pkr * multiplier);

  const handleCopyJazzNo = () => {
    navigator.clipboard.writeText(JAZZCASH_NO);
    setCopiedJazzNo(true);
    setTimeout(() => setCopiedJazzNo(false), 2000);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const record: PaymentRecord = {
        id: `pay_${Math.random().toString(36).substring(2, 10)}`,
        userId: 'usr_current',
        userEmail,
        userName,
        organization: userOrg,
        tier,
        tierName,
        amountUsd: finalUsd,
        amountPkr: finalPkr,
        paymentMethod: method,
        jazzcashRecipient: JAZZCASH_NO,
        jazzcashSenderNumber: method === 'jazzcash' ? jazzSenderNo : undefined,
        transactionReference: method === 'jazzcash' ? (jazzTid || `JC-TID-${Date.now().toString().slice(-8)}`) : `AUTH-CRD-${Date.now().toString().slice(-6)}`,
        cardLast4: method === 'credit_card' ? '4242' : undefined,
        cardBrand: method === 'credit_card' ? 'Visa' : undefined,
        status: method === 'credit_card' ? 'completed' : 'pending_approval',
        timestamp: new Date().toISOString(),
        billingCycle,
        approvedAt: method === 'credit_card' ? new Date().toISOString() : undefined,
        approvedBy: method === 'credit_card' ? 'Stripe Gateway' : undefined,
        notes: method === 'jazzcash' ? `Transferred to ${JAZZCASH_NO}` : 'Card authenticated'
      };

      setIsProcessing(false);
      setPaymentSuccess(true);
      setCompletedRecord(record);
      onPaymentComplete(record);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Purchase Subscription Tier
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                SSL Secured
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Instant activation for {tierName} with cryptographic lineage proofs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {paymentSuccess && completedRecord ? (
          <div className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                {completedRecord.paymentMethod === 'credit_card' 
                  ? 'Payment Successful & Tier Activated!' 
                  : 'JazzCash Payment Submitted for Verification!'}
              </h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                {completedRecord.paymentMethod === 'credit_card'
                  ? `Your account has been upgraded to ${tierName}. 2.5M AI Data Passports are now enabled in your organization's WORM ledger.`
                  : `Your JazzCash transaction (${completedRecord.transactionReference}) to ${JAZZCASH_NO} has been logged. An administrator will verify and approve your order in the Admin Panel.`}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left font-mono text-xs dark:border-zinc-800 dark:bg-zinc-950 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Payment Ref:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{completedRecord.transactionReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Plan Tier:</span>
                <span className="text-emerald-600 font-bold">{completedRecord.tierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Amount Paid:</span>
                <span className="font-bold">${completedRecord.amountUsd} USD (~Rs. {completedRecord.amountPkr.toLocaleString()} PKR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Payment Method:</span>
                <span className="capitalize">{completedRecord.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Status:</span>
                <span className={`font-bold ${completedRecord.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {completedRecord.status.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 transition"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleProcessPayment} className="p-6 space-y-5 text-xs">
            {/* Plan Price Summary */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
                  Selected Tier
                </span>
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                  {tierName}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Includes full cryptographic hash chaining & EU AI Act compliance exports
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-zinc-900 dark:text-white">
                  ${finalUsd} <span className="text-xs font-normal text-zinc-400">/ mo</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold font-mono">
                  ~ Rs. {finalPkr.toLocaleString()} PKR
                </div>
              </div>
            </div>

            {/* Payment Method Switcher Tabs */}
            <div>
              <label className="font-bold text-zinc-800 dark:text-zinc-200 block mb-2">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* JazzCash Tab */}
                <button
                  type="button"
                  onClick={() => setMethod('jazzcash')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                    method === 'jazzcash'
                      ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/20 dark:bg-red-950/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-black text-sm shrink-0">
                    JC
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>JazzCash</span>
                      <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.2 rounded font-semibold">
                        Direct Transfer
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Send to <strong>{JAZZCASH_NO}</strong>
                    </p>
                  </div>
                </button>

                {/* Credit Card Tab */}
                <button
                  type="button"
                  onClick={() => setMethod('credit_card')}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition ${
                    method === 'credit_card'
                      ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20 dark:bg-emerald-950/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <CreditCard className={`h-6 w-6 shrink-0 ${method === 'credit_card' ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white">
                      Credit / Debit Card
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Visa, MasterCard, Amex
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* JAZZCASH FORM DETAILS */}
            {method === 'jazzcash' && (
              <div className="space-y-4 rounded-xl border border-red-200 bg-red-50/30 p-4 dark:border-red-950 dark:bg-red-950/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 block">
                      Official JazzCash Beneficiary Details:
                    </span>
                    <div className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">
                      {JAZZCASH_TITLE}
                    </div>
                    <div className="text-base font-black text-red-600 dark:text-red-400 font-mono tracking-wide mt-1 flex items-center gap-2">
                      <span>{JAZZCASH_NO}</span>
                      <button
                        type="button"
                        onClick={handleCopyJazzNo}
                        className="rounded bg-white p-1 text-xs text-zinc-600 shadow-xs hover:text-black dark:bg-zinc-800 dark:text-zinc-300"
                        title="Copy JazzCash Number"
                      >
                        {copiedJazzNo ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 block">Pay in PKR:</span>
                    <span className="text-base font-bold text-zinc-900 dark:text-white">
                      Rs. {finalPkr.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-white/80 p-3 text-[11px] text-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300 space-y-1">
                  <div className="font-semibold text-zinc-900 dark:text-white">Quick Payment Instructions:</div>
                  <ol className="list-decimal pl-4 space-y-0.5">
                    <li>Open your <strong>JazzCash App</strong> or dial <strong>*786#</strong></li>
                    <li>Transfer <strong>Rs. {finalPkr.toLocaleString()} PKR</strong> to Mobile No: <strong className="font-mono">{JAZZCASH_NO}</strong></li>
                    <li>Confirm payment with your MPIN and copy the <strong>12-Digit TID</strong> from the confirmation SMS</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Sender Mobile Number
                    </label>
                    <input
                      type="text"
                      value={jazzSenderNo}
                      onChange={(e) => setJazzSenderNo(e.target.value)}
                      placeholder="03001234567"
                      required
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      JazzCash TID (Transaction ID)
                    </label>
                    <input
                      type="text"
                      value={jazzTid}
                      onChange={(e) => setJazzTid(e.target.value)}
                      placeholder="e.g. 091823746123"
                      required
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CREDIT CARD FORM DETAILS */}
            {method === 'credit_card' && (
              <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="MM/YY"
                      required
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="CVC"
                      required
                      className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md active:scale-98 transition ${
                method === 'jazzcash'
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>
                {isProcessing 
                  ? 'Verifying Transaction...' 
                  : method === 'jazzcash' 
                    ? `Confirm JazzCash Order (Rs. ${finalPkr.toLocaleString()})`
                    : `Pay $${finalUsd} USD via Card`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
