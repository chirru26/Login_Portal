import { db } from './index';
import { users } from '@shared/schema';
import { hashPassword } from '../server/auth'; // You may need to export this function
import * as fs from 'fs';

async function importUsers() {
  try {
    console.log('Starting user data import...');
    
    // Read your user data from a JSON file
    // IMPORTANT: Store this file securely and never commit it to version control
    const userData = JSON.parse(fs.readFileSync('./user-data.json', 'utf8'));
    
    // Process each user
    for (const user of userData) {
      // Hash the password if it's in plain text
      if (user.password && !user.password.includes('.')) {
        user.password = await hashPassword(user.password);
      }
      
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, user.username)
      });
      
      if (existingUser) {
        console.log(`User ${user.username} already exists, skipping...`);
        continue;
      }
      
      // Insert the user
      await db.insert(users).values({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || null,
        phone: user.phone || null,
        password: user.password,
        authCode: user.authCode || null,
        // The createdAt field will be set automatically
      });
      
      console.log(`Imported user: ${user.username}`);
    }
    
    console.log('User import completed successfully!');
  } catch (error) {
    console.error('Error importing users:', error);
  }
}

// Example user data format for reference:
/*
[
  {
    "username": "admin",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "phone": null,
    "password": "plaintext_password_to_be_hashed",
    "authCode": null
  }
]
*/

// Run the import
importUsers();