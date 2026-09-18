import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { MhdUser, Bill } from '../lib/types';
import { fmtD, rupees } from '../lib/format';
import { toast } from '../components/Toaster';
import { bind } from './bind';
import { PageHeader, Loading, EmptyState, StatusChip } from './common';

export default function BillingTab({ patientData }: { patientData: MhdUser }) {
  const [bills, setBills] = useState<Bill[] | null>(null);

  useEffect(() => bind<Bill>('bills', [['patientId', '==', patientData.id]], setBills), [patientData.id]);

  if (bills === null) return <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 min-w-0 w-full"><Loading /></div>;

  const list = [...bills].sort((a, b) => b.createdAt - a.createdAt);
  const total = bills.reduce((s, b) => s + (b.total || 0), 0);
  const paid = bills.filter((b) => b.status === 'paid').reduce((s, b) => s + (b.total || 0), 0);
  const pending = total - paid;

  const pay = async (b: Bill) => {
    try {
      await updateDoc(doc(db, 'bills', b.id), { status: 'paid', paidAt: Date.now() });
      toast('Payment recorded');
    } catch { toast('Could not pay', 'err'); }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      <PageHeader title="Billing" sub="Consultation fees and hospital bills — pay pending ones here." />

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[['Total', total, 'text-heading'], ['Paid', paid, 'text-ok'], ['Pending', pending, 'text-danger']].map(([l, v, c], idx) => (
          <div key={`${l}-${idx}`} className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-2.5 sm:p-4 shadow-sm min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-wider truncate">{l}</p>
            <p className={`text-sm sm:text-2xl font-bold leading-tight truncate ${c}`}>{rupees(v as number)}</p>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-8 h-8 text-ghost mx-auto" strokeWidth={1.5} />} title="No bills yet" sub="Bills appear here after consultations and hospital services." />
      ) : (
        <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] shadow-sm overflow-hidden">
          <div className="divide-y divide-line">
            {list.map((b, idx) => (
              <div key={`${b.id}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-stripe transition-colors min-w-0">
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-semibold text-ink truncate">{b.doctorName || b.hospital || 'MHD Hospital'} <span className="text-muted font-normal">· {b.type || 'bill'}</span></p>
                  <p className="text-[11px] sm:text-[12px] text-muted mt-0.5 truncate">
                    {(b.items || []).map((i) => `${i.label} ${rupees(i.amount)}`).join(' + ') || '—'} · {fmtD(b.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-xs sm:text-[15px] font-bold text-heading">{rupees(b.total)}</span>
                  <StatusChip ok={b.status === 'paid'} danger={b.status === 'pending'}>{b.status === 'paid' ? 'Paid' : 'Pending'}</StatusChip>
                  {b.status === 'pending' && (
                    <button onClick={() => pay(b)} className="text-xs font-bold text-white bg-primary px-3 sm:px-4 py-1 sm:py-1.5 rounded-[4px] hover:bg-primary-d transition-colors">Pay</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
