# Cosmic Authentication System - Technical Documentation

## Architecture Overview

This document provides technical details and implementation guidelines for developers working on the Cosmic Authentication System.

### System Architecture

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│   React UI     │◄────►│  Express API   │◄────►│   PostgreSQL   │
│                │      │                │      │                │
└────────────────┘      └────────────────┘      └────────────────┘
```

The application follows a modern full-stack JavaScript architecture with:
- Frontend: React with TypeScript
- API: Express.js server
- Database: PostgreSQL with Drizzle ORM

## Frontend Implementation

### Core Components

#### Authentication Context (`client/src/hooks/use-auth.tsx`)

The central state management for authentication using React Context API and TanStack Query.

```typescript
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // User data
  const { data: user, error, isLoading } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login, logout, register mutations
  const loginMutation = useMutation({ /* ... */ });
  const registerMutation = useMutation({ /* ... */ });
  const logoutMutation = useMutation({ /* ... */ });

  // Context value
  return (
    <AuthContext.Provider value={{ user, isLoading, error, loginMutation, logoutMutation, registerMutation }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### Protected Routes (`client/src/lib/protected-route.tsx`)

Handles route protection for authenticated users:

```typescript
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}
```

#### Star Field Animation (`client/src/components/star-field.tsx`)

Custom canvas-based animation for the cosmic background:

```typescript
export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Canvas setup
    // Animation logic for stars and shooting stars
    // Event listeners for interactive effects
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 -z-10" />;
}
```

### Form Implementation

The application uses React Hook Form with Zod validation:

```typescript
// Form schemas (shared/schema.ts)
export const insertUserSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  captchaToken: z.string().min(1, "Please complete the captcha"),
  authCode: z.string().optional().or(z.literal("")),
}).refine(/* password match validation */);

// Form usage (client/src/pages/auth-page.tsx)
const registerForm = useForm<RegisterFormValues>({
  resolver: zodResolver(insertUserSchema),
  defaultValues: { /* ... */ },
});
```

## Backend Implementation

### Authentication Flow (`server/auth.ts`)

1. **Registration Flow**:
   ```
   Client Registration Form → 
   Validate Input → 
   Check Username Availability → 
   Hash Password → 
   Store User in Database → 
   Create Session → 
   Return User Data
   ```

2. **Login Flow**:
   ```
   Client Login Form → 
   Validate Input → 
   Authenticate Using Passport → 
   Create Session → 
   Return User Data
   ```

3. **Authentication Middleware**:
   ```javascript
   function isAuthenticated(req, res, next) {
     if (req.isAuthenticated()) {
       return next();
     }
     res.status(401).json({ message: "Not authenticated" });
   }
   ```

### Password Security (`server/auth.ts`)

The application uses the Node.js crypto module with scrypt for secure password hashing:

```typescript
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
```

### Session Management

Session data is stored in memory using memorystore, which provides a production-ready in-memory session store:

```typescript
// Import the memory store
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

// Configure session settings
const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "super-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  }
};
```

## Database Implementation

### PostgreSQL Connection Setup (`db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Create a PostgreSQL client
export const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
});

// Export PostgreSQL pool for session store
export const pool = {
  connect: async () => client,
  query: async (text: string, params: any[] = []) => {
    return client.unsafe(text, params);
  },
  end: async () => {
    await client.end();
  }
};

