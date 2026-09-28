# Caloryx Mobile

A minimal, modern health, fitness, and nutrition tracking mobile application built with React Native and Expo. Caloryx unifies workout logging, macro tracking, daily activity, hydration, and sleep into a clean, single-view wellness platform.

---

## Features

- **Daily Dashboard**: Centralized day overview tracking steps, nutrition calories/macros, active workouts, hydration, and sleep.
- **Workout Tracking**: Active session logger with set-by-set previous performance context (`PREV: weight × reps`), muscle group distribution visualization, and custom routines.
- **Nutrition & Macros**: Calorie and macro target tracking (protein, carbs, fat), fast food search with caching, and custom meal logging.
- **Health & Recovery**: Step tracking via Health Connect (Android) with Pedometer fallback, hydration logging with quick-add presets, and sleep duration/quality tracking.
- **Personalized Goals**: Built-in BMR and TDEE calculators, goal adjustments (fat loss, maintenance, muscle gain), and body stat tracking.
- **Offline & Guest Mode**: Full offline-first functionality with local storage, plus optional Supabase cloud sync and automatic guest-to-account migration.

---

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) (0.86) with [Expo](https://expo.dev/) (SDK 57)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation)
- **Language**: TypeScript
- **Backend & Auth**: [Supabase](https://supabase.com/)
- **Local Storage**: `@react-native-async-storage/async-storage`
- **Health & Sensors**: `react-native-health-connect` & `expo-sensors`

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone, or an Android/iOS emulator

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. (Optional) Configure environment variables for Supabase in a `.env` file:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

   *Note: Caloryx can be run completely in Guest Mode without Supabase credentials.*

### Running the App

Start the Expo development server:

```bash
npx expo start
```

- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code using the **Expo Go** app on your physical device

To run validation checks:

```bash
npm run lint         # Run ESLint
npx tsc --noEmit     # Check TypeScript types
```

---

## Project Structure

```text
src/
├── app/          # Expo Router routes (tabs, workout flows, auth, profile)
├── components/   # UI components organized by feature (dashboard, nutrition, workout, profile, common)
├── context/      # State management (AuthContext, HealthContext, NutritionContext, WorkoutContext)
├── services/     # Cloud synchronization and external APIs (Supabase, step tracking)
├── storage/      # Local persistence handlers (AsyncStorage)
├── styles/       # Design tokens, colors, typography, and spacing
├── types/        # TypeScript domain models (health, nutrition, workout)
└── utils/        # Calculation logic (BMR/TDEE, workout volume, dates, progress)
```
