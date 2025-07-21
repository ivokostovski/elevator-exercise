import type { Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import {
  getStatusClass,
  getStatusIcon,
  getStatusLabel,
} from './elevator-status-helpers';

describe('elevator-status-helpers', () => {
  describe('getStatusClass', () => {
    const createElevator = (
      isDisabled: boolean,
      statusMessage: string
    ): Elevator => ({
      id: 'elevator-1',
      currentFloor: 1,
      direction: ElevatorDirection.Idle,
      doorStatus: DoorStatus.Closed,
      loadingUnloadingRemainingTime: 0,
      movementRemainingTime: 0,
      destinationFloors: [],
      passengers: [],
      isDisabled,
      statusMessage,
    });

    it('should return disabled class for disabled elevator', () => {
      const elevator = createElevator(true, 'Any status message');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('disabled');
    });

    it('should return moving-up class for elevator moving up', () => {
      const elevator = createElevator(false, 'Moving Up (3s)');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('moving-up');
    });

    it('should return moving-down class for elevator moving down', () => {
      const elevator = createElevator(false, 'Moving Down (2s)');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('moving-down');
    });

    it('should return loading class for elevator loading', () => {
      const elevator = createElevator(false, 'Loading/Unloading (5s)');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('loading');
    });

    it('should return loading class for elevator unloading', () => {
      const elevator = createElevator(false, 'Unloading passengers');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('loading');
    });

    it('should return idle class for idle elevator', () => {
      const elevator = createElevator(false, 'Idle');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('idle');
    });

    it('should return active class for other status messages', () => {
      const elevator = createElevator(false, 'Arrived, Opening Doors');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('active');
    });

    it('should return correct status class for case insensitive status messages and expect proper CSS class', () => {
      const elevator = createElevator(false, 'MOVING UP (3s)');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('active');
    });

    it('should return correct status class for partial status messages and expect proper CSS class', () => {
      const elevator = createElevator(false, 'Moving Up');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('moving-up');
    });

    it('should return default status class for empty status message and expect active class', () => {
      const elevator = createElevator(false, '');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('active');
    });

    it('should return default status class for null status message and expect active class', () => {
      const elevator = createElevator(false, null as any);
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('active');
    });

    it('should return default status class for undefined status message and expect active class', () => {
      const elevator = createElevator(false, undefined as any);
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('active');
    });

    it('should prioritize disabled status over all others', () => {
      const elevator = createElevator(true, 'Moving Up (3s)');
      const statusClass = getStatusClass(elevator);
      expect(statusClass).toBe('disabled');
    });
  });

  describe('getStatusIcon', () => {
    const createElevator = (
      isDisabled: boolean,
      statusMessage: string
    ): Elevator => ({
      id: 'elevator-1',
      currentFloor: 1,
      direction: ElevatorDirection.Idle,
      doorStatus: DoorStatus.Closed,
      loadingUnloadingRemainingTime: 0,
      movementRemainingTime: 0,
      destinationFloors: [],
      passengers: [],
      isDisabled,
      statusMessage,
    });

    it('should return disabled icon for disabled elevator', () => {
      const elevator = createElevator(true, 'Any status message');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('🚫');
    });

    it('should return up arrow for elevator moving up', () => {
      const elevator = createElevator(false, 'Moving Up (3s)');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('⬆️');
    });

    it('should return down arrow for elevator moving down', () => {
      const elevator = createElevator(false, 'Moving Down (2s)');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('⬇️');
    });

    it('should return hourglass for elevator loading', () => {
      const elevator = createElevator(false, 'Loading/Unloading (5s)');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('⏳');
    });

    it('should return hourglass for elevator unloading', () => {
      const elevator = createElevator(false, 'Unloading passengers');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('⏳');
    });

    it('should return sleeping face for idle elevator', () => {
      const elevator = createElevator(false, 'Idle');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('💤');
    });

    it('should return checkmark for other status messages', () => {
      const elevator = createElevator(false, 'Arrived, Opening Doors');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('✅');
    });

    it('should handle case insensitive status messages', () => {
      const elevator = createElevator(false, 'MOVING UP (3s)');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('✅');
    });

    it('should handle partial status messages', () => {
      const elevator = createElevator(false, 'Moving Up');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('⬆️');
    });

    it('should handle empty status message', () => {
      const elevator = createElevator(false, '');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('✅');
    });

    it('should handle null status message', () => {
      const elevator = createElevator(false, null as any);
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('✅');
    });

    it('should handle undefined status message', () => {
      const elevator = createElevator(false, undefined as any);
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('✅');
    });

    it('should prioritize disabled status over all others', () => {
      const elevator = createElevator(true, 'Moving Up (3s)');
      const statusIcon = getStatusIcon(elevator);
      expect(statusIcon).toBe('🚫');
    });
  });

  describe('getStatusLabel', () => {
    const createElevator = (
      isDisabled: boolean,
      statusMessage: string
    ): Elevator => ({
      id: 'elevator-1',
      currentFloor: 1,
      direction: ElevatorDirection.Idle,
      doorStatus: DoorStatus.Closed,
      loadingUnloadingRemainingTime: 0,
      movementRemainingTime: 0,
      destinationFloors: [],
      passengers: [],
      isDisabled,
      statusMessage,
    });

    it('should return Disabled for disabled elevator', () => {
      const elevator = createElevator(true, 'Any status message');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Disabled');
    });

    it('should return Moving Up for elevator moving up', () => {
      const elevator = createElevator(false, 'Moving Up (3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Moving Up');
    });

    it('should return Moving Down for elevator moving down', () => {
      const elevator = createElevator(false, 'Moving Down (2s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Moving Down');
    });

    it('should return Loading for elevator loading', () => {
      const elevator = createElevator(false, 'Loading/Unloading (5s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Loading');
    });

    it('should return Loading for elevator unloading', () => {
      const elevator = createElevator(false, 'Unloading passengers');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Loading');
    });

    it('should return Idle for idle elevator', () => {
      const elevator = createElevator(false, 'Idle');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Idle');
    });

    it('should return Active for other status messages', () => {
      const elevator = createElevator(false, 'Arrived, Opening Doors');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle case insensitive status messages', () => {
      const elevator = createElevator(false, 'MOVING UP (3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle partial status messages', () => {
      const elevator = createElevator(false, 'Moving Up');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Moving Up');
    });

    it('should handle empty status message', () => {
      const elevator = createElevator(false, '');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle null status message', () => {
      const elevator = createElevator(false, null as any);
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle undefined status message', () => {
      const elevator = createElevator(false, undefined as any);
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should prioritize disabled status over all others', () => {
      const elevator = createElevator(true, 'Moving Up (3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Disabled');
    });

    it('should handle status message with many words and still match Moving Up pattern', () => {
      const elevator = createElevator(
        false,
        'Moving Up with a very long status message that contains many words and should still match the Moving Up pattern'
      );
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Moving Up');
    });

    it('should handle status message with special characters and still match Moving Up pattern', () => {
      const elevator = createElevator(
        false,
        'Moving Up (3s) - Special chars: !@#$%^&*()'
      );
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Moving Up');
    });

    it('should handle status message with numbers and match Loading pattern', () => {
      const elevator = createElevator(false, 'Loading/Unloading (12345s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Loading');
    });

    it('should handle status message with mixed case and match Moving Up pattern', () => {
      const elevator = createElevator(false, 'MoViNg Up (3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle status message with extra spaces and match Moving Up pattern', () => {
      const elevator = createElevator(false, 'Moving    Up   (3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle status message with tabs and match Moving Up pattern', () => {
      const elevator = createElevator(false, 'Moving\tUp\t(3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle status message with newlines and match Moving Up pattern', () => {
      const elevator = createElevator(false, 'Moving\nUp\n(3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should handle status message with unicode characters and match Moving Up pattern', () => {
      const elevator = createElevator(false, 'Moving Up 🚀 (3s)');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Moving Up');
    });

    it('should treat status message of "0" as active', () => {
      const elevator = createElevator(false, '0');
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });

    it('should treat boolean status message as active', () => {
      const elevator = createElevator(false, true as any);
      const statusLabel = getStatusLabel(elevator);
      expect(statusLabel).toBe('Active');
    });
  });
});
