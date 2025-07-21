import type { BuildingState, Elevator } from '../types/elevator';
import { ElevatorDirection } from '../types/elevator';

export function handleToggleElevatorDisabled(
  state: BuildingState,
  payload: { elevatorId: string; isDisabled: boolean }
): BuildingState {
  const { elevatorId, isDisabled } = payload;
  const elevatorIndex = (state.elevators || []).findIndex(
    e => e && e.id === elevatorId
  );

  if (elevatorIndex === -1) return state;

  const newElevators = [...(state.elevators || [])];
  const originalElevator = newElevators[elevatorIndex];

  if (!originalElevator) return state;

  const disabledElevator: Elevator = {
    ...originalElevator,
    isDisabled,
  };

  // If disabling, reassign its current destinations
  if (isDisabled) {
    // Put current destination floors back into the call queue
    const callsToRequeue = (disabledElevator.destinationFloors || []).map(
      floor => {
        const direction =
          floor > (disabledElevator.currentFloor || 1)
            ? ElevatorDirection.Up
            : ElevatorDirection.Down;
        return { floorNumber: floor, direction, timestamp: Date.now() };
      }
    );

    // Also requeue any floors where passengers inside wanted to go
    (disabledElevator.passengers || []).forEach(p => {
      const alreadyQueued = callsToRequeue.some(
        c => c.floorNumber === p.destinationFloor
      );
      if (!alreadyQueued) {
        const direction =
          p.destinationFloor > (disabledElevator.currentFloor || 1)
            ? ElevatorDirection.Up
            : ElevatorDirection.Down;
        callsToRequeue.push({
          floorNumber: p.destinationFloor,
          direction,
          timestamp: Date.now(),
        });
      }
    });

    disabledElevator.destinationFloors = [];
    disabledElevator.passengers = [];

    newElevators[elevatorIndex] = disabledElevator;

    return {
      ...state,
      elevators: newElevators,
      elevatorCallQueue: [
        ...(state.elevatorCallQueue || []),
        ...callsToRequeue,
      ],
    };
  }

  // If enabling, just update the status
  newElevators[elevatorIndex] = disabledElevator;
  return { ...state, elevators: newElevators };
}
