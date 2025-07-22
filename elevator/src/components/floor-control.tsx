import { useBuilding } from '@/contexts/building-context';
import type { Floor } from '../types/elevator';
import { ElevatorDirection } from '../types/elevator';

type FloorControlProps = {
  floor: Floor;
  numberOfFloors: number;
};

const FloorControl = ({ floor, numberOfFloors }: FloorControlProps) => {
  const { dispatch } = useBuilding();

  const handleCallElevator = (
    floorNumber: number,
    direction: ElevatorDirection
  ) => {
    dispatch({
      type: 'CALL_ELEVATOR',
      payload: { floorNumber, direction },
    });
  };

  return (
    <div className='floor-control' role='gridcell'>
      <div className='floor-number' id={`floor-${floor.floorNumber}-label`}>
        Floor {floor.floorNumber}
      </div>
      <div
        className='call-buttons'
        role='group'
        aria-labelledby={`floor-${floor.floorNumber}-label`}
      >
        {floor.floorNumber < numberOfFloors && (
          <button
            className={`call-button up ${floor.hasUpCall ? 'active' : ''}`}
            onClick={() =>
              handleCallElevator(floor.floorNumber, ElevatorDirection.Up)
            }
            disabled={floor.hasUpCall}
            aria-pressed={floor.hasUpCall}
            aria-label={`Call elevator up from floor ${floor.floorNumber}${floor.hasUpCall ? ' - Already called' : ''}`}
          >
            ↑ Up
          </button>
        )}
        {floor.floorNumber > 1 && (
          <button
            className={`call-button down ${floor.hasDownCall ? 'active' : ''}`}
            onClick={() =>
              handleCallElevator(floor.floorNumber, ElevatorDirection.Down)
            }
            disabled={floor.hasDownCall}
            aria-pressed={floor.hasDownCall}
            aria-label={`Call elevator down from floor ${floor.floorNumber}${floor.hasDownCall ? ' - Already called' : ''}`}
          >
            ↓ Down
          </button>
        )}
      </div>
    </div>
  );
};

export default FloorControl;
