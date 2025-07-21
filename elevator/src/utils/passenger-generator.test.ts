import { generateRandomPassengers } from './passenger-generator';

describe('passenger-generator', () => {
  beforeEach(() => {
    // Mock Math.random to make tests deterministic and avoid infinite loops
    let callCount = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      // Return different values to avoid infinite loops
      // For passenger count: 0.5 -> 2 passengers
      // For destination floors: cycle through different values
      if (callCount <= 1) return 0.5; // For passenger count
      return ((callCount - 1) % 4) / 4; // Returns 0, 0.25, 0.5, 0.75, 0, 0.25, ...
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate 1-3 passengers', () => {
    const passengers = generateRandomPassengers(1, 5);
    expect(passengers.length).toBeGreaterThanOrEqual(1);
    expect(passengers.length).toBeLessThanOrEqual(3);
  });

  it('should generate passengers with different destination floors', () => {
    const passengers = generateRandomPassengers(1, 5);
    const destinations = passengers.map(p => p.destinationFloor);

    // All destinations should be different from current floor
    destinations.forEach(dest => {
      expect(dest).not.toBe(1);
    });

    // All destinations should be within valid range
    destinations.forEach(dest => {
      expect(dest).toBeGreaterThanOrEqual(1);
      expect(dest).toBeLessThanOrEqual(5);
    });
  });

  it('should generate passengers for two-floor building and expect valid destination floors', () => {
    const passengers = generateRandomPassengers(1, 2);
    expect(passengers.length).toBeGreaterThanOrEqual(1);

    passengers.forEach(p => {
      expect(p.destinationFloor).toBe(2); // Only valid destination
    });
  });

  it('should generate passengers when current floor is in middle of building and expect valid destinations', () => {
    const passengers = generateRandomPassengers(3, 5);

    passengers.forEach(p => {
      expect(p.destinationFloor).not.toBe(3);
      expect(p.destinationFloor).toBeGreaterThanOrEqual(1);
      expect(p.destinationFloor).toBeLessThanOrEqual(5);
    });
  });

  it('should generate passengers when current floor is at top of building and expect valid destinations', () => {
    const passengers = generateRandomPassengers(5, 5);

    passengers.forEach(p => {
      expect(p.destinationFloor).toBeGreaterThanOrEqual(1);
      expect(p.destinationFloor).toBeLessThanOrEqual(5);
    });
  });

  it('should generate passengers when current floor is at bottom of building and expect valid destinations', () => {
    const passengers = generateRandomPassengers(1, 5);

    passengers.forEach(p => {
      expect(p.destinationFloor).not.toBe(1);
      expect(p.destinationFloor).toBeGreaterThanOrEqual(1);
      expect(p.destinationFloor).toBeLessThanOrEqual(5);
    });
  });

  it('should generate passengers for large building with many floors and expect valid destinations', () => {
    const passengers = generateRandomPassengers(50, 100);

    passengers.forEach(p => {
      expect(p.destinationFloor).not.toBe(50);
      expect(p.destinationFloor).toBeGreaterThanOrEqual(1);
      expect(p.destinationFloor).toBeLessThanOrEqual(100);
    });
  });

  it('should return array with correct structure', () => {
    const passengers = generateRandomPassengers(1, 5);

    passengers.forEach(p => {
      expect(p).toHaveProperty('destinationFloor');
      expect(typeof p.destinationFloor).toBe('number');
    });
  });
});
