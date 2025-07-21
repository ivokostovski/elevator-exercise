import type { Floor } from '../../types/elevator';

type FloorCallsProps = {
  floors: Floor[];
  numberOfFloors: number;
};

const FloorCalls = ({ floors, numberOfFloors }: FloorCallsProps) => {
  return (
    <div className='floor-calls' role='grid' aria-label='Floor call indicators'>
      {Array.from({ length: numberOfFloors }, (_, i) => {
        const floorNumber = numberOfFloors - i; // Start from top floor
        const floor = floors.find(f => f.floorNumber === floorNumber);
        const hasAnyCall = floor?.hasUpCall || floor?.hasDownCall;

        return (
          <div
            key={floorNumber}
            className={`floor-call-indicator ${!hasAnyCall ? 'no-calls' : ''}`}
            role='gridcell'
            aria-label={`Floor ${floorNumber} calls${floor?.hasUpCall ? ' - Up call active' : ''}${floor?.hasDownCall ? ' - Down call active' : ''}`}
          >
            <div className='call-buttons' aria-hidden='true'>
              {floor?.hasUpCall && <span className='call-up'>↑</span>}
              {floor?.hasDownCall && <span className='call-down'>↓</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FloorCalls;
