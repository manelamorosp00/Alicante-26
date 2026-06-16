import React, { useState } from 'react';
import { Language, Member, Expense } from '../types';
import { t } from '../translations';
import { Trash2, Plus, AlertCircle, Sparkles, Coins, ArrowRightLeft } from 'lucide-react';

interface ExpenseSplitterProps {
  language: Language;
  members: Member[];
  expenses: Expense[];
  activeMemberId: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  onDeleteExpense: (id: string) => void;
  onResetExpenses: () => void;
}

export const ExpenseSplitter: React.FC<ExpenseSplitterProps> = ({
  language,
  members,
  expenses,
  activeMemberId,
  onAddExpense,
  onDeleteExpense,
  onResetExpenses,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState(activeMemberId || (members[0]?.id || ''));
  const [useCustomSplit, setUseCustomSplit] = useState(false);
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map(m => m.id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync payer with active member if it changes
  React.useEffect(() => {
    if (activeMemberId) {
      setPayer(activeMemberId);
    }
  }, [activeMemberId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    // If custom split is not checked, we split between everyone
    const splitIds = useCustomSplit ? splitBetween : [];

    try {
      await onAddExpense({
        description: description.trim(),
        amount: parseFloat(parseFloat(amount).toFixed(2)),
        paidBy: payer || (members[0]?.id ?? ''),
        splitBetween: splitIds,
        date: new Date().toISOString().split('T')[0],
      });

      // Only clear form on success
      setDescription('');
      setAmount('');
      setUseCustomSplit(false);
      setSplitBetween(members.map(m => m.id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Show a friendly error; the raw Firestore error may be JSON
      try {
        const parsed = JSON.parse(msg);
        setSubmitError(`Error: ${parsed.error ?? msg}`);
      } catch {
        setSubmitError(`Error desant la despesa: ${msg}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSplitMember = (memberId: string) => {
    if (splitBetween.includes(memberId)) {
      if (splitBetween.length > 1) {
        setSplitBetween(splitBetween.filter(id => id !== memberId));
      }
    } else {
      setSplitBetween([...splitBetween, memberId]);
    }
  };

  // 1. Calculate Balances
  const calculateBalances = () => {
    const balances: Record<string, number> = {};
    members.forEach(m => {
      balances[m.id] = 0;
    });

    expenses.forEach(exp => {
      const payerId = exp.paidBy;
      const totalAmount = exp.amount;
      // Get array of split participants
      const participants = exp.splitBetween.length > 0 ? exp.splitBetween : members.map(m => m.id);
      
      // Ensure raw balance values are correctly credited/debited
      if (balances[payerId] !== undefined) {
        balances[payerId] += totalAmount;
      }

      const share = totalAmount / participants.length;
      participants.forEach(pId => {
        if (balances[pId] !== undefined) {
          balances[pId] -= share;
        }
      });
    });

    return balances;
  };

  const balances = calculateBalances();
  const totalTripExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 2. Greedy Debt Settler Algorithm
  const calculateSettlements = () => {
    const listBalances = { ...balances };
    
    // Sort debtors and creditors
    const debtorList: { id: string; balance: number }[] = [];
    const creditorList: { id: string; balance: number }[] = [];

    Object.entries(listBalances).forEach(([id, bal]) => {
      // Avoid tiny float values
      if (Math.abs(bal) > 0.01) {
        if (bal < 0) {
          debtorList.push({ id, balance: bal });
        } else {
          creditorList.push({ id, balance: bal });
        }
      }
    });

    // Debtors: ascending order (most negative first)
    debtorList.sort((a, b) => a.balance - b.balance);
    // Creditors: descending order (most positive first)
    creditorList.sort((a, b) => b.balance - a.balance);

    const transactions: { from: string; to: string; amount: number }[] = [];

    let i = 0; // debtor pointer
    let j = 0; // creditor pointer

    while (i < debtorList.length && j < creditorList.length) {
      const debtor = debtorList[i];
      const creditor = creditorList[j];

      const owed = Math.abs(debtor.balance);
      const credit = creditor.balance;

      const minTransfer = parseFloat(Math.min(owed, credit).toFixed(2));

      if (minTransfer > 0.01) {
        transactions.push({
          from: debtor.id,
          to: creditor.id,
          amount: minTransfer,
        });
      }

      debtor.balance += minTransfer;
      creditor.balance -= minTransfer;

      if (Math.abs(debtor.balance) < 0.01) {
        i++;
      }
      if (Math.abs(creditor.balance) < 0.01) {
        j++;
      }
    }

    return transactions;
  };

  const settlements = calculateSettlements();

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 py-2">
      
      {/* Left Column: Form & Statistics */}
      <div className="md:col-span-5 flex flex-col gap-6">
        
        {/* Statistics Ring Card */}
        <div className="bg-[#2d2d2d] text-white p-6 shadow-[8px_8px_0px_0px_#FF6321] border-2 border-[#2d2d2d] rounded-none flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-white/50 font-mono font-bold">{t('quickStats', language)}</span>
              <h2 className="text-4xl font-mono font-black text-art-yellow mt-1">
                {totalTripExpenses.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </h2>
            </div>
            <Coins className="text-art-yellow w-10 h-10 stroke-[2.5px]" />
          </div>

          <p className="text-xs text-white/80 border-t border-white/10 pt-3 font-medium">
            {language === 'ca' 
              ? `Repartit entre ${members.length} persones de viatge.` 
              : language === 'en' 
              ? `Divided among ${members.length} passengers.` 
              : `Repartío' a susharra entre lo' ${members.length} de la peñita.`}
          </p>

          {/* Quick Member Contribution List */}
          <div className="mt-4 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {members.map(member => {
              const personalExpenses = expenses
                .filter(e => e.paidBy === member.id)
                .reduce((sum, e) => sum + e.amount, 0);

              const balance = balances[member.id] || 0;
              const formatBalance = balance > 0 
                ? `+${balance.toFixed(1)}€` 
                : `${balance.toFixed(1)}€`;

              return (
                <div key={member.id} className="flex items-center justify-between text-xs py-1.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{member.avatarUrl}</span>
                    <span className="font-bold text-white/95">{member.nickname || member.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 mr-2">Paga: {personalExpenses.toFixed(0)}€</span>
                    <span className={`font-mono font-bold ${balance > 0.1 ? 'text-emerald-400' : balance < -0.1 ? 'text-rose-400' : 'text-white/60'}`}>
                      {formatBalance}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Expense Form Box */}
        <div className="bg-white border-2 border-[#2d2d2d] p-6 shadow-[5px_5px_0px_0px_#2d2d2d] rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <Coins className="text-art-orange w-5 h-5 stroke-[2.5px]" />
            <h3 className="font-display font-black uppercase text-lg text-[#2d2d2d]">{t('addExpenseBtn', language)}</h3>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs md:text-sm">
            <div>
              <label htmlFor="expense-desc" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                {language === 'ca' ? 'Què és?' : language === 'en' ? 'What item?' : 'Consesto'}
              </label>
              <input
                id="expense-desc"
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('expenseDescInput', language)}
                className="w-full px-4 py-3 border-2 border-[#2d2d2d] text-[#2d2d2d] bg-white font-medium focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="expense-amount" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                  {t('expenseAmountInput', language)}
                </label>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border-2 border-[#2d2d2d] text-[#2d2d2d] bg-white font-mono font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="expense-payer" className="block text-xs font-black uppercase tracking-wider text-art-text/60 mb-1">
                  {t('expensePayer', language)}
                </label>
                <select
                  id="expense-payer"
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  className="w-full px-3 py-3 border-2 border-[#2d2d2d] text-[#2d2d2d] bg-white font-bold focus:outline-hidden cursor-pointer"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.avatarUrl} {m.nickname || m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Split Toggle */}
            <div className="pt-1">
              <label htmlFor="custom-split-checkbox" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="custom-split-checkbox"
                  type="checkbox"
                  checked={useCustomSplit}
                  onChange={(e) => setUseCustomSplit(e.target.checked)}
                  className="w-4 h-4 text-art-orange border-2 border-[#2d2d2d] focus:ring-0 rounded-none cursor-pointer"
                />
                <span className="text-xs font-black uppercase tracking-wider text-[#2d2d2d]/85">
                  {language === 'ca' 
                    ? 'Dividir només entre algunes persones' 
                    : language === 'en' 
                    ? 'Split only among specific friends' 
                    : 'Repartí solo con farándula fihá'}
                </span>
              </label>

              {useCustomSplit && (
                <div className="mt-3 p-3 bg-art-bg border-2 border-[#2d2d2d] rounded-none max-h-48 overflow-y-auto flex flex-col gap-1.5 animate-fadeIn">
                  <span className="text-[10px] text-art-text/50 font-mono font-bold uppercase tracking-wider mb-1 block">
                    {language === 'ca' ? 'Integrants afectats:' : language === 'en' ? 'Affected friends:' : 'Gente arrastrá:'}
                  </span>
                  {members.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleToggleSplitMember(member.id)}
                      className={`flex items-center justify-between p-2 border-2 transition-all cursor-pointer ${splitBetween.includes(member.id) ? 'bg-[#ffebee] text-rose-700 border-[#2d2d2d] font-bold shadow-[2px_2px_0px_0px_#2d2d2d]' : 'bg-white border-transparent text-art-text/80 hover:bg-white hover:border-[#2d2d2d]'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{member.avatarUrl}</span>
                        <span className="text-xs">{member.nickname || member.name}</span>
                      </span>
                      <span className="text-[11px] font-black">
                        {splitBetween.includes(member.id) ? '✓' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border-2 border-rose-400 text-rose-700 text-xs font-medium rounded-none">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-3.5 px-4 border-2 border-[#2d2d2d] text-art-text font-display text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#2d2d2d] flex items-center justify-center gap-2 transition-all
                ${isSubmitting ? 'bg-art-yellow/50 cursor-not-allowed' : 'bg-art-yellow hover:bg-art-yellow/85 hover:translate-y-[-1px] cursor-pointer'}`}
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              {isSubmitting
                ? (language === 'ca' ? 'Desant...' : language === 'en' ? 'Saving...' : 'Guardando...')
                : t('addExpenseBtn', language)}
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Debts & Settlement & History */}
      <div className="md:col-span-7 flex flex-col gap-6">

        {/* Debts Settlement Dashboard */}
        <div className="bg-white border-2 border-[#2d2d2d] p-6 shadow-[5px_5px_0px_0px_#2d2d2d] rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="text-art-orange w-5 h-5 stroke-[2.5px]" />
            <h3 className="font-display font-black uppercase text-lg text-art-text">{t('settlementDebts', language)}</h3>
          </div>

          {settlements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4 bg-emerald-50/50 border-2 border-dashed border-emerald-500/20 rounded-none">
              <Sparkles className="text-emerald-500 w-10 h-10 mb-2" />
              <p className="text-sm font-black uppercase tracking-wider text-emerald-800">{t('noDebtsYet', language)}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                {language === 'ca' 
                  ? 'Fins ara tothom ha pagat la seva part justa.' 
                  : language === 'en' 
                  ? 'All expenses are perfectly equalized so far.' 
                  : 'Nadie se columpia de momento. ¡Cuentas limpia\'!'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {settlements.map((tx, idx) => {
                const debtorObj = members.find(m => m.id === tx.from);
                const creditorObj = members.find(m => m.id === tx.to);

                if (!debtorObj || !creditorObj) return null;

                return (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-white border-2 border-[#2d2d2d] rounded-none text-xs md:text-sm shadow-[3px_3px_0px_0px_#2d2d2d] transition-hover hover:translate-y-[-1px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="flex items-center gap-1 p-1 bg-art-bg rounded-none border border-[#2d2d2d]">
                        <span>{debtorObj.avatarUrl}</span>
                        <span className="font-extrabold text-art-text">{debtorObj.name}</span>
                      </span>
                      
                      <span className="text-xs text-art-text/50 px-1 font-black uppercase tracking-tight text-[10px]">
                        {t('debtOwesText', language)}
                      </span>

                      <span className="flex items-center gap-1 p-1 bg-art-bg rounded-none border border-[#2d2d2d]">
                        <span>{creditorObj.avatarUrl}</span>
                        <span className="font-extrabold text-art-text">{creditorObj.name}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-base font-black text-art-orange whitespace-nowrap">
                        {tx.amount.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses List History */}
        <div className="bg-white border-2 border-[#2d2d2d] p-6 shadow-[5px_5px_0px_0px_#2d2d2d] rounded-none flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-black uppercase text-lg text-art-text">{t('recentExpenses', language)}</h3>
            {expenses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(t('resetExpensesWarning', language))) {
                    onResetExpenses();
                  }
                }}
                className="text-xs border-2 border-rose-500 bg-rose-50 hover:bg-rose-100 text-rose-500 font-black px-2.5 py-1 transition-all cursor-pointer uppercase tracking-wider select-none shadow-[2px_2px_0px_0px_#f43f5e]"
              >
                {language === 'ca' ? 'Resetear Tot' : language === 'en' ? 'Reset All' : 'Borrà to\' er taco'}
              </button>
            )}
          </div>

          {expenses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#2d2d2d]/30 rounded-none p-6">
              <AlertCircle className="text-art-text/30 w-10 h-10 mb-2" />
              <p className="text-sm font-black uppercase tracking-wider text-art-text/60">{t('noExpensesYet', language)}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
              {[...expenses].reverse().map((exp) => {
                const payerObj = members.find(m => m.id === exp.paidBy);
                const hasCustomSplit = exp.splitBetween.length > 0;

                return (
                  <div key={exp.id} className="flex items-center justify-between p-3.5 bg-white border border-[#2d2d2d] rounded-none hover:bg-art-bg/30 transition-all text-xs md:text-sm group">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold text-art-text font-display text-sm uppercase">{exp.description}</span>
                      <div className="flex items-center gap-2 text-art-text/50 font-mono text-[10px] sm:text-[11px]">
                        <span className="bg-[#fdfaf2] px-2 py-0.5 rounded-none border border-[#2d2d2d] flex items-center gap-1 font-bold text-art-text">
                          {payerObj ? `${payerObj.avatarUrl} ${payerObj.nickname || payerObj.name}` : ''}
                        </span>
                        <span>•</span>
                        <span>{exp.date}</span>
                        {hasCustomSplit && (
                          <>
                            <span>•</span>
                            <span className="text-white font-bold uppercase tracking-wider text