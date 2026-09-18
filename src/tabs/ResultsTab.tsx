import { useEffect, useState } from 'react';
import { ListChecks, FileText } from 'lucide-react';
import type { MhdUser, ReportDoc } from '../lib/types';
import { fmtD, fmtDT } from '../lib/format';
import Modal from '../components/Modal';
import { bind } from './bind';
import { PageHeader, Loading, EmptyState, StatusChip, FilterPills } from './common';

export default function ResultsTab({ patientData }: { patientData: MhdUser }) {
  const [reports, setReports] = useState<ReportDoc[] | null>(null);
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState<ReportDoc | null>(null);

  useEffect(() => bind<ReportDoc>('reports', [['patientId', '==', patientData.id]], setReports), [patientData.id]);

  if (reports === null) return <div className="max-w-[1000px] mx-auto min-w-0 w-full"><Loading /></div>;

  const types = ['All', ...Array.from(new Set(reports.map((r) => r.type)))];
  const list = [...reports].sort((a, b) => b.createdAt - a.createdAt)
    .filter((r) => filter === 'All' || r.type === filter);

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      <PageHeader title="My Results" sub="Lab reports, scans and documents uploaded by the hospital." />
      <FilterPills filters={types} value={filter} onChange={setFilter} />

      {list.length === 0 ? (
        <EmptyState icon={<ListChecks className="w-8 h-8 text-ghost mx-auto" strokeWidth={1.5} />} title="No results yet" sub="Documents your hospital uploads will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {list.map((r, idx) => (
            <button key={`${r.id}-${idx}`} onClick={() => setOpen(r)} className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-3.5 sm:p-4 shadow-sm text-left hover:border-primary transition-colors min-w-0">
              <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  {r.fileData ? (
                    <img src={r.fileData} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-[4px] object-cover border border-line shrink-0" />
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-[4px] bg-active flex items-center justify-center shrink-0"><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={1.5} /></div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-[13px] font-semibold text-ink truncate">{r.title}</p>
                    <p className="text-[11px] sm:text-[12px] text-muted truncate">{r.type} · {fmtD(r.date)}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusChip ok={r.verified} warn={!r.verified}>{r.verified ? 'Verified' : 'Pending'}</StatusChip>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && (
        <Modal title={open.title} onClose={() => setOpen(null)}
          icon={<FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />}>
          {open.fileData && <img src={open.fileData} alt={open.title} className="w-full max-h-[300px] object-contain rounded-lg sm:rounded-[4px] border border-line mb-3 sm:mb-4 bg-black/5" />}
          <dl className="text-xs sm:text-[13px] space-y-2">
            {[['Type', open.type], ['Date', fmtD(open.date)], ['Hospital', open.hospital], ['Doctor', open.doctor], ['Note', open.note],
              ['Uploaded by', (open.uploadedBy || '—') + (open.uploadedByRole ? ` (${open.uploadedByRole})` : '')],
              ['Uploaded on', fmtDT(open.createdAt)], ['Status', open.verified ? 'Verified' : 'Awaiting verification']].map(([k, v], i) => v && (
              <div key={`${k}-${i}`} className="flex flex-col sm:flex-row sm:gap-2 border-b border-line/40 pb-1.5 last:border-0"><dt className="w-full sm:w-[110px] shrink-0 font-medium text-muted">{k}</dt><dd className="text-ink break-words">{v}</dd></div>
            ))}
          </dl>
        </Modal>
      )}
    </div>
  );
}
