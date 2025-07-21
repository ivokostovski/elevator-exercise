export enum ElevatorDirection {
  Up = 'Up',
  Down = 'Down',
  Idle = 'Idle',
}

export enum DoorStatus {
  Open = 'Open',
  Closed = 'Closed',
}

export interface Elevator {
  id: string;
  currentFloor: number;
  direction: ElevatorDirection;
  doorStatus: DoorStatus;
  loadingUnloadingRemainingTime: number;
  movementRemainingTime: number;
  destinationFloors: number[];
  passengers: { destinationFloor: number }[];
  isDisabled: boolean;
  statusMessage: string;
}

export interface Floor {
  floorNumber: number;
  hasUpCall: boolean;
  hasDownCall: boolean;
  waitingPassengers: { fromFloor: number; toFloor: number }[];
}

export interface ElevatorCall {
  floorNumber: number;
  direction: ElevatorDirection;
  timestamp: number;
}

export interface BuildingState {
  numberOfFloors: number;
  numberOfElevators: number;
  elevators: Elevator[];
  floors: Floor[];
  elevatorCallQueue: ElevatorCall[];
}

export type BuildingAction =
  | { type: 'INITIALIZE_BUILDING' }
  | {
      type: 'CALL_ELEVATOR';
      payload: { floorNumber: number; direction: ElevatorDirection };
    }
  | { type: 'TICK' }
  | {
      type: 'ELEVATOR_ARRIVED';
      payload: { elevatorId: string; floorNumber: number };
    }
  | {
      type: 'ELEVATOR_PICK_UP';
      payload: {
        elevatorId: string;
        passengers: { destinationFloor: number }[];
      };
    }
  | {
      type: 'ELEVATOR_DROP_OFF';
      payload: { elevatorId: string; floorNumber: number };
    }
  | {
      type: 'TOGGLE_ELEVATOR_DISABLED';
      payload: { elevatorId: string; isDisabled: boolean };
    };

export const initialBuildingState: BuildingState = {
  numberOfFloors: 10,
  numberOfElevators: 4,
  elevators: [],
  floors: [],
  elevatorCallQueue: [],
};
