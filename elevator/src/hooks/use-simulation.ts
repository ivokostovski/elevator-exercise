import { useCallback, useEffect } from 'react';
import {
  RANDOM_CALL_INTERVAL_MAX,
  RANDOM_CALL_INTERVAL_MIN,
  TICK_INTERVAL,
} from '../constants/elevator';
import { useBuilding } from '../contexts/building-context';
import { ElevatorDirection } from '../types/elevator';

export const useSimulation = () => {
  const { state, dispatch } = useBuilding();

  // Handle the main simulation tick
  useEffect(() => {
    const tickTimer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, TICK_INTERVAL);
    return () => clearInterval(tickTimer);
  }, [dispatch]);

  // Handle random elevator calls
  const generateRandomCall = useCallback(() => {
    const randomFloor = Math.floor(Math.random() * state.numberOfFloors) + 1;
    const randomDirection =
      Math.random() > 0.5 ? ElevatorDirection.Up : ElevatorDirection.Down;

    // Ensure direction is valid for edge floors
    if (randomFloor === 1) {
      dispatch({
        type: 'CALL_ELEVATOR',
        payload: { floorNumber: randomFloor, direction: ElevatorDirection.Up },
      });
    } else if (randomFloor === state.numberOfFloors) {
      dispatch({
        type: 'CALL_ELEVATOR',
        payload: {
          floorNumber: randomFloor,
          direction: ElevatorDirection.Down,
        },
      });
    } else {
      dispatch({
        type: 'CALL_ELEVATOR',
        payload: { floorNumber: randomFloor, direction: randomDirection },
      });
    }

    const nextCallTime =
      Math.random() * (RANDOM_CALL_INTERVAL_MAX - RANDOM_CALL_INTERVAL_MIN) +
      RANDOM_CALL_INTERVAL_MIN;
    setTimeout(generateRandomCall, nextCallTime);
  }, [state.numberOfFloors, dispatch]);

  useEffect(() => {
    // Start generating random calls after initial render
    const initialCallTime =
      Math.random() * (RANDOM_CALL_INTERVAL_MAX - RANDOM_CALL_INTERVAL_MIN) +
      RANDOM_CALL_INTERVAL_MIN;
    const initialTimer = setTimeout(generateRandomCall, initialCallTime);
    return () => clearTimeout(initialTimer);
  }, [generateRandomCall]);
};
