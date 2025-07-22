import { useBuilding } from '@/contexts/building-context';
import FloorCallIndicator from './floor-call-indicator';

const FloorCalls = () => {
  const {
    state: { numberOfFloors, floors },
  } = useBuilding();

  return (
    <div className='floor-calls' role='grid' aria-label='Floor call indicators'>
      {Array.from({ length: numberOfFloors }, (_, i) => {
        const floorNumber = numberOfFloors - i; // Start from top floor
        const floor = floors.find(f => f.floorNumber === floorNumber);

        return (
          <FloorCallIndicator
            key={floorNumber}
            floorNumber={floorNumber}
            floor={floor}
          />
        );
      })}
    </div>
  );
};

export default FloorCalls;
