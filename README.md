# 🌐 JetCare Health Ecosystem - Frontend

<div align="center">

![JetCare](https://img.shields.io/badge/JetCare-Health%20Frontend-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-teal)

**A modern, responsive healthcare platform frontend built with Next.js 16 App Router**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

JetCare Frontend is a comprehensive healthcare web application enabling:

- 🏥 **Patients** to find nearby healthcare facilities on interactive maps
- 📅 **Appointment** booking with doctors and labs
- 📊 **Dashboard** for managing health records, prescriptions, and test results
- 💬 **Real-time chat** with healthcare providers
- 🔐 **Secure authentication** with HttpOnly cookies and Zustand persistence
- 🗺️ **Geolocation** search for facilities within custom radius

Built with the latest Next.js 16, React 19, and modern web technologies.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT authentication with HttpOnly cookies (XSS-proof)
- Zustand + localStorage for persistent user state
- Protected routes with middleware
- Automatic token refresh
- Secure logout with complete state cleanup

### 🎨 Modern UI/UX
- shadcn/ui components (Radix primitives)
- Tailwind CSS 4 with custom design system
- Responsive design (mobile-first)
- Dark mode ready
- Lucide React icons

### 🗺️ Interactive Maps
- Mapbox GL for smooth map interactions
- User location detection with blue dot marker
- Recenter button for easy navigation
- Facility clustering
- Distance calculation & display

### 📍 Facility Search
- Find nearby doctors, labs, and pharmacies
- Radius-based filtering (1-50km)
- Real-time OpenStreetMap data via Overpass API
- List view with distance & details

### 📊 Dashboard
- Overview with health stats
- Appointment management
- Medical records upload & view
- Prescription tracking
- Lab results display
- Profile settings

### 💬 Real-Time Communication
- Chat UI components
- WebSocket integration (in progress)
- Message persistence
- Online status indicators

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.4 (App Router) |
| **Language** | TypeScript 5+ |
| **UI Library** | React 19.2.3 |
| **Styling** | Tailwind CSS 4 |
| **Components** | shadcn/ui + Radix UI |
| **State** | Zustand 5.0 (with persistence) |
| **Server State** | TanStack Query 5.90 |
| **Forms** | React Hook Form + Zod |
| **Maps** | Mapbox GL 3.18 + Leaflet |
| **HTTP** | Axios 1.13 |
| **Icons** | Lucide React |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn
- Backend API running (see [backend README](../jetcare/README.md))

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd c:\Users\HP\code\maincode\jetcarefrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Create .env.local
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Open http://localhost:3000
   - Login or create an account

### Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
jetcarefrontend/
├── app/                      # Next.js 16 App Router
│   ├── (auth)/              # Auth routes (login, signup)
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── appointments/
│   │   ├── profile/
│   │   ├── records/
│   │   ├── search/
│   │   └── settings/
│   ├── api/                 # API routes
│   │   ├── [...all]/        # Proxy to backend
│   │   └── auth/login/      # Login handler
│   ├── layout.tsx
│   ├── page.tsx            # Landing page
│   └── globals.css
├── components/              # React components
│   ├── auth/               # Login/signup forms
│   ├── dashboard/          # Dashboard components
│   ├── map/                # Map components
│   └── ui/                 # shadcn/ui components
├── hooks/                  # Custom React hooks
│   ├── use-auth.ts        # Authentication hook
│   ├── use-mobile.ts      # Responsive hook
│   └── queries.ts         # TanStack Query hooks
├── store/                 # Zustand stores
│   └── auth-store.ts     # Auth state with persistence
├── lib/                   # Utilities
│   ├── api-client.ts     # Axios instance
│   └── utils.ts          # Helper functions
├── types/                # TypeScript types
│   └── index.ts
├── middleware.ts         # Route protection
├── .env.local           # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🔐 Authentication Flow

### Login Process
1. User enters credentials
2. Frontend sends to `/api/auth/login`
3. Backend validates & returns user data + sets HttpOnly cookies
4. Frontend stores user data in Zustand (→ localStorage)
5. Redirect to dashboard

### Page Reload
1. Zustand loads user from localStorage (instant display)
2. Middleware checks for `access_token` cookie
3. If valid, fetch fresh user data from `/auth/me`
4. Update Zustand with latest data

### Logout
1. Call `/api/auth/logout`
2. Clear both Zustand state AND React Query cache
3. Cookies cleared by backend
4. Redirect to `/login`

---

## 🗺️ Map Integration

### Mapbox Setup
1. Get free API key from https://www.mapbox.com
2. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token-here
   ```

### Features
- User location with blue dot marker
- Smooth animation to location
- Custom markers for facilities
- Recenter button
- Clustering for many markers
- Distance calculation

---

## 📚 Key Components

### Authentication
- `components/auth/login-form.tsx` - Login UI
- `components/auth/signup-form.tsx` - Registration UI
- `store/auth-store.ts` - Persistent auth state
- `hooks/use-auth.ts` - Auth hook with TanStack Query

### Dashboard
- `components/dashboard/app-sidebar.tsx` - Main navigation
- `components/dashboard/stats-cards.tsx` - Health stats
- `app/dashboard/page.tsx` - Dashboard home

### Map
- `components/map/mapbox-provider-map.tsx` - Main map component
- `hooks/use-overpass.ts` - Facility search hook

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

### Adding New Pages

1. Create file in `app/` directory:
   ```tsx
   // app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page</div>
   }
   ```

2. Add to sidebar navigation:
   ```tsx
   // components/dashboard/app-sidebar.tsx
   const items = [
     { title: "New Page", url: "/new-page", icon: Icon }
   ]
   ```

### Adding New Components

Use shadcn CLI:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
```

