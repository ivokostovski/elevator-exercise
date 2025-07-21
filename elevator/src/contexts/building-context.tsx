import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import type { BuildingAction, BuildingState } from '../types/elevator';
import { initialBuildingState } from '../types/elevator';
import { initializeBuilding } from '../utils/building-initializer';
import { handleCallElevator } from '../utils/call-handler';
import { handleToggleElevatorDisabled } from '../utils/elevator-disabler';
import { handleTick } from '../utils/tick-handler';

const buildingReducer = (
  state: BuildingState,
  action: BuildingAction
): BuildingState => {
  switch (action.type) {
    case 'INITIALIZE_BUILDING':
      return initializeBuilding(state);
    case 'CALL_ELEVATOR':
      return handleCallElevator(state, action.payload);
    case 'TICK':
      return handleTick(state);
    case 'TOGGLE_ELEVATOR_DISABLED':
      return handleToggleElevatorDisabled(state, action.payload);
    default:
      return state;
  }
};

export const BuildingContext = createContext<{
  state: BuildingState;
  dispatch: React.Dispatch<BuildingAction>;
}>({
  state: initialBuildingState,
  dispatch: () => null,
});

export const BuildingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(buildingReducer, initialBuildingState);

  useEffect(() => {
    dispatch({ type: 'INITIALIZE_BUILDING' });
  }, []);

  return (
    <BuildingContext.Provider value={{ state, dispatch }}>
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => useContext(BuildingContext);
