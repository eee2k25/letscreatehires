
export interface SensorData {
  v: number;
  i: number;
  p: number;
  temp?: number;
  irr?: number;
  speed?: number;
  rpm?: number;
  soc?: number;
  status?: string;
}

export interface InverterData {
  v_in: number;
  v_out: number;
  freq: number;
  eff: number;
}

export interface LoadData {
  active: number;
  status: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface Telemetry {
  solar: SensorData;
  wind: SensorData;
  battery: SensorData;
  inverter: InverterData;
  load: LoadData;
  timestamp: number;
}

export interface HistoryPoint {
  time: string;
  solarP: number;
  windP: number;
  loadP: number;
  batterySoc: number;
}

export enum SystemMode {
  HYBRID = 'Hybrid',
  SOLAR_ONLY = 'Solar Only',
  WIND_ONLY = 'Wind Only',
  BATTERY_ONLY = 'Battery Only',
  ECO_MODE = 'Eco Mode'
}
