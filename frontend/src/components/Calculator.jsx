import React, { useState } from 'react';
import { calculatorAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import EmissionCard from './EmissionCard';

/* ─────────────────────────────────────────
   Reusable Google Cloud form field
───────────────────────────────────────── */
const GcField = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{
      display: 'block',
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      fontSize: '13px', fontWeight: '500',
      color: '#5f6368', marginBottom: '6px',
      letterSpacing: '0.01em',
    }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = (focused) => ({
  width: '100%',
  padding: '8px 12px',
  border: `1px solid ${focused ? '#1a73e8' : '#dadce0'}`,
  borderRadius: '4px',
  fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
  fontSize: '14px',
  color: '#202124',
  background: '#fff',
  outline: 'none',
  boxShadow: focused ? '0 0 0 2px rgba(26,115,232,0.15)' : 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
  boxSizing: 'border-box',
});

const GcInput = ({ ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={inputStyle(focused)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const GcSelect = ({ children, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle(focused),
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235f6368'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '20px',
        paddingRight: '36px',
        appearance: 'none',
        cursor: 'pointer',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
};

/* ─────────────────────────────────────────
   Section header (Google Cloud fieldset style)
───────────────────────────────────────── */
const SectionHeader = ({ icon, title }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    borderBottom: '1px solid #e8eaed',
    paddingBottom: '10px', marginBottom: '16px',
    marginTop: '8px',
  }}>
    <span style={{ fontSize: '16px' }}>{icon}</span>
    <span style={{
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      fontSize: '14px', fontWeight: '500',
      color: '#1a73e8', letterSpacing: '0.01em',
    }}>
      {title}
    </span>
  </div>
);

const Calculator = () => {
  const [formData, setFormData] = useState({
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
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userId, setCurrentFootprint } = useAppContext();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      ...formData,
      daily_car_km: formData.daily_car_km === '' ? 0 : formData.daily_car_km,
      monthly_flights: formData.monthly_flights === '' ? 0 : formData.monthly_flights,
      public_transport_km: formData.public_transport_km === '' ? 0 : formData.public_transport_km,
      monthly_electricity_kwh: formData.monthly_electricity_kwh === '' ? 0 : formData.monthly_electricity_kwh,
      ac_hours_daily: formData.ac_hours_daily === '' ? 0 : formData.ac_hours_daily,
      lpg_kg_monthly: formData.lpg_kg_monthly === '' ? 0 : formData.lpg_kg_monthly,
      household_size: formData.household_size === '' ? 1 : formData.household_size,
    };
    try {
      const response = await calculatorAPI.calculate(data, userId);
      setResult(response);
      setCurrentFootprint(response);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate footprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '960px', margin: '0 auto',
      padding: '32px 24px',
      fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
    }}>
      {/* Page heading */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
          fontSize: '1.75rem', fontWeight: '400',
          color: '#202124', margin: '0 0 4px',
        }}>
          Carbon Footprint Calculator
        </h2>
        <p style={{
          fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
          fontSize: '14px', color: '#5f6368', margin: 0,
        }}>
          Enter your daily activity details to get a precise carbon footprint estimate.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {/* ── FORM CARD ── */}
        <div style={{
          background: '#fff',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <form onSubmit={handleSubmit}>

            {/* Transportation */}
            <SectionHeader icon="🚗" title="Transportation" />
            <GcField label="Daily car travel (km)">
              <GcInput type="number" name="daily_car_km" value={formData.daily_car_km} onChange={handleChange} min="0" step="0.5" placeholder="0" />
            </GcField>
            <GcField label="Fuel type">
              <GcSelect name="car_fuel_type" value={formData.car_fuel_type} onChange={handleChange}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
              </GcSelect>
            </GcField>
            <GcField label="Flights per month">
              <GcInput type="number" name="monthly_flights" value={formData.monthly_flights} onChange={handleChange} min="0" step="0.25" placeholder="0" />
            </GcField>
            <GcField label="Public transport (km/month)">
              <GcInput type="number" name="public_transport_km" value={formData.public_transport_km} onChange={handleChange} min="0" step="1" placeholder="0" />
            </GcField>

            {/* Energy */}
            <SectionHeader icon="⚡" title="Energy & Cooling" />
            <GcField label="Monthly electricity (kWh)">
              <GcInput type="number" name="monthly_electricity_kwh" value={formData.monthly_electricity_kwh} onChange={handleChange} min="0" step="10" placeholder="0" />
            </GcField>
            <GcField label="AC usage (hours/day)">
              <GcInput type="number" name="ac_hours_daily" value={formData.ac_hours_daily} onChange={handleChange} min="0" step="0.5" max="24" placeholder="0" />
            </GcField>
            <GcField label="LPG / Cooking gas (kg/month)">
              <GcInput type="number" name="lpg_kg_monthly" value={formData.lpg_kg_monthly} onChange={handleChange} min="0" step="0.5" placeholder="0" />
            </GcField>

            {/* Household */}
            <SectionHeader icon="👥" title="Household" />
            <GcField label="Household size (people)">
              <GcInput type="number" name="household_size" value={formData.household_size} onChange={handleChange} min="1" step="1" />
            </GcField>
            <GcField label="Region">
              <GcSelect name="region" value={formData.region} onChange={handleChange}>
                <option value="india">India</option>
                <option value="us">USA</option>
                <option value="eu">European Union</option>
                <option value="uk">United Kingdom</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
              </GcSelect>
            </GcField>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '44px',
                border: 'none', borderRadius: '4px',
                background: loading ? '#f1f3f4' : '#1a73e8',
                color: loading ? '#9aa0a6' : '#fff',
                fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                fontSize: '14px', fontWeight: '500',
                cursor: loading ? 'default' : 'pointer',
                letterSpacing: '0.01em',
                marginTop: '8px',
                boxShadow: loading ? 'none' : '0 1px 3px rgba(60,64,67,0.25)',
                transition: 'background 280ms, box-shadow 280ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
              onMouseOver={e => { if (!loading) { e.currentTarget.style.background = '#1557b0'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(60,64,67,0.20)'; } }}
              onMouseOut={e => { if (!loading) { e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25)'; } }}
            >
              {loading && (
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'gcSpin 0.8s linear infinite' }} />
              )}
              {loading ? 'Calculating…' : 'Calculate Footprint'}
            </button>
          </form>
        </div>

        {/* ── RESULTS ── */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <EmissionCard result={result} />
            {result.recommendations?.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '20px' }}>
                <div style={{
                  fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                  fontSize: '14px', fontWeight: '500', color: '#1a73e8',
                  marginBottom: '12px',
                }}>
                  💡 Top Actions
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#34a853" style={{ flexShrink: 0, marginTop: '2px' }}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#202124' }}>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes gcSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Calculator;
