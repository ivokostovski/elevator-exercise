import {
  FLOOR_MOVEMENT_TIME,
  LOAD_UNLOAD_TIME,
  MAX_PASSENGERS,
  TICK_INTERVAL,
} from '../constants/elevator';
import type { BuildingState } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import { getNextDestinationFloor } from './destination-floor-utils';
import { findBestElevator } from './elevator-cost-calculator';
import { generateRandomPassengers } from './passenger-generator';

export function handleTick(state: BuildingState): BuildingState {
  let newElevators = (state.elevators || []).map(elevator => {
    if (!elevator) return elevator; // Skip null elevators by returning them as-is
    if (elevator.isDisabled) {
      return elevator;
    }

    // 1. Loading/Unloading Passengers
    if (elevator.doorStatus === DoorStatus.Open) {
      let newLoadingUnloadingRemainingTime =
        elevator.loadingUnloadingRemainingTime - TICK_INTERVAL;

      if (newLoadingUnloadingRemainingTime <= 0) {
        // Finished loading/unloading
        newLoadingUnloadingRemainingTime = 0;
        const newDoorStatus = DoorStatus.Closed;

        // Drop off passengers if current floor is a destination
        const passengersToDropOff = elevator.passengers.filter(
          p => p.destinationFloor === elevator.currentFloor
        );
        let newPassengers = elevator.passengers;
        if (passengersToDropOff.length > 0) {
          newPassengers = elevator.passengers.filter(
            p => p.destinationFloor !== elevator.currentFloor
          );
        }

        // Generate random passengers for simulation
        const availableSpots = Math.max(
          0,
          MAX_PASSENGERS - elevator.passengers.length
        );
        const newPassengersGenerated =
          availableSpots > 0
            ? generateRandomPassengers(
                elevator.currentFloor,
                state.numberOfFloors
              ).slice(0, availableSpots)
            : [];
        newPassengers = [...newPassengers, ...newPassengersGenerated];

        // Add new destination floors
        let newDestinationFloors = [...elevator.destinationFloors];
        newPassengersGenerated.forEach(p => {
          if (!newDestinationFloors.includes(p.destinationFloor)) {
            newDestinationFloors.push(p.destinationFloor);
          }
        });

        // Remove current floor from destinations
        newDestinationFloors = newDestinationFloors.filter(
          f => f !== elevator.currentFloor
        );

        return {
          ...elevator,
          doorStatus: newDoorStatus,
          loadingUnloadingRemainingTime: newLoadingUnloadingRemainingTime,
          passengers: newPassengers,
          destinationFloors: newDestinationFloors,
          statusMessage: 'Moving',
        };
      } else {
        return {
          ...elevator,
          loadingUnloadingRemainingTime: newLoadingUnloadingRemainingTime,
          statusMessage: `Loading/Unloading (${Math.ceil(
            newLoadingUnloadingRemainingTime / 1000
          )}s)`,
        };
      }
    }

    // 2. Movement
    if (
      elevator.doorStatus === DoorStatus.Closed &&
      elevator.destinationFloors.length > 0
    ) {
      if (elevator.movementRemainingTime > 0) {
        // Still moving
        return {
          ...elevator,
          movementRemainingTime: elevator.movementRemainingTime - TICK_INTERVAL,
          statusMessage: `Moving ${elevator.direction} (${Math.ceil(
            elevator.movementRemainingTime / 1000
          )}s)`,
        };
      } else {
        // Arrived at next floor or ready to move
        const nextTargetFloor = getNextDestinationFloor(elevator);

        if (nextTargetFloor !== null) {
          // Determine direction
          const newDirection =
            nextTargetFloor > elevator.currentFloor
              ? ElevatorDirection.Up
              : ElevatorDirection.Down;

          // Move to the next floor
          const newCurrentFloor =
            elevator.currentFloor +
            (newDirection === ElevatorDirection.Up ? 1 : -1);

          const newMovementRemainingTime = FLOOR_MOVEMENT_TIME;

          // Check if arrived at a destination floor
          const arrivedAtDestination =
            newCurrentFloor === nextTargetFloor ||
            elevator.passengers.some(
              p => p.destinationFloor === newCurrentFloor
            );
          const hasCallOnCurrentFloor = state.floors.some(
            f =>
              f.floorNumber === newCurrentFloor &&
              (f.hasUpCall || f.hasDownCall)
          );

          if (arrivedAtDestination || hasCallOnCurrentFloor) {
            return {
              ...elevator,
              currentFloor: newCurrentFloor,
              direction: newDirection,
              movementRemainingTime: 0,
              loadingUnloadingRemainingTime: LOAD_UNLOAD_TIME,
              doorStatus: DoorStatus.Open,
              statusMessage: 'Arrived, Opening Doors',
            };
          } else {
            // Keep moving
            return {
              ...elevator,
              currentFloor: newCurrentFloor,
              direction: newDirection,
              movementRemainingTime: newMovementRemainingTime,
              statusMessage: `Moving ${newDirection}`,
            };
          }
        } else {
          // No next target, become idle
          return {
            ...elevator,
            direction: ElevatorDirection.Idle,
            statusMessage: 'Idle',
          };
        }
      }
    } else if (elevator.destinationFloors.length === 0) {
      // No destinations, become idle
      return {
        ...elevator,
        direction: ElevatorDirection.Idle,
        statusMessage: 'Idle',
      };
    }

    return elevator;
  });

  // Process elevator call queue with delay
  let newElevatorCallQueue = [...(state.elevatorCallQueue || [])];
  let newFloors = [...(state.floors || [])];
  const currentTime = Date.now();
  const CALL_PROCESSING_DELAY = 2000;

  for (let i = 0; i < newElevatorCallQueue.length; i++) {
    const call = newElevatorCallQueue[i];
    if (!call) continue;

    // Only process calls that have been in the queue for at least 2 seconds
    if (currentTime - call.timestamp < CALL_PROCESSING_DELAY) {
      continue;
    }

    const bestElevator = findBestElevator(
      newElevators,
      call.floorNumber,
      call.direction
    );

    if (bestElevator) {
      // Find the assigned elevator in the newElevators array and update it
      newElevators = newElevators.map(el => {
        if (el.id === bestElevator.id) {
          // If elevator was idle, set its initial direction first
          let newElevatorDirection = el.direction;
          if (el.direction === ElevatorDirection.Idle) {
            if (call.floorNumber > el.currentFloor) {
              newElevatorDirection = ElevatorDirection.Up;
            } else if (call.floorNumber < el.currentFloor) {
              newElevatorDirection = ElevatorDirection.Down;
            }
          }

          // Now sort destination floors based on the new direction
          const newDestinationFloors = Array.from(
            new Set([...el.destinationFloors, call.floorNumber])
          ).sort((a, b) =>
            newElevatorDirection === ElevatorDirection.Up ? a - b : b - a
          );

          return {
            ...el,
            destinationFloors: newDestinationFloors,
            direction: newElevatorDirection,
          };
        }
        return el;
      });

      // Mark the floor call as handled
      newFloors = newFloors.map(f =>
        f.floorNumber === call.floorNumber
          ? {
              ...f,
              hasUpCall:
                call.direction === ElevatorDirection.Up ? false : f.hasUpCall,
              hasDownCall:
                call.direction === ElevatorDirection.Down
                  ? false
                  : f.hasDownCall,
            }
          : f
      );

      // Remove the call from the queue
      newElevatorCallQueue.splice(i, 1);
      i--; // Adjust index due to removal
    }
  }

  return {
    ...state,
    elevators: newElevators,
    floors: newFloors,
    elevatorCallQueue: newElevatorCallQueue,
  };
}
