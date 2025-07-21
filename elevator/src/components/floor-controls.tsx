import { useBuilding } from '../contexts/building-context';
import { ElevatorDirection } from '../types/elevator';

const FloorControls = () => {
  const { state, dispatch } = useBuilding();

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
    <div
      className='floor-controls'
      role='region'
      aria-labelledby='floor-controls-heading'
    >
      <h3 id='floor-controls-heading' className='sr-only'>
        Manual Floor Controls
      </h3>
      <div
        className='controls-grid'
        role='grid'
        aria-label='Floor control buttons'
      >
        {state.floors
          .slice()
          .reverse() // Display higher floors at the top
          .map(floor => (
            <div
              key={floor.floorNumber}
              className='floor-control'
              role='gridcell'
            >
              <div
                className='floor-number'
                id={`floor-${floor.floorNumber}-label`}
              >
                Floor {floor.floorNumber}
              </div>
              <div
                className='call-buttons'
                role='group'
                aria-labelledby={`floor-${floor.floorNumber}-label`}
              >
                {floor.floorNumber < state.numberOfFloors && (
                  <button
                    className={`call-button up ${floor.hasUpCall ? 'active' : ''}`}
                    onClick={() =>
                      handleCallElevator(
                        floor.floorNumber,
                        ElevatorDirection.Up
                      )
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
                      handleCallElevator(
                        floor.floorNumber,
                        ElevatorDirection.Down
                      )
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
          ))}
      </div>
    </div>
  );
};

export default FloorControls;
