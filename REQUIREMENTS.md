# JetCare Frontend - Project Requirements

## 🎯 Project Overview

**JetCare Health Ecosystem Frontend** - A modern, responsive Next.js application for healthcare super-app providing seamless patient-provider interactions.

---

## 🏗️ Tech Stack

### Core Framework
- **Next.js** 16.1.4 - React framework with App Router
- **React** 19.2.3 - UI library
- **TypeScript** 5+ - Type safety
- **Tailwind CSS** 4 - Utility-first styling

### State Management
- **Zustand** 5.0+ - Lightweight state management with persistence
- **TanStack Query** 5.90+ - Server state & caching

### Forms & Validation
- **React Hook Form** 7.71+ - Form management
- **Zod** 4.3+ - Schema validation
- **@hookform/resolvers** 5.2+ - Form-Zod integration

---

## 📦 Required NPM Packages

### UI Components (shadcn/ui + Radix)
```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-separator": "^1.1.8",
  "@radix-ui/react-slider": "^1.3.6",
  "@radix-ui/react-slot": "^1.2.4",
  "@radix-ui/react-tabs": "^1.1.13",
  "@radix-ui/react-tooltip": "^1.2.8",
  "@radix-ui/react-icons": "^1.3.2"
}
```

### Maps & Geolocation
```json
{
  "mapbox-gl": "^3.18.1",
  "react-map-gl": "^8.1.0",
  "@react-google-maps/api": "^2.20.8",
  "leaflet": "^1.9.4",
  "react-leaflet": "^5.0.0",
  "@turf/turf": "^7.3.3"
}
```

### HTTP & Data Fetching
```json
{
  "axios": "^1.13.2",
  "@tanstack/react-query": "^5.90.19"
}
```

### Utilities
```json
{
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "lucide-react": "^0.562.0",
  "date-fns": "^4.1.0",
  "react-day-picker": "^9.13.0"
}
```

---

## 🔌 External APIs & Services Required

### 1. **Google reCAPTCHA** (Bot Protection)
- **Version:** reCAPTCHA v3 (invisible)
- **Required Env Vars:**
  ```bash
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
  ```
- **Installation:**
  ```bash
  npm install react-google-recaptcha-v3
  ```
- **Get Keys:** https://www.google.com/recaptcha/admin

**Implementation:**
```tsx
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

// Wrap app
<GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
  {children}
</GoogleReCaptchaProvider>

// In login/signup
const { executeRecaptcha } = useGoogleReCaptcha();
const token = await executeRecaptcha('login');
// Send token to backend for verification
```

---

### 2. **Mapbox** (Primary Maps)
- **Purpose:** Interactive maps for facility search
- **Required Env Vars:**
  ```bash
  NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-public-token
  ```
- **Pricing:** Free tier - 50,000 loads/month
- **Get Token:** https://www.mapbox.com

**Features:**
- Custom markers for facilities
- User location blue dot
- Smooth animations
- Clustering for many facilities

---

### 3. **Face Recognition (Optional - Advanced)**

#### Option A: **Face-API.js** (Open Source, Client-Side)
```bash
npm install face-api.js
```

**Pros:**
- ✅ Free & open-source
- ✅ Runs in browser (privacy-friendly)
- ✅ No backend needed
- ✅ Face detection, recognition, landmarks

**Implementation:**
```tsx
import * as faceapi from 'face-api.js';

// Load models
await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

// Detect face
const detections = await faceapi
  .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptor();

// Store descriptor in backend for comparison
```

#### Option B: **AWS Rekognition** (Cloud-Based)
- More accurate but costs money
- Requires AWS SDK
- Better for production scale

---

### 4. **Biometric Authentication (Future)**

#### WebAuthn API (Built-in Browser)
```bash
npm install @simplewebauthn/browser
```

**Purpose:** Fingerprint, Face ID on mobile
**Free:** Yes, browser API
**Use Cases:**
- Touch ID on Mac/iPhone
- Face ID on iPhone/iPad
- Fingerprint on Android

```tsx
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Register biometric
const credential = await startRegistration(options);

// Authenticate
const verification = await startAuthentication(options);
```

---

### 5. **Health Data APIs (Future Integration)**

#### Apple HealthKit (iOS)
```bash
npm install react-native-health
```
- Access step count, heart rate, sleep data
- Requires native module

#### Google Fit (Android)
- REST API for health data
- OAuth 2.0 required

---

## 🎨 UI/UX Libraries

### Already Installed
- ✅ **shadcn/ui** - Component library (Radix + Tailwind)
- ✅ **Lucide Icons** - Beautiful icon set
- ✅ **Tailwind CSS** - Utility-first styling

### Recommended Additions

#### 1. **Framer Motion** (Animations)
```bash
npm install framer-motion
```
**Use for:**
- Page transitions
- Modal animations
- Loading skeletons
- Micro-interactions

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### 2. **React Hot Toast** (Notifications)
```bash
npm install react-hot-toast
```
**Use for:**
- Success messages
- Error notifications
- Loading states

