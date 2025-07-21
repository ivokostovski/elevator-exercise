import type { Elevator } from '../types/elevator';
import { ElevatorDirection } from '../types/elevator';

// Calculates a "cost" for an elevator to pick up a call,
// prioritizing efficiency (minimal movement, correct direction).
export function calculateElevatorCost(
  elevator: Elevator,
  callFloor: number,
  callDirection: ElevatorDirection
): number {
  if (elevator.isDisabled) {
    return Infinity; // Disabled elevators cannot be chosen
  }

  // Cost for elevator being idle on the same floor
  if (
    elevator.currentFloor === callFloor &&
    elevator.direction === ElevatorDirection.Idle
  ) {
    return 0; // Perfect match
  }

  // Cost for an elevator already heading towards the call floor in the right direction
  if (elevator.direction === callDirection) {
    if (
      (callDirection === ElevatorDirection.Up &&
        elevator.currentFloor <= callFloor) ||
      (callDirection === ElevatorDirection.Down &&
        elevator.currentFloor >= callFloor)
    ) {
      // If elevator is already past the call floor but heading in the same direction,
      // it means it will pick up passengers on its way back. This is less efficient
      // than picking up on the way.
      // We need to account for distance to callFloor
      let cost = Math.abs(elevator.currentFloor - callFloor);

      // Add cost for each destination floor currently in its queue that is *before* the call floor
      // and not in the correct direction relative to the call.
      elevator.destinationFloors.forEach(destFloor => {
        if (
          (callDirection === ElevatorDirection.Up && destFloor < callFloor) ||
          (callDirection === ElevatorDirection.Down && destFloor > callFloor)
        ) {
          cost += 0.5; // Small penalty for each stop before reaching the call
        }
      });

      return cost;
    }
  }

  // Cost for an elevator going in the opposite direction or idle but not on the floor
  // It needs to finish current tasks, then reverse, then travel.
  // This is a higher cost.
  let cost = Math.abs(elevator.currentFloor - callFloor) * 2; // Penalize opposite direction or significant travel
  cost += elevator.destinationFloors.length * 5; // Penalize for existing tasks

  return cost;
}

export function findBestElevator(
  elevators: Elevator[],
  callFloor: number,
  callDirection: ElevatorDirection
): Elevator | null {
  let bestElevator: Elevator | null = null;
  let minCost = Infinity;

  for (const elevator of elevators) {
    const cost = calculateElevatorCost(elevator, callFloor, callDirection);
    if (cost < minCost) {
      minCost = cost;
      bestElevator = elevator;
    }
  }

  return bestElevator;
}
