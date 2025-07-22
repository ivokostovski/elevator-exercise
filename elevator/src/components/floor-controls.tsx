import { useBuilding } from '../contexts/building-context';
import FloorControl from './floor-control';

const FloorControls = () => {
  const {
    state: { floors, numberOfFloors },
  } = useBuilding();

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
        {floors
          .slice()
          .reverse() // Display higher floors at the top
          .map(floor => (
            <FloorControl
              key={floor.floorNumber}
              floor={floor}
              numberOfFloors={numberOfFloors}
            />
          ))}
      </div>
    </div>
  );
};

export default FloorControls;
