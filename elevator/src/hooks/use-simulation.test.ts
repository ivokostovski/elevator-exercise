import { act, renderHook } from '@testing-library/react';
import { RANDOM_CALL_INTERVAL_MAX, TICK_INTERVAL } from '../constants/elevator';
import { ElevatorDirection } from '../types/elevator';
import { useSimulation } from './use-simulation';

// Mock the building context
const mockDispatch = jest.fn();
const mockUseBuilding = jest.fn();

jest.mock('../contexts/building-context', () => ({
  useBuilding: () => mockUseBuilding(),
}));

// Mock timers
jest.useFakeTimers();

describe('useSimulation', () => {
  const createMockState = (numberOfFloors: number = 5) => ({
    numberOfFloors,
    numberOfElevators: 2,
    elevators: [
      {
        id: 'elevator-1',
        currentFloor: 1,
        direction: 'Idle',
        doorStatus: 'Closed',
        loadingUnloadingRemainingTime: 0,
        movementRemainingTime: 0,
        destinationFloors: [],
        passengers: [],
        isDisabled: false,
        statusMessage: 'Idle',
      },
    ],
    floors: Array.from({ length: numberOfFloors }, (_, i) => ({
      floorNumber: i + 1,
      hasUpCall: false,
      hasDownCall: false,
      waitingPassengers: [],
    })),
    elevatorCallQueue: [],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBuilding.mockReturnValue({
      state: createMockState(),
      dispatch: mockDispatch,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Tick functionality', () => {
    it('dispatches TICK action at regular intervals', () => {
      renderHook(() => useSimulation());

      // Advance time by one tick interval
      act(() => {
        jest.advanceTimersByTime(TICK_INTERVAL);
      });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'TICK' });

      // Advance time by another tick interval
      act(() => {
        jest.advanceTimersByTime(TICK_INTERVAL);
      });

      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(mockDispatch).toHaveBeenNthCalledWith(2, { type: 'TICK' });
    });

    it('cleans up tick timer on unmount', () => {
      const { unmount } = renderHook(() => useSimulation());

      // Advance time to trigger a tick
      act(() => {
        jest.advanceTimersByTime(TICK_INTERVAL);
      });

      expect(mockDispatch).toHaveBeenCalledWith({ type: 'TICK' });

      // Clear the mock to verify no more calls after unmount
      mockDispatch.mockClear();

      // Unmount the hook
      unmount();

      // Advance time again - should not trigger any more ticks
      act(() => {
        jest.advanceTimersByTime(TICK_INTERVAL);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Random call generation', () => {
    it('generates random elevator calls after initial delay', () => {
      renderHook(() => useSimulation());

      // Initially no calls should be made
      expect(mockDispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CALL_ELEVATOR' })
      );

      // Advance time to trigger the first random call
      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'CALL_ELEVATOR',
          payload: expect.objectContaining({
            floorNumber: expect.any(Number),
            direction: expect.any(String),
          }),
        })
      );
    });

    it('generates calls for floor 1 with Up direction only', () => {
      // Mock Math.random to return 0, which will result in floor 1
      jest.spyOn(Math, 'random').mockReturnValue(0);

      renderHook(() => useSimulation());

      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CALL_ELEVATOR',
        payload: { floorNumber: 1, direction: ElevatorDirection.Up },
      });
    });

    it('generates calls for top floor with Down direction only', () => {
      const numberOfFloors = 10;
      mockUseBuilding.mockReturnValue({
        state: createMockState(numberOfFloors),
        dispatch: mockDispatch,
      });

      // Mock Math.random to return 0.99, which will result in the top floor
      jest.spyOn(Math, 'random').mockReturnValue(0.99);

      renderHook(() => useSimulation());

      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CALL_ELEVATOR',
        payload: {
          floorNumber: numberOfFloors,
          direction: ElevatorDirection.Down,
        },
      });
    });

    it('generates calls for middle floors with random direction', () => {
      const numberOfFloors = 10;
      mockUseBuilding.mockReturnValue({
        state: createMockState(numberOfFloors),
        dispatch: mockDispatch,
      });

      // Mock Math.random to return 0.5, which will result in floor 5 (middle floor)
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      renderHook(() => useSimulation());

      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      const callElevatorCalls = mockDispatch.mock.calls.filter(
        call => call[0].type === 'CALL_ELEVATOR'
      );

      expect(callElevatorCalls.length).toBeGreaterThan(0);
      const callPayload = callElevatorCalls[0][0].payload;
      expect(callPayload.floorNumber).toBeGreaterThanOrEqual(1);
      expect(callPayload.floorNumber).toBeLessThanOrEqual(numberOfFloors);
      expect(callPayload.direction).toMatch(/^(Up|Down)$/);

      randomSpy.mockRestore();
    });

    it('schedules subsequent random calls after each call', () => {
      renderHook(() => useSimulation());

      // Trigger first call
      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      const firstCallCount = mockDispatch.mock.calls.filter(
        call => call[0].type === 'CALL_ELEVATOR'
      ).length;

      // Advance time to trigger second call
      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      const secondCallCount = mockDispatch.mock.calls.filter(
        call => call[0].type === 'CALL_ELEVATOR'
      ).length;

      expect(secondCallCount).toBeGreaterThan(firstCallCount);
    });
  });

  describe('Integration', () => {
    it('handles both tick and random call generation simultaneously', () => {
      renderHook(() => useSimulation());

      // Advance time to trigger both tick and random call
      act(() => {
        jest.advanceTimersByTime(
          Math.max(TICK_INTERVAL, RANDOM_CALL_INTERVAL_MAX)
        );
      });

      const tickCalls = mockDispatch.mock.calls.filter(
        call => call[0].type === 'TICK'
      );
      const callElevatorCalls = mockDispatch.mock.calls.filter(
        call => call[0].type === 'CALL_ELEVATOR'
      );

      expect(tickCalls.length).toBeGreaterThan(0);
      expect(callElevatorCalls.length).toBeGreaterThan(0);
    });

    it('uses correct state values for random call generation', () => {
      const numberOfFloors = 15;
      mockUseBuilding.mockReturnValue({
        state: createMockState(numberOfFloors),
        dispatch: mockDispatch,
      });

      renderHook(() => useSimulation());

      act(() => {
        jest.advanceTimersByTime(RANDOM_CALL_INTERVAL_MAX);
      });

      // Verify that the call uses the correct number of floors
      const callElevatorCalls = mockDispatch.mock.calls.filter(
        call => call[0].type === 'CALL_ELEVATOR'
      );

      expect(callElevatorCalls.length).toBeGreaterThan(0);
      const callPayload = callElevatorCalls[0][0].payload;
      expect(callPayload.floorNumber).toBeGreaterThanOrEqual(1);
      expect(callPayload.floorNumber).toBeLessThanOrEqual(numberOfFloors);
    });
  });
});
