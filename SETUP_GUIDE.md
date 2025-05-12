# Cosmic Authentication System - Setup Guide

This guide walks you through the setup process for the Cosmic Authentication System from scratch.

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- Git (for cloning the repository)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/cosmic-auth-system.git
cd cosmic-auth-system
```

## Step 2: Install Dependencies

Install all required dependencies with npm:

```bash
npm install
```

This will install both frontend and backend dependencies, including:
- React and TypeScript
- Express.js
- Drizzle ORM
- Passport.js
- PostgreSQL client libraries
- UI components and utilities

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/cosmic_auth

# Session security
SESSION_SECRET=your_secure_random_string_here

# Node environment
NODE_ENV=development
```

Make sure to replace the placeholder values with your actual PostgreSQL connection details.

## Step 4: Set Up the Database

1. Create a PostgreSQL database:

```bash
createdb cosmic_auth
```

2. Push the schema to the database:

```bash
npm run db:push
```

This will create the necessary tables in your PostgreSQL database based on the schema defined in the application.

## Step 5: Start the Development Server

Run the application in development mode:

```bash
npm run dev
```

This starts both the Express backend server and the React frontend application.

## Step 6: Access the Application

Open your browser and navigate to:

```
http://localhost:5000
```

You should see the Cosmic Authentication System login page with the animated star field background.

## Authentication Features

The system comes with the following authentication features:

- **User Registration**: Create new user accounts with comprehensive profile information
- **Login**: Secure authentication with password hashing
- **CAPTCHA Protection**: CAPTCHA verification on both login and registration
- **Session Management**: Persistent sessions with secure cookies
- **Password Security**: Password hashing with scrypt and salt

## Troubleshooting

### Database Connection Issues

If you experience problems connecting to the database:

1. Verify your PostgreSQL server is running:
```bash
pg_isready
```

2. Confirm your DATABASE_URL is correct in the .env file
3. Ensure your PostgreSQL user has permission to create tables

### Session Store Errors

If you see errors related to the session store:

1. Make sure your PostgreSQL user has permissions to create the session table
2. Check that the SESSION_SECRET environment variable is set

### Frontend Assets Not Loading

If the frontend doesn't load properly:

1. Clear your browser cache
2. Check the browser console for errors
3. Verify that the build process completed successfully

## Production Deployment

For production deployment, consider the following:

1. Set NODE_ENV=production in your environment variables
2. Ensure your PostgreSQL database uses SSL connections
3. Configure a reverse proxy (like Nginx) with HTTPS
4. Set up proper connection pooling for the database
5. Use a process manager like PM2 to keep the application running

## Database Migrations

When making changes to the database schema:

1. Update the schema definition in `shared/schema.ts`
2. Run `npm run db:push` to apply the changes
3. For production environments, consider using `db:generate` and `db:migrate` for safer migrations

## Additional Configuration Options

You can customize the application by:

1. Modifying the theme colors in `client/src/index.css`
2. Adjusting the session timeout in `server/auth.ts`
3. Configuring password complexity requirements in validation schemas

## Support and Documentation

For more detailed information, refer to:

- README.md - General project overview
- DOCUMENTATION.md - Technical documentation for developers