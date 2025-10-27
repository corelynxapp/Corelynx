import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Shipment,
  InsertShipment,
  Payment,
  InsertPayment,
  Negotiation,
  InsertNegotiation,
  Message,
  InsertMessage,
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApproval(id: string, isApproved: number): Promise<User | undefined>;
  getPendingUsers(): Promise<User[]>;
  
  // Shipment methods
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  getShipment(id: string): Promise<Shipment | undefined>;
  getShipmentsByPartner(partnerId: string): Promise<Shipment[]>;
  getShipmentsByAgent(agentId: string): Promise<Shipment[]>;
  getAllShipments(): Promise<Shipment[]>; // all shipments (admin)
  getAvailableShipments(): Promise<Shipment[]>; // pending shipments
  updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment | undefined>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByShipment(shipmentId: string): Promise<Payment[]>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getEarningsByUser(userId: string): Promise<Payment[]>;
  getSpendingByUser(userId: string): Promise<Payment[]>;
  getPendingPayouts(): Promise<Payment[]>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined>;
  
  // Negotiation methods
  createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation>;
  getNegotiationsByShipment(shipmentId: string): Promise<Negotiation[]>;
  updateNegotiation(id: string, status: string): Promise<Negotiation | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByShipment(shipmentId: string): Promise<Message[]>;
  markMessageAsRead(id: string): Promise<Message | undefined>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUserApproval(id: string, isApproved: number): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set({ isApproved })
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  async getPendingUsers(): Promise<User[]> {
    return await db.select().from(schema.users).where(eq(schema.users.isApproved, 0));
  }

  // Shipment methods
  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const result = await db.insert(schema.shipments).values(shipment).returning();
    return result[0];
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    const result = await db.select().from(schema.shipments).where(eq(schema.shipments.id, id)).limit(1);
    return result[0];
  }

  async getShipmentsByPartner(partnerId: string): Promise<Shipment[]> {
    return await db.select().from(schema.shipments)
      .where(eq(schema.shipments.partnerId, partnerId))
      .orderBy(desc(schema.shipments.createdAt));
  }

  async getShipmentsByAgent(agentId: string): Promise<Shipment[]> {
    return await db.select().from(schema.shipments)
      .where(eq(schema.shipments.agentId, agentId))
      .orderBy(desc(schema.shipments.createdAt));
  }

  async getAllShipments(): Promise<Shipment[]> {
    return await db.select().from(schema.shipments)
      .orderBy(desc(schema.shipments.createdAt));
  }

  async getAvailableShipments(): Promise<Shipment[]> {
    return await db.select().from(schema.shipments)
      .where(eq(schema.shipments.status, "pending"))
      .orderBy(desc(schema.shipments.createdAt));
  }

  async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment | undefined> {
    const result = await db.update(schema.shipments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.shipments.id, id))
      .returning();
    return result[0];
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(schema.payments).values(payment).returning();
    return result[0];
  }

  async getPaymentsByShipment(shipmentId: string): Promise<Payment[]> {
    return await db.select().from(schema.payments)
      .where(eq(schema.payments.shipmentId, shipmentId))
      .orderBy(desc(schema.payments.createdAt));
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    // Get all payments where user is either payer or payee
    const fromPayments = await db.select().from(schema.payments)
      .where(eq(schema.payments.fromUserId, userId));
    const toPayments = await db.select().from(schema.payments)
      .where(eq(schema.payments.toUserId, userId));
    
    // Combine and sort by date
    return [...fromPayments, ...toPayments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getEarningsByUser(userId: string): Promise<Payment[]> {
    // Get payments where user is receiving money
    return await db.select().from(schema.payments)
      .where(eq(schema.payments.toUserId, userId))
      .orderBy(desc(schema.payments.createdAt));
  }

  async getSpendingByUser(userId: string): Promise<Payment[]> {
    // Get payments where user is paying money
    return await db.select().from(schema.payments)
      .where(eq(schema.payments.fromUserId, userId))
      .orderBy(desc(schema.payments.createdAt));
  }

  async getPendingPayouts(): Promise<Payment[]> {
    return await db.select().from(schema.payments)
      .where(and(
        eq(schema.payments.type, "admin_to_agent"),
        eq(schema.payments.status, "pending")
      ))
      .orderBy(desc(schema.payments.createdAt));
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const result = await db.update(schema.payments)
      .set(data)
      .where(eq(schema.payments.id, id))
      .returning();
    return result[0];
  }

  // Negotiation methods
  async createNegotiation(negotiation: InsertNegotiation): Promise<Negotiation> {
    const result = await db.insert(schema.negotiations).values(negotiation).returning();
    return result[0];
  }

  async getNegotiationsByShipment(shipmentId: string): Promise<Negotiation[]> {
    return await db.select().from(schema.negotiations)
      .where(eq(schema.negotiations.shipmentId, shipmentId))
      .orderBy(desc(schema.negotiations.createdAt));
  }

  async updateNegotiation(id: string, status: string): Promise<Negotiation | undefined> {
    const result = await db.update(schema.negotiations)
      .set({ status })
      .where(eq(schema.negotiations.id, id))
      .returning();
    return result[0];
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(schema.messages).values(message).returning();
    return result[0];
  }

  async getMessagesByShipment(shipmentId: string): Promise<Message[]> {
    return await db.select().from(schema.messages)
      .where(eq(schema.messages.shipmentId, shipmentId))
      .orderBy(schema.messages.createdAt);
  }

  async markMessageAsRead(id: string): Promise<Message | undefined> {
    const result = await db.update(schema.messages)
      .set({ isRead: 1 })
      .where(eq(schema.messages.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DbStorage();