---

## 🔒 Security

### Current Implementation
- ✅ HttpOnly cookies for JWT tokens
- ✅ Zustand persistence for non-sensitive user data
- ✅ Middleware route protection
- ✅ CSRF protection (`SameSite=Strict`)
- ✅ Input validation with Zod

### Planned Enhancements
- [ ] reCAPTCHA on auth forms
- [ ] Content Security Policy headers
- [ ] Input sanitization (DOMPurify)
- [ ] Face recognition (optional)
- [ ] Biometric authentication

**See [REQUIREMENTS.md](./REQUIREMENTS.md) for security checklist.**

---

## 🌍 Environment Variables

### Required

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Maps (get from mapbox.com)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-public-token
```

### Optional (Future)

```bash
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**⚠️ Never commit `.env.local` to Git!**

---

## 🎨 Customization

### Tailwind Theme

Edit `app/globals.css`:
```css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... */
  }
}
```

### Custom Components

Follow shadcn pattern:
```tsx
import { cn } from "@/lib/utils"

interface Props {
  className?: string
}

export function MyComponent({ className }: Props) {
  return <div className={cn("base-classes", className)} />
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy!

**Auto-deploys:** Push to `main` = production deploy

### Other Platforms

- **Netlify** - Similar to Vercel
- **AWS Amplify** - AWS integration
- **DigitalOcean App Platform** - Full-stack hosting
- **Render** - Simple deployment

### Environment Setup

Set in hosting platform dashboard:
```
NEXT_PUBLIC_API_URL=https://api.jetcare.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.production-token
```

---

## 📊 Performance

### Optimization Techniques

1. **Image Optimization**
   ```tsx
   import Image from 'next/image'
   <Image src="/photo.jpg" width={500} height={300} alt="..." />
   ```

2. **Dynamic Imports**
   ```tsx
   const Map = dynamic(() => import('@/components/map'), { ssr: false })
   ```

3. **React Query Caching**
   ```tsx
   staleTime: 5 * 60 * 1000  // 5 minutes
   ```

### Performance Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

---

## 🧪 Testing (Future)

### Unit Tests
```bash
npm install -D @testing-library/react @testing-library/jest-dom
npm run test
```

### E2E Tests
```bash
npm install -D @playwright/test
npx playwright test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

### Code Style
- Follow TypeScript strict mode
- Use Prettier for formatting
- Follow ESLint rules
- Add JSDoc comments for complex functions

---

## 📝 Documentation

- **[REQUIREMENTS.md](./REQUIREMENTS.md)** - Dependencies & APIs
- **[PROGRESS.md](./PROGRESS.md)** - Development progress
- **[Backend README](../jetcare/README.md)** - Backend documentation

---

## 🗺️ Roadmap

### Current (v0.1.0) ✅
- [x] Authentication & state management
- [x] Dashboard layout
- [x] Map integration
- [x] Facility search
- [x] Basic appointment UI

### Next (v0.2.0) 🚧
- [ ] reCAPTCHA integration
- [ ] Real-time chat (WebSocket)
- [ ] Toast notifications
- [ ] Loading animations

### Future (v0.3.0+) 📋
- [ ] Face recognition
- [ ] Payment integration
- [ ] PWA features
- [ ] Push notifications

---

## ⚠️ Known Issues

- Chat UI exists but WebSocket not connected
- No loading states on slow connections
- Mobile sidebar doesn't auto-close on navigation

See [PROGRESS.md](./PROGRESS.md) for full list.

---

## 📄 License

MIT License - See [LICENSE](../LICENSE)

---

## 👨‍💻 Authors

- **Lead Developer** - [Your Name]
- **Contributors** - See contributors list

---

## 📞 Support

- **Issues:** GitHub Issues
- **Email:** support@jetcare.com
- **Docs:** See REQUIREMENTS.md and PROGRESS.md

---

## 🙏 Acknowledgments

- Next.js team for amazing framework
- shadcn for beautiful components
- Radix UI for accessible primitives
- Mapbox for mapping platform

---

<div align="center">

**Built with ❤️ for accessible healthcare**

[⬆ Back to Top](#-jetcare-health-ecosystem---frontend)

</div>
