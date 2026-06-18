/** Default carbon calculator form values shared across components. */
export const DEFAULT_FORM_DATA = {
  daily_car_km: '',
  car_fuel_type: 'petrol',
  monthly_flights: '',
  flight_type: 'domestic',
  public_transport_km: '',
  public_transport_type: 'bus',
  monthly_electricity_kwh: '',
  ac_hours_daily: '',
  lpg_kg_monthly: '',
  household_size: 1,
  region: 'india',
};

/** Generate or retrieve a persistent anonymous user ID. */
export function getOrCreateUserId() {
  const existing = localStorage.getItem('userId');
  if (existing) return existing;
  const id = `user-${crypto.randomUUID().slice(0, 8)}`;
  localStorage.setItem('userId', id);
  return id;
}
