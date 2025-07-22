import { useBuilding } from '@/contexts/building-context';

const FloorNumbers = () => {
  const {
    state: { numberOfFloors },
  } = useBuilding();

  return (
    <div className='floor-numbers' role='grid' aria-label='Floor numbers'>
      {Array.from({ length: numberOfFloors }, (_, i) => {
        const floorNumber = numberOfFloors - i; // Start from top floor
        return (
          <div
            key={floorNumber}
            className='floor-number'
            role='gridcell'
            aria-label={`Floor ${floorNumber}`}
          >
            {floorNumber}
          </div>
        );
      })}
    </div>
  );
};

export default FloorNumbers;
