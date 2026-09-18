import {
  CalendarPlus, History, FileText, FlaskConical, Pill, QrCode
} from 'lucide-react';

interface QuickActionsGridProps {
  onNavigate: (tab: string) => void;
}

export default function QuickActionsGrid({ onNavigate }: QuickActionsGridProps) {
  const actions = [
    {
      id: 'book-appt',
      label: 'Book Appointment',
      sub: 'Schedule specialist visit',
      icon: CalendarPlus,
      tab: 'Appointments',
      iconCls: 'bg-primary/10 text-primary',
    },
    {
      id: 'view-timeline',
      label: 'Health Timeline',
      sub: 'Full chronological log',
      icon: History,
      tab: 'Timeline',
      iconCls: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'view-records',
      label: 'Medical Records',
      sub: 'Clinical cases & notes',
      icon: FileText,
      tab: 'My Case',
      iconCls: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'view-reports',
      label: 'Lab Reports',
      sub: 'Diagnostic test results',
      icon: FlaskConical,
      tab: 'My Results',
      iconCls: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'view-prescriptions',
      label: 'Prescriptions',
      sub: 'Active dosages & meds',
      icon: Pill,
      tab: 'Medicines',
      iconCls: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
    },
    {
      id: 'view-qr',
      label: 'My Health QR',
      sub: 'Instant emergency card',
      icon: QrCode,
      tab: 'My QR',
      iconCls: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onNavigate(action.tab)}
              className="bg-surface border border-line rounded-2xl p-4 text-left shadow-[0_2px_8px_-2px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-primary/50 transition-all duration-150 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${action.iconCls}`}>
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold text-heading group-hover:text-primary transition-colors leading-tight">
                  {action.label}
                </p>
                <p className="text-[11px] text-muted truncate mt-1">
                  {action.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
