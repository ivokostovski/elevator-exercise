import type { BuildingState } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';

export function initializeBuilding(state: BuildingState): BuildingState {
  const floors = Array.from({ length: state.numberOfFloors }, (_, i) => ({
    floorNumber: i + 1,
    hasUpCall: false,
    hasDownCall: false,
    waitingPassengers: [],
  }));

  const elevators = Array.from({ length: state.numberOfElevators }, (_, i) => ({
    id: `elevator-${i + 1}`,
    currentFloor: 1,
    direction: ElevatorDirection.Idle,
    doorStatus: DoorStatus.Closed,
    loadingUnloadingRemainingTime: 0,
    movementRemainingTime: 0,
    destinationFloors: [],
    passengers: [],
    isDisabled: false,
    statusMessage: 'Idle',
  }));

  return {
    ...state,
    floors,
    elevators,
  };
}
