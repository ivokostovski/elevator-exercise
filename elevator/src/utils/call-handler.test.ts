import type { BuildingState } from '../types/elevator';
import { ElevatorDirection } from '../types/elevator';
import { handleCallElevator } from './call-handler';

describe('call-handler', () => {
  const createBuildingState = (
    floors: Array<{
      floorNumber: number;
      hasUpCall: boolean;
      hasDownCall: boolean;
      waitingPassengers: any[];
    }>,
    elevatorCallQueue: Array<{
      floorNumber: number;
      direction: ElevatorDirection;
      timestamp: number;
    }> = []
  ): BuildingState => ({
    numberOfFloors: 10,
    numberOfElevators: 2,
    floors,
    elevators: [],
    elevatorCallQueue,
  });

  it('should add up call to correct floor', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 2,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 3,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[1]!.hasUpCall).toBe(true);
    expect(result.floors[1]!.hasDownCall).toBe(false);
    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 2,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should add down call to correct floor', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 2,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 3,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Down,
    });

    expect(result.floors[1]!.hasUpCall).toBe(false);
    expect(result.floors[1]!.hasDownCall).toBe(true);
    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 2,
      direction: ElevatorDirection.Down,
      timestamp: expect.any(Number),
    });
  });

  it('should preserve existing up call when adding down call', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 2,
        hasUpCall: true,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 3,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Down,
    });

    expect(result.floors[1]!.hasUpCall).toBe(true);
    expect(result.floors[1]!.hasDownCall).toBe(true);
  });

  it('should preserve existing down call when adding up call', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 2,
        hasUpCall: false,
        hasDownCall: true,
        waitingPassengers: [],
      },
      {
        floorNumber: 3,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[1]!.hasUpCall).toBe(true);
    expect(result.floors[1]!.hasDownCall).toBe(true);
  });

  it('should not affect other floors', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 2,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 3,
        hasUpCall: true,
        hasDownCall: true,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(false);
    expect(result.floors[0]!.hasDownCall).toBe(false);
    expect(result.floors[2]!.hasUpCall).toBe(true);
    expect(result.floors[2]!.hasDownCall).toBe(true);
  });

  it('should add call to existing queue', () => {
    const existingCalls = [
      {
        floorNumber: 1,
        direction: ElevatorDirection.Up,
        timestamp: Date.now(),
      },
    ];
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 2,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors, existingCalls);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Down,
    });

    expect(result.elevatorCallQueue).toHaveLength(2);
    expect(result.elevatorCallQueue[0]).toEqual(existingCalls[0]);
    expect(result.elevatorCallQueue[1]).toEqual({
      floorNumber: 2,
      direction: ElevatorDirection.Down,
      timestamp: expect.any(Number),
    });
  });

  it('should add call for minimum floor number and expect call to be added to queue', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(1);
  });

  it('should add call for maximum floor number and expect call to be added to queue', () => {
    const floors = [
      {
        floorNumber: 10,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 10,
      direction: ElevatorDirection.Down,
    });

    expect(result.floors[0]!.hasDownCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(10);
  });

  it('should add call for zero floor number and expect call to be added to queue', () => {
    const floors = [
      {
        floorNumber: 0,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 0,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(0);
  });

  it('should add call for negative floor number and expect call to be added to queue', () => {
    const floors = [
      {
        floorNumber: -1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: -1,
      direction: ElevatorDirection.Down,
    });

    expect(result.floors[0]!.hasDownCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(-1);
  });

  it('should add call for very large floor number and expect call to be added to queue', () => {
    const floors = [
      {
        floorNumber: 999,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 999,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(999);
  });

  it('should handle floor not found in floors array', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
      {
        floorNumber: 3,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Up,
    });

    // Should not affect any floors since floor 2 doesn't exist
    expect(result.floors[0]!.hasUpCall).toBe(false);
    expect(result.floors[1]!.hasUpCall).toBe(false);
    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(2);
  });

  it('should handle empty floors array', () => {
    const state = createBuildingState([]);

    const result = handleCallElevator(state, {
      floorNumber: 5,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors).toEqual([]);
    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(5);
  });

  it('should handle multiple calls to same floor', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result1 = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    const result2 = handleCallElevator(result1, {
      floorNumber: 1,
      direction: ElevatorDirection.Down,
    });

    expect(result2.floors[0]!.hasUpCall).toBe(true);
    expect(result2.floors[0]!.hasDownCall).toBe(true);
    expect(result2.elevatorCallQueue).toHaveLength(2);
  });

  it('should handle decimal floor numbers', () => {
    const floors = [
      {
        floorNumber: 1.5,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 1.5,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(1.5);
  });

  it('should handle null floors array', () => {
    const state = createBuildingState(null as any);

    const result = handleCallElevator(state, {
      floorNumber: 5,
      direction: ElevatorDirection.Up,
    });

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(5);
  });

  it('should handle undefined floors array', () => {
    const state = createBuildingState(undefined as any);

    const result = handleCallElevator(state, {
      floorNumber: 5,
      direction: ElevatorDirection.Up,
    });

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(5);
  });

  it('should handle floors with null properties', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: null as any,
        hasDownCall: null as any,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(1);
  });

  it('should handle floors with undefined properties', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: undefined as any,
        hasDownCall: undefined as any,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Down,
    });

    expect(result.floors[0]!.hasDownCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(1);
  });

  it('should handle floors with missing properties', () => {
    const floors = [{ floorNumber: 1, waitingPassengers: [] } as any];
    const state = createBuildingState(floors);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    expect(result.floors[0]!.hasUpCall).toBe(true);
    expect(result.elevatorCallQueue[0]!.floorNumber).toBe(1);
  });

  it('should add call when existing calls are in queue and expect call to be added', () => {
    const existingCalls = [
      {
        floorNumber: 1,
        direction: ElevatorDirection.Up,
        timestamp: Date.now(),
      },
      {
        floorNumber: 3,
        direction: ElevatorDirection.Down,
        timestamp: Date.now(),
      },
      {
        floorNumber: 5,
        direction: ElevatorDirection.Up,
        timestamp: Date.now(),
      },
    ];
    const floors = [
      {
        floorNumber: 2,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors, existingCalls);

    const result = handleCallElevator(state, {
      floorNumber: 2,
      direction: ElevatorDirection.Down,
    });

    expect(result.elevatorCallQueue).toHaveLength(4);
    expect(result.elevatorCallQueue[3]).toEqual({
      floorNumber: 2,
      direction: ElevatorDirection.Down,
      timestamp: expect.any(Number),
    });
  });

  it('should add call when very large number of existing calls and expect call to be added', () => {
    const existingCalls = Array.from({ length: 1000 }, (_, i) => ({
      floorNumber: i,
      direction: ElevatorDirection.Up,
      timestamp: Date.now(),
    }));
    const floors = [
      {
        floorNumber: 1000,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors, existingCalls);

    const result = handleCallElevator(state, {
      floorNumber: 1000,
      direction: ElevatorDirection.Down,
    });

    expect(result.elevatorCallQueue).toHaveLength(1001);
    expect(result.elevatorCallQueue[1000]).toEqual({
      floorNumber: 1000,
      direction: ElevatorDirection.Down,
      timestamp: expect.any(Number),
    });
  });

  it('should add call when existing call queue is empty and expect call to be added', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors, []);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 1,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should add call when existing call queue is null and expect call to be added', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors, null as any);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 1,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });

  it('should add call when existing call queue is undefined and expect call to be added', () => {
    const floors = [
      {
        floorNumber: 1,
        hasUpCall: false,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    const state = createBuildingState(floors, undefined as any);

    const result = handleCallElevator(state, {
      floorNumber: 1,
      direction: ElevatorDirection.Up,
    });

    expect(result.elevatorCallQueue).toHaveLength(1);
    expect(result.elevatorCallQueue[0]).toEqual({
      floorNumber: 1,
      direction: ElevatorDirection.Up,
      timestamp: expect.any(Number),
    });
  });
});
