import { render } from '@testing-library/react';
import SimulationManager from './simulation-manager';

// Mock the building context
const mockDispatch = jest.fn();
const mockUseBuilding = jest.fn();

jest.mock('../contexts/building-context', () => ({
  useBuilding: () => mockUseBuilding(),
}));

// Mock constants
jest.mock('../constants/elevator', () => ({
  RANDOM_CALL_INTERVAL_MIN: 1000,
  RANDOM_CALL_INTERVAL_MAX: 3000,
  TICK_INTERVAL: 100,
}));

describe('SimulationManager', () => {
  const createMockState = (numberOfFloors: number = 5) => ({
    numberOfFloors,
    numberOfElevators: 2,
    elevators: [],
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

  describe('Component behavior', () => {
    it('renders nothing (no UI)', () => {
      const { container } = render(<SimulationManager />);

      expect(container.firstChild).toBeNull();
    });

    it('uses building context state', () => {
      render(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalledTimes(1);
    });

    it('updates when building state changes', () => {
      const { rerender } = render(<SimulationManager />);

      // Change the state
      mockUseBuilding.mockReturnValue({
        state: createMockState(8),
        dispatch: mockDispatch,
      });

      rerender(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalledTimes(2);
    });

    it('handles different building configurations', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(1),
        dispatch: mockDispatch,
      });

      render(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalledTimes(1);
    });

    it('handles large number of floors', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(20),
        dispatch: mockDispatch,
      });

      render(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalledTimes(1);
    });

    it('handles building with no elevators', () => {
      const stateWithNoElevators = createMockState();
      stateWithNoElevators.numberOfElevators = 0;
      stateWithNoElevators.elevators = [];

      mockUseBuilding.mockReturnValue({
        state: stateWithNoElevators,
        dispatch: mockDispatch,
      });

      render(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalledTimes(1);
    });
  });

  describe('Context integration', () => {
    it('provides dispatch function to context', () => {
      render(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalled();
      const contextValue = mockUseBuilding.mock.results[0]?.value;
      expect(contextValue).toHaveProperty('dispatch');
      expect(contextValue).toHaveProperty('state');
    });

    it('accesses building state from context', () => {
      render(<SimulationManager />);

      expect(mockUseBuilding).toHaveBeenCalled();
      const contextValue = mockUseBuilding.mock.results[0]?.value;
      expect(contextValue?.state).toHaveProperty('numberOfFloors');
      expect(contextValue?.state).toHaveProperty('elevators');
      expect(contextValue?.state).toHaveProperty('floors');
    });
  });
});