// Export the drizzle instance
export const db = drizzle(client, { schema });
```

### Schema Definition (`shared/schema.ts`)

```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email"),
  phone: text("phone"),
  password: text("password").notNull(),
  authCode: text("auth_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Database Operations (`server/storage.ts`)

```typescript
// Example: Creating a user
async createUser(user: DbUser): Promise<SelectUser> {
  try {
    console.log("🔍 Validating user data against schema...");
    // Validate the user data against our schema
    const validUser = userDbSchema.parse(user);
    console.log("✅ User data validated successfully");
    
    // Log the validated data (excluding sensitive info)
    console.log("📊 Validated user data:", {
      username: validUser.username,
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      email: validUser.email,
      phone: validUser.phone,
      hasAuthCode: !!validUser.authCode,
    });
    
    console.log("🔄 Inserting user into database...");
    // Insert the user into the database
    await db.insert(users).values(validUser);
    
    // For PostgreSQL, we need to fetch the user by username to get the created user with its ID
    console.log("🔍 Retrieving newly created user...");
    const insertedUser = await db.query.users.findFirst({
      where: eq(users.username, validUser.username)
    });
    
    if (!insertedUser) {
      throw new Error("Failed to retrieve inserted user");
    }

    console.log(`✅ User inserted successfully with ID: ${insertedUser.id}`);
    return insertedUser;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  }
}
```

## CAPTCHA Implementation

The application uses a client-side CAPTCHA implementation for validation:

```typescript
// Generate random CAPTCHA code
const generateCaptchaCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Validate CAPTCHA on form submission
if (enteredCaptcha !== captchaCode) {
  form.setError('captchaToken', { 
    type: 'manual', 
    message: 'CAPTCHA verification failed. Please try again.' 
  });
  refreshCaptcha();
  return;
}
```

## Theme System

The application uses a custom theme provider with CSS variables:

```typescript
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove old theme class
    root.classList.remove("light", "dark");

    // Add new theme class
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  // Context value
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Deployment Considerations

1. **Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SESSION_SECRET`: Secret for session cookie encryption
   - `NODE_ENV`: Environment (development/production)

2. **Production Optimizations**:
   - Enable HTTPS for secure cookies
   - Set up database connection pooling
   - Implement rate limiting for authentication routes
   - Add CSRF protection

3. **Scaling**:
   - Use a load balancer for multiple instances
   - Consider Redis for session storage in clustered environments
   - Implement database replication for read scaling

## Development Workflow

1. **Setup Development Environment**:
   ```bash
   npm install           # Install dependencies
   npm run db:push       # Update database schema
   npm run dev           # Start development server
   ```

2. **Testing**:
   ```bash
   npm run test          # Run test suite
   npm run test:e2e      # Run end-to-end tests
   ```

3. **Database Migration**:
   ```bash
   npm run db:generate   # Generate migration
   npm run db:migrate    # Apply migrations
   ```

## Future Enhancements

1. **Security Enhancements**:
   - Two-factor authentication
   - Email verification
   - OAuth integration

2. **User Experience**:
   - Password strength meter
   - Progressive web app support
   - Accessibility improvements

3. **Backend Improvements**:
   - GraphQL API
   - Microservices architecture
   - Serverless functions

## Troubleshooting

### Common Issues

1. **Database Connection Failures**:
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL service is running
   - Check network connectivity and firewall settings

2. **Authentication Issues**:
   - Verify session store is properly configured
   - Check password hashing implementation
   - Inspect cookie settings and secure flag

3. **UI Rendering Problems**:
   - Check for React key prop warnings
   - Verify theme CSS variables
   - Inspect component prop types

### Debugging Tools

- Client-side logging via browser console
- Server-side logging via console.log and dedicated logger
- Database query logging via Drizzle ORM debug mode

## API Reference

### Authentication Endpoints

- `POST /api/register`: Create a new user account
- `POST /api/login`: Authenticate a user
- `POST /api/logout`: End a user session
- `GET /api/user`: Get the current authenticated user

### Request/Response Examples

#### Register User

```
POST /api/register
{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "captchaToken": "abc123",
  "authCode": ""
}

Response 201:
{
  "id": 1,
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": null,
  "authCode": null,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Login User

```
POST /api/login
{
  "username": "johndoe",
  "password": "securePassword123",
  "captchaToken": "abc123"
}

Response 200:
{
  "id": 1,
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": null,
  "authCode": null,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```