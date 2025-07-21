import type { BuildingState, Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import { handleToggleElevatorDisabled } from './elevator-disabler';

describe('elevator-disabler', () => {
  const createElevator = (
    id: string,
    currentFloor: number,
    destinationFloors: number[],
    passengers: Array<{ destinationFloor: number }>,
    isDisabled = false
  ): Elevator => ({
    id,
    currentFloor,
    direction: ElevatorDirection.Idle,
    doorStatus: DoorStatus.Closed,
    loadingUnloadingRemainingTime: 0,
    movementRemainingTime: 0,
    destinationFloors,
    passengers,
    isDisabled,
    statusMessage: 'Idle',
  });

  const createBuildingState = (
    elevators: Elevator[],
    elevatorCallQueue: Array<{
      floorNumber: number;
      direction: ElevatorDirection;
      timestamp: number;
    }> = []
  ): BuildingState => ({
    numberOfFloors: 10,
    numberOfElevators: elevators.length,
    floors: [],
    elevators,
    elevatorCallQueue,
  });

  it('should disable an enabled elevator', () => {
    const elevator = createElevator(
      'elevator-1',
      5,
      [7, 9],
      [{ destinationFloor: 8 }]
    );
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevators[0]!.isDisabled).toBe(true);
    expect(result.elevators[0]!.destinationFloors).toEqual([]);
    expect(result.elevators[0]!.passengers).toEqual([]);
    expect(result.elevatorCallQueue).toHaveLength(3); // 2 destinations + 1 passenger destination
  });

  it('should enable a disabled elevator', () => {
    const elevator = createElevator('elevator-1', 5, [], [], true);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: false,
    });

    expect(result.elevators[0]!.isDisabled).toBe(false);
    expect(result.elevatorCallQueue).toHaveLength(0);
  });

  it('should return original state when elevator not found', () => {
    const elevator = createElevator('elevator-1', 5, [7], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'nonexistent-elevator',
      isDisabled: true,
    });

    expect(result).toBe(state);
  });

  it('should requeue destination floors when disabling', () => {
    const elevator = createElevator('elevator-1', 5, [7, 9], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(2);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 7,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
    expect(result.elevatorCallQueue[1]).toEqual({
      floorNumber: 9,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should requeue passenger destinations when disabling', () => {
    const elevator = createElevator(
      'elevator-1',
      5,
      [],
      [{ destinationFloor: 8 }]
    );
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 8,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should avoid duplicate calls when passenger destination matches elevator destination', () => {
    const elevator = createElevator(
      'elevator-1',
      5,
      [8],
      [{ destinationFloor: 8 }]
    );
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(1); // No duplicate
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(8);
  });

  it('should determine correct direction for requeued calls', () => {
    const elevator = createElevator('elevator-1', 5, [3, 7], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(2);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 3,
      direction: ElevatorDirection.Down,
      timestamp: expect.any(Number),
    });
    expect(result.elevatorCallQueue[1]).toEqual({
      floorNumber: 7,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should disable elevator when current floor is at boundary and expect elevator to be disabled', () => {
    const elevator = createElevator('elevator-1', 1, [3], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 3,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should disable elevator when destination equals current floor and expect elevator to be disabled', () => {
    const elevator = createElevator('elevator-1', 5, [5], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 5,
      direction: ElevatorDirection.Down, // When equal, direction is Down
      timestamp: expect.any(Number),
    });
  });

  it('should preserve existing call queue when disabling', () => {
    const elevator = createElevator('elevator-1', 5, [7], []);
    const existingCalls = [
      {
        floorNumber: 2,
        direction: ElevatorDirection.Up,
        timestamp: Date.now(),
      },
    ];
    const state = createBuildingState([elevator], existingCalls);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(2);
    expect(result.elevatorCallQueue[0]).toEqual(existingCalls[0]);
  });

  it('should handle multiple elevators correctly', () => {
    const elevator1 = createElevator('elevator-1', 5, [7], []);
    const elevator2 = createElevator('elevator-2', 3, [9], []);
    const state = createBuildingState([elevator1, elevator2]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevators[0]!.isDisabled).toBe(true);
    expect(result.elevators[1]!.isDisabled).toBe(false);
    expect(result.elevatorCallQueue).toHaveLength(1);
  });

  it('should handle empty destination floors and passengers', () => {
    const elevator = createElevator('elevator-1', 5, [], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevators[0]!.isDisabled).toBe(true);
    expect(result.elevatorCallQueue).toHaveLength(0);
  });

  it('should handle null elevator in array', () => {
    const elevator = createElevator('elevator-1', 5, [7], []);
    const state = createBuildingState([elevator]);
    state.elevators[0] = null as any;

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result).toBe(state);
  });

  it('should handle undefined elevator in array', () => {
    const elevator = createElevator('elevator-1', 5, [7], []);
    const state = createBuildingState([elevator]);
    state.elevators[0] = undefined as any;

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result).toBe(state);
  });

  it('should disable elevator with maximum floor values and expect elevator to be disabled', () => {
    const elevator = createElevator('elevator-1', 100, [150], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 150,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should disable elevator with minimum floor values and expect elevator to be disabled', () => {
    const elevator = createElevator('elevator-1', 1, [5], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 5,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should handle negative floor values', () => {
    const elevator = createElevator('elevator-1', 0, [-5], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: -5,
      direction: ElevatorDirection.Down,
      timestamp: expect.any(Number),
    });
  });

  it('should handle multiple passengers with same destination', () => {
    const elevator = createElevator(
      'elevator-1',
      5,
      [],
      [
        { destinationFloor: 8 },
        { destinationFloor: 8 },
        { destinationFloor: 9 },
      ]
    );
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(2); // No duplicates
    expect(result.elevatorCallQueue.some(call => call.floorNumber === 8)).toBe(
      true
    );
    expect(result.elevatorCallQueue.some(call => call.floorNumber === 9)).toBe(
      true
    );
  });

  it('should handle complex scenario with mixed destinations', () => {
    const elevator = createElevator(
      'elevator-1',
      5,
      [3, 7],
      [{ destinationFloor: 1 }, { destinationFloor: 9 }]
    );
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevatorCallQueue).toHaveLength(4);
    const floorNumbers = result.elevatorCallQueue.map(call => call.floorNumber);
    expect(floorNumbers).toContain(1);
    expect(floorNumbers).toContain(3);
    expect(floorNumbers).toContain(7);
    expect(floorNumbers).toContain(9);
  });

  it('should handle enabling already enabled elevator', () => {
    const elevator = createElevator('elevator-1', 5, [7], []);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: false,
    });

    expect(result.elevators[0]!.isDisabled).toBe(false);
    expect(result.elevatorCallQueue).toHaveLength(0);
  });

  it('should handle disabling already disabled elevator', () => {
    const elevator = createElevator('elevator-1', 5, [7], [], true);
    const state = createBuildingState([elevator]);

    const result = handleToggleElevatorDisabled(state, {
      elevatorId: 'elevator-1',
      isDisabled: true,
    });

    expect(result.elevators[0]!.isDisabled).toBe(true);
  });
});
