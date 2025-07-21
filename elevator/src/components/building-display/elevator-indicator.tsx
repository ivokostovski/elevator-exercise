import type { Elevator } from '../../types/elevator';
import { getElevatorColor } from '../../utils/elevator-color-utils';

type ElevatorIndicatorProps = {
  elevator: Elevator;
};

const ElevatorIndicator = ({ elevator }: ElevatorIndicatorProps) => {
  return (
    <div
      className='elevator-indicator'
      style={{ backgroundColor: getElevatorColor(elevator) }}
      role='status'
      id={`elevator-${elevator.id}-status`}
      aria-label={`Elevator ${elevator.id} - ${elevator.statusMessage}${elevator.passengers.length > 0 ? ` with ${elevator.passengers.length} passenger${elevator.passengers.length !== 1 ? 's' : ''}` : ''}`}
    >
      <div className='elevator-id' aria-hidden='true'>
        {elevator.id}
      </div>
      <div className='elevator-status' aria-hidden='true'>
        {elevator.statusMessage}
      </div>
      {elevator.passengers.length > 0 && (
        <div className='passenger-count' aria-hidden='true'>
          👥 {elevator.passengers.length}
        </div>
      )}
    </div>
  );
};

export default ElevatorIndicator;
