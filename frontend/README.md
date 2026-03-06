# Frontend - Next.js Application

Production-ready Next.js frontend with TypeScript, Tailwind CSS, authentication, and modern UI components.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Authentication** with JWT and Context API
- **API Integration** with Axios interceptors
- **Protected Routes** with authentication guards
- **Modern UI** with responsive design
- **Form Validation** and error handling

## 📁 Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   └── page.tsx           # Protected dashboard
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Registration page
│   ├── layout.tsx             # Root layout with AuthProvider
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   └── apiClient.ts           # Axios instance with interceptors
├── services/
│   └── authService.ts         # Authentication API calls
├── .env.local.example         # Environment variables template
└── package.json
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5005/api/v1
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## 📱 Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | User login | Public |
| `/register` | User registration | Public |
| `/dashboard` | User dashboard | Protected |

## 🔐 Authentication Flow

1. **Registration**: User creates account → Token stored in localStorage
2. **Login**: User authenticates → Token stored in localStorage
3. **Protected Routes**: Check authentication → Redirect to login if not authenticated
4. **API Calls**: Axios interceptor adds token to all requests
5. **Logout**: Clear localStorage and redirect to login

## 🎨 UI Components

### Landing Page
- Gradient background with glassmorphism
- Feature cards
- Call-to-action buttons

### Login/Register Pages
- Form validation
- Error handling
- Loading states
- Responsive design

### Dashboard
- User profile display
- Stats cards
- Protected route with auth check
- Logout functionality

## 🔧 API Integration

### API Client (`lib/apiClient.ts`)
- Axios instance with base URL
- Request interceptor: Adds JWT token
- Response interceptor: Handles errors and 401 redirects

### Auth Service (`services/authService.ts`)
- `register()` - Register new user
- `login()` - Authenticate user
- `logout()` - Clear session
- `getProfile()` - Fetch user profile
- `updateProfile()` - Update user data

### Auth Context (`contexts/AuthContext.tsx`)
- Global authentication state
- User data management
- Authentication methods
- `useAuth()` hook for components

## 📦 Dependencies

```json
{
  "next": "^15.x",
  "react": "^19.x",
  "typescript": "^5.x",
  "tailwindcss": "^4.x",
  "axios": "^1.x"
}
```

## 🎯 Usage Examples

### Using Auth Context
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state and methods
}
```

### Making API Calls
```tsx
import apiClient from '@/lib/apiClient';

const response = await apiClient.get('/some-endpoint');
```

### Protected Route Pattern
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null;

  return <div>Protected Content</div>;
}
```

## 🔒 Security Features

- JWT token authentication
- Automatic token injection in API calls
- Protected routes with authentication guards
- Secure token storage in localStorage
- Automatic redirect on 401 errors
- CORS configuration

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Responsive Design** mobile-first approach
- **Gradient Backgrounds** for modern look
- **Glassmorphism** effects
- **Smooth Transitions** and animations

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:5005/api/v1 |
| `NEXT_PUBLIC_APP_NAME` | Application name | My Application |

## 🧪 Testing

```bash
npm test
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Adding New Features

1. **Create Page** in `app/[route]/page.tsx`
2. **Create Service** in `services/` for API calls
3. **Add Context** if needed for state management
4. **Style with Tailwind** CSS utilities

## 🤝 Integration with Backend

Ensure backend is running on `http://localhost:5005` and CORS is configured to allow `http://localhost:3000`.

## 📄 License

ISC
