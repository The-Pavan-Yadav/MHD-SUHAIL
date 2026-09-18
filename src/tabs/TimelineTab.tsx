import { useEffect, useState } from 'react';
import { History, Baby, Stethoscope, Calendar, Pill, FileText, Activity, Clock, Syringe, Building2 } from 'lucide-react';
import type { MhdUser, TimelineEntry, CaseDoc, Appointment, Medicine, ReportDoc, VitalsDoc } from '../lib/types';
import { fmtDT, fmtD } from '../lib/format';
import { bind } from './bind';
import { PageHeader, Loading, EmptyState, FilterPills } from './common';

type SynEvent = {
  id: string;
  timeMs: number;
  dateStr: string;
  type: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
};

export default function TimelineTab({ patientData }: { patientData: MhdUser }) {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const [tEntries, setTEntries] = useState<TimelineEntry[]>([]);
  const [cases, setCases] = useState<CaseDoc[]>([]);
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [vitals, setVitals] = useState<VitalsDoc[]>([]);

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    const load = async () => {
      unsubs.push(bind<TimelineEntry>('timeline', [['patientId', '==', patientData.id]], setTEntries));
      unsubs.push(bind<CaseDoc>('cases', [['patientId', '==', patientData.id]], setCases));
      unsubs.push(bind<Appointment>('appointments', [['patientId', '==', patientData.id]], setAppts));
      unsubs.push(bind<Medicine>('medicines', [['patientId', '==', patientData.id]], setMeds));
      unsubs.push(bind<ReportDoc>('reports', [['patientId', '==', patientData.id]], setReports));
      unsubs.push(bind<VitalsDoc>('vitals', [['patientId', '==', patientData.id]], setVitals));
      
      // Give a tiny delay for firebase to fetch
      setTimeout(() => setLoading(false), 800);
    };
    load();
    return () => unsubs.forEach((u) => u());
  }, [patientData.id]);

  if (loading) return <div className="max-w-[1000px] mx-auto min-w-0 w-full"><Loading /></div>;

  const events: SynEvent[] = [];

  // 1. Birth Event
  if (patientData.dob) {
    const dMs = new Date(patientData.dob).getTime();
    events.push({
      id: 'birth',
      timeMs: dMs,
      dateStr: patientData.dob,
      type: 'general',
      icon: <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />,
      title: 'Born',
      description: 'Patient date of birth',
      subtitle: `DOB: ${fmtD(patientData.dob)}`
    });
  }

  // 2. Cases (Consultations / Diagnoses)
  cases.forEach(c => {
    events.push({
      id: c.id,
      timeMs: c.createdAt,
      dateStr: fmtD(c.createdAt),
      type: 'consultation',
      icon: <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
      title: c.chiefComplaint || 'Consultation',
      description: c.summary || c.doctorNotes || 'Consultation record',
      subtitle: c.doctorName ? `Dr. ${c.doctorName}` : (c.hospital || 'Hospital Visit'),
      badge: c.status === 'reviewed' ? 'Reviewed' : 'Waiting',
      badgeColor: c.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
    });
  });

  // 3. Appointments
  appts.forEach(a => {
    events.push({
      id: a.id,
      timeMs: a.createdAt,
      dateStr: a.date,
      type: 'appointment',
      icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
      title: 'Appointment Scheduled',
      description: `${a.type || 'General'} visit at ${a.time}`,
      subtitle: `Dr. ${a.doctorName} ${a.hospital ? `· ${a.hospital}` : ''}`,
      badge: a.status,
      badgeColor: a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : a.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
    });
  });

  // 4. Medicines / Prescriptions
  meds.forEach(m => {
    events.push({
      id: m.id,
      timeMs: m.createdAt,
      dateStr: m.startDate || fmtD(m.createdAt),
      type: 'prescription',
      icon: <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />,
      title: `Prescription: ${m.name}`,
      description: `${m.dosage} ${m.durationDays ? `for ${m.durationDays} days` : ''}`,
      subtitle: m.prescribedBy ? `Prescribed by Dr. ${m.prescribedBy}` : 'Added by patient',
      badge: m.verified ? 'Verified' : '',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    });
  });

  // 5. Lab Reports / Procedures
  reports.forEach(r => {
    events.push({
      id: r.id,
      timeMs: r.createdAt,
      dateStr: r.date || fmtD(r.createdAt),
      type: 'report',
      icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />,
      title: r.title || 'Medical Report',
      description: r.summary || r.note || 'Lab report or document uploaded',
      subtitle: r.hospital || r.doctorName ? `${r.hospital || ''} ${r.doctorName || ''}` : 'Uploaded document',
      badge: r.type || 'Report',
      badgeColor: 'bg-slate-100 text-slate-700'
    });
  });

  // 6. Vitals
  vitals.forEach(v => {
    events.push({
      id: v.id,
      timeMs: v.createdAt,
      dateStr: v.date || fmtD(v.createdAt),
      type: 'vitals',
      icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />,
      title: 'Vitals Recorded',
      description: `BP: ${v.bp} | HR: ${v.hr} | Temp: ${v.temp} | Wt: ${v.wt}`,
      subtitle: v.enteredBy === 'patient' ? 'Self-logged' : (v.doctorName ? `Logged by Dr. ${v.doctorName}` : 'Hospital logged'),
    });
  });

  // 7. Timeline specific events
  tEntries.forEach(t => {
    if (['consult', 'appointment', 'prescription'].includes(t.type)) return;
    
    events.push({
      id: t.id,
      timeMs: t.createdAt,
      dateStr: t.date || fmtD(t.createdAt),
      type: t.type,
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />,
      title: t.title || 'Timeline Event',
      description: t.description || t.note || '',
      subtitle: t.due ? `Due: ${fmtD(t.due)}` : '',
      badge: t.type === 'followup' ? 'Follow-up' : '',
      badgeColor: 'bg-indigo-100 text-indigo-700'
    });
  });

  events.sort((a, b) => b.timeMs - a.timeMs);

  const types = ['All', 'consultation', 'prescription', 'appointment', 'report', 'vitals', 'general', 'followup'];
  const list = events.filter((e) => filter === 'All' || e.type === filter);

  // Group by year
  const grouped: Record<string, SynEvent[]> = {};
  list.forEach(e => {
    const d = new Date(e.timeMs);
    const yr = isNaN(d.getFullYear()) ? 'Unknown' : d.getFullYear().toString();
    if (!grouped[yr]) grouped[yr] = [];
    grouped[yr].push(e);
  });

  const sortedYears = Object.keys(grouped).sort((a, b) => (b === 'Unknown' ? -1 : a === 'Unknown' ? 1 : parseInt(b) - parseInt(a)));

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      <PageHeader title="My Timeline" sub="Your complete medical journey from birth to present — newest first." />
      <FilterPills filters={types.map(t => t.charAt(0).toUpperCase() + t.slice(1))} value={filter.charAt(0).toUpperCase() + filter.slice(1)} onChange={(v) => setFilter(v.toLowerCase())} />
      
      {list.length === 0 ? (
        <EmptyState icon={<History className="w-8 h-8 text-ghost mx-auto" strokeWidth={1.5} />} title="Nothing here yet" sub="Medical events will build this timeline." />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {sortedYears.map(year => (
            <div key={year} className="relative">
              <div className="sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur-md py-1.5 sm:py-2 border-y border-line -mx-3 px-3 sm:mx-0 sm:px-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none sm:py-0 mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4">
                <h3 className="text-base sm:text-lg font-bold text-ink">{year}</h3>
                <div className="h-px bg-line flex-1 hidden sm:block"></div>
              </div>
              
              <div className="relative border-l-2 border-line ml-3.5 sm:ml-6 space-y-4 sm:space-y-6 pb-2 sm:pb-4">
                {grouped[year].map((e, idx) => (
                  <div key={`${e.id}-${idx}`} className="relative pl-5 sm:pl-8 group min-w-0">
                    {/* Timeline dot/icon */}
                    <div className="absolute -left-[15px] sm:-left-[17px] top-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white border-2 border-line flex items-center justify-center group-hover:border-primary group-hover:scale-110 transition-all shadow-sm">
                      {e.icon}
                    </div>

                    {/* Content Card */}
                    <div className="bg-white border border-line rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                            <h4 className="text-xs sm:text-[15px] font-bold text-ink truncate">{e.title}</h4>
                            {e.badge && (
                              <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${e.badgeColor}`}>
                                {e.badge}
                              </span>
                            )}
                          </div>
                          {e.subtitle && <p className="text-[11px] sm:text-[13px] font-medium text-primary truncate">{e.subtitle}</p>}
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-[11px] sm:text-[13px] font-semibold text-ink">{fmtDT(e.timeMs)}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs sm:text-[13px] text-muted bg-surface rounded-lg p-2.5 sm:p-3 border border-line/50 break-words">
                        {e.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
