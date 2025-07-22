import { useBuilding } from '@/contexts/building-context';
import BuildingGrid from './building-display/building-grid';
import FloorNumbers from './building-display/floor-numbers';

const BuildingDisplay = () => {
  const {
    state: { numberOfFloors, elevators },
  } = useBuilding();

  return (
    <div
      className='building-display'
      role='region'
      aria-labelledby='building-view-heading'
    >
      <h2 id='building-view-heading'>Building View</h2>
      <div
        className='building-container'
        role='grid'
        aria-label={`${numberOfFloors}-floor building with ${elevators.length} elevators`}
      >
        <FloorNumbers />
        <BuildingGrid />
      </div>
    </div>
  );
};

export default BuildingDisplay;
