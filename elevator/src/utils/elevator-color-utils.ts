import { ELEVATOR_COLORS } from '../constants/elevator';
import type { Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';

export const getElevatorColor = (elevator: Elevator): string => {
  if (elevator.isDisabled) return ELEVATOR_COLORS.DISABLED;

  if (elevator.doorStatus === DoorStatus.Open) {
    return elevator.loadingUnloadingRemainingTime > 0
      ? ELEVATOR_COLORS.LOADING
      : ELEVATOR_COLORS.UNLOADING;
  }

  if (elevator.direction === ElevatorDirection.Up)
    return ELEVATOR_COLORS.MOVING_UP;
  if (elevator.direction === ElevatorDirection.Down)
    return ELEVATOR_COLORS.MOVING_DOWN;

  return ELEVATOR_COLORS.IDLE;
};
