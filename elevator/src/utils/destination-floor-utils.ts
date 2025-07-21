import type { Elevator } from '../types/elevator';
import { ElevatorDirection } from '../types/elevator';

// Gets the next destination floor for an elevator based on its current direction and destinations.
export function getNextDestinationFloor(elevator: Elevator): number | null {
  if (elevator.destinationFloors.length === 0) {
    return null;
  }

  const sortedDestinations = [...elevator.destinationFloors].sort((a, b) => {
    // Sort based on current direction
    if (elevator.direction === ElevatorDirection.Up) {
      return a - b;
    } else if (elevator.direction === ElevatorDirection.Down) {
      return b - a;
    }
    // If idle, prioritize closest
    return (
      Math.abs(elevator.currentFloor - a) - Math.abs(elevator.currentFloor - b)
    );
  });

  // Find the next closest destination in the current direction
  for (const floor of sortedDestinations) {
    if (
      (elevator.direction === ElevatorDirection.Up &&
        floor >= elevator.currentFloor) ||
      (elevator.direction === ElevatorDirection.Down &&
        floor <= elevator.currentFloor)
    ) {
      return Math.round(floor);
    }
  }

  // If no floors in current direction (e.g., all destinations are behind),
  // then reverse direction and pick the closest
  return sortedDestinations[0] ? Math.round(sortedDestinations[0]) : null;
}
