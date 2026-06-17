import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { simulatorAPI } from '../services/api';

const WhatIfSimulator = () => {
  const { 
    currentFootprint, 
    calculatorFormData,
    scenarios,
    setScenarios,
    selectedScenario,
    setSelectedScenario 
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  if (!currentFootprint || !calculatorFormData) {
    return (
      <div style={{ maxWidth: '600px', margin: '48px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: '#fff', border: '1px solid #dadce0',
          borderRadius: '8px', padding: '48px 32px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3 style={{
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            fontSize: '20px', fontWeight: '400', color: '#202124',
            margin: '0 0 8px',
          }}>
            Calculate First
          </h3>
          <p style={{
            fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
            fontSize: '14px', color: '#5f6368', lineHeight: '1.6',
          }}>
            Use the Calculator tab to get your baseline carbon footprint, then return here to explore what-if scenarios.
          </p>
        </div>
      </div>
    );
  }

  const predefinedScenarios = [
    { name: 'Cut car usage by 50%', icon: '🚗', desc: 'Reduce daily driving distance by half', changes: { daily_car_km: (calculatorFormData.daily_car_km || 0) * 0.5 } },
    { name: 'Switch to electric car', icon: '⚡', desc: 'Replace your petrol/diesel vehicle', changes: { car_fuel_type: 'electric' } },
    { name: 'Reduce AC by 4 hours', icon: '❄️', desc: 'Less air conditioning daily', changes: { ac_hours_daily: Math.max(0, (calculatorFormData.ac_hours_daily || 0) - 4) } },
    { name: 'Use public transport', icon: '🚌', desc: 'Switch to bus or metro commute', changes: { daily_car_km: 0, public_transport_km: (calculatorFormData.public_transport_km || 0) + 100 } },
    { name: 'No flights this year', icon: '✈️', desc: 'Eliminate all air travel', changes: { monthly_flights: 0 } },
    { name: 'Renewable energy switch', icon: '🌱', desc: 'Switch to solar / green grid', changes: { monthly_electricity_kwh: 0 } },
  ];

  const runSimulation = async (scenario, idx) => {
    setLoading(true);
    setActiveCard(idx);
    try {
      const result = await simulatorAPI.whatIf(calculatorFormData, scenario.changes, scenario.name);
      setScenarios(prev => {
        const exists = prev.findIndex(s => s.scenario_name === result.scenario_name);
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = result;
          return updated;
        }
        return [...prev, result];
      });
      setSelectedScenario(result);
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Failed to run simulation');
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
          What-If Scenarios
        </h2>
        <p style={{
          fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
          fontSize: '14px', color: '#5f6368', margin: 0,
        }}>
          Explore how lifestyle changes could reduce your carbon footprint
        </p>
      </div>

      {/* Scenario cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {predefinedScenarios.map((scenario, idx) => {
          const isSelected = selectedScenario?.scenario_name === scenario.name;
          const isLoading = loading && activeCard === idx;
          return (
            <button
              key={idx}
              onClick={() => runSimulation(scenario, idx)}
              disabled={loading}
              style={{
                background: '#fff',
                border: `1px solid ${isSelected ? '#1a73e8' : '#dadce0'}`,
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'left',
                cursor: loading ? 'default' : 'pointer',
                transition: 'box-shadow 200ms, border-color 200ms',
                boxShadow: isSelected ? '0 0 0 1px #1a73e8, 0 1px 3px rgba(26,115,232,0.15)' : 'none',
                outline: 'none',
              }}
              onMouseOver={e => { if (!loading && !isSelected) { e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25)'; e.currentTarget.style.borderColor = '#80868b'; } }}
              onMouseOut={e => { if (!isSelected) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#dadce0'; } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{scenario.icon}</span>
                <span style={{
                  fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                  fontSize: '14px', fontWeight: '500',
                  color: isSelected ? '#1967d2' : '#202124',
                }}>
                  {scenario.name}
                </span>
                {isLoading && (
                  <div style={{ marginLeft: 'auto', width: '14px', height: '14px', border: '2px solid #e8eaed', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'gcSpin 0.8s linear infinite', flexShrink: 0 }} />
                )}
              </div>
              <p style={{
                fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
                fontSize: '13px', color: '#5f6368', margin: 0, lineHeight: '1.4',
              }}>
                {scenario.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {selectedScenario && (
        <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            fontSize: '18px', fontWeight: '400', color: '#202124',
            margin: '0 0 20px',
          }}>
            Results: <span style={{ color: '#1a73e8' }}>{selectedScenario.scenario_name}</span>
          </h3>

          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Current', value: `${selectedScenario.baseline_monthly_kg?.toFixed(1)} kg`, sub: 'CO₂e / month', color: '#5f6368', bg: '#f8f9fa' },
              { label: 'New Scenario', value: `${selectedScenario.scenario_monthly_kg?.toFixed(1)} kg`, sub: 'CO₂e / month', color: '#34a853', bg: '#e6f4ea' },
              { label: 'Savings', value: `${selectedScenario.percentage_reduction?.toFixed(1)}%`, sub: 'reduction', color: '#1a73e8', bg: '#e8f0fe' },
            ].map((m, i) => (
              <div key={i} style={{ background: m.bg, border: '1px solid #e8eaed', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#80868b', marginBottom: '8px' }}>{m.label}</div>
                <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '1.75rem', fontWeight: '400', color: m.color, lineHeight: '1' }}>{m.value}</div>
                <div style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '12px', color: '#9aa0a6', marginTop: '4px' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Annual savings */}
          <div style={{ background: '#e8f0fe', border: '1px solid rgba(26,115,232,0.2)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '13px', fontWeight: '500', color: '#1967d2' }}>💰 Annual Money Saved</div>
              <div style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '12px', color: '#1a73e8', marginTop: '2px' }}>
                Plus {selectedScenario.saved_tonnes_annually?.toFixed(2)} tonnes CO₂e saved per year
              </div>
            </div>
            <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '2rem', fontWeight: '400', color: '#1967d2' }}>
              ₹{(selectedScenario.annual_money_saved || 0).toFixed(0)}
            </div>
          </div>
        </div>
      )}

      {/* Comparison table */}
      {scenarios.length > 1 && (
        <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px', marginTop: '16px' }}>
          <h3 style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '16px', fontWeight: '500', color: '#202124', margin: '0 0 16px' }}>
            Scenario Comparison
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8eaed' }}>
                {['Scenario', 'Reduction', 'New Monthly', 'Annual Savings'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '12px', fontWeight: '600', color: '#80868b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f3f4' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px', fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#202124' }}>{s.scenario_name}</td>
                  <td style={{ padding: '10px 12px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', color: '#34a853', fontWeight: '500' }}>{s.percentage_reduction?.toFixed(1)}%</td>
                  <td style={{ padding: '10px 12px', fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#5f6368' }}>{s.scenario_monthly_kg?.toFixed(1)} kg</td>
                  <td style={{ padding: '10px 12px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', color: '#1a73e8', fontWeight: '500' }}>₹{(s.annual_money_saved || 0).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes gcSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default WhatIfSimulator;
