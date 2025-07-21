import type { Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import { getNextDestinationFloor } from './destination-floor-utils';

describe('destination-floor-utils', () => {
  const createElevator = (
    currentFloor: number,
    direction: ElevatorDirection,
    destinationFloors: number[]
  ): Elevator => ({
    id: 'elevator-1',
    currentFloor,
    direction,
    doorStatus: DoorStatus.Closed,
    loadingUnloadingRemainingTime: 0,
    movementRemainingTime: 0,
    destinationFloors,
    passengers: [],
    isDisabled: false,
    statusMessage: 'Idle',
  });

  it('should return null for elevator with no destinations', () => {
    const elevator = createElevator(5, ElevatorDirection.Idle, []);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBeNull();
  });

  it('should return closest floor when elevator is idle', () => {
    const elevator = createElevator(5, ElevatorDirection.Idle, [3, 7, 1]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(3); // Closest to floor 5
  });

  it('should return closest floor when elevator is idle with equal distances', () => {
    const elevator = createElevator(5, ElevatorDirection.Idle, [3, 7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(3); // First in sorted array
  });

  it('should return next floor in upward direction when moving up', () => {
    const elevator = createElevator(3, ElevatorDirection.Up, [1, 5, 7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Next floor above current
  });

  it('should return next floor in downward direction when moving down', () => {
    const elevator = createElevator(7, ElevatorDirection.Down, [1, 5, 9]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Next floor below current
  });

  it('should return first destination when all are behind elevator moving up', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [1, 3]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(1); // First in sorted array (ascending)
  });

  it('should return first destination when all are behind elevator moving down', () => {
    const elevator = createElevator(3, ElevatorDirection.Down, [5, 7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(7); // First in sorted array (descending)
  });

  it('should handle single destination floor', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(7);
  });

  it('should handle current floor as destination when moving up', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [5, 7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Current floor is valid when moving up
  });

  it('should handle current floor as destination when moving down', () => {
    const elevator = createElevator(5, ElevatorDirection.Down, [3, 5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Current floor is valid when moving down
  });

  it('should handle current floor as destination when idle', () => {
    const elevator = createElevator(5, ElevatorDirection.Idle, [5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Current floor is closest
  });

  it('should find next destination with maximum floor values and expect highest floor', () => {
    const elevator = createElevator(100, ElevatorDirection.Up, [50, 150, 200]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(150); // Next floor above current
  });

  it('should find next destination with minimum floor values and expect lowest floor', () => {
    const elevator = createElevator(1, ElevatorDirection.Down, [5, 10]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(10); // First in sorted array (descending)
  });

  it('should handle negative floor values', () => {
    const elevator = createElevator(0, ElevatorDirection.Up, [-5, 5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Next floor above current
  });

  it('should handle large number of destinations', () => {
    const destinations = Array.from({ length: 100 }, (_, i) => i + 1);
    const elevator = createElevator(50, ElevatorDirection.Up, destinations);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(50); // Next floor above current
  });

  it('should handle duplicate destination floors', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [3, 3, 7, 7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(7); // Next floor above current (duplicates handled by sorting)
  });

  it('should handle all destinations equal to current floor', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [5, 5, 5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Current floor is valid
  });

  it('should handle all destinations below current floor when moving up', () => {
    const elevator = createElevator(10, ElevatorDirection.Up, [1, 3, 5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(1); // First in sorted array (ascending)
  });

  it('should handle all destinations above current floor when moving down', () => {
    const elevator = createElevator(1, ElevatorDirection.Down, [5, 7, 9]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(9); // First in sorted array (descending)
  });

  it('should handle zero as destination floor', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [0, 7]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(7); // Next floor above current (0 is below)
  });

  it('should handle negative destination floors', () => {
    const elevator = createElevator(0, ElevatorDirection.Up, [-5, 5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Next floor above current
  });

  it('should handle very large destination floors', () => {
    const elevator = createElevator(
      1000,
      ElevatorDirection.Down,
      [500, 1500, 2000]
    );
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(500); // Next floor below current
  });

  it('should handle decimal floor values (should be rounded)', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, [3.5, 7.2]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(7); // Next floor above current (decimals handled by Math.floor)
  });

  it('should find next destination when current floor is at boundary and expect next floor', () => {
    const elevator = createElevator(1, ElevatorDirection.Up, [1, 2]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(1); // Current floor is valid when moving up
  });

  it('should find next destination when current floor is at upper boundary and expect next floor', () => {
    const elevator = createElevator(10, ElevatorDirection.Down, [9, 10]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(10); // Current floor is valid when moving down
  });

  it('should handle mixed positive and negative destinations', () => {
    const elevator = createElevator(0, ElevatorDirection.Up, [-10, 5, 10]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Next floor above current
  });

  it('should return null when destination array is empty and expect no destination', () => {
    const elevator = createElevator(5, ElevatorDirection.Up, []);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBeNull();
  });

  it('should handle single destination equal to current floor when idle', () => {
    const elevator = createElevator(5, ElevatorDirection.Idle, [5]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(5); // Current floor is closest
  });

  it('should handle single destination different from current floor when idle', () => {
    const elevator = createElevator(5, ElevatorDirection.Idle, [10]);
    const result = getNextDestinationFloor(elevator);
    expect(result).toBe(10); // Only destination
  });
});
