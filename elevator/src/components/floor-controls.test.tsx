import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ElevatorDirection } from '../types/elevator';
import FloorControls from './floor-controls';

// Mock the building context
const mockDispatch = jest.fn();
const mockUseBuilding = jest.fn();

jest.mock('../contexts/building-context', () => ({
  useBuilding: () => mockUseBuilding(),
}));

describe('FloorControls', () => {
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

  describe('Rendering', () => {
    it('renders floor controls container', () => {
      render(<FloorControls />);

      const container = screen.getByRole('region');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('floor-controls');
    });

    it('renders heading for screen readers', () => {
      render(<FloorControls />);

      const heading = screen.getByText('Manual Floor Controls');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('sr-only');
    });

    it('renders controls grid with proper accessibility', () => {
      render(<FloorControls />);

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveAttribute('aria-label', 'Floor control buttons');
    });

    it('renders all floors in reverse order (highest first)', () => {
      render(<FloorControls />);

      const floorLabels = screen.getAllByText(/Floor \d+/);
      expect(floorLabels).toHaveLength(5);
      expect(floorLabels[0]).toHaveTextContent('Floor 5');
      expect(floorLabels[4]).toHaveTextContent('Floor 1');
    });
  });

  describe('Floor control structure', () => {
    it('renders each floor as a grid cell', () => {
      render(<FloorControls />);

      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells).toHaveLength(5);
    });

    it('renders floor number for each floor', () => {
      render(<FloorControls />);

      expect(screen.getByText('Floor 1')).toBeInTheDocument();
      expect(screen.getByText('Floor 2')).toBeInTheDocument();
      expect(screen.getByText('Floor 3')).toBeInTheDocument();
      expect(screen.getByText('Floor 4')).toBeInTheDocument();
      expect(screen.getByText('Floor 5')).toBeInTheDocument();
    });

    it('renders call buttons for each floor', () => {
      render(<FloorControls />);

      const upButtons = screen.getAllByText('↑ Up');
      const downButtons = screen.getAllByText('↓ Down');

      // All floors except the top floor have up buttons, all except floor 1 have down buttons
      expect(upButtons).toHaveLength(4);
      expect(downButtons).toHaveLength(4);
    });
  });

  describe('Call button functionality', () => {
    it('calls elevator up when up button is clicked', async () => {
      const user = userEvent.setup();
      render(<FloorControls />);

      const upButtons = screen.getAllByText('↑ Up');
      const upButton = upButtons[0]; // Floor 4 (first button after reverse)
      expect(upButton).toBeInTheDocument();

      await act(async () => {
        await user.click(upButton!);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CALL_ELEVATOR',
        payload: { floorNumber: 4, direction: ElevatorDirection.Up },
      });
    });

    it('calls elevator down when down button is clicked', async () => {
      const user = userEvent.setup();
      render(<FloorControls />);

      const downButton = screen.getAllByText('↓ Down')[0]; // Floor 5
      await act(async () => {
        await user.click(downButton!);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CALL_ELEVATOR',
        payload: { floorNumber: 5, direction: ElevatorDirection.Down },
      });
    });

    it('handles multiple button clicks', async () => {
      const user = userEvent.setup();
      render(<FloorControls />);

      const upButton = screen.getAllByText('↑ Up')[0];
      const downButton = screen.getAllByText('↓ Down')[0];

      await act(async () => {
        await user.click(upButton!);
      });
      await act(async () => {
        await user.click(downButton!);
      });

      expect(mockDispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Button states', () => {
    it('disables up button when floor has up call', () => {
      const stateWithUpCall = createMockState();
      stateWithUpCall.floors[3]!.hasUpCall = true; // Floor 4 has up call (first button after reverse)
      mockUseBuilding.mockReturnValue({
        state: stateWithUpCall,
        dispatch: mockDispatch,
      });

      render(<FloorControls />);

      const upButtons = screen.getAllByText('↑ Up');
      expect(upButtons[0]).toBeDisabled();
      expect(upButtons[0]).toHaveClass('active');
    });

    it('disables down button when floor has down call', () => {
      const stateWithDownCall = createMockState();
      stateWithDownCall.floors[4]!.hasDownCall = true; // Floor 5 has down call
      mockUseBuilding.mockReturnValue({
        state: stateWithDownCall,
        dispatch: mockDispatch,
      });

      render(<FloorControls />);

      const downButtons = screen.getAllByText('↓ Down');
      expect(downButtons[0]).toBeDisabled();
      expect(downButtons[0]).toHaveClass('active');
    });

    it('enables buttons when floor has no calls', () => {
      render(<FloorControls />);

      const upButtons = screen.getAllByText('↑ Up');
      const downButtons = screen.getAllByText('↓ Down');

      upButtons.forEach(button => {
        expect(button).not.toBeDisabled();
        expect(button).not.toHaveClass('active');
      });

      downButtons.forEach(button => {
        expect(button).not.toBeDisabled();
        expect(button).not.toHaveClass('active');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for buttons', () => {
      render(<FloorControls />);

      const upButtons = screen.getAllByText('↑ Up');
      const downButtons = screen.getAllByText('↓ Down');

      upButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed', 'false');
        expect(button).toHaveAttribute('aria-label');
      });

      downButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed', 'false');
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('has proper ARIA labels for button groups', () => {
      render(<FloorControls />);

      const buttonGroups = screen.getAllByRole('group');
      buttonGroups.forEach(group => {
        expect(group).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Edge cases', () => {
    it('handles single floor building', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(1),
        dispatch: mockDispatch,
      });

      render(<FloorControls />);

      expect(screen.getByText('Floor 1')).toBeInTheDocument();
      expect(screen.queryByText('↑ Up')).not.toBeInTheDocument(); // No up button on single floor
      expect(screen.queryByText('↓ Down')).not.toBeInTheDocument();
    });

    it('handles two floor building', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(2),
        dispatch: mockDispatch,
      });

      render(<FloorControls />);

      expect(screen.getByText('Floor 1')).toBeInTheDocument();
      expect(screen.getByText('Floor 2')).toBeInTheDocument();
      expect(screen.getAllByText('↑ Up')).toHaveLength(1); // Only floor 1 has up button
      expect(screen.getAllByText('↓ Down')).toHaveLength(1); // Only floor 2 has down button
    });

    it('handles large number of floors', () => {
      mockUseBuilding.mockReturnValue({
        state: createMockState(10),
        dispatch: mockDispatch,
      });

      render(<FloorControls />);

      expect(screen.getByText('Floor 10')).toBeInTheDocument();
      expect(screen.getByText('Floor 1')).toBeInTheDocument();
      expect(screen.getAllByText('↑ Up')).toHaveLength(9); // Top floor doesn't have up button
      expect(screen.getAllByText('↓ Down')).toHaveLength(9); // Bottom floor doesn't have down button
    });
  });

  describe('Keyboard navigation', () => {
    it('handles keyboard interactions', async () => {
      const user = userEvent.setup();
      render(<FloorControls />);

      const upButton = screen.getAllByText('↑ Up')[0];
      upButton!.focus();

      await act(async () => {
        await user.keyboard('{Enter}');
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'CALL_ELEVATOR',
        payload: { floorNumber: 4, direction: ElevatorDirection.Up },
      });
    });
  });
});
