import type { Elevator } from '../../types/elevator';
import ElevatorIndicator from './elevator-indicator';

type ElevatorShaftProps = {
  elevator: Elevator;
  numberOfFloors: number;
};

const ElevatorShaft = ({ elevator, numberOfFloors }: ElevatorShaftProps) => {
  return (
    <div
      className='elevator-shaft'
      role='grid'
      aria-label={`Elevator ${elevator.id} shaft`}
      aria-describedby={`elevator-${elevator.id}-status`}
    >
      {Array.from({ length: numberOfFloors }, (_, i) => {
        const floorNumber = numberOfFloors - i; // Start from top floor
        const isElevatorHere = elevator.currentFloor === floorNumber;

        return (
          <div
            key={floorNumber}
            className='elevator-cell'
            role='gridcell'
            aria-label={`Floor ${floorNumber}${isElevatorHere ? ` - Elevator ${elevator.id} present` : ''}`}
          >
            {isElevatorHere && <ElevatorIndicator elevator={elevator} />}
          </div>
        );
      })}
    </div>
  );
};

export default ElevatorShaft;
