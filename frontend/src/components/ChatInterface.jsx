import { useState, useRef, useEffect } from 'react';
import { chatAPI, pledgeAPI } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { DEFAULT_FORM_DATA } from '../constants/defaults';

/* ─────────────────────────────────────────────
   Structured response cards (Google Cloud card style)
───────────────────────────────────────────── */
const StructuredResponseCards = ({ data }) => {
  const { summary, recommendations, what_if, challenge, confidence } = data;
  const { userId } = useAppContext();
  const [pledgedTasks, setPledgedTasks] = useState({});
  const [pledging, setPledging] = useState({});

  const handlePledge = async (taskName, co2Saved) => {
    if (pledgedTasks[taskName]) return;
    setPledging(prev => ({ ...prev, [taskName]: true }));
    try {
      await pledgeAPI.createPledge({
        action: taskName,
        estimated_co2_reduction: parseFloat(co2Saved),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }, userId || 'anonymous');
      setPledgedTasks(prev => ({ ...prev, [taskName]: true }));
    } catch (err) {
      console.error('Failed to commit pledge:', err);
    } finally {
      setPledging(prev => ({ ...prev, [taskName]: false }));
    }
  };

  const getScoreStyle = (score) => {
    if (score >= 80) return { chip: '#e6f4ea', chipText: '#137333', bar: '#34a853', label: 'Low Impact 🌱' };
    if (score >= 50) return { chip: '#fef7e0', chipText: '#b06000', bar: '#fbbc04', label: 'Moderate ⚡' };
    return { chip: '#fce8e6', chipText: '#c5221f', bar: '#ea4335', label: 'High Impact 🔥' };
  };

  const scoreStyle = getScoreStyle(summary?.score || 70);
  const totalTonnes = summary?.total_annual_tonnes || 0;

  // Shared card style
  const card = {
    background: '#fff',
    border: '1px solid #dadce0',
    borderRadius: '8px',
    padding: '20px',
    transition: 'box-shadow 280ms cubic-bezier(0.4,0,0.2,1)',
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '16px',
      marginTop: '12px',
      width: '100%',
      maxWidth: '800px',
    }}>

      {/* ── 1. CARBON SCORE ── */}
      <div style={card} onMouseOver={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25), 0 2px 6px rgba(60,64,67,0.15)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#80868b' }}>
            Carbon Score
          </span>
          <span style={{ background: scoreStyle.chip, color: scoreStyle.chipText, borderRadius: '100px', padding: '2px 10px', fontSize: '12px', fontWeight: '500', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}>
            {scoreStyle.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
          <span style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '3rem', fontWeight: '400', color: '#202124', lineHeight: '1' }}>{summary.score}</span>
          <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#80868b' }}>/100</span>
        </div>
        <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#5f6368', marginBottom: '12px' }}>
          Estimated annual footprint: <strong style={{ color: '#202124' }}>{totalTonnes} tonnes CO₂e</strong>
        </p>
        <div style={{ height: '4px', background: '#e8eaed', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: scoreStyle.bar, borderRadius: '2px', width: `${summary.score}%`, transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: '#9aa0a6', fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif' }}>High (0)</span>
          <span style={{ fontSize: '10px', color: '#9aa0a6', fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif' }}>Neutral (100)</span>
        </div>
      </div>

      {/* ── 2. EMISSION BREAKDOWN ── */}
      <div style={card} onMouseOver={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25), 0 2px 6px rgba(60,64,67,0.15)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
        <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#80868b', marginBottom: '12px' }}>
          📊 Emission Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {summary.categories?.map((cat, i) => {
            const pct = totalTonnes > 0 ? Math.min(100, Math.round((cat.value / totalTonnes) * 100)) : 0;
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#202124', fontWeight: '500' }}>{cat.name}</span>
                  <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '12px', color: '#5f6368' }}>{cat.value} {cat.unit || 't'} ({pct}%)</span>
                </div>
                <div style={{ height: '4px', background: '#e8eaed', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#1a73e8', borderRadius: '2px', width: `${pct}%`, transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '10px', color: '#9aa0a6', marginTop: '12px' }}>
          * Based on regional grid mix and emission factors
        </p>
      </div>

      {/* ── 3. RECOMMENDATIONS (full width) ── */}
      <div style={{ ...card, gridColumn: 'span 2' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25), 0 2px 6px rgba(60,64,67,0.15)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
        <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#80868b', marginBottom: '16px' }}>
          💡 Actionable Recommendations
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* High Impact */}
          <div>
            <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '12px', fontWeight: '600', color: '#c5221f', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              💥 High Impact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recommendations?.high_impact?.map((rec, i) => (
                <div key={i} style={{ background: '#fce8e6', border: '1px solid rgba(197,34,31,0.12)', borderRadius: '4px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#202124', margin: '0 0 2px', fontWeight: '500' }}>{rec.action}</p>
                  {rec.savings && <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '11px', color: '#137333', margin: 0, fontWeight: '500' }}>Saves: {rec.savings}</p>}
                </div>
              ))}
            </div>
          </div>
          {/* Easy Wins */}
          <div>
            <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '12px', fontWeight: '600', color: '#137333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ✨ Easy Wins
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recommendations?.easy_wins?.map((rec, i) => (
                <div key={i} style={{ background: '#e6f4ea', border: '1px solid rgba(19,115,51,0.12)', borderRadius: '4px', padding: '10px 12px' }}>
                  <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#202124', margin: '0 0 2px', fontWeight: '500' }}>{rec.action}</p>
                  {rec.savings && <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '11px', color: '#137333', margin: 0, fontWeight: '500' }}>Saves: {rec.savings}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. WHAT-IF ── */}
      {what_if && (
        <div style={{ ...card, background: '#f8f9fa' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25), 0 2px 6px rgba(60,64,67,0.15)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#80868b', marginBottom: '12px' }}>
            🎯 What-If Simulation
          </div>
          <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#5f6368', fontStyle: 'italic', margin: '0 0 14px', borderLeft: '3px solid #1a73e8', paddingLeft: '10px' }}>
            &ldquo;{what_if.scenario}&rdquo;
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
              <p style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#80868b', margin: '0 0 4px' }}>Reduction</p>
              <p style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '1.5rem', fontWeight: '500', color: '#34a853', margin: 0 }}>-{what_if.reduction_percentage}%</p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
              <p style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#80868b', margin: '0 0 4px' }}>Annual Savings</p>
              <p style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '1.5rem', fontWeight: '500', color: '#1a73e8', margin: 0 }}>₹{what_if.estimated_savings_rupees}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. WEEKLY CHALLENGE ── */}
      {challenge && (
        <div style={card} onMouseOver={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25), 0 2px 6px rgba(60,64,67,0.15)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#80868b' }}>
              🏆 Weekly Challenge
            </div>
            <span style={{ background: '#34a853', color: '#fff', borderRadius: '100px', padding: '2px 10px', fontSize: '11px', fontWeight: '600', fontFamily: '"Google Sans", Roboto, Arial, sans-serif' }}>
              +{challenge.potential_saved_kg} kg CO₂
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {challenge.tasks?.map((task, i) => {
              const isPledged = pledgedTasks[task];
              const isPledging = pledging[task];
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e8eaed', borderRadius: '4px', padding: '8px 10px' }}>
                  <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#202124', flex: '1', marginRight: '8px' }}>{task}</span>
                  <button
                    onClick={() => handlePledge(task, Math.round(challenge.potential_saved_kg / challenge.tasks.length))}
                    disabled={isPledged || isPledging}
                    style={{
                      padding: '4px 12px', height: '28px', border: 'none', borderRadius: '4px',
                      background: isPledged ? '#34a853' : '#1a73e8',
                      color: '#fff',
                      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                      fontSize: '12px', fontWeight: '500',
                      cursor: isPledged ? 'default' : 'pointer',
                      opacity: isPledging ? 0.7 : 1,
                      transition: 'background 200ms',
                      flexShrink: 0,
                    }}
                  >
                    {isPledging ? '...' : isPledged ? 'Pledged ✓' : 'Commit'}
                  </button>
                </div>
              );
            })}
          </div>
          <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '11px', color: '#9aa0a6', marginTop: '10px', textAlign: 'center' }}>
            Commits are saved to your dashboard goals
          </p>
        </div>
      )}

      {/* ── 6. CONFIDENCE ── */}
      {confidence && (
        <div style={{ ...card, gridColumn: 'span 2', background: '#f8f9fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1' }}>
              <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9aa0a6', marginBottom: '6px' }}>
                Model Assumptions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {confidence.assumptions?.map((a, i) => (
                  <span key={i} style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '12px', color: '#5f6368' }}>• {a}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9aa0a6' }}>Confidence</span>
              <span style={{ background: '#e8f0fe', color: '#1967d2', borderRadius: '4px', padding: '2px 10px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '13px', fontWeight: '600' }}>
                {confidence.score}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   ChatInterface — Google Cloud styled
───────────────────────────────────────────── */
const ChatInterface = () => {
  const { 
    userId, 
    sessionId, 
    setSessionId, 
    chatHistory, 
    setChatHistory, 
    calculatorFormData, 
    setCalculatorFormData, 
    setCurrentFootprint 
  } = useAppContext();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      const sid = `session-${Date.now()}`;
      setSessionId(sid);
    }
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        content: '👋 Welcome to EcoMind AI! I\'m your personal carbon footprint coach. Tell me about your daily activities, and I\'ll help you understand and reduce your carbon footprint.\n\nFor example: "I drive 18 km daily, use AC 8 hours, and fly twice a year."',
      }]);
    }
  }, [sessionId, setSessionId, chatHistory.length, setChatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage(userMsg, sessionId, userId);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: res.message,
        structuredData: res.structured_data,
      }]);

      // Link sections: Sync extracted values to calculator context
      if (res.carbon_result && res.extracted_data) {
        const mergedData = {
          ...DEFAULT_FORM_DATA,
          ...calculatorFormData,
        };

        // Merge only non-zero and populated values extracted by the AI
        Object.keys(res.extracted_data).forEach(key => {
          const val = res.extracted_data[key];
          if (val !== 0 && val !== '' && val !== null && val !== undefined) {
            mergedData[key] = val;
          }
        });

        // Ensure dependent fields update correctly
        if (res.extracted_data.car_fuel_type && res.extracted_data.daily_car_km > 0) {
          mergedData.car_fuel_type = res.extracted_data.car_fuel_type;
        }
        if (res.extracted_data.public_transport_type && res.extracted_data.public_transport_km > 0) {
          mergedData.public_transport_type = res.extracted_data.public_transport_type;
        }
        if (res.extracted_data.flight_type && res.extracted_data.monthly_flights > 0) {
          mergedData.flight_type = res.extracted_data.flight_type;
        }
        if (res.extracted_data.region) {
          mergedData.region = res.extracted_data.region;
        }
        if (res.extracted_data.household_size && res.extracted_data.household_size > 1) {
          mergedData.household_size = res.extracted_data.household_size;
        }

        setCalculatorFormData(mergedData);

        const updatedFootprint = {
          ...res.carbon_result,
          recommendations: res.carbon_result.recommendations || 
            (res.structured_data?.recommendations?.high_impact 
              ? res.structured_data.recommendations.high_impact.map(r => r.action)
              : [])
        };
        setCurrentFootprint(updatedFootprint);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>

      {/* Messages */}
      <div
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
        style={{ flex: '1 1 0', overflowY: 'auto', padding: '24px 24px 16px' }}
      >
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'gcFadeIn 0.25s ease' }}>
            {/* Sender label */}
            <div style={{
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: '11px', fontWeight: '600',
              color: '#80868b',
              marginBottom: '4px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {msg.role === 'user' ? 'You' : 'EcoMind AI'}
            </div>

            {/* Bubble */}
            <div style={{
              maxWidth: msg.structuredData ? '85%' : '70%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#1a73e8' : '#f1f3f4',
              color: msg.role === 'user' ? '#fff' : '#202124',
              fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-line',
              boxShadow: '0 1px 2px rgba(60,64,67,0.10)',
            }}>
              {msg.content}
            </div>

            {/* Structured cards */}
            {msg.structuredData && (
              <div style={{ marginTop: '12px', width: '100%', maxWidth: '85%' }}>
                <StructuredResponseCards data={msg.structuredData} />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              background: '#f1f3f4',
              borderRadius: '18px 18px 18px 4px',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div aria-hidden="true" style={{
                width: '16px', height: '16px',
                border: '2px solid #e8eaed',
                borderTopColor: '#1a73e8',
                borderRadius: '50%',
                animation: 'gcSpin 0.8s linear infinite',
              }} />
              <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#5f6368' }}>
                Analyzing...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {chatHistory.length <= 1 && (
        <div style={{ padding: '0 24px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            'I drive 15 km daily in a petrol car',
            'I use AC for 6 hours a day',
            'I fly 4 times a year for work',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => { setInput(prompt); }}
              style={{
                padding: '6px 14px',
                border: '1px solid #dadce0',
                borderRadius: '100px',
                background: 'transparent',
                fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
                fontSize: '13px', color: '#1a73e8',
                cursor: 'pointer',
                transition: 'background 200ms, border-color 200ms',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(26,115,232,0.04)'; e.currentTarget.style.borderColor = '#1a73e8'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#dadce0'; }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{
        borderTop: '1px solid #e8eaed',
        padding: '16px 24px',
        background: '#fff',
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          border: `1px solid ${inputFocused ? '#1a73e8' : '#dadce0'}`,
          borderRadius: '24px',
          padding: '8px 8px 8px 20px',
          background: '#fff',
          boxShadow: inputFocused ? '0 0 0 2px rgba(26,115,232,0.15)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Tell me about your lifestyle…"
            aria-label="Describe your lifestyle to calculate carbon footprint"
            aria-describedby="chat-disclaimer"
            disabled={loading}
            style={{
              flex: '1',
              border: 'none',
              outline: 'none',
              fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
              fontSize: '14px',
              color: '#202124',
              background: 'transparent',
              lineHeight: '1.5',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            style={{
              width: '40px', height: '40px',
              border: 'none', borderRadius: '50%',
              background: loading || !input.trim() ? '#f1f3f4' : '#1a73e8',
              color: loading || !input.trim() ? '#9aa0a6' : '#fff',
              cursor: loading || !input.trim() ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 200ms, color 200ms',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <p id="chat-disclaimer" style={{
          fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
          fontSize: '11px', color: '#9aa0a6',
          textAlign: 'center', marginTop: '8px',
        }}>
          EcoMind AI may produce inaccurate estimates. Verify important information.
        </p>
      </div>

      <style>{`
        @keyframes gcFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gcSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
