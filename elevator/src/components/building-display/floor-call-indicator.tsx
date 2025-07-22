import type { Floor } from '../../types/elevator';

const generateFloorCallAriaLabel = (
  floorNumber: number,
  floor?: Floor
): string => {
  const baseLabel = `Floor ${floorNumber} calls`;

  if (!floor) {
    return baseLabel;
  }

  const callParts: string[] = [];

  if (floor.hasUpCall) {
    callParts.push('Up call active');
  }

  if (floor.hasDownCall) {
    callParts.push('Down call active');
  }

  if (callParts.length === 0) {
    return baseLabel;
  }

  return `${baseLabel} - ${callParts.join(' - ')}`;
};

type FloorCallIndicatorProps = {
  floorNumber: number;
  floor: Floor | undefined;
};

const FloorCallIndicator = ({
  floorNumber,
  floor,
}: FloorCallIndicatorProps) => {
  const hasAnyCall = floor?.hasUpCall || floor?.hasDownCall;

  return (
    <div
      className={`floor-call-indicator ${!hasAnyCall ? 'no-calls' : ''}`}
      role='gridcell'
      aria-label={generateFloorCallAriaLabel(floorNumber, floor)}
    >
      <div className='call-buttons' aria-hidden='true'>
        {floor?.hasUpCall && <span className='call-up'>↑</span>}
        {floor?.hasDownCall && <span className='call-down'>↓</span>}
      </div>
    </div>
  );
};

export default FloorCallIndicator;
