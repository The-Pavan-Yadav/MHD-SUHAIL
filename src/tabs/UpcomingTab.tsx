import { useEffect, useState } from 'react';
import { CalendarClock, Pill, AlertCircle, Clock } from 'lucide-react';
import type { MhdUser, Appointment, TimelineEntry, Medicine } from '../lib/types';
import { fmtD, todayStr, queueNumberOf, schedTimeFromDosage } from '../lib/format';
import { t } from '../lib/i18n';
import { bind } from './bind';
import { PageHeader, Loading, EmptyState, StatusChip } from './common';

/** Upcoming: appointments (queue #), follow-up reminders, active medicines. */
export default function UpcomingTab({ patientData }: { patientData: MhdUser }) {
  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);

  useEffect(() => {
    const u1 = bind<Appointment>('appointments', [['patientId', '==', patientData.id]], setAppts);
    const u2 = bind<TimelineEntry>('timeline', [['patientId', '==', patientData.id]], setTimeline);
    const u3 = bind<Medicine>('medicines', [['patientId', '==', patientData.id]], setMeds);
    return () => { u1(); u2(); u3(); };
  }, [patientData.id]);

  if (appts === null) return <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 min-w-0 w-full"><Loading /></div>;

  const today = todayStr();
  const upcoming = appts
    .filter((a) => a.status === 'upcoming' && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const followups = timeline
    .filter((e) => e.type === 'followup' && e.due && e.due >= today)
    .sort((a, b) => String(a.due).localeCompare(String(b.due)));
  const activeMeds = meds.filter((m) => m.active !== false);

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      <PageHeader title={t('upcoming')} sub={t('upcomingEvents')} />

      <div className="bg-white border border-line rounded-xl sm:rounded-[4px] shadow-sm overflow-hidden">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-line bg-[#2a8eff] text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-white" style={{ color: '#ffffff' }} strokeWidth={1.5} />
          <span className="text-white font-bold" style={{ color: '#ffffff' }}>{t('appts')} ({upcoming.length})</span>
        </div>
        {upcoming.length === 0 ? (
          <p className="p-6 text-xs sm:text-[13px] text-slate-600 text-center">{t('noUpcomingAppts')}</p>
        ) : (
          <div className="divide-y divide-line">
            {upcoming.map((a, i) => (
              <div key={`${a.id}-${i}`} className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-50 transition-colors gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-semibold text-[#1e3a8a] truncate">{a.doctorName} <span className="text-slate-500 font-normal">· {a.type}</span></p>
                  <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">{fmtD(a.date)} · {a.time} · {a.hospital || '—'}</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#2a8eff] border border-[#2a8eff] rounded-[4px] px-2 py-0.5">#{queueNumberOf(appts, a)}</span>
                  <StatusChip warn>{t('upcomingTab')}</StatusChip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-l-4 border-amber-500 border-y border-r border-y-line border-r-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#1e3a8a] uppercase tracking-wider mb-2.5 sm:mb-3">
          <AlertCircle className="w-4 h-4 text-[#1e3a8a]" />
          <span className="text-[#1e3a8a] font-bold">{t('followReminders')} ({followups.length})</span>
        </div>
        {followups.length === 0 ? (
          <p className="text-xs sm:text-[13px] text-slate-600">No follow-ups due.</p>
        ) : (
          <div className="space-y-2">
            {followups.map((f, i) => (
              <div key={`${f.id}-${i}`} className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-50 border border-amber-200 rounded-[4px] px-3 py-2 gap-1 sm:gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-medium text-[#1e3a8a] truncate">{f.icon} {f.title}</p>
                  <p className="text-[11px] sm:text-[12px] text-slate-500">{f.description}</p>
                </div>
                <span className="text-[11px] sm:text-[12px] font-bold text-amber-600 whitespace-nowrap shrink-0">{fmtD(f.due)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-line rounded-xl sm:rounded-[4px] shadow-sm overflow-hidden">
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-line bg-[#2a8eff] text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Pill className="w-4 h-4 text-white" style={{ color: '#ffffff' }} strokeWidth={1.5} />
          <span className="text-white font-bold" style={{ color: '#ffffff' }}>{t('activeMeds')} ({activeMeds.length})</span>
        </div>
        {activeMeds.length === 0 ? (
          <p className="p-6 text-xs sm:text-[13px] text-muted text-center">No active medicines.</p>
        ) : (
          <div className="divide-y divide-line">
            {activeMeds.map((m, i) => (
              <div key={`${m.id}-${i}`} className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 gap-1.5 sm:gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-semibold text-ink truncate">{m.name}</p>
                  <p className="text-[11px] sm:text-[12px] text-muted">{m.dosage} · {schedTimeFromDosage(m.dosage || '')} · by {m.prescribedBy || '—'}</p>
                </div>
                <div className="shrink-0">
                  <StatusChip ok={m.verified} warn={!m.verified}>{m.verified ? t('verifiedLbl') : 'Pending'}</StatusChip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
