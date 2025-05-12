# Database Import Guide

This guide will help you import your own data into the Cosmic Authentication System.

## Step 1: Configure Your Database Connection

Edit the `.env` file to connect to your PostgreSQL database:

```
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DATABASE
SESSION_SECRET=your_secret_key
NODE_ENV=development
```

Replace the placeholders with your actual database credentials.

## Step 2: Create the Database Schema

Run the following command to create all necessary tables:

```bash
npm run db:push
```

This will create the user table and other required tables in your database.

## Step 3: Prepare Your User Data

Create a file named `user-data.json` in the root directory with the following structure:

```json
[
  {
    "username": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "phone": null,
    "password": "your_password",
    "authCode": null
  },
  {
    "username": "user1",
    "firstName": "Regular",
    "lastName": "User",
    "email": "user@example.com",
    "phone": "+12345678901",
    "password": "user_password",
    "authCode": null
  }
]
```

**IMPORTANT SECURITY NOTE:**
- This file will contain passwords - keep it secure and never commit it to version control
- Passwords will be automatically hashed during import
- Delete this file immediately after importing

## Step 4: Run the Import Script

Run the import script with:

```bash
tsx db/import.ts
```

This will:
1. Read the user data from `user-data.json`
2. Hash any plain text passwords
3. Check for existing users to avoid duplicates
4. Import all users into your database

## Step 5: Verify the Import

You can verify the import was successful by:

1. Trying to log in with the imported credentials
2. Checking the database directly:

```sql
SELECT username, firstname, lastname, email FROM users;
```

## Troubleshooting

If you encounter any issues during import:

1. **Connection errors**: Double-check your DATABASE_URL in the .env file
2. **Permission errors**: Ensure your database user has the proper permissions
3. **Schema errors**: If you've modified the schema, make sure your import data matches the expected format
4. **Password issues**: If importing already-hashed passwords, ensure they use the correct format (hash.salt)

## Security Considerations

- After testing, change any default or test passwords
- In production, use strong password requirements
- Consider implementing additional security measures like rate limiting and IP blocking