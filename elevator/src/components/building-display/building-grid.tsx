import type { Elevator, Floor } from '../../types/elevator';
import ElevatorShaft from './elevator-shaft';
import FloorCalls from './floor-calls';

type BuildingGridProps = {
  elevators: Elevator[];
  floors: Floor[];
  numberOfFloors: number;
};

const BuildingGrid = ({
  elevators,
  floors,
  numberOfFloors,
}: BuildingGridProps) => {
  return (
    <div
      className='building-grid'
      role='grid'
      aria-label='Building grid layout'
    >
      {/* Elevator shafts */}
      {elevators.map(elevator => (
        <ElevatorShaft
          key={elevator.id}
          elevator={elevator}
          numberOfFloors={numberOfFloors}
        />
      ))}

      {/* Floor call indicators on the right */}
      <FloorCalls floors={floors} numberOfFloors={numberOfFloors} />
    </div>
  );
};

export default BuildingGrid;
