import { db } from "@db";
import { users, userDbSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import session from "express-session";
import { pool } from "@db";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";
import createMemoryStore from "memorystore";

// Initialize memory store for sessions
const MemoryStore = createMemoryStore(session);

// Type for database operations
export type DbUser = z.infer<typeof userDbSchema>;

export interface IStorage {
  getUserById(id: number): Promise<SelectUser>;
  getUserByUsername(username: string): Promise<SelectUser | undefined>;
  createUser(user: DbUser): Promise<SelectUser>;
  sessionStore: session.Store;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use an in-memory session store for simplicity
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUserById(id: number): Promise<SelectUser> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });

    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }

    return result;
  }

  async getUserByUsername(username: string): Promise<SelectUser | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    return result;
  }

  async createUser(user: DbUser): Promise<SelectUser> {
    try {
      console.log("🔍 Validating user data against schema...");
      // Validate the user data against our schema
      const validUser = userDbSchema.parse(user);
      console.log("✅ User data validated successfully");
      
      // Log the validated data
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
}

export const storage = new DatabaseStorage();
