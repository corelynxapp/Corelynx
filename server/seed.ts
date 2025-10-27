import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const newUser = await storage.createUser({
        username: "admin",
        password: hashedPassword,
        fullName: "System Administrator",
        role: "admin",
      });
      
      // Approve the admin user
      await storage.updateUserApproval(newUser.id, 1);
      console.log("[SEED] Admin user created successfully (username: admin, password: admin123)");
    } else {
      console.log("[SEED] Admin user already exists");
    }
  } catch (error) {
    console.error("[SEED] Error seeding admin user:", error);
  }
}
