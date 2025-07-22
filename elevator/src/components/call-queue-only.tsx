import { useBuilding } from '../contexts/building-context';
import CallQueueItem from './call-queue-item';

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
          state.elevatorCallQueue.map(call => (
            <CallQueueItem key={call.timestamp} call={call} />
          ))
        )}
      </div>
    </div>
  );
};

export default CallQueueOnly;
