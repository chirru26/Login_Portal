import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");
    
    // Check if we already have users
    const existingUsers = await db.query.users.findMany();
    
    if (existingUsers.length === 0) {
      console.log("No users found, adding demo user...");
      
      // Create a demo user
      const hashedPassword = await hashPassword("password123");
      
      await db.insert(schema.users).values({
        username: "demo",
        password: hashedPassword,
      });
      
      console.log("Demo user created successfully");
    } else {
      console.log("Users already exist, skipping user creation");
    }
    
    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
