import { useBuilding } from '../contexts/building-context';
import type { Elevator } from '../types/elevator';
import {
  getStatusClass,
  getStatusIcon,
  getStatusLabel,
} from '../utils/elevator-status-helpers';

type ElevatorDebugItemProps = {
  elevator: Elevator;
};

const ElevatorDebugItem = ({ elevator }: ElevatorDebugItemProps) => {
  const { dispatch } = useBuilding();

  const handleToggleElevator = (elevatorId: string, isDisabled: boolean) => {
    dispatch({
      type: 'TOGGLE_ELEVATOR_DISABLED',
      payload: { elevatorId, isDisabled },
    });
  };

  return (
    <div className='elevator-item' role='listitem'>
      <div className='elevator-header'>
        <h4 id={`elevator-${elevator.id}-title`}>{elevator.id}</h4>
        <label
          className='toggle-switch'
          aria-label={`Toggle ${elevator.id} ${elevator.isDisabled ? 'enabled' : 'disabled'}`}
        >
          <input
            type='checkbox'
            checked={!elevator.isDisabled}
            onChange={e => handleToggleElevator(elevator.id, !e.target.checked)}
            aria-describedby={`elevator-${elevator.id}-title`}
          />
          <span className='slider' aria-hidden='true'></span>
        </label>
      </div>
      <div
        className='elevator-details'
        role='region'
        aria-labelledby={`elevator-${elevator.id}-title`}
      >
        <div className='detail-row'>
          <span>Floor:</span>
          <span
            aria-label={`${elevator.id} is on floor ${elevator.currentFloor}`}
          >
            {elevator.currentFloor}
          </span>
        </div>
        <div className='detail-row'>
          <span
            className={`status ${getStatusClass(elevator)}`}
            aria-label={`${elevator.id} status: ${getStatusLabel(elevator)}`}
          >
            <span aria-hidden='true'>{getStatusIcon(elevator)}</span>{' '}
            {getStatusLabel(elevator)}
          </span>
        </div>
        <div className='detail-row'>
          <span>Direction:</span>
          <span aria-label={`${elevator.id} direction: ${elevator.direction}`}>
            {elevator.direction}
          </span>
        </div>
        <div className='detail-row'>
          <span>Doors:</span>
          <span aria-label={`${elevator.id} doors: ${elevator.doorStatus}`}>
            {elevator.doorStatus}
          </span>
        </div>
        <div className='detail-row'>
          <span>Passengers:</span>
          <span
            aria-label={`${elevator.id} has ${elevator.passengers.length} passenger${elevator.passengers.length !== 1 ? 's' : ''}`}
          >
            {elevator.passengers.length}
          </span>
        </div>
        <div className='detail-row destinations-row'>
          <span>Destinations:</span>
          <div className='destinations-list'>
            {elevator.destinationFloors.length > 0 ? (
              elevator.destinationFloors.length > 7 ? (
                <>
                  <span
                    aria-label={`${elevator.id} destinations: ${elevator.destinationFloors.slice(0, 7).join(', ')} and more`}
                  >
                    {elevator.destinationFloors.slice(0, 7).join(', ')}
                  </span>
                  <span className='destinations-more' aria-hidden='true'>
                    ...
                  </span>
                </>
              ) : (
                <span
                  aria-label={`${elevator.id} destinations: ${elevator.destinationFloors.join(', ')}`}
                >
                  {elevator.destinationFloors.join(', ')}
                </span>
              )
            ) : (
              <span aria-label={`${elevator.id} has no destinations`}>
                None
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevatorDebugItem;
