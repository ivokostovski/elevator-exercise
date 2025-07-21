import { render, screen } from '@testing-library/react';
import BuildingDisplay from './building-display';

// Mock the building context
const mockUseBuilding = jest.fn();

jest.mock('../contexts/building-context', () => ({
  useBuilding: () => mockUseBuilding(),
}));

// Mock child components
jest.mock('./building-display/building-grid', () => {
  return function MockBuildingGrid({ elevators, floors, numberOfFloors }: any) {
    return (
      <div data-testid='building-grid'>
        <div data-testid='elevators-count'>{elevators.length}</div>
        <div data-testid='floors-count'>{floors.length}</div>
        <div data-testid='number-of-floors'>{numberOfFloors}</div>
      </div>
    );
  };
});

jest.mock('./building-display/floor-numbers', () => {
  return function MockFloorNumbers({ numberOfFloors }: any) {
    return (
      <div data-testid='floor-numbers'>
        <div data-testid='floor-numbers-count'>{numberOfFloors}</div>
      </div>
    );
  };
});

describe('BuildingDisplay', () => {
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
      {
        id: 'elevator-2',
        currentFloor: 3,
        direction: 'Up',
        doorStatus: 'Open',
        loadingUnloadingRemainingTime: 2,
        movementRemainingTime: 0,
        destinationFloors: [5],
        passengers: [{ destinationFloor: 5 }],
        isDisabled: false,
        statusMessage: 'Moving Up',
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
    });
  });

  describe('Rendering', () => {
    it('renders building display container', () => {
      render(<BuildingDisplay />);

      const container = screen.getByRole('region');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('building-display');
    });

    it('renders heading for building view', () => {
      render(<BuildingDisplay />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Building View');
    });

    it('renders building container with proper accessibility', () => {
      render(<BuildingDisplay />);

      const container = screen.getByRole('grid');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute(
        'aria-label',
        '5-floor building with 2 elevators'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<BuildingDisplay />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute(
        'aria-labelledby',
        'building-view-heading'
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'building-view-heading');
    });

    it('provides descriptive aria-label for building container', () => {
      render(<BuildingDisplay />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        '5-floor building with 2 elevators'
      );
    });
  });

  describe('Component integration', () => {
    it('passes correct props to BuildingGrid', () => {
      render(<BuildingDisplay />);

      expect(screen.getByTestId('elevators-count')).toHaveTextContent('2');
      expect(screen.getByTestId('floors-count')).toHaveTextContent('5');
      expect(screen.getByTestId('number-of-floors')).toHaveTextContent('5');
    });

    it('passes correct props to FloorNumbers', () => {
      render(<BuildingDisplay />);

      expect(screen.getByTestId('floor-numbers-count')).toHaveTextContent('5');
    });

    it('updates aria-label when building configuration changes', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(10),
      });

      render(<BuildingDisplay />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        '10-floor building with 2 elevators'
      );
    });
  });

  describe('State integration', () => {
    it('uses building context state', () => {
      render(<BuildingDisplay />);

      expect(mockUseBuilding).toHaveBeenCalledTimes(1);
    });

    it('handles different elevator counts', () => {
      const stateWithMoreElevators = createMockState();
      stateWithMoreElevators.numberOfElevators = 4;
      stateWithMoreElevators.elevators = Array.from({ length: 4 }, (_, i) => ({
        id: `elevator-${i + 1}`,
        currentFloor: 1,
        direction: 'Idle',
        doorStatus: 'Closed',
        loadingUnloadingRemainingTime: 0,
        movementRemainingTime: 0,
        destinationFloors: [],
        passengers: [],
        isDisabled: false,
        statusMessage: 'Idle',
      }));

      mockUseBuilding.mockReturnValue({
        state: stateWithMoreElevators,
      });

      render(<BuildingDisplay />);

      expect(screen.getByTestId('elevators-count')).toHaveTextContent('4');
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        '5-floor building with 4 elevators'
      );
    });

    it('handles different floor counts', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(3),
      });

      render(<BuildingDisplay />);

      expect(screen.getByTestId('floors-count')).toHaveTextContent('3');
      expect(screen.getByTestId('number-of-floors')).toHaveTextContent('3');
      expect(screen.getByTestId('floor-numbers-count')).toHaveTextContent('3');
    });
  });

  describe('Edge cases', () => {
    it('handles single floor building', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(1),
      });

      render(<BuildingDisplay />);

      expect(screen.getByTestId('floors-count')).toHaveTextContent('1');
      expect(screen.getByTestId('number-of-floors')).toHaveTextContent('1');
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        '1-floor building with 2 elevators'
      );
    });

    it('handles building with no elevators', () => {
      const stateWithNoElevators = createMockState();
      stateWithNoElevators.numberOfElevators = 0;
      stateWithNoElevators.elevators = [];

      mockUseBuilding.mockReturnValue({
        state: stateWithNoElevators,
      });

      render(<BuildingDisplay />);

      expect(screen.getByTestId('elevators-count')).toHaveTextContent('0');
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        '5-floor building with 0 elevators'
      );
    });

    it('handles large number of floors', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(20),
      });

      render(<BuildingDisplay />);

      expect(screen.getByTestId('floors-count')).toHaveTextContent('20');
      expect(screen.getByTestId('number-of-floors')).toHaveTextContent('20');
      const grid = screen.getByRole('grid');
      expect(grid).toHaveAttribute(
        'aria-label',
        '20-floor building with 2 elevators'
      );
    });
  });
});
