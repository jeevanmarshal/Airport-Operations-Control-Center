import type { AllData, Flight, Passenger, Baggage } from '@/types';

export function flightPassengers(data: AllData, flightId: string): Passenger[] {
  return data.passengers.filter((p) => p.flight_id === flightId);
}
export function flightBaggage(data: AllData, flightId: string): Baggage[] {
  return data.baggage.filter((b) => b.flight_id === flightId);
}
export function flightGateEvents(data: AllData, flightId: string) {
  return data.gateEvents.filter((g) => g.flight_id === flightId);
}
export function flightMaintenance(data: AllData, flight: Pick<Flight, 'flight_id' | 'tail_number'>) {
  return data.maintenanceLogs.filter((m) => m.flight_id === flight.flight_id || m.tail_number === flight.tail_number);
}
export function flightRetail(data: AllData, flightId: string) {
  return data.retailTransactions.filter((r) => r.flight_id === flightId);
}
export function flightStaff(data: AllData, flightId: string) {
  const staffIds = new Set(flightGateEvents(data, flightId).map((g) => g.staff_id));
  return data.staffShifts.filter((st) => staffIds.has(st.staff_id));
}

export function passengerSecurity(data: AllData, passenger: Pick<Passenger, 'pnr_code' | 'passenger_id'>) {
  return data.securityScreenings.filter((sc) => sc.pnr_code === passenger.pnr_code || sc.passenger_id === passenger.passenger_id);
}
export function passengerBaggage(data: AllData, passenger: Pick<Passenger, 'pnr_code' | 'passenger_id'>) {
  return data.baggage.filter((b) => b.pnr_code === passenger.pnr_code || b.passenger_id === passenger.passenger_id);
}
export function passengerFlight(data: AllData, flightId: string): Flight | undefined {
  return data.flights.find((f) => f.flight_id === flightId);
}
export function passengerRetail(data: AllData, pnr: string) {
  return data.retailTransactions.filter((r) => r.pnr_code === pnr);
}

export function gateEventsForGate(data: AllData, gate: string) {
  return data.gateEvents.filter((g) => g.gate === gate);
}

export function staffGateEvents(data: AllData, staffId: string) {
  return data.gateEvents.filter((g) => g.staff_id === staffId);
}
export function staffScreenings(data: AllData, staffId: string) {
  return data.securityScreenings.filter((sc) => sc.staff_id === staffId);
}
export function supervisorOf(data: AllData, supervisorId: string) {
  return data.staffShifts.find((st) => st.staff_id === supervisorId);
}

export function maintenanceFlight(data: AllData, flightId: string) {
  return data.flights.find((f) => f.flight_id === flightId);
}

/**
 * Simulated overweight threshold (Business Rule in plan §baggage): since the
 * dataset's is_overweight column is always False, derive it from weight and
 * the passenger's cabin class — Economy > 20kg, Business > 32kg.
 */
export function isSimOverweight(bag: Baggage, cabinClass: string | undefined): boolean {
  const limit = cabinClass === 'Business' ? 32 : 20;
  return bag.weight_kg > limit;
}
