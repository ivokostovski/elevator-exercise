import type { Elevator } from '../types/elevator';

export const getStatusClass = (elevator: Elevator): string => {
  if (elevator.isDisabled) return 'disabled';

  const statusMessage = String(elevator.statusMessage || '');

  switch (true) {
    case statusMessage.includes('Moving Up'):
      return 'moving-up';
    case statusMessage.includes('Moving Down'):
      return 'moving-down';
    case statusMessage.includes('Loading') ||
      statusMessage.includes('Unloading'):
      return 'loading';
    case statusMessage.includes('Idle'):
      return 'idle';
    default:
      return 'active';
  }
};

export const getStatusIcon = (elevator: Elevator): string => {
  if (elevator.isDisabled) return '🚫';

  const statusMessage = String(elevator.statusMessage || '');

  switch (true) {
    case statusMessage.includes('Moving Up'):
      return '⬆️';
    case statusMessage.includes('Moving Down'):
      return '⬇️';
    case statusMessage.includes('Loading') ||
      statusMessage.includes('Unloading'):
      return '⏳';
    case statusMessage.includes('Idle'):
      return '💤';
    default:
      return '✅';
  }
};

export const getStatusLabel = (elevator: Elevator): string => {
  if (elevator.isDisabled) return 'Disabled';

  const statusMessage = String(elevator.statusMessage || '');

  switch (true) {
    case statusMessage.includes('Moving Up'):
      return 'Moving Up';
    case statusMessage.includes('Moving Down'):
      return 'Moving Down';
    case statusMessage.includes('Loading') ||
      statusMessage.includes('Unloading'):
      return 'Loading';
    case statusMessage.includes('Idle'):
      return 'Idle';
    default:
      return 'Active';
  }
};
