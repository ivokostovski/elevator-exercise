import { useBuilding } from '@/contexts/building-context';
import ElevatorShaft from './elevator-shaft';
import FloorCalls from './floor-calls';

const BuildingGrid = () => {
  const {
    state: { elevators },
  } = useBuilding();

  return (
    <div
      className='building-grid'
      role='grid'
      aria-label='Building grid layout'
    >
      {elevators.map(elevator => (
        <ElevatorShaft key={elevator.id} elevator={elevator} />
      ))}

      <FloorCalls />
    </div>
  );
};

export default BuildingGrid;
