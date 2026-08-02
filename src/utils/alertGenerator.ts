import type { AllData, OpsAlert } from '@/types';
import { isSimOverweight } from '@/utils/crossJoin';

let counter = 0;
const nextId = () => `ALT-${(counter += 1).toString(36).toUpperCase()}`;

/**
 * Derives operational alerts from the raw dataset per the 13 rules in the
 * implementation plan. simulatedNow is used only for the certification-expiry
 * rule (relative to the moving simulation clock).
 */
export function generateAlerts(data: AllData, simulatedNow: Date): OpsAlert[] {
  counter = 0;
  const alerts: OpsAlert[] = [];
  const push = (severity: OpsAlert['severity'], module: OpsAlert['module'], message: string, recordId: string, timestamp: Date) => {
    alerts.push({ id: nextId(), severity, module, message, recordId, timestamp, acknowledged: false, status: 'Created' });
  };

  // 1. CRITICAL — TECH delay > 60min
  data.flights.forEach((f) => {
    if (f.delay_reason === 'TECH' && f.delay_minutes > 60) {
      push('CRITICAL', 'flights', `${f.flight_id} to ${f.destination}: technical delay of ${f.delay_minutes}min`, f.flight_id, f.scheduled_departure);
    }
  });

  // 2. CRITICAL — AOG
  data.maintenanceLogs.forEach((m) => {
    if (m.is_aog) push('CRITICAL', 'maintenance', `Aircraft ${m.tail_number} is AOG (${m.work_order_id})`, m.work_order_id, m.start_time ?? simulatedNow);
  });

  // 3. HIGH — not cleared to fly
  data.maintenanceLogs.forEach((m) => {
    if (!m.cleared_to_fly) push('HIGH', 'maintenance', `Maintenance hold: ${m.tail_number} not cleared to fly (${m.work_order_id})`, m.work_order_id, m.end_time ?? simulatedNow);
  });

  // 4. HIGH — flagged screening
  data.securityScreenings.forEach((sc) => {
    if (sc.is_flagged) push('HIGH', 'security', `Screening ${sc.screening_id} flagged at lane ${sc.lane_number}`, sc.screening_id, sc.screening_time ?? simulatedNow);
  });

  // 5. HIGH — alert triggered
  data.securityScreenings.forEach((sc) => {
    if (sc.alert_triggered) push('HIGH', 'security', `Security alert triggered — screening ${sc.screening_id}`, sc.screening_id, sc.screening_time ?? simulatedNow);
  });

  // 6. HIGH — overbooking
  data.flights.forEach((f) => {
    if (f.load_factor_pct >= 100) push('HIGH', 'flights', `${f.flight_id} overbooked at ${f.load_factor_pct.toFixed(1)}% load factor`, f.flight_id, f.scheduled_departure);
  });

  // 7. MEDIUM — delay > 60
  data.flights.forEach((f) => {
    if (f.delay_minutes > 60) push('MEDIUM', 'flights', `${f.flight_id} severely delayed by ${f.delay_minutes}min (${f.delay_reason ?? 'unknown'})`, f.flight_id, f.scheduled_departure);
  });

  // 8. MEDIUM — cert expiry within 30 days of simulated now
  data.staffShifts.forEach((st) => {
    if (st.certification_expiry) {
      const days = (st.certification_expiry.getTime() - simulatedNow.getTime()) / 86400000;
      if (days < 0) push('CRITICAL', 'staff', `${st.name} (${st.staff_id}) certification expired`, st.staff_id, st.certification_expiry);
      else if (days <= 30) push('MEDIUM', 'staff', `${st.name} (${st.staff_id}) certification expires in ${Math.round(days)}d`, st.staff_id, st.certification_expiry);
    }
  });

  // 9. MEDIUM — damaged baggage
  data.baggage.forEach((b) => {
    if (b.is_damaged) push('MEDIUM', 'baggage', `Bag ${b.bag_tag} reported damaged`, b.bag_tag, b.timestamp ?? simulatedNow);
  });

  // 10. LOW — delay 30-60
  data.flights.forEach((f) => {
    if (f.delay_minutes >= 30 && f.delay_minutes <= 60) push('LOW', 'flights', `${f.flight_id} delayed ${f.delay_minutes}min (${f.delay_reason ?? 'unknown'})`, f.flight_id, f.scheduled_departure);
  });

  // 11. LOW — dissatisfied passenger
  data.passengers.forEach((p) => {
    if (p.satisfaction_score < 0) push('LOW', 'passengers', `${p.first_name} ${p.last_name} reported dissatisfaction (${p.satisfaction_score.toFixed(2)})`, p.passenger_id, p.boarding_time ?? simulatedNow);
  });

  // 12. INFO — overweight baggage
  const passengerClassMap = new Map<string, string>();
  data.passengers.forEach((p) => {
    passengerClassMap.set(p.passenger_id, p.cabin_class);
  });
  data.baggage.forEach((b) => {
    const cc = passengerClassMap.get(b.passenger_id);
    if (isSimOverweight(b, cc)) {
      push('INFO', 'baggage', `Bag ${b.bag_tag} flagged overweight (${b.weight_kg.toFixed(1)}kg)`, b.bag_tag, b.timestamp ?? simulatedNow);
    }
  });

  // 13. INFO — codeshare international
  data.flights.forEach((f) => {
    if (f.is_codeshare && f.is_international) push('INFO', 'flights', `${f.flight_id} is an international codeshare service to ${f.destination}`, f.flight_id, f.scheduled_departure);
  });

  const order: Record<OpsAlert['severity'], number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  return alerts.sort((a, b) => order[a.severity] - order[b.severity] || b.timestamp.getTime() - a.timestamp.getTime());
}
