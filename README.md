# Elevator Exercise

## Table of Contents

- [Main Requirements](#main-requirements)
- [My Solution](#my-solution)
- [Features](#features)
- [Algorithm](#algorithm)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation & Usage](#installation--usage)
- [Development](#development)
- [Testing](#testing)
- [Code Style](#code-style)
- [Tools Used](#tools-used)

## Main Requirements

_Note_: Since you are applying for a Senior Frontend Developer position, we expect a more refined and interactive web-based user interface as part of your submission. While the original assignment mentions that the UI can be as simple as console logging, this does not apply in your case. Your solution should include a clear, functional web UI that visually represents elevator movements and system status.

Design and program an elementary elevator control system. The focus is only on moving and tracking elevators in a building - real world concerns like weight limits, fire control, overrides, holds, etc., are beyond the scope of the program.

### Parameters for the program:

- The building has 10 floors
- There are four elevators
- It takes 10 seconds for an elevator car to move from one floor to the next
- When a car stops on a floor, it takes 10 seconds for passengers to enter / leave and then the car is ready to move again

Write a program that generates random calls for the elevator on floors throughout the building. The elevator cars will move to pick up passengers and debark them. The algorithm can be simple and naive, but in general, an "up" elevator should keep going up until it has no more passengers and the same for a "down" elevator - an elevator shouldn't yo-yo up and down between floors while still containing passengers. A demonstrated optimized algorithm is extra credit, but not necessary. The program should indicate the relative position of the elevator cars (car 1 is on floor 3, car 2 is on floor 10) and user actions ("down" request on floor 4 received, "up" request on floor 7 received); this can be as simple as console logging - more complicated UI is extra credit.

No one expects this to be "production ready". It's a simple programming exercise. Don't get complicated or worry about on-offs / special cases. However, do treat this as "production code" and not a one-time script; assume it is code that will be reviewed, must be maintained, will be augmented later, etc. Give us an idea of what your code will be like when submitted on an actual real-world project. We're not looking for 'clever' code or a full application, but rather an example of your coding style. Clean code, appropriate comments and adequate test coverage are appreciated.

C# and TypeScript are used extensively on our projects, but feel free to use whatever programming language you prefer.

## My Solution

My solution is a simple one-page application that allows an administrator to control the elevators in a building. The building is configurable completely, it can have any number of floors and elevators. I use methods that do continuous random calls for the elevators, but the calls can also be made manually by a person through the `Manual control` tab. The sidebar contains two more tabs: `Call queue` and `Elevator list`. The `Call queue` tab shows the call queue for the elevators, and the `Elevator list` tab shows the list of elevators with their current status.

## Features

- **Configurable Building**: Set any number of floors and elevators
- **Real-time Visualization**: Visual representation of elevator movements and building status
- **Multiple Control Modes**:
  - Automatic random call generation
  - Manual control for testing specific scenarios
- **Interactive UI**: Three-tab sidebar with manual controls, call queue, and elevator status
- **Theme Support**: Light and dark mode for better accessibility
- **Responsive Design**: Works on different screen sizes

## Algorithm

My solution is inspired by React Redux state management, but I am using Context API instead of Redux as a better option, but I am utilizing useReducer hook to manage the state and helper functions to update the state based on different actions which are / can be dispatched.

The main algorithm is located / initiated in the `building-context.tsx` file. It is a simple algorithm that moves the elevators up and down, picks up passengers, and drops them off.

### Key Algorithm Features:

- **Direction-based Movement**: Elevators maintain their direction until no more passengers need to go that way
- **Efficient Routing**: Minimizes unnecessary stops and direction changes
- **Queue Management**: Proper handling of multiple calls and passenger destinations

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Context API** - State management
- **React Hooks** - Functional components and state management

## Architecture

```
src/
├── components/          # React components
│   ├── building-display/    # Building visualization components
│   └── ...                 # Other UI components
├── constants/          # Application constants and default values
├── contexts/           # React Context providers
├── styles/             # Global styles and CSS variables
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

Each component goes in pair with a corresponding `.css` file.

## Installation & Usage

### Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd elevator-exercise/elevator

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Development

### Linting and Formatting

- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting
- **TypeScript** - Type checking and configuration

All of them are configured in a minimalistic way just to show how I would do it in a real-world project.

### Styling

I prefer using plain CSS for styling, or using Tailwind CSS with or without a Tailwind based component library, based on the project requirements. In this case, I decided to use plain CSS.

- I use plain CSS for styling, and I am also utilizing CSS variables to make the styling more dynamic and reusable.
- I have implemented theming to make the UI more accessible and user-friendly.
- I am using unicode Icons (⬆️⬇️⏳💤✅🚫) which are universally recognizable, but I am fully aware that it is still not a good practice, and would probably not be used in a real-world project, and move to some regular characters + some icon library.

## Testing

- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **Coverage Reports** - Built-in coverage reporting

I have implemented unit tests for both functions and some of the components, to show how I would do it in a real-world project.

## Code Style

### Naming Conventions

I like to follow the following naming conventions:

- **File Names**: kebab-case (e.g., `building-display.tsx`)
- **Variables**: camelCase (e.g., `currentFloor`)
- **Components**: PascalCase (e.g., `BuildingDisplay`)
- **Constants**: UPPERCASE_SNAKE_CASE (e.g., `MAX_FLOORS`)

### Principles for Writing Code

I prefer to use longer and well descriptive names for variables, functions, components, etc. I believe that is much more important to have readable code than to have a shorter code, so I prefer to use nested loops instead of chained Higher Order Functions, as it is much more readable, easier to understand, easier to maintain, and easier to debug.

Regarding comments, I prefer not to use them and try to make the code as self-explanatory as possible. But, in case of complex logic, I would use comments to explain the code.

### Code Organization

- Each component in its own file
- Utility functions separated into dedicated files
- Clear separation of concerns
- Consistent file structure

## Tools Used

My tools of choice for this project are:

- **Cursor** - AI-assisted coding
- **Warp** - Terminal
- **GitKraken** - Git client
