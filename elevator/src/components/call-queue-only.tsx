import { useBuilding } from '../contexts/building-context';
import type { ElevatorCall } from '../types/elevator';

const CallQueueOnly = () => {
  const { state } = useBuilding();

  return (
    <div
      className='call-queue-only'
      role='region'
      aria-labelledby='call-queue-heading'
    >
      <h2 id='call-queue-heading'>📞 Call Queue</h2>
      <div className='queue-list' role='list' aria-label='Elevator call queue'>
        {state.elevatorCallQueue.length === 0 ? (
          <div className='queue-empty' role='listitem'>
            <p>No pending calls</p>
          </div>
        ) : (
          state.elevatorCallQueue.map((call: ElevatorCall, index: number) => {
            const timeInQueue = Math.floor(
              (Date.now() - call.timestamp) / 1000
            );
            return (
              <div key={index} className='queue-item' role='listitem'>
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
                    <span aria-hidden='true'>
                      {call.direction === 'Up' ? '↑' : '↓'}
                    </span>{' '}
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
          })
        )}
      </div>
    </div>
  );
};

export default CallQueueOnly;
