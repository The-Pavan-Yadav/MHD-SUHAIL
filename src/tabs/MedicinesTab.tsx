import { useEffect, useState } from 'react';
import { Pill, Loader2 } from 'lucide-react';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { MhdUser, Medicine } from '../lib/types';
import { fmtD, todayStr, schedTimeFromDosage } from '../lib/format';
import { toast } from '../components/Toaster';
import { bind } from './bind';
import { PageHeader, Loading, EmptyState, StatusChip, inputCls, labelCls, btnPrimary, FilterPills } from './common';

export default function MedicinesTab({ patientData }: { patientData: MhdUser }) {
  const [meds, setMeds] = useState<Medicine[] | null>(null);
  const [filter, setFilter] = useState('All');
  const [f, setF] = useState({ name: '', dosage: '', startDate: todayStr(), durationDays: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => bind<Medicine>('medicines', [['patientId', '==', patientData.id]], setMeds), [patientData.id]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) { toast('Enter the medicine name.', 'err'); return; }
    setBusy(true);
    try {
      await addDoc(collection(db, 'medicines'), {
        patientId: patientData.id, name: f.name.trim(), dosage: f.dosage,
        startDate: f.startDate || todayStr(), durationDays: f.durationDays,
        prescribedBy: `${patientData.name} (self-reported)`, verified: false,
        source: 'patient', active: true, createdAt: Date.now(),
      });
      toast('Medicine added');
      setF({ name: '', dosage: '', startDate: todayStr(), durationDays: '' });
    } catch { toast('Could not add medicine', 'err'); } finally { setBusy(false); }
  };

  const markTaken = async (m: Medicine) => {
    try {
      await updateDoc(doc(db, 'medicines', m.id), { [`takenDates.${todayStr()}`]: true });
      toast('Marked as taken');
    } catch { toast('Could not update', 'err'); }
  };

  const toggleActive = async (m: Medicine) => {
    try {
      await updateDoc(doc(db, 'medicines', m.id), { active: m.active === false });
      toast(m.active === false ? 'Medicine restarted' : 'Medicine stopped');
    } catch { toast('Could not update', 'err'); }
  };

  if (meds === null) return <div className="max-w-[1000px] mx-auto min-w-0 w-full"><Loading /></div>;

  const list = [...meds].sort((a, b) => b.createdAt - a.createdAt).filter((m) =>
    filter === 'All' ? true : filter === 'Active' ? m.active !== false : m.active === false);

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      <PageHeader title="Medicines" sub="Self-report medicines; a doctor verifies them. Track what you take each day." />

      <form onSubmit={add} className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 items-end min-w-0">
        <div className="min-w-0"><label className={labelCls}>Medicine name *</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls + ' text-xs sm:text-sm'} placeholder="e.g. Metformin 500mg" /></div>
        <div className="min-w-0"><label className={labelCls}>Dosage / when</label><input value={f.dosage} onChange={(e) => setF({ ...f, dosage: e.target.value })} className={inputCls + ' text-xs sm:text-sm'} placeholder="1 tablet after breakfast" /></div>
        <div className="min-w-0"><label className={labelCls}>Start date</label><input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className={inputCls + ' text-xs sm:text-sm'} /></div>
        <div className="flex gap-2 items-end min-w-0">
          <div className="flex-1 min-w-0"><label className={labelCls}>Days</label><input value={f.durationDays} onChange={(e) => setF({ ...f, durationDays: e.target.value })} className={inputCls + ' text-xs sm:text-sm'} placeholder="e.g. 30" /></div>
          <button type="submit" disabled={busy} className={btnPrimary + ' flex items-center justify-center gap-1.5 disabled:opacity-70 px-3.5 py-2 text-xs sm:text-sm shrink-0'}>{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : ''} Add</button>
        </div>
      </form>

      <FilterPills filters={['All', 'Active', 'Stopped']} value={filter} onChange={setFilter} />

      {list.length === 0 ? (
        <EmptyState icon={<Pill className="w-8 h-8 text-ghost mx-auto" strokeWidth={1.5} />} title="No medicines here" sub="Add one above — a doctor will verify it." />
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {list.map((m, i) => {
            const taken = !!(m.takenDates && m.takenDates[todayStr()]);
            return (
              <div key={`${m.id}-${i}`} className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs sm:text-[14px] font-semibold text-ink truncate">{m.name} {taken && <span className="text-[11px] sm:text-[12px] text-ok font-medium">· taken today</span>}</p>
                  <p className="text-[11px] sm:text-[12px] text-muted mt-0.5">
                    {m.dosage || '—'} ·{schedTimeFromDosage(m.dosage || '')} · started {fmtD(m.startDate)}
                    {m.durationDays ? ` · ${m.durationDays} days` : ''} · by {m.prescribedBy || '—'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <StatusChip ok={m.verified} warn={!m.verified}>{m.verified ? `Verified${m.verifiedBy ? ` · ${m.verifiedBy}` : ''}` : 'Pending'}</StatusChip>
                  {m.active !== false && !taken && (
                    <button onClick={() => markTaken(m)} className="text-[11px] sm:text-[12px] font-medium text-ok border border-ok-bd px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[4px] hover:bg-ok-bg transition-colors">Mark Taken</button>
                  )}
                  <button onClick={() => toggleActive(m)} className="text-[11px] sm:text-[12px] font-medium text-muted border border-line px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[4px] hover:bg-app transition-colors">
                    {m.active === false ? '▶ Restart' : 'Stop'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
