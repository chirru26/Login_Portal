# Cosmic Authentication System

A modern, visually engaging authentication system that transforms login experience into an immersive cosmic journey with comprehensive user registration and security features.

![Cosmic Authentication System](https://i.imgur.com/Oj8VXmH.png)

## 🌌 Features

### ✨ Visual Experience
- **Dynamic Star Field Animation**: Interactive background with shooting stars that move across the screen
- **Cosmic Theme**: Gradient text, glowing elements, and space-inspired design
- **Dark/Light Mode Support**: Full theme support with persistent user preference

### 🔒 Authentication Features
- **Comprehensive User Registration**:
  - First and last name
  - Username
  - Contact method (email or phone)
  - Secure password with confirmation
  - Authentication code support
  - CAPTCHA verification

- **Enhanced Login Security**:
  - CAPTCHA verification
  - Remember me functionality
  - Show/hide password toggle
  - Input validation
  - Error handling

- **User Session Management**:
  - Persistent login sessions
  - Secure logout
  - Protected routes

## 🚀 Technology Stack

### Frontend
- **React**: UI component library
- **TypeScript**: Type safety and better developer experience
- **TanStack Query**: Data fetching and state management
- **Shadcn UI**: UI component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Zod**: Schema validation
- **React Hook Form**: Form handling with validation
- **Wouter**: Lightweight routing library

### Backend
- **Express**: Web server framework
- **Passport.js**: Authentication middleware
- **PostgreSQL**: Relational database
- **Drizzle ORM**: Database ORM
- **Express Session**: Session management
- **Crypto**: Password hashing and security

### DevOps & Tools
- **Vite**: Fast, modern frontend build tool
- **Node.js**: JavaScript runtime
- **TSX**: TypeScript execution environment

## 📋 Database Schema

The application uses a PostgreSQL database with the following schema:

```typescript
// User table
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

## 🔧 How to Run the Project

1. **Prerequisites**:
   - Node.js (v14 or later)
   - PostgreSQL database

2. **Environment Setup**:
   ```
   # Clone the repository
   git clone <repository-url>
   cd cosmic-auth-system
   
   # Install dependencies
   npm install
   ```

3. **Database Configuration**:
   - Create a PostgreSQL database
   - Set the DATABASE_URL environment variable:
   ```
   export DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   ```

4. **Database Setup**:
   ```
   # Push schema changes to the database
   npm run db:push
   ```

5. **Run the Application**:
   ```
   # Start the development server
   npm run dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:5000`

## 🛠️ Project Structure

```
├── client/                   # Frontend code
│   ├── src/                  # Source files
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   └── star-field.tsx # Custom animation component
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # Application pages
│   │   └── App.tsx           # Main application component
├── db/                       # Database related files
│   ├── index.ts              # Database connection
│   └── seed.ts               # Database seeding
├── server/                   # Backend code
│   ├── auth.ts               # Authentication logic
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database operations
│   └── index.ts              # Server entry point
├── shared/                   # Shared code between frontend and backend
│   └── schema.ts             # Database schema and validation
└── package.json              # Project dependencies
```

## 🔐 Security Features

1. **Password Security**:
   - Passwords are hashed using scrypt with a random salt
   - Password show/hide toggle for better user experience

2. **CAPTCHA Protection**:
   - Both login and registration forms have CAPTCHA verification
   - CAPTCHA codes are dynamically generated

3. **Input Validation**:
   - Client-side validation using Zod schemas
   - Server-side validation for all input

4. **Session Management**:
   - Secure cookies for session storage
   - Session expiry and automatic logout

## 🎨 UI/UX Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Animated Transitions**: Smooth transitions between states
- **Accessibility**: Screen reader support, keyboard navigation
- **Error Messaging**: Clear error messages for failed operations
- **Form Validation Feedback**: Real-time validation feedback

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Shadcn UI](https://ui.shadcn.com/) for beautiful component designs
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Drizzle ORM](https://orm.drizzle.team/) for database operations