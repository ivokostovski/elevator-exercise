export function generateRandomPassengers(
  currentFloor: number,
  numberOfFloors: number
): { destinationFloor: number }[] {
  const numPassengers = Math.floor(Math.random() * 3) + 1; // 1-3 passengers
  const passengers: { destinationFloor: number }[] = [];

  for (let i = 0; i < numPassengers; i++) {
    let destinationFloor = currentFloor;
    while (destinationFloor === currentFloor) {
      destinationFloor = Math.floor(Math.random() * numberOfFloors) + 1;
    }
    passengers.push({ destinationFloor });
  }
  return passengers;
}
