import type { BuildingState } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import { initializeBuilding } from './building-initializer';

describe('building-initializer', () => {
  const createBaseState = (
    numberOfFloors: number,
    numberOfElevators: number
  ): BuildingState => ({
    numberOfFloors,
    numberOfElevators,
    floors: [],
    elevators: [],
    elevatorCallQueue: [],
  });

  it('should initialize building with correct number of floors', () => {
    const state = createBaseState(5, 2);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(5);
    expect(result.floors[0]!.floorNumber).toBe(1);
    expect(result.floors[4]!.floorNumber).toBe(5);
  });

  it('should initialize building with correct number of elevators', () => {
    const state = createBaseState(5, 3);
    const result = initializeBuilding(state);

    expect(result.elevators).toHaveLength(3);
    expect(result.elevators[0]!.id).toBe('elevator-1');
    expect(result.elevators[2]!.id).toBe('elevator-3');
  });

  it('should initialize floors with correct properties', () => {
    const state = createBaseState(3, 1);
    const result = initializeBuilding(state);

    result.floors.forEach(floor => {
      expect(floor).toHaveProperty('floorNumber');
      expect(floor).toHaveProperty('hasUpCall');
      expect(floor).toHaveProperty('hasDownCall');
      expect(floor).toHaveProperty('waitingPassengers');
      expect(floor.hasUpCall).toBe(false);
      expect(floor.hasDownCall).toBe(false);
      expect(floor.waitingPassengers).toEqual([]);
    });
  });

  it('should initialize elevators with correct properties', () => {
    const state = createBaseState(5, 2);
    const result = initializeBuilding(state);

    result.elevators.forEach(elevator => {
      expect(elevator).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          currentFloor: 1,
          direction: ElevatorDirection.Idle,
          doorStatus: DoorStatus.Closed,
          loadingUnloadingRemainingTime: 0,
          movementRemainingTime: 0,
          destinationFloors: [],
          passengers: [],
          isDisabled: false,
          statusMessage: 'Idle',
        })
      );
    });
  });

  it('should initialize building with single floor and expect one floor with correct properties', () => {
    const state = createBaseState(1, 1);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(1);
    expect(result.floors[0]!.floorNumber).toBe(1);
    expect(result.elevators).toHaveLength(1);
    expect(result.elevators[0]!.id).toBe('elevator-1');
  });

  it('should initialize building with single elevator and expect one elevator with correct properties', () => {
    const state = createBaseState(5, 1);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(5);
    expect(result.elevators).toHaveLength(1);
    expect(result.elevators[0]!.id).toBe('elevator-1');
  });

  it('should initialize building with large number of floors and expect all floors with correct properties', () => {
    const state = createBaseState(100, 2);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(100);
    expect(result.floors[0]!.floorNumber).toBe(1);
    expect(result.floors[99]!.floorNumber).toBe(100);
  });

  it('should initialize building with large number of elevators and expect all elevators with correct properties', () => {
    const state = createBaseState(5, 50);
    const result = initializeBuilding(state);

    expect(result.elevators).toHaveLength(50);
    expect(result.elevators[0]!.id).toBe('elevator-1');
    expect(result.elevators[49]!.id).toBe('elevator-50');
  });

  it('should initialize building with zero floors and expect empty floors array', () => {
    const state = createBaseState(0, 1);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(0);
    expect(result.elevators).toHaveLength(1);
  });

  it('should initialize building with zero elevators and expect empty elevators array', () => {
    const state = createBaseState(5, 0);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(5);
    expect(result.elevators).toHaveLength(0);
  });

  it('should initialize building with decimal number of floors and expect rounded number of floors', () => {
    const state = createBaseState(3.5, 1);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(3); // Math.floor(3.5) = 3
    expect(result.elevators).toHaveLength(1);
  });

  it('should initialize building with decimal number of elevators and expect rounded number of elevators', () => {
    const state = createBaseState(5, 2.7);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(5);
    expect(result.elevators).toHaveLength(2); // Math.floor(2.7) = 2
  });

  it('should initialize large building with many floors and elevators and expect all components with correct properties', () => {
    const state = createBaseState(1000, 100);
    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(1000);
    expect(result.elevators).toHaveLength(100);
    expect(result.floors[0]!.floorNumber).toBe(1);
    expect(result.floors[999]!.floorNumber).toBe(1000);
    expect(result.elevators[0]!.id).toBe('elevator-1');
    expect(result.elevators[99]!.id).toBe('elevator-100');
  });

  it('should preserve existing call queue when initializing', () => {
    const state = createBaseState(5, 2);
    state.elevatorCallQueue = [
      {
        floorNumber: 3,
        direction: ElevatorDirection.Up,
        timestamp: Date.now(),
      },
    ];

    const result = initializeBuilding(state);

    expect(result.numberOfFloors).toBe(5);
    expect(result.numberOfElevators).toBe(2);
    expect(result.elevatorCallQueue).toEqual(state.elevatorCallQueue);
  });

  it('should override existing floors and elevators with new ones', () => {
    const state = createBaseState(5, 2);
    state.floors = [
      {
        floorNumber: 1,
        hasUpCall: true,
        hasDownCall: false,
        waitingPassengers: [],
      },
    ];
    state.elevators = [
      {
        id: 'existing',
        currentFloor: 5,
        direction: ElevatorDirection.Up,
        doorStatus: DoorStatus.Open,
        loadingUnloadingRemainingTime: 1000,
        movementRemainingTime: 500,
        destinationFloors: [7],
        passengers: [],
        isDisabled: true,
        statusMessage: 'Moving',
      },
    ];

    const result = initializeBuilding(state);

    expect(result.floors).toHaveLength(5);
    expect(result.elevators).toHaveLength(2);
    // Should override existing floors and elevators
    expect(result.floors?.[0]?.hasUpCall).toBe(false);
    expect(result.elevators?.[0]?.id).toBe('elevator-1');
  });
});
