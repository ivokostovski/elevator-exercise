import { useState } from 'react';
import CallQueueOnly from './call-queue-only';
import ElevatorDebug from './elevator-debug';
import FloorControls from './floor-controls';

enum TabType {
  Controls = 'controls',
  Status = 'status',
  Queue = 'queue',
}

const TabbedSidebar = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.Controls);

  const tabs = [
    { id: TabType.Controls, label: 'Manual Controls', icon: '🎛️' },
    { id: TabType.Status, label: 'Elevator Status', icon: '🏢' },
    { id: TabType.Queue, label: 'Call Queue', icon: '📞' },
  ];

  return (
    <div
      className='tabbed-sidebar'
      role='tablist'
      aria-label='Control panel tabs'
    >
      <div
        className='tab-navigation'
        role='tablist'
        aria-label='Tab navigation'
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role='tab'
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            <span className='tab-icon' aria-hidden='true'>
              {tab.icon}
            </span>
            <span className='tab-label'>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className='tab-content'>
        {activeTab === TabType.Controls && (
          <div
            role='tabpanel'
            id='tabpanel-controls'
            aria-labelledby='tab-controls'
          >
            <FloorControls />
          </div>
        )}
        {activeTab === TabType.Status && (
          <div
            role='tabpanel'
            id='tabpanel-status'
            aria-labelledby='tab-status'
          >
            <ElevatorDebug />
          </div>
        )}
        {activeTab === TabType.Queue && (
          <div role='tabpanel' id='tabpanel-queue' aria-labelledby='tab-queue'>
            <CallQueueOnly />
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedSidebar;
