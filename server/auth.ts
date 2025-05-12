import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage, DbUser } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Exported for use in import scripts
export async function hashPassword(password: string) {
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

export function setupAuth(app: Express) {
  // Configure session settings
  const sessionSecret = process.env.SESSION_SECRET || "super-secret-key-change-in-production";
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register routes
  app.post("/api/register", async (req, res, next) => {
    try {
      console.log("📝 Starting user registration process...");
      
      const { 
        username, 
        password, 
        firstName, 
        lastName, 
        email, 
        phone, 
        authCode, 
        captchaToken, 
        confirmPassword 
      } = req.body;
      
      console.log("📬 Registration request received with fields:", {
        username,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        authCode: authCode ? "[PROVIDED]" : "[NOT PROVIDED]",
        captchaVerified: !!captchaToken,
      });
      
      // Basic validation
      if (!username || !password || !firstName || !lastName) {
        console.log("❌ Registration validation failed: Missing required fields");
        return res.status(400).json({ 
          message: "Missing required fields: username, password, firstName, and lastName are required" 
        });
      }
      
      // Enforce either email or phone
      if (!email && !phone) {
        console.log("❌ Registration validation failed: No contact method provided");
        return res.status(400).json({ 
          message: "Either email or phone number is required" 
        });
      }
      
      // Check password confirmation (should also be validated by client-side zod)
      if (password !== confirmPassword) {
        console.log("❌ Registration validation failed: Password mismatch");
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        console.log(`❌ Registration failed: Username '${username}' already exists`);
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash the password
      console.log("🔒 Hashing password...");
      const hashedPassword = await hashPassword(password);
      console.log("✅ Password hashed successfully");
      
      // Process auth code if provided
      if (authCode) {
        console.log(`🔑 Auth code provided: ${authCode}`);
        // In a real app, you would validate this against some database
        const isAuthCodeValid = true; // For now, we'll accept any auth code
      }
      
      // Log the user data being saved (excluding sensitive info)
      console.log('👤 Preparing user record for database with data:', {
        username,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        hasAuthCode: !!authCode,
      });
      
      // Create the user record
      const userData: DbUser = {
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        authCode: authCode || null,
      };
      
      console.log("💾 Saving user to database...");
      const user = await storage.createUser(userData);
      console.log(`✅ User ${username} (ID: ${user.id}) created successfully`);

      // Log the user in after successful registration
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Extract credentials and CAPTCHA token
      const { username, password, captchaToken } = req.body;
      
      // In a production system, you would validate CAPTCHA on the server side
      // For this demo, we're relying on client-side validation
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA verification is required" });
      }
      
      // Authenticate the user
      passport.authenticate("local", (err: Error, user: SelectUser) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          
          // Return user without the password hash
          const { password, ...userWithoutPassword } = user;
          return res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without password hash
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
