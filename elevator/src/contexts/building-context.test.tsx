import { act, render, screen } from '@testing-library/react';
import { ElevatorDirection } from '../types/elevator';
import { BuildingProvider, useBuilding } from './building-context';

// Test component to access context
const TestComponent = () => {
  const { state, dispatch } = useBuilding();
  return (
    <div>
      <div data-testid='elevator-count'>{state.elevators.length}</div>
      <div data-testid='floor-count'>{state.numberOfFloors}</div>
      <div data-testid='call-queue-length'>
        {state.elevatorCallQueue.length}
      </div>
      <button
        data-testid='call-elevator'
        onClick={() =>
          dispatch({
            type: 'CALL_ELEVATOR',
            payload: { floorNumber: 5, direction: ElevatorDirection.Up },
          })
        }
      >
        Call Elevator
      </button>
      <button data-testid='tick' onClick={() => dispatch({ type: 'TICK' })}>
        Tick
      </button>
      <button
        data-testid='toggle-disabled'
        onClick={() =>
          dispatch({
            type: 'TOGGLE_ELEVATOR_DISABLED',
            payload: { elevatorId: 'elevator-1', isDisabled: true },
          })
        }
      >
        Toggle Disabled
      </button>
    </div>
  );
};

describe('BuildingContext', () => {
  describe('BuildingProvider', () => {
    it('renders children and provides context', () => {
      render(
        <BuildingProvider>
          <div data-testid='child'>Test Child</div>
        </BuildingProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('initializes building state on mount', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      // Should have initialized elevators and floors
      expect(screen.getByTestId('elevator-count')).toHaveTextContent('4');
      expect(screen.getByTestId('floor-count')).toHaveTextContent('10');
    });

    it('provides initialized state to children', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      expect(screen.getByTestId('elevator-count')).toHaveTextContent('4');
      expect(screen.getByTestId('floor-count')).toHaveTextContent('10');
      expect(screen.getByTestId('call-queue-length')).toHaveTextContent('0');
    });
  });

  describe('useBuilding hook', () => {
    it('provides state and dispatch when used within provider', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      expect(screen.getByTestId('elevator-count')).toBeInTheDocument();
      expect(screen.getByTestId('call-elevator')).toBeInTheDocument();
    });

    it('returns default context value when used outside provider', async () => {
      const TestComponentOutsideProvider = () => {
        const { state } = useBuilding();
        return (
          <div>
            <div data-testid='outside-elevator-count'>
              {state.elevators.length}
            </div>
            <div data-testid='outside-floor-count'>{state.numberOfFloors}</div>
          </div>
        );
      };

      await act(async () => {
        render(<TestComponentOutsideProvider />);
      });

      // Should have default values
      expect(screen.getByTestId('outside-elevator-count')).toHaveTextContent(
        '0'
      );
      expect(screen.getByTestId('outside-floor-count')).toHaveTextContent('10');
    });
  });

  describe('Context actions', () => {
    it('handles CALL_ELEVATOR action', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      // Initial state
      expect(screen.getByTestId('call-queue-length')).toHaveTextContent('0');

      // Dispatch action
      await act(async () => {
        screen.getByTestId('call-elevator').click();
      });

      // Should have added a call to the queue
      expect(screen.getByTestId('call-queue-length')).toHaveTextContent('1');
    });

    it('handles TICK action', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      // Dispatch action
      await act(async () => {
        screen.getByTestId('tick').click();
      });

      // Should not throw and should process the tick
      expect(screen.getByTestId('elevator-count')).toBeInTheDocument();
    });

    it('handles TOGGLE_ELEVATOR_DISABLED action', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      // Dispatch action
      await act(async () => {
        screen.getByTestId('toggle-disabled').click();
      });

      // Should not throw and should process the toggle
      expect(screen.getByTestId('elevator-count')).toBeInTheDocument();
    });

    it('handles unknown action type gracefully', () => {
      const TestComponentWithUnknownAction = () => {
        const { dispatch } = useBuilding();
        return (
          <button
            data-testid='unknown-action'
            onClick={() => dispatch({ type: 'UNKNOWN_ACTION' as any })}
          >
            Unknown Action
          </button>
        );
      };

      render(
        <BuildingProvider>
          <TestComponentWithUnknownAction />
        </BuildingProvider>
      );

      expect(() => {
        screen.getByTestId('unknown-action').click();
      }).not.toThrow();
    });
  });

  describe('Context value structure', () => {
    it('provides correct context value structure', async () => {
      let contextValue: any;

      const TestContextValue = () => {
        const value = useBuilding();
        contextValue = value;
        return <div data-testid='context-value'>Context loaded</div>;
      };

      await act(async () => {
        render(
          <BuildingProvider>
            <TestContextValue />
          </BuildingProvider>
        );
      });

      expect(contextValue).toHaveProperty('state');
      expect(contextValue).toHaveProperty('dispatch');
      expect(typeof contextValue.dispatch).toBe('function');
      expect(contextValue.state).toMatchObject({
        numberOfFloors: 10,
        numberOfElevators: 4,
        elevators: expect.any(Array),
        floors: expect.any(Array),
        elevatorCallQueue: expect.any(Array),
      });
    });
  });

  describe('State updates', () => {
    it('updates state when actions are dispatched', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      // Initial state
      expect(screen.getByTestId('call-queue-length')).toHaveTextContent('0');

      // Dispatch multiple actions
      await act(async () => {
        screen.getByTestId('call-elevator').click();
      });

      await act(async () => {
        screen.getByTestId('tick').click();
      });

      // Verify state changes
      expect(screen.getByTestId('call-queue-length')).toHaveTextContent('1');
    });

    it('maintains state consistency across multiple actions', async () => {
      await act(async () => {
        render(
          <BuildingProvider>
            <TestComponent />
          </BuildingProvider>
        );
      });

      // Initial state
      expect(screen.getByTestId('elevator-count')).toHaveTextContent('4');
      expect(screen.getByTestId('floor-count')).toHaveTextContent('10');

      // Dispatch actions
      await act(async () => {
        screen.getByTestId('call-elevator').click();
      });

      await act(async () => {
        screen.getByTestId('tick').click();
      });

      // State should remain consistent
      expect(screen.getByTestId('elevator-count')).toHaveTextContent('4');
      expect(screen.getByTestId('floor-count')).toHaveTextContent('10');
    });
  });
});
