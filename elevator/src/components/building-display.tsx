import { useBuilding } from '../contexts/building-context';
import BuildingGrid from './building-display/building-grid';
import FloorNumbers from './building-display/floor-numbers';

const BuildingDisplay = () => {
  const { state } = useBuilding();

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
        aria-label={`${state.numberOfFloors}-floor building with ${state.elevators.length} elevators`}
      >
        <FloorNumbers numberOfFloors={state.numberOfFloors} />
        <BuildingGrid
          elevators={state.elevators}
          floors={state.floors}
          numberOfFloors={state.numberOfFloors}
        />
      </div>
    </div>
  );
};

export default BuildingDisplay;
