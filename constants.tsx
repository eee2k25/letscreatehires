
export const COLORS = {
  solar: '#FDE047',
  wind: '#60A5FA',
  battery: '#22C55E',
  load: '#F87171',
  inverter: '#A855F7',
  background: '#020617',
  card: '#0f172a',
  border: '#1e293b'
};

export const INITIAL_TELEMETRY = {
  solar: { v: 18.5, i: 5.2, p: 96.2, irr: 820, temp: 38 },
  wind: { v: 24.0, i: 3.1, p: 74.4, speed: 12.0, rpm: 420 },
  battery: { v: 12.8, i: 1.2, soc: 75, temp: 28, status: 'Idle' },
  inverter: { v_in: 12.8, v_out: 230, freq: 50.0, eff: 94 },
  load: { active: 140, status: 'Stable', priority: 'High' as const },
  timestamp: Date.now()
};
