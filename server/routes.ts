import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { 
  registrationSchema, 
  insertShipmentSchema,
  insertPaymentSchema,
  type User,
  type Shipment 
} from "@shared/schema";

// Extend Express session to include user
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Helper to get current user from session
async function getCurrentUser(req: Request): Promise<User | null> {
  if (!req.session.userId) {
    return null;
  }
  const user = await storage.getUser(req.session.userId);
  return user || null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - attach user to request
  app.use(async (req: Request, res: Response, next) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      (req as any).user = user;
    }
    next();
  });

  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const data = registrationSchema.parse(req.body);
      
      // Prevent admin registration through public endpoint
      if (data.role === "admin") {
        return res.status(403).json({ message: "Cannot register as admin through this endpoint" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user (isApproved defaults to 0 in database)
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      // Return success message without logging in (user needs approval)
      res.json({ 
        message: "Registration successful. Your account is pending admin approval.",
        userId: user.id,
        role: user.role,
        isApproved: user.isApproved,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user is approved (except for admin)
      if (user.role !== "admin" && user.isApproved !== 1) {
        if (user.isApproved === 0) {
          return res.status(403).json({ message: "Account pending approval" });
        }
        return res.status(403).json({ message: "Account has been rejected" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin: Get pending users
  app.get("/api/admin/pending-users", async (req: Request, res: Response) => {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const pendingUsers = await storage.getPendingUsers();
    const usersWithoutPasswords = pendingUsers.map(({ password, ...rest }) => rest);
    res.json(usersWithoutPasswords);
  });

  // Admin: Approve/reject user
  app.post("/api/admin/approve-user", async (req: Request, res: Response) => {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { userId, isApproved } = req.body;
    if (!userId || (isApproved !== 1 && isApproved !== 2)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const updatedUser = await storage.updateUserApproval(userId, isApproved);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // Approve user (parameterized route)
  app.post("/api/admin/approve-user/:id", async (req: Request, res: Response) => {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedUser = await storage.updateUserApproval(req.params.id, 1);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // Reject user (parameterized route)
  app.post("/api/admin/reject-user/:id", async (req: Request, res: Response) => {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedUser = await storage.updateUserApproval(req.params.id, 2);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // ============ SHIPMENT ENDPOINTS ============

  // Create new shipment (partner only)
  app.post("/api/shipments", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "partner") {
        return res.status(403).json({ message: "Only partners can create shipments" });
      }

      const data = insertShipmentSchema.parse({
        ...req.body,
        partnerId: user.id,
        status: "pending",
        paymentStatus: "pending"
      });

      const shipment = await storage.createShipment(data);
      res.json(shipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create shipment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // List all shipments for current user
  app.get("/api/shipments", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let shipments: Shipment[] = [];

      if (user.role === "partner") {
        shipments = await storage.getShipmentsByPartner(user.id);
      } else if (user.role === "agent") {
        shipments = await storage.getShipmentsByAgent(user.id);
      } else if (user.role === "admin") {
        // Admins can see all shipments
        shipments = await storage.getAllShipments();
      }

      res.json(shipments);
    } catch (error) {
      console.error("Get shipments error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // List available shipments for agents to accept
  app.get("/api/shipments/available", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "agent") {
        return res.status(403).json({ message: "Only agents can view available shipments" });
      }

      const shipments = await storage.getAvailableShipments();
      res.json(shipments);
    } catch (error) {
      console.error("Get available shipments error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get single shipment details
  app.get("/api/shipments/:id", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Check authorization
      if (user.role === "partner" && shipment.partnerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to view this shipment" });
      }

      if (user.role === "agent" && shipment.agentId !== user.id && shipment.status !== "pending") {
        return res.status(403).json({ message: "Unauthorized to view this shipment" });
      }

      res.json(shipment);
    } catch (error) {
      console.error("Get shipment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Agent accepts a shipment
  app.post("/api/shipments/:id/accept", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "agent") {
        return res.status(403).json({ message: "Only agents can accept shipments" });
      }

      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      if (shipment.status !== "pending") {
        return res.status(400).json({ message: "Shipment is not available for acceptance" });
      }

      const updatedShipment = await storage.updateShipment(req.params.id, {
        status: "agent_accepted",
        agentId: user.id
      });

      res.json(updatedShipment);
    } catch (error) {
      console.error("Accept shipment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Agent declines a shipment offer
  app.post("/api/shipments/:id/decline", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "agent") {
        return res.status(403).json({ message: "Only agents can decline shipments" });
      }

      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      if (shipment.agentId !== user.id) {
        return res.status(403).json({ message: "You are not assigned to this shipment" });
      }

      const updatedShipment = await storage.updateShipment(req.params.id, {
        status: "declined",
        agentId: null
      });

      res.json(updatedShipment);
    } catch (error) {
      console.error("Decline shipment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update shipment details
  app.put("/api/shipments/:id", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shipment = await storage.getShipment(req.params.id);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Check authorization - partners can update their shipments, agents can update assigned shipments, admins can update any
      if (user.role === "partner" && shipment.partnerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to update this shipment" });
      }

      if (user.role === "agent" && shipment.agentId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to update this shipment" });
      }

      // Only allow updating safe fields (not status, paymentStatus, partnerId, agentId, etc.)
      // These should only be updated through dedicated endpoints (accept, decline, payment)
      const safeUpdateSchema = insertShipmentSchema
        .pick({
          origin: true,
          destination: true,
          cargoType: true,
          weight: true,
          distance: true,
          currency: true,
          offeredAmount: true,
          pickupDate: true,
        })
        .partial();

      const data = safeUpdateSchema.parse(req.body);

      const updatedShipment = await storage.updateShipment(req.params.id, data);
      res.json(updatedShipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Update shipment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ PAYMENT ENDPOINTS ============

  // Create payment record
  app.post("/api/payments", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Only admins and partners can create payments
      if (user.role !== "admin" && user.role !== "partner") {
        return res.status(403).json({ message: "Unauthorized to create payments" });
      }

      const data = insertPaymentSchema.parse(req.body);

      // Verify the shipment exists
      const shipment = await storage.getShipment(data.shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // If partner is creating payment, verify they own the shipment
      if (user.role === "partner" && shipment.partnerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to create payment for this shipment" });
      }

      const payment = await storage.createPayment(data);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create payment error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get earnings for current user (agent)
  app.get("/api/payments/earnings", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "agent") {
        return res.status(403).json({ message: "Only agents can view earnings" });
      }

      const earnings = await storage.getEarningsByUser(user.id);
      res.json(earnings);
    } catch (error) {
      console.error("Get earnings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get spending for current user (partner)
  app.get("/api/payments/spending", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      if (user.role !== "partner") {
        return res.status(403).json({ message: "Only partners can view spending" });
      }

      const spending = await storage.getSpendingByUser(user.id);
      res.json(spending);
    } catch (error) {
      console.error("Get spending error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get pending payouts (admin only)
  app.get("/api/admin/pending-payouts", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const pendingPayouts = await storage.getPendingPayouts();
      res.json(pendingPayouts);
    } catch (error) {
      console.error("Get pending payouts error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Process payout (admin only)
  app.post("/api/admin/process-payout/:id", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const payment = await storage.updatePayment(req.params.id, {
        status: "payout_completed",
        processedAt: new Date()
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json(payment);
    } catch (error) {
      console.error("Process payout error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ NEGOTIATION ENDPOINTS ============

  // Create negotiation (agent or partner can propose new cost)
  app.post("/api/negotiations", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { shipmentId, proposedAmount, currency, message } = req.body;

      if (!shipmentId || !proposedAmount) {
        return res.status(400).json({ message: "Shipment ID and proposed amount required" });
      }

      // Verify shipment exists and user is authorized
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Only partner or assigned agent can negotiate
      if (user.role === "partner" && shipment.partnerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (user.role === "agent" && shipment.agentId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const negotiation = await storage.createNegotiation({
        shipmentId,
        proposedBy: user.id,
        proposedAmount,
        currency: currency || shipment.currency,
        message,
        status: "pending",
      });

      res.json(negotiation);
    } catch (error) {
      console.error("Create negotiation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get negotiations for a shipment
  app.get("/api/negotiations/:shipmentId", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shipment = await storage.getShipment(req.params.shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Check authorization
      if (user.role === "partner" && shipment.partnerId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (user.role === "agent" && shipment.agentId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const negotiations = await storage.getNegotiationsByShipment(req.params.shipmentId);
      res.json(negotiations);
    } catch (error) {
      console.error("Get negotiations error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Accept/reject negotiation
  app.post("/api/negotiations/:id/respond", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { status } = req.body; // "accepted" or "rejected"
      if (status !== "accepted" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Get the negotiation to find the shipment
      const negotiations = await storage.getNegotiationsByShipment(req.params.id);
      const negotiation = negotiations[0]; // Assuming we get the right one
      
      // For now, simplified - in production you'd query by negotiation ID
      const updatedNegotiation = await storage.updateNegotiation(req.params.id, status);

      if (!updatedNegotiation) {
        return res.status(404).json({ message: "Negotiation not found" });
      }

      // If accepted, update the shipment's negotiated amount
      if (status === "accepted" && negotiation) {
        await storage.updateShipment(negotiation.shipmentId, {
          negotiatedAmount: negotiation.proposedAmount,
        });
      }

      res.json(updatedNegotiation);
    } catch (error) {
      console.error("Respond to negotiation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ============ MESSAGING/CHAT ENDPOINTS ============

  // Send message
  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { shipmentId, receiverId, message } = req.body;

      if (!shipmentId || !receiverId || !message) {
        return res.status(400).json({ message: "Shipment ID, receiver ID, and message required" });
      }

      // Verify shipment exists and user is authorized
      const shipment = await storage.getShipment(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Only partner or assigned agent can message about this shipment
      const isPartner = user.role === "partner" && shipment.partnerId === user.id;
      const isAgent = user.role === "agent" && shipment.agentId === user.id;
      
      if (!isPartner && !isAgent && user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const newMessage = await storage.createMessage({
        shipmentId,
        senderId: user.id,
        receiverId,
        message,
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get messages for a shipment
  app.get("/api/messages/:shipmentId", async (req: Request, res: Response) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const shipment = await storage.getShipment(req.params.shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found" });
      }

      // Check authorization
      const isPartner = user.role === "partner" && shipment.partnerId === user.id;
      const isAgent = user.role === "agent" && shipment.agentId === user.id;
      
      if (!isPartner && !isAgent && user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const messages = await storage.getMessagesByShipment(req.params.shipmentId);
      
      // Mark messages as read where user is receiver
      for (const msg of messages) {
        if (msg.receiverId === user.id && msg.isRead === 0) {
          await storage.markMessageAsRead(msg.id);
        }
      }

      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
