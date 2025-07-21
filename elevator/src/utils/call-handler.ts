import type { BuildingState } from '../types/elevator';
import { ElevatorDirection } from '../types/elevator';

export function handleCallElevator(
  state: BuildingState,
  payload: { floorNumber: number; direction: ElevatorDirection }
): BuildingState {
  const { floorNumber, direction } = payload;

  // This code updates the floors array to reflect a new elevator call.
  // For each floor, if the floor number matches the one where the call was made,
  // it sets hasUpCall to true if the call direction is Up (otherwise keeps its previous value),
  // and sets hasDownCall to true if the call direction is Down (otherwise keeps its previous value).
  // All other floors remain unchanged.
  const floors = (state.floors || []).map(f =>
    f.floorNumber === floorNumber
      ? {
          ...f,
          hasUpCall: direction === ElevatorDirection.Up ? true : f.hasUpCall,
          hasDownCall:
            direction === ElevatorDirection.Down ? true : f.hasDownCall,
        }
      : f
  );

  const callWithTimestamp = {
    ...payload,
    timestamp: Date.now(), // Add timestamp to the call for processing delay§
  };

  const newCallQueue = [...(state.elevatorCallQueue || []), callWithTimestamp];

  return { ...state, floors, elevatorCallQueue: newCallQueue };
}
