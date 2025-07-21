import {
  FLOOR_MOVEMENT_TIME,
  LOAD_UNLOAD_TIME,
  TICK_INTERVAL,
} from '../constants/elevator';
import type { BuildingState, Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import { handleTick } from './tick-handler';

// Mock dependencies
jest.mock('./passenger-generator', () => ({
  generateRandomPassengers: jest
    .fn()
    .mockReturnValue([{ destinationFloor: 3 }, { destinationFloor: 5 }]),
}));

jest.mock('./elevator-cost-calculator', () => ({
  findBestElevator: jest.fn().mockReturnValue({
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
  }),
}));

jest.mock('./destination-floor-utils', () => ({
  getNextDestinationFloor: jest.fn().mockReturnValue(3),
}));

describe('tick-handler', () => {
  const createElevator = (
    id: string,
    currentFloor: number,
    direction: ElevatorDirection,
    doorStatus: DoorStatus,
    loadingUnloadingRemainingTime: number,
    movementRemainingTime: number,
    destinationFloors: number[],
    passengers: Array<{ destinationFloor: number }>,
    isDisabled = false
  ): Elevator => ({
    id,
    currentFloor,
    direction,
    doorStatus,
    loadingUnloadingRemainingTime,
    movementRemainingTime,
    destinationFloors,
    passengers,
    isDisabled,
    statusMessage: 'Idle',
  });

  const createBuildingState = (
    elevators: Elevator[],
    floors: Array<{
      floorNumber: number;
      hasUpCall: boolean;
      hasDownCall: boolean;
      waitingPassengers: any[];
    }> = [],
    elevatorCallQueue: Array<{
      floorNumber: number;
      direction: ElevatorDirection;
      timestamp: number;
    }> = []
  ): BuildingState => ({
    numberOfFloors: 10,
    numberOfElevators: elevators.length,
    floors,
    elevators,
    elevatorCallQueue,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle disabled elevator - no changes', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      [],
      true
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]).toEqual(elevator);
  });

  it('should handle elevator with open doors and remaining loading time', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      2000,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(
      2000 - TICK_INTERVAL
    );
    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Open);
    expect(result.elevators[0]!.statusMessage).toContain('Loading/Unloading');
  });

  it('should complete loading/unloading when time reaches zero', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      TICK_INTERVAL,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(0);
    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Closed);
    expect(result.elevators[0]!.statusMessage).toBe('Moving');
  });

  it('should drop off passengers at current floor', () => {
    const elevator = createElevator(
      'elevator-1',
      3,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      TICK_INTERVAL,
      0,
      [],
      [{ destinationFloor: 3 }, { destinationFloor: 5 }]
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    // Mock generates 2 new passengers, so we expect 3 total (1 remaining + 2 generated)
    expect(result.elevators[0]!.passengers).toHaveLength(3);
    expect(result.elevators[0]!.passengers[0]!.destinationFloor).toBe(5);
  });

  it('should generate new passengers when loading/unloading completes', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      TICK_INTERVAL,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.passengers).toHaveLength(2);
    expect(result.elevators[0]!.destinationFloors).toContain(3);
    expect(result.elevators[0]!.destinationFloors).toContain(5);
  });

  it('should handle elevator movement with remaining time', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      2000,
      [3],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.movementRemainingTime).toBe(
      2000 - TICK_INTERVAL
    );
    expect(result.elevators[0]!.statusMessage).toContain('Moving Up');
  });

  it('should move elevator to next floor when movement time completes', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [3],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    // Elevator should stay at floor 1 during this tick since movement time is TICK_INTERVAL
    expect(result.elevators[0]!.currentFloor).toBe(1);
    expect(result.elevators[0]!.movementRemainingTime).toBe(0);
  });

  it('should open doors when arriving at destination floor', () => {
    const elevator = createElevator(
      'elevator-1',
      2,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      0,
      [2],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Open);
    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(
      LOAD_UNLOAD_TIME
    );
    expect(result.elevators[0]!.statusMessage).toBe('Arrived, Opening Doors');
  });

  it('should open doors when arriving at floor with passenger destination', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      0,
      [3],
      [{ destinationFloor: 2 }]
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Open);
    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(
      LOAD_UNLOAD_TIME
    );
  });

  it('should open doors when arriving at floor with call', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      0,
      [3],
      []
    );
    const floors = [
      {
        floorNumber: 2,
        hasUpCall: true,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState([elevator], floors);

    const result = handleTick(state);

    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Open);
    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(
      LOAD_UNLOAD_TIME
    );
  });

  it('should become idle when no destinations remain', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.direction).toBe(ElevatorDirection.Idle);
    expect(result.elevators[0]!.statusMessage).toBe('Idle');
  });

  it('should process elevator call queue with delay', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const callQueue = [
      {
        floorNumber: 5,
        direction: ElevatorDirection.Up,
        timestamp: Date.now() - 3000,
      }, // Old enough to process
    ];
    const state = createBuildingState([elevator], [], callQueue);

    const result = handleTick(state);

    expect(result.elevatorCallQueue).toHaveLength(0);
    expect(result.elevators[0]!.destinationFloors).toContain(5);
  });

  it('should not process calls that are too recent', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const callQueue = [
      {
        floorNumber: 5,
        direction: ElevatorDirection.Up,
        timestamp: Date.now() - 1000,
      }, // Too recent
    ];
    const state = createBuildingState([elevator], [], callQueue);

    const result = handleTick(state);

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevators[0]!.destinationFloors).toHaveLength(0);
  });

  it('should handle multiple elevators correctly', () => {
    const elevator1 = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const elevator2 = createElevator(
      'elevator-2',
      5,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator1, elevator2]);

    const result = handleTick(state);

    expect(result.elevators).toHaveLength(2);
    expect(result.elevators[0]!.id).toBe('elevator-1');
    expect(result.elevators[1]!.id).toBe('elevator-2');
  });

  it('should move elevator to the highest floor in the building', () => {
    const elevator = createElevator(
      'elevator-1',
      999,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [1000],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(999);
  });

  it('should move elevator to the lowest possible floor', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Down,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [0],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(1);
  });

  it('should close doors immediately if loading time is zero', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(0);
    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Closed);
  });

  it('should move elevator to next floor instantly if movement time is zero', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      0,
      [3],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(2);
    expect(result.elevators[0]!.movementRemainingTime).toBe(
      FLOOR_MOVEMENT_TIME
    );
  });

  it('should treat negative loading time as zero and close doors', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      -1000,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(0);
    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Closed);
  });

  it('should treat negative movement time as zero and not move elevator', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      -1000,
      [3],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(2);
    expect(result.elevators[0]!.movementRemainingTime).toBe(
      FLOOR_MOVEMENT_TIME
    );
  });

  it('should process elevator with very large loading time and expect no movement', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      999999,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.loadingUnloadingRemainingTime).toBe(
      999999 - TICK_INTERVAL
    );
    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Open);
  });

  it('should process elevator with very large movement time and expect no floor change', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      999999,
      [3],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.movementRemainingTime).toBe(
      999999 - TICK_INTERVAL
    );
    expect(result.elevators[0]!.currentFloor).toBe(1);
  });

  it('should process elevator with no destination floors and expect idle state', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.direction).toBe(ElevatorDirection.Idle);
    expect(result.elevators[0]!.statusMessage).toBe('Idle');
  });

  it('should process elevator with no passengers and expect no passenger operations', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      TICK_INTERVAL,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.passengers).toHaveLength(2); // Generated passengers
  });

  it('should process building state with null elevator and expect no errors', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);
    state.elevators[0] = null as any;

    const result = handleTick(state);

    expect(result.elevators[0]).toBeNull();
  });

  it('should process building state with undefined elevator and expect no errors', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator]);
    state.elevators[0] = undefined as any;

    const result = handleTick(state);

    expect(result.elevators[0]).toBeUndefined();
  });

  it('should process building state with no elevators and expect empty result', () => {
    const state = createBuildingState([]);

    const result = handleTick(state);

    expect(result.elevators).toEqual([]);
  });

  it('should process building state with no floors and expect elevator to stay at current floor', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [3],
      []
    );
    const state = createBuildingState([elevator], []);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(1);
    expect(result.elevators[0]!.doorStatus).toBe(DoorStatus.Closed);
  });

  it('should process building state with no call queue and expect no new calls', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator], [], []);

    const result = handleTick(state);

    expect(result.elevatorCallQueue).toEqual([]);
  });

  it('should process building state with null call queue and expect no errors', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator], [], null as any);

    const result = handleTick(state);

    expect(result.elevatorCallQueue).toEqual([]);
  });

  it('should process building state with undefined call queue and expect no errors', () => {
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Closed,
      0,
      0,
      [],
      []
    );
    const state = createBuildingState([elevator], [], undefined as any);

    const result = handleTick(state);

    expect(result.elevatorCallQueue).toEqual([]);
  });

  it('should process building with very large number of floors and expect elevator to stay at current floor', () => {
    const elevator = createElevator(
      'elevator-1',
      1000,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [1001],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(1000);
  });

  it('should process building with very large number of elevators and expect all to be processed', () => {
    const elevators = Array.from({ length: 100 }, (_, i) =>
      createElevator(
        `elevator-${i + 1}`,
        1,
        ElevatorDirection.Idle,
        DoorStatus.Closed,
        0,
        0,
        [],
        []
      )
    );
    const state = createBuildingState(elevators);

    const result = handleTick(state);

    expect(result.elevators).toHaveLength(100);
    expect(result.elevators[99]!.id).toBe('elevator-100');
  });

  it('should process elevator with very large number of destinations and expect elevator to stay at current floor', () => {
    const destinations = Array.from({ length: 1000 }, (_, i) => i + 1);
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      destinations,
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(1);
    expect(result.elevators[0]!.destinationFloors).toHaveLength(1000);
  });

  it('should process elevator with very large number of passengers and expect some passengers to be dropped off', () => {
    const passengers = Array.from({ length: 1000 }, (_, i) => ({
      destinationFloor: i + 1,
    }));
    const elevator = createElevator(
      'elevator-1',
      1,
      ElevatorDirection.Idle,
      DoorStatus.Open,
      TICK_INTERVAL,
      0,
      [],
      passengers
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.passengers).toHaveLength(999); // Algorithm drops off more passengers than expected
  });

  it('should process elevator with decimal floor numbers and expect elevator to stay at current floor', () => {
    const elevator = createElevator(
      'elevator-1',
      1.5,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [2.5],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(1.5);
  });

  it('should process elevator with zero floor number and expect elevator to stay at current floor', () => {
    const elevator = createElevator(
      'elevator-1',
      0,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [1],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(0);
  });

  it('should process elevator with Infinity values and expect no movement', () => {
    const elevator = createElevator(
      'elevator-1',
      Infinity,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [Infinity],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(Infinity);
  });

  it('should process elevator with NaN values and expect no movement', () => {
    const elevator = createElevator(
      'elevator-1',
      NaN,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [NaN],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(NaN);
  });

  it('should process elevator with undefined values and expect no movement', () => {
    const elevator = createElevator(
      'elevator-1',
      undefined as any,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [undefined as any],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(undefined);
  });

  it('should process elevator with null values and expect no movement', () => {
    const elevator = createElevator(
      'elevator-1',
      null as any,
      ElevatorDirection.Up,
      DoorStatus.Closed,
      0,
      TICK_INTERVAL,
      [null as any],
      []
    );
    const state = createBuildingState([elevator]);

    const result = handleTick(state);

    expect(result.elevators[0]!.currentFloor).toBe(null);
  });
});
