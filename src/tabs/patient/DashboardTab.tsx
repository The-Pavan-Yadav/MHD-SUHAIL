import { useEffect, useState } from 'react';
import {
  Pill, CalendarClock, ListChecks, Bell, FileText, CalendarPlus, MessageSquare,
  AlertCircle, QrCode, Activity, Loader2, CheckCircle2, ArrowRight, TrendingUp, ShieldCheck,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import type { MhdUser, Medicine, Appointment, CaseDoc, TimelineEntry, ReportDoc, Bill } from '../../lib/types';
import { t } from '../../lib/i18n';
import { greetKey } from '../../lib/format';
import { fmtD, todayStr, schedTimeFromDosage, queueNumberOf, rupees } from '../../lib/format';
import { ActivityStreakCard } from './ActivityTab';

/** Patient dashboard — modern SaaS & AI-friendly clinical experience. */
export default function DashboardTab({ me, go }: { me: MhdUser; go: (tab: string) => void }) {
  const uid = me.id;
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [cases, setCases] = useState<CaseDoc[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifs, setNotifs] = useState<{ id: string; read: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const bind = <T,>(col: string, cb: (rows: T[]) => void, ...wheres: [string, unknown][]) => {
      let q: any = collection(db, col);
      wheres.forEach(([f, v]) => { q = query(q, where(f, '==', v)); });
      unsubs.push(onSnapshot(q, (s: any) => { cb(s.docs.map((d: any) => ({ id: d.id, ...d.data() }))); setLoading(false); }, () => setLoading(false)));
    };
    bind<Medicine>('medicines', setMeds, ['patientId', uid]);
    bind<Appointment>('appointments', setAppts, ['patientId', uid]);
    bind<CaseDoc>('cases', setCases, ['patientId', uid]);
    bind<TimelineEntry>('timeline', setTimeline, ['patientId', uid]);
    bind<ReportDoc>('reports', setReports, ['patientId', uid]);
    bind<Bill>('bills', setBills, ['patientId', uid]);
    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('to', '==', uid ?? '')),
      (s) => setNotifs(s.docs.map((d) => ({ id: d.id, read: !!d.data().read }))),
      () => { /* ignore */ },
    ));
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto p-12 text-center flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium text-muted">Syncing health records & vitals…</p>
      </div>
    );
  }

  const today = todayStr();
  const upcoming = appts.filter((a) => a.status === 'upcoming' && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const nextAppt = upcoming[0];
  const activeMeds = meds.filter((m) => m.active !== false);
  const unread = notifs.filter((n) => !n.read).length;
  const reviewed = cases.filter((c) => c.status === 'reviewed').length;
  const healthPct = cases.length ? Math.round((reviewed / cases.length) * 100) : 100;
  const dueFollowups = timeline.filter((e) => e.type === 'followup' && e.due && e.due >= today);
  const pendingBills = bills.filter((b) => b.status === 'pending');
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 100);
  const verifiedMeds = activeMeds.filter((m) => m.verified).length;
  const verifiedReports = reports.filter((r) => r.verified).length;
  const paidBills = bills.filter((b) => b.status === 'paid').length;
  const careBars: [string, number][] = [
    ['Cases reviewed', pct(reviewed, cases.length)],
    ['Meds verified', pct(verifiedMeds, activeMeds.length)],
    ['Results verified', pct(verifiedReports, reports.length)],
    ['Bills paid', pct(paidBills, bills.length)],
  ];
  const lastBill = [...bills].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];

  const todaysMeds = activeMeds
    .map((m) => ({ ...m, at: schedTimeFromDosage(m.dosage || '') }))
    .sort((a, b) => a.at.localeCompare(b.at));

  const reco = cases.length === 0 ? t('recoStart') : healthPct === 100 ? t('recoGreat') : t('recoDoing');

  const quickActions: [string, typeof Pill, string][] = [
    [t('bookAppt'), CalendarPlus, t('appts')],
    [t('talkDoctor'), MessageSquare, t('doctors')],
    [t('newCase'), FileText, t('mycase')],
    [t('qr'), QrCode, t('qr')],
  ];

  return (
    <div className="max-w-[1150px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 bg-surface border border-line rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="space-y-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] sm:text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> MHD Verified Patient Profile
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight truncate">
            {t(greetKey())}, {me.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted break-words">
            Health ID: <span className="font-mono font-bold text-primary">{me.healthId}</span> · Blood Group: <span className="font-semibold text-ink">{me.bloodGroup || 'O+'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => go(t('appts'))}
            className="w-full sm:w-auto px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#2a8eff] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#1e74ff] transition-all flex items-center justify-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" /> {t('bookAppt')}
          </button>
        </div>
      </div>

      {/* Core Health Overview + Next Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
        {/* Health Tracker */}
        <div className="bg-surface border border-line rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t('healthStatus')}</span>
              <span className="text-xs font-semibold text-[#2a8eff] bg-[#eaf3ff] px-2.5 py-1 rounded-full border border-[#b8d7ff] flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Optimal
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{healthPct}%</span>
              <span className="text-xs text-muted font-medium">{reviewed} of {cases.length} cases reviewed</span>
            </div>
            <div className="h-2.5 bg-app rounded-full overflow-hidden border border-line mb-3">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${healthPct}%` }} />
            </div>
            <p className="text-xs text-muted leading-relaxed">{reco}</p>
          </div>

          {cases.some((c) => c.status === 'waiting') && (
            <div className="mt-3.5 sm:mt-4 flex items-start gap-2.5 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 sm:p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {t('waitingReview')}
            </div>
          )}
        </div>

        {/* Next Appointment Card */}
        <div className="bg-surface border border-line border-l-4 border-l-primary rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{t('nextApptLbl')}</span>
              <CalendarClock className="w-4 h-4 text-primary" />
            </div>
            {nextAppt ? (
              <div className="space-y-1.5">
                <p className="text-[15px] sm:text-base font-bold text-ink">{nextAppt.doctorName}</p>
                <p className="text-xs font-medium text-muted">
                  {fmtD(nextAppt.date)} · {nextAppt.time} · Queue #{queueNumberOf(appts, nextAppt)}
                </p>
                <p className="text-xs text-muted">{nextAppt.type}{nextAppt.hospital ? ` · ${nextAppt.hospital}` : ''}</p>
                <button
                  onClick={() => go(t('appts'))}
                  className="mt-2.5 sm:mt-3 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  {t('viewDetails')} <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="py-2 space-y-2">
                <p className="text-xs text-muted">{t('noUpcomingAppts')}</p>
                <button
                  onClick={() => go(t('appts'))}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  {t('bookAppt')} →
                </button>
              </div>
            )}
          </div>

          {dueFollowups.length > 0 && (
            <div className="mt-3.5 sm:mt-4 text-xs text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 sm:p-3">
              {t('followDue')}: {fmtD(dueFollowups[0].due)}
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {([
          [t('activeSub'), activeMeds.length, Pill, t('meds')],
          [t('upcomingSub'), upcoming.length, CalendarClock, t('appts')],
          [t('totalSub'), reports.length, ListChecks, t('results')],
          [t('unreadSub'), unread, Bell, t('notifs')],
        ] as [string, number, typeof Pill, string][]).map(([label, val, Icon, navTab]) => (
          <button
            key={label}
            onClick={() => go(navTab)}
            className="bg-surface border border-line rounded-xl sm:rounded-2xl p-3 sm:p-5 text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider truncate">{label}</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-app text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{val}</p>
          </button>
        ))}
      </div>

      {/* Today's Medications */}
      <div className="bg-surface border border-line rounded-xl sm:rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-line bg-[#2a8eff] text-white">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider" style={{ color: '#ffffff' }}>{t('todaysMeds')}</h4>
          <button onClick={() => go(t('meds'))} className="text-xs font-bold text-white hover:underline" style={{ color: '#ffffff' }}>{t('viewAll')}</button>
        </div>
        {todaysMeds.length === 0 ? (
          <p className="p-6 sm:p-8 text-xs text-muted text-center">No active medicines scheduled for today. You can add prescriptions in {t('meds')}.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[360px]">
              <thead>
                <tr className="bg-[#2a8eff] border-b border-[#2a8eff] text-white font-semibold">
                  {['Time', 'Medicine', 'Dosage', t('verifiedLbl')].map((h, i) => (
                    <th key={`${h}-${i}`} className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 font-bold text-[11px] sm:text-xs uppercase tracking-wider text-white" style={{ color: '#ffffff' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {todaysMeds.slice(0, 5).map((m) => {
                  const taken = !!(m.takenDates && m.takenDates[today]);
                  return (
                    <tr key={m.id} className="hover:bg-[#eaf3ff] transition-colors">
                      <td className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 font-mono text-[#2a8eff] text-xs">{m.at}</td>
                      <td className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 font-bold text-[#2a8eff]">{m.name}</td>
                      <td className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 text-[#2a8eff]">{m.dosage || '1 dose'}</td>
                      <td className="px-3.5 sm:px-6 py-2.5 sm:py-3.5">
                        {m.verified ? (
                          <span className="inline-flex items-center gap-1 text-[#2a8eff] font-semibold text-[11px] sm:text-xs bg-[#eaf3ff] rounded-full px-2 py-0.5 sm:py-1 border border-[#b8d7ff]">
                            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[#2a8eff] text-[11px] sm:text-xs bg-[#f3f8ff] px-2 py-0.5 sm:py-1 rounded-full border border-[#d9eaff]">Self-reported</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2.5 sm:mb-3">{t('quickActions')}</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {quickActions.map(([label, Icon, nav]) => (
            <button key={label} onClick={() => go(nav)} className="bg-surface border border-line rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-sm hover:border-primary transition-colors flex flex-col items-center gap-2 sm:gap-3">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={1.5} />
              <span className="text-xs sm:text-[13px] font-semibold text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Care status bars */}
      <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-5 shadow-sm space-y-3.5 sm:space-y-4">
        <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('careStatus')}</h4>
        {careBars.map(([label, pct]) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">{label}</span>
              <span className="font-semibold text-ink">{pct}%</span>
            </div>
            <div className="h-[6px] bg-app rounded-full overflow-hidden border border-line">
              <div className="h-full bg-[#2a8eff] rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Mini lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
        <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('allMeds')}</h4>
            <button onClick={() => go(t('meds'))} className="text-[11px] font-bold text-primary">{t('viewLink')}</button>
          </div>
          {activeMeds.slice(0, 3).map((m) => (
            <p key={m.id} className="text-xs sm:text-[13px] text-ink py-1.5 border-b border-line last:border-0 truncate">{m.name} <span className="text-muted">· {m.dosage}</span></p>
          ))}
          {activeMeds.length === 0 && <p className="text-xs text-muted">—</p>}
        </div>
        <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('allResults')}</h4>
            <button onClick={() => go(t('results'))} className="text-[11px] font-bold text-primary">{t('viewLink')}</button>
          </div>
          {reports.slice(-3).reverse().map((r) => (
            <p key={r.id} className="text-xs sm:text-[13px] text-ink py-1.5 border-b border-line last:border-0 truncate">{r.title} <span className="text-muted">· {fmtD(r.date)}</span></p>
          ))}
          {reports.length === 0 && <p className="text-xs text-muted">—</p>}
        </div>
        <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">{t('billingHistory')}</h4>
            <button onClick={() => go(t('billing'))} className="text-[11px] font-bold text-primary">{t('viewLink')}</button>
          </div>
          {lastBill ? (
            <p className="text-xs sm:text-[13px] text-ink py-1.5">{rupees(lastBill.total)} <span className={`font-semibold ${lastBill.status === 'paid' ? 'text-ok' : 'text-danger'}`}>· {lastBill.status === 'paid' ? t('paidLbl') : t('pendingLbl')}</span></p>
          ) : <p className="text-xs text-muted">{t('noBillsYet')}</p>}
          {pendingBills.length > 0 && <p className="text-xs text-danger mt-1">{pendingBills.length} {t('pendingLbl').toLowerCase()}</p>}
        </div>
      </div>

      {/* Tracking link */}
      <button onClick={() => go(t('tracking'))} className="w-full flex items-center justify-between bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-5 shadow-sm hover:border-primary transition-colors text-left gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Activity className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-xs sm:text-[14px] font-medium text-ink truncate">{t('tracking')} — BP · Temp · Heart Rate · Weight</span>
        </div>
        <span className="text-xs sm:text-[13px] font-medium text-primary shrink-0">{t('viewLink')}</span>
      </button>

      {/* Activity streak */}
      <ActivityStreakCard me={me} onClick={() => go('Activity')} />
    </div>
  );
}
