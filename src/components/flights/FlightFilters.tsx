import type { Flight } from '@/types';
import type { FilterDef } from '@/components/common/FilterBar';

export function buildFlightFilterDefs(flights: Flight[]): FilterDef[] {
  const airlines = Array.from(new Set(flights.map((f) => f.airline_name))).sort();
  const delayCategories = Array.from(new Set(flights.map((f) => f.delay_category))).sort();
  const flightCategories = Array.from(new Set(flights.map((f) => f.flight_category))).sort();
  const timesOfDay = Array.from(new Set(flights.map((f) => f.time_of_day))).sort();
  const daysOfWeek = Array.from(new Set(flights.map((f) => f.day_of_week)));

  return [
    { key: 'airline_name', label: 'Airline', options: airlines.map((a) => ({ value: a, label: a })) },
    { key: 'delay_category', label: 'Delay', options: delayCategories.map((d) => ({ value: d, label: d })) },
    { key: 'flight_category', label: 'Category', options: flightCategories.map((c) => ({ value: c, label: c })) },
    { key: 'time_of_day', label: 'Time', options: timesOfDay.map((t) => ({ value: t, label: t })) },
    { key: 'day_of_week', label: 'Day', options: daysOfWeek.map((d) => ({ value: d, label: d })) },
    { key: 'is_international', label: 'Route', options: [{ value: 'true', label: 'International' }, { value: 'false', label: 'Domestic' }] },
    { key: 'is_peak_hour', label: 'Peak', options: [{ value: 'true', label: 'Peak Hour' }, { value: 'false', label: 'Off-Peak' }] },
  ];
}

export const flightFilterPredicates: Record<string, (f: Flight, v: unknown) => boolean> = {
  airline_name: (f, v) => f.airline_name === v,
  delay_category: (f, v) => f.delay_category === v,
  flight_category: (f, v) => f.flight_category === v,
  time_of_day: (f, v) => f.time_of_day === v,
  day_of_week: (f, v) => f.day_of_week === v,
  is_international: (f, v) => String(f.is_international) === v,
  is_peak_hour: (f, v) => String(f.is_peak_hour) === v,
};
