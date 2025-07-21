export const LOAD_UNLOAD_TIME = 10000; // 10 seconds in ms
export const FLOOR_MOVEMENT_TIME = 10000; // 10 seconds in ms
export const TICK_INTERVAL = 100; // Simulation tick interval in ms (for smooth animation)

// Random call generation intervals
export const RANDOM_CALL_INTERVAL_MIN = 10_000; // 10 seconds
export const RANDOM_CALL_INTERVAL_MAX = 30_000; // 30 seconds

// Elevator capacity
export const MAX_PASSENGERS = 8;

// Elevator colors for UI
export const ELEVATOR_COLORS = {
  IDLE: '#6c757d',
  MOVING_UP: '#28a745',
  MOVING_DOWN: '#dc3545',
  LOADING: '#ffc107',
  UNLOADING: '#fd7e14',
  ERROR: '#dc3545',
  DISABLED: '#6c757d',
} as const;
