import type { ElevatorCall } from '../types/elevator';

type CallQueueItemProps = {
  call: ElevatorCall;
};

const CallQueueItem = ({ call }: CallQueueItemProps) => {
  const timeInQueue = Math.floor((Date.now() - call.timestamp) / 1000);

  return (
    <div className='queue-item' role='listitem'>
      <div className='call-info'>
        <span
          className='call-floor'
          aria-label={`Call from floor ${call.floorNumber}`}
        >
          Floor {call.floorNumber}
        </span>
        <span
          className={`call-direction ${call.direction.toLowerCase()}`}
          aria-label={`${call.direction} direction call`}
        >
          <span aria-hidden='true'>{call.direction === 'Up' ? '↑' : '↓'}</span>{' '}
          {call.direction}
        </span>
      </div>
      <div
        className='queue-time'
        aria-label={`Call has been in queue for ${timeInQueue} seconds`}
      >
        In queue: {timeInQueue}s
      </div>
    </div>
  );
};

export default CallQueueItem;
