# Smart Garden IoT Application

A React-based IoT application for monitoring and controlling smart garden devices.

## Project Structure

```
smart-garden-iot/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SensorDataCard.jsx
│   │   ├── DeviceControlPanel.jsx
│   │   ├── Calendar.jsx
│   │   ├── PlantCard.jsx
│   │   ├── PlantDetailModal.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── BottomNavigation.jsx
│   │   └── ErrorAlert.jsx
│   ├── services/
│   │   └── api.js
│   ├── hooks/
│   │   ├── useSensorData.js
│   │   ├── useDeviceControl.js
│   │   └── usePlants.js
│   ├── utils/
│   │   └── constants.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Features

- Sensor data monitoring
- Device control panel
- Plant management
- Calendar integration
- Real-time updates
