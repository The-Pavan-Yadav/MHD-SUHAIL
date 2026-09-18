import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';
import type { MhdUser, Appointment } from '../lib/types';
import { useEffect, useState } from 'react';
import { ageOf, todayStr, queueNumberOf } from '../lib/format';
import { bind } from './bind';
import { PageHeader, Loading } from './common';

export default function MyQRTab({ patientData }: { patientData: MhdUser }) {
  const [appts, setAppts] = useState<Appointment[] | null>(null);
  useEffect(() => bind<Appointment>('appointments', [['patientId', '==', patientData.id]], setAppts), [patientData.id]);

  if (appts === null) return <div className="max-w-[1000px] mx-auto min-w-0 w-full"><Loading /></div>;

  const today = todayStr();
  const nextAppt = appts
    .filter((a) => a.status === 'upcoming' && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];

  const payload = JSON.stringify({
    app: 'MHD-Hospital', healthId: patientData.healthId, name: patientData.name,
    age: ageOf(patientData.dob), gender: patientData.gender, bloodGroup: patientData.bloodGroup,
    allergies: patientData.allergies, conditions: patientData.conditions,
    emergencyContact: patientData.emergencyPhone, issuedDate: todayStr(),
    issuedTime: new Date().toLocaleTimeString('en-IN'),
    todayQueue: nextAppt ? { doctor: nextAppt.doctorName, date: nextAppt.date, time: nextAppt.time, queue: queueNumberOf(appts, nextAppt), hospital: nextAppt.hospital } : null,
  });

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 sm:space-y-6 pb-8 sm:pb-12 min-w-0 w-full">
      <PageHeader title="My QR Medical ID" sub="Show this at the hospital desk or in an emergency." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-4 sm:p-6 shadow-sm flex flex-col items-center min-w-0">
          <div className="border border-line rounded-xl sm:rounded-[4px] p-3 sm:p-4 bg-white max-w-full overflow-hidden flex items-center justify-center">
            <QRCodeSVG value={payload} size={180} className="w-full max-w-[180px] h-auto" level="M" />
          </div>
          <p className="text-sm sm:text-[15px] font-semibold text-heading mt-3 sm:mt-4 truncate max-w-full">{patientData.name}</p>
          <p className="text-xs sm:text-[13px] text-muted font-mono truncate max-w-full">{patientData.healthId}</p>
          <p className="text-[11px] sm:text-[12px] text-muted mt-1 text-center">Issued {todayStr()} · MHD Hospital</p>
        </div>
        <div className="bg-surface border border-line rounded-xl sm:rounded-[4px] p-4 sm:p-5 shadow-sm min-w-0">
          <h4 className="text-[10px] sm:text-[11px] font-bold text-muted uppercase tracking-wider mb-2.5 sm:mb-3">What&apos;s inside</h4>
          <ul className="text-xs sm:text-[13px] text-ink space-y-1.5 sm:space-y-2">
            <li>Health ID &amp; name</li>
            <li>Age, gender</li>
            <li>Blood group</li>
            <li>Allergies &amp; existing conditions</li>
            <li>Emergency contact</li>
            <li>Today&apos;s queue token {nextAppt ? `— #${queueNumberOf(appts, nextAppt)} at ${nextAppt.doctorName}` : '— none today'}</li>
          </ul>
          <p className="text-[10px] sm:text-[11px] text-muted mt-3 sm:mt-4">Hospital staff scan this to pull your emergency card instantly. Data is read-only.</p>
        </div>
      </div>
    </div>
  );
}
