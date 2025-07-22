import { useBuilding } from '../contexts/building-context';
import ElevatorDebugItem from './elevator-debug-item';

const ElevatorDebug = () => {
  const { state } = useBuilding();

  return (
    <div
      className='elevator-debug'
      role='region'
      aria-labelledby='elevator-status-heading'
    >
      <h3 id='elevator-status-heading' className='sr-only'>
        Elevator Status Information
      </h3>
      <div
        className='elevator-list'
        role='list'
        aria-label='Elevator status list'
      >
        {state.elevators.map(elevator => (
          <ElevatorDebugItem key={elevator.id} elevator={elevator} />
        ))}
      </div>
    </div>
  );
};

export default ElevatorDebug;
