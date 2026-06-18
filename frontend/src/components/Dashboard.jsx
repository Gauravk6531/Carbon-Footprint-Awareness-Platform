import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { calculatorAPI, pledgeAPI } from '../services/api';

/* ────────────────────────────────────────────
   Stat Card — Google Cloud metric style
 ──────────────────────────────────────────── */
const StatCard = ({ label, value, unit, sub, icon, color = '#1a73e8', bg = '#e8f0fe' }) => (
  <div style={{
    background: '#fff', border: '1px solid #dadce0',
    borderRadius: '8px', padding: '20px',
    transition: 'box-shadow 200ms',
    cursor: 'default',
  }}
  onMouseOver={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.25)'}
  onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <span style={{
        fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
        fontSize: '12px', fontWeight: '500',
        color: '#5f6368', letterSpacing: '0.01em',
      }}>
        {label}
      </span>
      <span style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: bg, color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', flexShrink: 0,
      }}>
        {icon}
      </span>
    </div>
    <div style={{
      fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
      fontSize: '2rem', fontWeight: '400',
      color: '#202124', lineHeight: '1', marginBottom: '4px',
    }}>
      {value}
    </div>
    <div style={{
      fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
      fontSize: '12px', color: color, fontWeight: '500',
    }}>
      {unit}
    </div>
    {sub && (
      <div style={{
        fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
        fontSize: '12px', color: '#34a853',
        marginTop: '8px',
        borderTop: '1px solid #e8eaed', paddingTop: '8px',
      }}>
        {sub}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { currentFootprint, userId } = useAppContext();
  const [history, setHistory] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const uid = userId || 'anonymous';
      const [histRes, pledgeRes] = await Promise.all([
        calculatorAPI.getHistory(uid),
        pledgeAPI.getPledges(uid)
      ]);
      setHistory(histRes.footprints || []);
      setPledges(pledgeRes.pledges || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, currentFootprint]);

  const handleCommitPledge = async (actionTitle) => {
    try {
      const uid = userId || 'anonymous';
      await pledgeAPI.createPledge({
        action: actionTitle,
        estimated_co2_reduction: 15.0, // standard estimate
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }, uid);
      await loadDashboardData();
    } catch (err) {
      console.error("Failed to commit pledge from dashboard:", err);
    }
  };

  // 1. Current Footprint (Annual Tonnes)
  const displayFootprint = Number(
    currentFootprint && currentFootprint.annual_tonnes !== undefined
      ? currentFootprint.annual_tonnes
      : (history.length > 0 && history[0] && history[0].annual_tonnes !== undefined ? history[0].annual_tonnes : 0.0)
  ) || 0.0;

  // 2. Streaks (Based on unique calculation days)
  const uniqueCalcDays = new Set(history.map(h => h.timestamp ? h.timestamp.split('T')[0] : '')).size;
  const streak = uniqueCalcDays > 0 ? uniqueCalcDays : 0;

  // 3. Goal Progress & Savings
  const baselineFootprint = Number(
    history.length > 0 && history[history.length - 1] && history[history.length - 1].annual_tonnes !== undefined
      ? history[history.length - 1].annual_tonnes
      : displayFootprint
  ) || 0.0;
  const co2SavedThisMonth = Math.max(0, baselineFootprint - displayFootprint) || 0.0;

  let reductionPercentage = 0;
  if (baselineFootprint > 0) {
    reductionPercentage = ((baselineFootprint - displayFootprint) / baselineFootprint) * 100;
  }
  const targetReduction = 10.0; // 10% monthly target
  const goalProgress = reductionPercentage > 0
    ? Math.min(100, Math.round((reductionPercentage / targetReduction) * 100))
    : 0;

  // 4. Trend Data mapping
  const sortedHistory = [...history].reverse();
  const recentCalcs = sortedHistory.slice(-5);
  const trendData = recentCalcs.length > 0 
    ? recentCalcs.map(h => Number(h.annual_tonnes) || 0.0) 
    : [Number(displayFootprint) || 0.0];
  const maxTrend = Math.max(...trendData, 1.0) + 0.5;
  const weekLabels = recentCalcs.length > 0 
    ? recentCalcs.map(h => {
        if (!h.timestamp) return 'Calc';
        const date = new Date(h.timestamp);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }) 
    : ['Initial'];

  // 5. Dynamic Badges
  const badgeList = [
    { label: 'Beginner', icon: '🥉', earned: history.length > 0, desc: 'First footprint' },
    { label: 'Green Citizen', icon: '🥈', earned: reductionPercentage > 0, desc: 'First reduction' },
    { label: 'Eco Warrior', icon: '🥇', earned: reductionPercentage >= 25, desc: '25% reduction' },
    { label: 'Climate Hero', icon: '🏆', earned: reductionPercentage >= 50, desc: '50% reduction' },
  ];

  // 6. Next Actions & Pledges lookup
  const pledgedActionsSet = new Set(pledges.map(p => p.action));

  const actionsList = currentFootprint && currentFootprint.recommendations && currentFootprint.recommendations.length > 0
    ? currentFootprint.recommendations.map((rec) => {
        const recStr = typeof rec === 'string' ? rec : String(rec || '');
        let icon = '💡';
        let tag = 'Recom';
        if (recStr.toLowerCase().includes('car') || recStr.toLowerCase().includes('transport') || recStr.toLowerCase().includes('transit')) {
          icon = '🚌';
          tag = 'Transport';
        } else if (recStr.toLowerCase().includes('ac') || recStr.toLowerCase().includes('cooling') || recStr.toLowerCase().includes('electricity') || recStr.toLowerCase().includes('insulation')) {
          icon = '❄️';
          tag = 'Energy';
        } else if (recStr.toLowerCase().includes('bulb') || recStr.toLowerCase().includes('led') || recStr.toLowerCase().includes('light')) {
          icon = '💡';
          tag = 'One-time';
        }
        return {
          icon,
          title: recStr,
          saving: 'Tailored action recommendation',
          tag
        };
      })
    : [
        { icon: '❄️', title: 'Reduce AC by 1 hour daily', saving: 'Save ~8 kg CO₂/month', tag: 'Easy win' },
        { icon: '🚌', title: 'Try public transit on Tuesdays', saving: 'Save ~3 kg CO₂ per trip', tag: 'Quick start' },
        { icon: '💡', title: 'Replace 3 bulbs with LED', saving: 'Save ~5 kg CO₂/month', tag: 'One-time' },
      ];

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e8eaed', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'gcSpin 0.8s linear infinite' }} />
        <span style={{ marginLeft: '12px', fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#5f6368' }}>Loading metrics...</span>
        <style>{`@keyframes gcSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
          Your Progress
        </h2>
        <p style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '14px', color: '#5f6368', margin: 0 }}>
          Track your carbon footprint journey and celebrate milestones
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          label="Annual Footprint"
          value={displayFootprint.toFixed(1)}
          unit="tonnes CO₂e"
          sub={co2SavedThisMonth > 0 ? `↓ ${co2SavedThisMonth.toFixed(1)} saved from baseline` : 'No reduction yet'}
          icon="🌍" color="#1a73e8" bg="#e8f0fe"
        />
        <StatCard
          label="Activity Streak"
          value={streak}
          unit="days calculated"
          icon="🔥" color="#fa7b17" bg="#fef3e2"
        />
        <StatCard
          label="Pledges Committed"
          value={pledges.length}
          unit="eco actions taken"
          icon="✅" color="#34a853" bg="#e6f4ea"
        />
        <StatCard
          label="Reduction Goal"
          value={`${goalProgress}%`}
          unit="toward 10% target"
          icon="🎯" color="#9334e9" bg="#f3e8ff"
        />
      </div>

      {/* ── Trend chart ── */}
      <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
        }}>
          <div style={{
            fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
            fontSize: '14px', fontWeight: '500', color: '#202124',
          }}>
            Calculation Trend History
          </div>
          {reductionPercentage > 0 && (
            <span style={{
              background: '#e6f4ea', color: '#137333',
              borderRadius: '100px', padding: '2px 10px',
              fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
              fontSize: '12px', fontWeight: '500',
            }}>
              ↓ {reductionPercentage.toFixed(0)}% overall reduction
            </span>
          )}
        </div>

        {/* Bar chart */}
        <div role="img" aria-label="Carbon footprint trend chart showing recent calculations" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '120px' }}>
          {trendData.map((value, idx) => {
            const isLast = idx === trendData.length - 1;
            const heightPct = (value / maxTrend) * 100;
            return (
              <div key={idx} style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                  fontSize: '11px', fontWeight: '500',
                  color: isLast ? '#1a73e8' : '#5f6368',
                }}>
                  {value.toFixed(1)}t
                </span>
                <div
                  title={`${value.toFixed(1)} tonnes CO₂e`}
                  style={{
                    width: '100%', height: `${heightPct}%`,
                    background: isLast
                      ? 'linear-gradient(180deg, #4285f4, #1a73e8)'
                      : 'linear-gradient(180deg, #dadce0, #bdc1c6)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'background 200ms, height 300ms',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          {weekLabels.map((l, i) => (
            <div key={i} style={{
              flex: '1', textAlign: 'center',
              fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
              fontSize: '11px', color: '#9aa0a6',
            }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* ── Goal progress ── */}
      <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#202124', marginBottom: '16px' }}>
          Monthly Reduction Goal
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '13px', color: '#5f6368' }}>
            Progress toward 10% monthly reduction
          </span>
          <span style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#1a73e8' }}>
            {goalProgress}%
          </span>
        </div>
        <div style={{ height: '8px', background: '#e8eaed', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '4px',
            background: 'linear-gradient(90deg, #34a853, #1a73e8)',
            width: `${goalProgress}%`,
            transition: 'width 800ms cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* ── Badges ── */}
      <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#202124', marginBottom: '16px' }}>
          Achievements
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
          {badgeList.map((badge, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '16px 8px',
              background: badge.earned ? '#f8f9fa' : '#fff',
              border: `1px solid ${badge.earned ? '#dadce0' : '#e8eaed'}`,
              borderRadius: '8px',
              opacity: badge.earned ? 1 : 0.4,
              transition: 'box-shadow 200ms',
            }}
            onMouseOver={e => { if (badge.earned) e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.20)'; }}
            onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{badge.icon}</div>
              <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '12px', fontWeight: '500', color: '#202124', marginBottom: '2px' }}>{badge.label}</div>
              <div style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '10px', color: '#9aa0a6' }}>{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Next actions ── */}
      <div style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px' }}>
        <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#202124', marginBottom: '16px' }}>
          Recommended Next Actions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {actionsList.map((action, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'center',
              padding: '14px 16px',
              background: '#f8f9fa', border: '1px solid #e8eaed',
              borderRadius: '8px',
              transition: 'box-shadow 200ms, border-color 200ms',
            }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(60,64,67,0.15)'; e.currentTarget.style.borderColor = '#dadce0'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e8eaed'; }}
            >
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{action.icon}</span>
              <div style={{ flex: '1' }}>
                <div style={{ fontFamily: '"Google Sans", Roboto, Arial, sans-serif', fontSize: '14px', fontWeight: '500', color: '#202124', marginBottom: '2px' }}>
                  {action.title}
                </div>
                <div style={{ fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif', fontSize: '12px', color: '#34a853' }}>
                  {action.saving}
                </div>
              </div>
              <button
                onClick={() => handleCommitPledge(action.title)}
                disabled={pledgedActionsSet.has(action.title)}
                aria-label={pledgedActionsSet.has(action.title) ? `Already pledged: ${action.title}` : `Commit to: ${action.title}`}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: '100px',
                  background: pledgedActionsSet.has(action.title) ? '#34a853' : '#e8f0fe',
                  color: pledgedActionsSet.has(action.title) ? '#fff' : '#1967d2',
                  fontFamily: '"Google Sans Text", Roboto, Arial, sans-serif',
                  fontSize: '11px', fontWeight: '500',
                  cursor: pledgedActionsSet.has(action.title) ? 'default' : 'pointer',
                  transition: 'background 200ms, color 200ms',
                  flexShrink: 0,
                }}
              >
                {pledgedActionsSet.has(action.title) ? 'Pledged ✓' : 'Commit Pledge'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
