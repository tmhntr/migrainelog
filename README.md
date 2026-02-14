# MigraineLog

A mobile application for tracking migraine triggers, episodes, and treatments. Built with React Native and local SQLite storage for complete data privacy.

## Features

- **Quick Logging Widget** — Log a trigger, episode, or treatment directly from a home screen widget without opening the app.
- **Event Management** — Create, view, update, and delete triggers, episodes, and treatments within the app.
- **Risk Level Indicator** — View your current migraine risk level at a glance via a widget or in-app display, calculated from recent triggers and historical patterns.
- **Dashboard** — View recent events and summary statistics including frequency trends, common triggers, and treatment effectiveness.

## Tech Stack

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Storage:** SQLite (local, on-device)
- **State Management:** Zustand
- **Navigation:** React Navigation
- **Widget:** react-native-widget-extension (iOS) / native widget module (Android)
- **Charts:** Victory Native or react-native-chart-kit

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # App screens (Dashboard, EventList, EventDetail, Settings)
├── db/               # SQLite schema, migrations, and query helpers
├── models/           # TypeScript types for Trigger, Episode, Treatment
├── stores/           # Zustand state stores
├── widgets/          # Widget configuration and shared data
├── utils/            # Risk calculation, date helpers, statistics
└── navigation/       # React Navigation stack/tab config
```

## Data Model

### Trigger
A potential migraine trigger observed by the user (e.g., poor sleep, stress, certain food).

### Episode
A migraine occurrence with severity, duration, symptoms, and optional notes.

### Treatment
An action taken to prevent or relieve a migraine (e.g., medication, rest, hydration).

All events share a timestamp and optional notes. Events link together by proximity in time to support pattern analysis.

## Getting Started

```bash
# Install dependencies
npm install

# Start the Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## License

MIT
