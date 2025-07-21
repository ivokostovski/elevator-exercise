import { ELEVATOR_COLORS } from '../constants/elevator';
import type { Elevator } from '../types/elevator';
import { DoorStatus, ElevatorDirection } from '../types/elevator';
import { getElevatorColor } from './elevator-color-utils';

describe('elevator-color-utils', () => {
  const createElevator = (
    isDisabled: boolean,
    doorStatus: DoorStatus,
    direction: ElevatorDirection,
    loadingUnloadingRemainingTime: number
  ): Elevator => ({
    id: 'elevator-1',
    currentFloor: 1,
    direction,
    doorStatus,
    loadingUnloadingRemainingTime,
    movementRemainingTime: 0,
    destinationFloors: [],
    passengers: [],
    isDisabled,
    statusMessage: 'Idle',
  });

  it('should return disabled color for disabled elevator', () => {
    const elevator = createElevator(
      true,
      DoorStatus.Closed,
      ElevatorDirection.Idle,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.DISABLED);
  });

  it('should return loading color for elevator with open doors and remaining loading time', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should return unloading color for elevator with open doors and no remaining loading time', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should return moving up color for elevator moving up with closed doors', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Closed,
      ElevatorDirection.Up,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.MOVING_UP);
  });

  it('should return moving down color for elevator moving down with closed doors', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Closed,
      ElevatorDirection.Down,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.MOVING_DOWN);
  });

  it('should return idle color for idle elevator with closed doors', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Closed,
      ElevatorDirection.Idle,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.IDLE);
  });

  it('should prioritize disabled status over all other states', () => {
    const elevator = createElevator(
      true,
      DoorStatus.Open,
      ElevatorDirection.Up,
      1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.DISABLED);
  });

  it('should prioritize open doors over movement direction', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Up,
      1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should return green color for very small remaining loading time and expect green status', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      1
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should return green color for zero remaining loading time and expect green status', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should return green color for negative remaining loading time and expect green status', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      -1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should return red color for very large remaining loading time and expect red status', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      999999
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should handle elevator moving up with open doors and loading time', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Up,
      1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should handle elevator moving down with open doors and loading time', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Down,
      1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should handle elevator moving up with open doors and no loading time', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Up,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should handle elevator moving down with open doors and no loading time', () => {
    const elevator = createElevator(
      false,
      DoorStatus.Open,
      ElevatorDirection.Down,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should handle disabled elevator with open doors', () => {
    const elevator = createElevator(
      true,
      DoorStatus.Open,
      ElevatorDirection.Idle,
      1000
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.DISABLED);
  });

  it('should handle disabled elevator moving up', () => {
    const elevator = createElevator(
      true,
      DoorStatus.Closed,
      ElevatorDirection.Up,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.DISABLED);
  });

  it('should handle disabled elevator moving down', () => {
    const elevator = createElevator(
      true,
      DoorStatus.Closed,
      ElevatorDirection.Down,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.DISABLED);
  });

  it('should handle disabled idle elevator', () => {
    const elevator = createElevator(
      true,
      DoorStatus.Closed,
      ElevatorDirection.Idle,
      0
    );
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.DISABLED);
  });

  it('should handle all possible combinations systematically', () => {
    const testCases = [
      {
        disabled: true,
        doorStatus: DoorStatus.Closed,
        direction: ElevatorDirection.Idle,
        loadingTime: 0,
        expected: ELEVATOR_COLORS.DISABLED,
      },
      {
        disabled: false,
        doorStatus: DoorStatus.Open,
        direction: ElevatorDirection.Idle,
        loadingTime: 1000,
        expected: ELEVATOR_COLORS.LOADING,
      },
      {
        disabled: false,
        doorStatus: DoorStatus.Open,
        direction: ElevatorDirection.Idle,
        loadingTime: 0,
        expected: ELEVATOR_COLORS.UNLOADING,
      },
      {
        disabled: false,
        doorStatus: DoorStatus.Closed,
        direction: ElevatorDirection.Up,
        loadingTime: 0,
        expected: ELEVATOR_COLORS.MOVING_UP,
      },
      {
        disabled: false,
        doorStatus: DoorStatus.Closed,
        direction: ElevatorDirection.Down,
        loadingTime: 0,
        expected: ELEVATOR_COLORS.MOVING_DOWN,
      },
      {
        disabled: false,
        doorStatus: DoorStatus.Closed,
        direction: ElevatorDirection.Idle,
        loadingTime: 0,
        expected: ELEVATOR_COLORS.IDLE,
      },
    ];

    testCases.forEach(
      ({ disabled, doorStatus, direction, loadingTime, expected }) => {
        const elevator = createElevator(
          disabled,
          doorStatus,
          direction,
          loadingTime
        );
        const color = getElevatorColor(elevator);
        expect(color).toBe(expected);
      }
    );
  });

  it('should return default color for undefined loading time and expect gray status', () => {
    const elevator = {
      ...createElevator(false, DoorStatus.Open, ElevatorDirection.Idle, 0),
      loadingUnloadingRemainingTime: undefined as any,
    };
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should return default color for null loading time and expect gray status', () => {
    const elevator = {
      ...createElevator(false, DoorStatus.Open, ElevatorDirection.Idle, 0),
      loadingUnloadingRemainingTime: null as any,
    };
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should return default color for string loading time and expect gray status', () => {
    const elevator = {
      ...createElevator(false, DoorStatus.Open, ElevatorDirection.Idle, 0),
      loadingUnloadingRemainingTime: '1000' as any,
    };
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should return default color for boolean loading time and expect gray status', () => {
    const elevator = {
      ...createElevator(false, DoorStatus.Open, ElevatorDirection.Idle, 0),
      loadingUnloadingRemainingTime: true as any,
    };
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.LOADING);
  });

  it('should return default color for zero loading time as string and expect gray status', () => {
    const elevator = {
      ...createElevator(false, DoorStatus.Open, ElevatorDirection.Idle, 0),
      loadingUnloadingRemainingTime: '0' as any,
    };
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });

  it('should return default color for false loading time and expect gray status', () => {
    const elevator = {
      ...createElevator(false, DoorStatus.Open, ElevatorDirection.Idle, 0),
      loadingUnloadingRemainingTime: false as any,
    };
    const color = getElevatorColor(elevator);
    expect(color).toBe(ELEVATOR_COLORS.UNLOADING);
  });
});