```tsx
import toast from 'react-hot-toast';

toast.success('Appointment booked!');
toast.error('Login failed');
```

#### 3. **React Webcam** (Camera Access)
```bash
npm install react-webcam
```
**Use for:**
- Face verification
- Document scanning
- Profile picture upload

---

## 🔐 Security Additions Needed

### 1. **Content Security Policy (CSP)**
Add to `next.config.ts`:
```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://api.mapbox.com;
  frame-src https://www.google.com/recaptcha/;
`;

export default {
  headers: async () => [{
    source: '/(.*)',
    headers: [{ key: 'Content-Security-Policy', value: cspHeader.replace(/\n/g, '') }]
  }]
}
```

### 2. **Input Sanitization**
```bash
npm install dompurify @types/dompurify
```
**Use for:**
- Sanitize user input
- Prevent XSS attacks

```tsx
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirtyHTML);
```

### 3. **Environment Variable Validation**
```bash
npm install zod
```

Create `lib/env.ts`:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
});
```

---

## 🌍 Environment Variables Required

Create `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-public-token

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Production:**
```bash
NEXT_PUBLIC_API_URL=https://api.jetcare.com
```

---

## 📁 Project Structure

```
jetcarefrontend/
├── app/                    # Next.js 16 App Router
│   ├── (auth)/            # Auth routes group
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # Protected routes
│   │   ├── page.tsx
│   │   ├── appointments/
│   │   ├── profile/
│   │   ├── records/
│   │   ├── search/
│   │   └── settings/
│   ├── api/               # API proxy routes
│   │   ├── [...all]/      # Catch-all proxy
│   │   └── auth/login/    # Login handler
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── globals.css
├── components/            # React components
│   ├── auth/
│   ├── dashboard/
│   ├── map/
│   ├── ui/               # shadcn components
│   └── providers.tsx
├── hooks/                # Custom hooks
│   ├── use-auth.ts
│   ├── use-mobile.ts
│   └── queries.ts
├── store/                # Zustand stores
│   └── auth-store.ts
├── lib/                  # Utilities
│   ├── api-client.ts
│   ├── axios.ts
│   └── utils.ts
├── types/                # TypeScript types
│   └── index.ts
├── middleware.ts         # Route protection
├── .env.local           # Environment variables
└── package.json
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
cd c:\Users\HP\code\maincode\jetcarefrontend
npm install
```

### 2. Install Additional Packages
```bash
# Security & Auth
npm install react-google-recaptcha-v3

# Animations & UX
npm install framer-motion react-hot-toast

# Camera & Face Recognition (Optional)
npm install react-webcam face-api.js

# Utilities
npm install dompurify @types/dompurify

# Biometrics (Future)
npm install @simplewebauthn/browser
```

### 3. Setup Environment
```bash
# Create .env.local
cp .env.example .env.local

# Add your keys
```

### 4. Run Development Server
```bash
npm run dev
```

Access at: http://localhost:3000

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🧪 Testing Setup (Recommended)

```bash
# Install testing libraries
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Install Playwright for E2E
npm install -D @playwright/test
```

---

## 📊 Performance Optimization

### 1. **Image Optimization**
```bash
npm install sharp  # Next.js automatic image optimization
```

### 2. **Bundle Analysis**
```bash
npm install -D @next/bundle-analyzer
```

Add to `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});
```

Run: `ANALYZE=true npm run build`

### 3. **Lazy Loading**
```tsx
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map'), { ssr: false });
```

---

## 🔄 Future Enhancements

### PWA (Progressive Web App)
```bash
npm install next-pwa
```
- Offline support
- Install on home screen
- Push notifications

### Real-time Updates
```bash
npm install socket.io-client
```
- Live chat updates
- Real-time appointment notifications

### Payment Integration
```bash
npm install @paystack/inline-js
# OR
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 📝 Code Quality Tools

```bash
# ESLint (already installed)
# Prettier
npm install -D prettier eslint-config-prettier

# Husky (Git hooks)
npm install -D husky lint-staged

# TypeScript strict mode
# Add to tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 🎯 Minimum Viable Product (MVP) Checklist

### Core Features (Current)
- [x] Authentication (login/signup/logout)
- [x] User profile management
- [x] Dashboard layout
- [x] Facility map search
- [x] Appointment booking UI
- [x] Medical records view
- [x] Real-time chat UI

### Security Enhancements (Needed)
- [ ] reCAPTCHA on login/signup
- [ ] Face recognition (optional)
- [ ] Biometric authentication
- [ ] Input sanitization
- [ ] CSP headers

### UX Improvements (Needed)
- [ ] Loading animations
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Page transitions
- [ ] Mobile optimization

---

**Last Updated:** 2026-02-04  
**Version:** 0.1.0  
**Status:** Development
