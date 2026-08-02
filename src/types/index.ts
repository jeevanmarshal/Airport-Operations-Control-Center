export interface Flight {
  flight_id: string;
  airline_name: string;
  airline_code: string;
  origin: string;
  destination: string;
  scheduled_departure: Date;
  actual_departure: Date;
  scheduled_arrival: Date;
  actual_arrival: Date;
  aircraft_type: string;
  tail_number: string;
  capacity: number;
  passengers_boarded: number;
  status: string;
  delay_minutes: number;
  delay_reason: string | null;
  terminal: string;
  gate: string;
  is_international: boolean;
  distance_km: number;
  revenue_inr: number;
  boarding_start_time: Date;
  is_codeshare: boolean;
  delay_category: string;
  load_factor_pct: number;
  fuel_efficiency: number;
  revenue_per_km: number;
  time_of_day: string;
  day_of_week: string;
  is_peak_hour: boolean;
  season: string;
  flight_category: string;
}

export interface Passenger {
  passenger_id: string;
  ff_number: number;
  pnr_code: string;
  first_name: string;
  last_name: string;
  nationality: string;
  dob: Date | null;
  gender: string;
  seat_number: string;
  cabin_class: string;
  flight_id: string;
  check_in_time: Date | null;
  boarding_time: Date | null;
  gate: string;
  bags_count: number;
  email: string;
  phone: string;
  is_frequent_flyer: boolean;
  satisfaction_score: number;
  is_upgrade: boolean;
  booked_class: string;
  age: number;
  age_group: string;
}

export interface Baggage {
  bag_tag: string;
  passenger_id: string;
  flight_id: string;
  pnr_code: string;
  weight_kg: number;
  dimensions: string;
  drop_point: string;
  location_code: string;
  timestamp: Date | null;
  created_at: Date | null;
  transfer_count: number;
  status: string;
  is_overweight: boolean;
  overweight_fee: number;
  handling_area: string;
  last_scanned: Date | null;
  is_damaged: boolean;
  damage_notes: string | null;
}

export interface GateEvent {
  event_id: string;
  flight_id: string;
  gate: string;
  terminal: string;
  event_type: string;
  event_time: Date | null;
  staff_id: string;
  pax_count: number;
  priority: string;
  is_delayed: boolean;
  delay_reason: string | null;
  resolved_at: Date | null;
  created_at: Date | null;
  scheduled_time: Date | null;
}

export interface SecurityScreening {
  screening_id: string;
  pnr_code: string;
  passenger_id: string;
  lane_number: number;
  screening_time: Date | null;
  flight_time: Date | null;
  cleared_time: Date | null;
  result: string;
  flag_reason: string | null;
  is_random: boolean;
  staff_id: string;
  equipment_id: string;
  processing_seconds: number;
  is_flagged: boolean;
  alert_triggered: boolean;
  shift_id: string;
  total_throughput: number;
  pass_count: number;
  fail_count: number;
  is_peak: boolean;
}

export interface MaintenanceLog {
  work_order_id: string;
  tail_number: string;
  flight_id: string;
  maintenance_type: string;
  technician_id: string;
  start_time: Date | null;
  end_time: Date | null;
  duration_hrs: number;
  parts_used_count: number;
  defect_description: string;
  repair_action: string;
  severity_level: number;
  supervisor_id: string;
  is_aog: boolean;
  cleared_to_fly: boolean;
  notes: string | null;
}

export interface StaffShift {
  staff_id: string;
  name: string;
  department: string;
  role: string;
  shift_date: Date | null;
  shift_start: Date | null;
  shift_end: Date | null;
  terminal: string;
  gate: string;
  supervisor_id: string;
  hours_worked: number;
  is_overtime: boolean;
  overtime_hours: number | null;
  certification_expiry: Date | null;
  language: string;
}

export interface RetailTransaction {
  transaction_id: string;
  staff_id: string;
  store_type: string;
  zone: string;
  pnr_code: string;
  flight_id: string;
  transaction_time: Date | null;
  product_category: string;
  quantity: number;
  unit_price_inr: number;
  total_amount_inr: number;
  payment_method: string;
  currency: string;
  discount_pct: number | null;
  terminal: string;
  location_type: string;
  is_duty_free: boolean;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlertModule =
  | 'flights' | 'gates' | 'baggage' | 'passengers'
  | 'security' | 'maintenance' | 'staff' | 'retail';

export type AlertStatus = 'Created' | 'Acknowledged' | 'Investigating' | 'Resolved' | 'Closed';

export interface OpsAlert {
  id: string;
  severity: AlertSeverity;
  module: AlertModule;
  message: string;
  recordId: string;
  timestamp: Date;
  acknowledged: boolean;
  status?: AlertStatus;
  resolvedAt?: Date;
}

export interface AllData {
  flights: Flight[];
  passengers: Passenger[];
  baggage: Baggage[];
  gateEvents: GateEvent[];
  securityScreenings: SecurityScreening[];
  maintenanceLogs: MaintenanceLog[];
  staffShifts: StaffShift[];
  retailTransactions: RetailTransaction[];
}

export type SimSpeed = 1 | 10 | 20 | 40 | 80;
