import Papa from 'papaparse';
import type {
  Flight, Passenger, Baggage, GateEvent, SecurityScreening,
  MaintenanceLog, StaffShift, RetailTransaction,
} from '@/types';

const s = (v: unknown): string => (v === undefined || v === null ? '' : String(v).trim());
const nStr = (v: unknown): string | null => { const t = s(v); return t === '' ? null : t; };
const num = (v: unknown): number => { const n = parseFloat(s(v)); return Number.isFinite(n) ? n : 0; };
const bool = (v: unknown): boolean => s(v).toLowerCase() === 'true';
const dt = (v: unknown): Date | null => {
  const t = s(v);
  if (!t) return null;
  const d = new Date(t.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
};
const dtReq = (v: unknown): Date => dt(v) ?? new Date(0);

/** All source CSVs have a numeric index row 0 (0,1,2,...) instead of a header. Strip it. */
async function loadRawRows(path: string): Promise<string[][]> {
  const res = await fetch(path);
  const text = await res.text();
  const parsed = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
  const rows = parsed.data as string[][];
  // Row 0 is the numeric index header ("0","1","2",...) — drop it.
  return rows.length > 0 ? rows.slice(1) : rows;
}

export async function loadFlights(path = '/data/flights.csv'): Promise<Flight[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    flight_id: s(r[0]),
    airline_name: s(r[1]),
    airline_code: s(r[2]),
    origin: s(r[3]),
    destination: s(r[4]),
    scheduled_departure: dtReq(r[5]),
    actual_departure: dtReq(r[6]),
    scheduled_arrival: dtReq(r[7]),
    actual_arrival: dtReq(r[8]),
    aircraft_type: s(r[9]),
    tail_number: s(r[10]),
    capacity: num(r[11]),
    passengers_boarded: num(r[12]),
    status: s(r[13]),
    delay_minutes: num(r[14]),
    delay_reason: nStr(r[15]),
    terminal: s(r[16]),
    gate: s(r[17]),
    is_international: bool(r[18]),
    distance_km: num(r[19]),
    revenue_inr: num(r[20]),
    boarding_start_time: dtReq(r[21]),
    is_codeshare: bool(r[22]),
    delay_category: s(r[23]),
    load_factor_pct: num(r[24]),
    fuel_efficiency: num(r[25]),
    revenue_per_km: num(r[26]),
    time_of_day: s(r[27]),
    day_of_week: s(r[28]),
    is_peak_hour: bool(r[29]),
    season: s(r[30]),
    flight_category: s(r[31]),
  })).filter((f) => f.flight_id);
}

export async function loadPassengers(path = '/data/passengers.csv'): Promise<Passenger[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    passenger_id: s(r[0]),
    ff_number: num(r[1]),
    pnr_code: s(r[2]),
    first_name: s(r[3]),
    last_name: s(r[4]),
    nationality: s(r[5]),
    dob: dt(r[6]),
    gender: s(r[7]),
    seat_number: s(r[8]),
    cabin_class: s(r[9]),
    flight_id: s(r[10]),
    check_in_time: dt(r[11]),
    boarding_time: dt(r[12]),
    gate: s(r[13]),
    bags_count: num(r[14]),
    email: s(r[18]),
    phone: s(r[19]),
    is_frequent_flyer: bool(r[22]),
    satisfaction_score: num(r[23]),
    is_upgrade: bool(r[24]),
    booked_class: s(r[25]),
    age: num(r[26]),
    age_group: s(r[27]),
  })).filter((p) => p.passenger_id);
}

export async function loadBaggage(path = '/data/baggage.csv'): Promise<Baggage[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    bag_tag: s(r[0]),
    passenger_id: s(r[1]),
    flight_id: s(r[2]),
    pnr_code: s(r[3]),
    weight_kg: num(r[4]),
    dimensions: s(r[5]),
    drop_point: s(r[6]),
    location_code: s(r[7]),
    timestamp: dt(r[8]),
    created_at: dt(r[9]),
    transfer_count: num(r[10]),
    status: s(r[11]),
    is_overweight: bool(r[12]),
    overweight_fee: num(r[13]),
    handling_area: s(r[14]),
    last_scanned: dt(r[15]),
    is_damaged: bool(r[16]),
    damage_notes: nStr(r[17]),
  })).filter((b) => b.bag_tag);
}

