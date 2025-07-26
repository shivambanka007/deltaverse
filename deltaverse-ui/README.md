# Deltaverse Frontend - React + Redux

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Loading/
│   │   ├── auth/            # Authentication components
│   │   │   ├── GoogleAuth/
│   │   │   ├── OTPVerification/
│   │   │   ├── LoginForm/
│   │   │   └── ProtectedRoute/
│   │   └── layout/          # Layout components
│   │       ├── Header/
│   │       ├── Footer/
│   │       └── Sidebar/
│   ├── pages/               # Page components
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   └── Profile/
│   ├── store/               # Redux store configuration
│   │   ├── index.js         # Store setup
│   │   ├── slices/          # Redux slices
│   │   │   ├── authSlice.js
│   │   │   ├── userSlice.js
│   │   │   └── appSlice.js
│   │   └── middleware/      # Custom middleware
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useLocalStorage.js
│   ├── services/            # API and external services
│   │   ├── api/
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   └── index.js
│   │   ├── firebase/
│   │   │   ├── config.js
│   │   │   ├── auth.js
│   │   │   └── index.js
│   │   └── storage/
│   ├── utils/               # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── styles/              # Global styles and themes
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── themes/
│   ├── assets/              # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── api.ts
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
├── package-lock.json
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

## Technology Stack

- **React 18** - UI Library
- **Redux Toolkit** - State Management
- **React Router** - Navigation
- **Firebase** - Authentication & Backend
- **Axios** - HTTP Client
- **CSS Modules** - Styling
- **React Hook Form** - Form Management

## Getting Started

1. Install dependencies: `npm install`
2. Copy environment file: `cp .env.example .env.local`
3. Configure Firebase credentials
4. Start development server: `npm start`

## Key Features

- 🔐 Firebase Authentication (Google + Phone OTP)
- 🔄 Redux state management
- 🛡️ Protected routes
- 📱 Responsive design
- 🎨 Component-based architecture
- 🔧 Utility-first approach
