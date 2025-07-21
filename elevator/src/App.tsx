import './App.css';
import BuildingDisplay from './components/building-display';
import SimulationManager from './components/simulation-manager';
import TabbedSidebar from './components/tabbed-sidebar';
import ThemeToggle from './components/theme-toggle';
import { BuildingProvider } from './contexts/building-context';
import { ThemeProvider } from './contexts/theme-context';

const App = () => {
  return (
    <ThemeProvider>
      <BuildingProvider>
        <div
          className='app'
          role='application'
          aria-label='Elevator Simulation System'
        >
          <header className='app-header' role='banner'>
            <div className='header-content'>
              <h1>Elevator Simulation</h1>
              <ThemeToggle />
            </div>
          </header>
          <main className='app-main' role='main'>
            <div
              className='building-section'
              aria-label='Building visualization'
            >
              <BuildingDisplay />
            </div>
            <div className='controls-section' aria-label='Control panel'>
              <TabbedSidebar />
            </div>
          </main>
          <SimulationManager />
        </div>
      </BuildingProvider>
    </ThemeProvider>
  );
};

export default App;