export async function loadGateEvents(path = '/data/gate_events.csv'): Promise<GateEvent[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    event_id: s(r[0]),
    flight_id: s(r[1]),
    gate: s(r[2]),
    terminal: s(r[3]),
    event_type: s(r[4]),
    event_time: dt(r[5]),
    staff_id: s(r[6]),
    pax_count: num(r[7]),
    priority: s(r[8]),
    is_delayed: bool(r[9]),
    delay_reason: nStr(r[10]),
    resolved_at: dt(r[11]),
    created_at: dt(r[12]),
    scheduled_time: dt(r[13]),
  })).filter((g) => g.event_id);
}

export async function loadSecurityScreenings(path = '/data/security_screening.csv'): Promise<SecurityScreening[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    screening_id: s(r[0]),
    pnr_code: s(r[1]),
    passenger_id: s(r[2]),
    lane_number: num(r[3]),
    screening_time: dt(r[4]),
    flight_time: dt(r[5]),
    cleared_time: dt(r[6]),
    result: s(r[7]),
    flag_reason: nStr(r[8]),
    is_random: bool(r[9]),
    staff_id: s(r[10]),
    equipment_id: s(r[11]),
    processing_seconds: num(r[12]),
    is_flagged: bool(r[13]),
    alert_triggered: bool(r[14]),
    shift_id: s(r[15]),
    total_throughput: num(r[16]),
    pass_count: num(r[17]),
    fail_count: num(r[18]),
    is_peak: bool(r[19]),
  })).filter((sc) => sc.screening_id);
}

export async function loadMaintenanceLogs(path = '/data/maintenance_logs.csv'): Promise<MaintenanceLog[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    work_order_id: s(r[0]),
    tail_number: s(r[1]),
    flight_id: s(r[2]),
    maintenance_type: s(r[3]),
    technician_id: s(r[4]),
    start_time: dt(r[5]),
    end_time: dt(r[6]),
    duration_hrs: num(r[7]),
    parts_used_count: num(r[8]),
    defect_description: s(r[9]),
    repair_action: s(r[10]),
    severity_level: num(r[11]),
    supervisor_id: s(r[12]),
    is_aog: bool(r[13]),
    cleared_to_fly: bool(r[14]),
    notes: nStr(r[15]),
  })).filter((m) => m.work_order_id);
}

export async function loadStaffShifts(path = '/data/staff_shifts.csv'): Promise<StaffShift[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => {
    const shift_date = dt(r[4]);
    const startRaw = dt(r[5]);
    const endRaw = dt(r[6]);

    const shift_start = shift_date && startRaw
      ? new Date(shift_date.getFullYear(), shift_date.getMonth(), shift_date.getDate(), startRaw.getHours(), startRaw.getMinutes(), startRaw.getSeconds())
      : null;

    const shift_end = shift_date && endRaw
      ? new Date(shift_date.getFullYear(), shift_date.getMonth(), shift_date.getDate(), endRaw.getHours(), endRaw.getMinutes(), endRaw.getSeconds())
      : null;

    return {
      staff_id: s(r[0]),
      name: s(r[1]),
      department: s(r[2]),
      role: s(r[3]),
      shift_date,
      shift_start,
      shift_end,
      terminal: s(r[7]),
      gate: s(r[8]),
      supervisor_id: s(r[9]),
      hours_worked: num(r[10]),
      is_overtime: bool(r[11]),
      overtime_hours: r[12] !== undefined && s(r[12]) !== '' ? num(r[12]) : null,
      certification_expiry: dt(r[13]),
      language: s(r[14]),
    };
  }).filter((st) => st.staff_id);
}

export async function loadRetailTransactions(path = '/data/retail_transactions.csv'): Promise<RetailTransaction[]> {
  const rows = await loadRawRows(path);
  return rows.map((r) => ({
    transaction_id: s(r[0]),
    staff_id: s(r[1]),
    store_type: s(r[2]),
    zone: s(r[3]),
    pnr_code: s(r[4]),
    flight_id: s(r[5]),
    transaction_time: dt(r[6]),
    product_category: s(r[7]),
    quantity: num(r[8]),
    unit_price_inr: num(r[9]),
    total_amount_inr: num(r[10]),
    payment_method: s(r[11]),
    currency: s(r[12]),
    discount_pct: r[13] !== undefined && s(r[13]) !== '' ? num(r[13]) : null,
    terminal: s(r[14]),
    location_type: s(r[15]),
    is_duty_free: bool(r[16]),
  })).filter((rt) => rt.transaction_id);
}
