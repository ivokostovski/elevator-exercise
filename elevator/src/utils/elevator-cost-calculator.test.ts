import type { Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import {
  calculateElevatorCost,
  findBestElevator,
} from './elevator-cost-calculator';

describe('elevator-cost-calculator', () => {
  describe('calculateElevatorCost', () => {
    const baseElevator: Elevator = {
      id: 'elevator-1',
      currentFloor: 1,
      direction: ElevatorDirection.Idle,
      doorStatus: DoorStatus.Closed,
      loadingUnloadingRemainingTime: 0,
      movementRemainingTime: 0,
      destinationFloors: [],
      passengers: [],
      isDisabled: false,
      statusMessage: 'Idle',
    };

    it('should return Infinity for disabled elevator', () => {
      const disabledElevator = { ...baseElevator, isDisabled: true };
      const cost = calculateElevatorCost(
        disabledElevator,
        5,
        ElevatorDirection.Up
      );
      expect(cost).toBe(Infinity);
    });

    it('should return 0 for perfect match - idle elevator on call floor', () => {
      const perfectMatchElevator = { ...baseElevator, currentFloor: 5 };
      const cost = calculateElevatorCost(
        perfectMatchElevator,
        5,
        ElevatorDirection.Up
      );
      expect(cost).toBe(0);
    });

    it('should calculate cost for elevator heading in same direction towards call', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 3,
        direction: ElevatorDirection.Up,
        destinationFloors: [7, 9],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Up);
      expect(cost).toBe(2); // Distance from 3 to 5
    });

    it('should add penalty for stops before call floor when heading up', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 1,
        direction: ElevatorDirection.Up,
        destinationFloors: [2, 3, 7], // 2 and 3 are before call floor 5
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Up);
      expect(cost).toBe(4 + 1); // Distance (4) + penalties for 2 stops (1)
    });

    it('should calculate cost for elevator heading down towards call', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 7,
        direction: ElevatorDirection.Down,
        destinationFloors: [3, 1],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Down);
      expect(cost).toBe(2); // Distance from 7 to 5
    });

    it('should add penalty for stops after call floor when heading down', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 9,
        direction: ElevatorDirection.Down,
        destinationFloors: [8, 6, 2], // 8 and 6 are after call floor 5
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Down);
      expect(cost).toBe(4 + 1); // Distance (4) + penalties for 2 stops (1)
    });

    it('should calculate high cost for elevator going opposite direction', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 3,
        direction: ElevatorDirection.Down,
        destinationFloors: [1],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Up);
      expect(cost).toBe(4 + 5); // Distance * 2 (4) + penalty for existing task (5)
    });

    it('should calculate high cost for idle elevator not on call floor', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 1,
        direction: ElevatorDirection.Idle,
        destinationFloors: [3, 7],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Up);
      expect(cost).toBe(8 + 10); // Distance * 2 (8) + penalties for 2 existing tasks (10)
    });

    it('should handle elevator past call floor but heading in same direction', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 7,
        direction: ElevatorDirection.Up,
        destinationFloors: [9],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Up);
      expect(cost).toBe(9); // Distance * 2 (4) + penalty for existing task (5)
    });

    it('should handle elevator past call floor heading down', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 1,
        direction: ElevatorDirection.Down,
        destinationFloors: [3],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Down);
      expect(cost).toBe(8 + 5); // Distance * 2 (8) + penalty for existing task (5)
    });

    it('should handle elevator with no destinations', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 3,
        direction: ElevatorDirection.Idle,
        destinationFloors: [],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Up);
      expect(cost).toBe(4); // Distance * 2 (4) + no penalties
    });

    it('should handle call floor equal to current floor but different direction', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 5,
        direction: ElevatorDirection.Up,
        destinationFloors: [7],
      };
      const cost = calculateElevatorCost(elevator, 5, ElevatorDirection.Down);
      expect(cost).toBe(0 + 5); // No distance + penalty for existing task
    });

    it('should calculate cost for elevator at maximum floor values and expect high cost', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 100,
        direction: ElevatorDirection.Down,
        destinationFloors: [50],
      };
      const cost = calculateElevatorCost(elevator, 1, ElevatorDirection.Down);
      expect(cost).toBe(99.5); // Distance (99) + penalty for destination floor (0.5)
    });

    it('should calculate cost for elevator at minimum floor values and expect perfect match', () => {
      const elevator = {
        ...baseElevator,
        currentFloor: 1,
        direction: ElevatorDirection.Up,
        destinationFloors: [5],
      };
      const cost = calculateElevatorCost(elevator, 1, ElevatorDirection.Up);
      expect(cost).toBe(0); // Perfect match
    });
  });

  describe('findBestElevator', () => {
    const createElevator = (
      id: string,
      floor: number,
      direction: ElevatorDirection,
      disabled = false
    ): Elevator => ({
      id,
      currentFloor: floor,
      direction,
      doorStatus: DoorStatus.Closed,
      loadingUnloadingRemainingTime: 0,
      movementRemainingTime: 0,
      destinationFloors: [],
      passengers: [],
      isDisabled: disabled,
      statusMessage: 'Idle',
    });

    it('should return null for empty elevator array', () => {
      const bestElevator = findBestElevator([], 5, ElevatorDirection.Up);
      expect(bestElevator).toBeNull();
    });

    it('should return the elevator with lowest cost', () => {
      const elevators = [
        createElevator('elevator-1', 1, ElevatorDirection.Idle), // Cost: 8
        createElevator('elevator-2', 5, ElevatorDirection.Idle), // Cost: 0 (perfect match)
        createElevator('elevator-3', 10, ElevatorDirection.Down), // Cost: 10 + 5
      ];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator?.id).toBe('elevator-2');
    });

    it('should ignore disabled elevators', () => {
      const elevators = [
        createElevator('elevator-1', 5, ElevatorDirection.Idle, true), // Disabled
        createElevator('elevator-2', 1, ElevatorDirection.Idle), // Cost: 8
      ];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator?.id).toBe('elevator-2');
    });

    it('should return first elevator when all have same cost', () => {
      const elevators = [
        createElevator('elevator-1', 1, ElevatorDirection.Idle),
        createElevator('elevator-2', 1, ElevatorDirection.Idle),
        createElevator('elevator-3', 1, ElevatorDirection.Idle),
      ];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator?.id).toBe('elevator-1');
    });

    it('should handle all disabled elevators', () => {
      const elevators = [
        createElevator('elevator-1', 5, ElevatorDirection.Idle, true),
        createElevator('elevator-2', 1, ElevatorDirection.Idle, true),
      ];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator).toBeNull();
    });

    it('should handle single elevator', () => {
      const elevators = [createElevator('elevator-1', 3, ElevatorDirection.Up)];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator?.id).toBe('elevator-1');
    });

    it('should handle complex scenario with multiple factors', () => {
      const elevators = [
        {
          ...createElevator('elevator-1', 1, ElevatorDirection.Up),
          destinationFloors: [2, 3], // Stops before call floor 5
        },
        {
          ...createElevator('elevator-2', 6, ElevatorDirection.Down),
          destinationFloors: [4], // Stop after call floor 5
        },
        createElevator('elevator-3', 5, ElevatorDirection.Idle), // Perfect match
      ];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator?.id).toBe('elevator-3');
    });

    it('should find best elevator when some have Infinity costs and expect non-disabled elevator', () => {
      const elevators = [
        createElevator('elevator-1', 1, ElevatorDirection.Idle, true), // Infinity cost
        createElevator('elevator-2', 10, ElevatorDirection.Down), // High but finite cost
      ];

      const bestElevator = findBestElevator(elevators, 5, ElevatorDirection.Up);
      expect(bestElevator?.id).toBe('elevator-2');
    });

    it('should handle call direction down', () => {
      const elevators = [
        createElevator('elevator-1', 10, ElevatorDirection.Down), // Good for down call
        createElevator('elevator-2', 1, ElevatorDirection.Up), // Bad for down call
      ];

      const bestElevator = findBestElevator(
        elevators,
        5,
        ElevatorDirection.Down
      );
      expect(bestElevator?.id).toBe('elevator-1');
    });

    it('should find best elevator with maximum floor values and expect closest elevator', () => {
      const elevators = [
        createElevator('elevator-1', 100, ElevatorDirection.Down),
        createElevator('elevator-2', 50, ElevatorDirection.Idle),
      ];

      const bestElevator = findBestElevator(
        elevators,
        1,
        ElevatorDirection.Down
      );
      expect(bestElevator?.id).toBe('elevator-2');
    });
  });
});
