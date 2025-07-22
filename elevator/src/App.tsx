import './App.css';
import BuildingDisplay from './components/building-display';
import TabbedSidebar from './components/tabbed-sidebar';
import ThemeToggle from './components/theme-toggle';
import { BuildingProvider } from './contexts/building-context';
import { ThemeProvider } from './contexts/theme-context';
import { useSimulation } from './hooks/use-simulation';

const App = () => {
  return (
    <ThemeProvider>
      <BuildingProvider>
        <AppContent />
      </BuildingProvider>
    </ThemeProvider>
  );
};

const AppContent = () => {
  useSimulation();

  return (
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
        <div className='building-section' aria-label='Building visualization'>
          <BuildingDisplay />
        </div>
        <div className='controls-section' aria-label='Control panel'>
          <TabbedSidebar />
        </div>
      </main>
    </div>
  );
};

export default App;
