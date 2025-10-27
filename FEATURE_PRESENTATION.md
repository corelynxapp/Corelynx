# Corelynx Solution - Feature Overview
## Complete Logistics Matching Platform MVP

---

## 🎯 Platform Overview

**Corelynx Solution** is a production-ready logistics matching platform that connects logistics Partners (shippers) with certified Logistics Agents (carriers) for efficient shipment execution.

**Default Currency:** Nigerian Naira (NGN)  
**Supported Currencies:** USD, EUR, GBP, ZAR, KES

---

## 👥 User Roles & Access

### 1. **Partner (Shipper)**
- Creates and manages shipment requests
- Negotiates pricing with agents
- Makes payments and tracks deliveries
- Views financial records

### 2. **Agent (Carrier)**
- Views and accepts available shipments
- Negotiates pricing with partners
- Manages active deliveries
- Requests payouts after completion
- Provides proof of delivery

### 3. **Admin (Platform Manager)**
- Approves/rejects new user registrations
- Manages payout requests (95% to agent, 5% to admin)
- Oversees platform operations
- Reviews financial transactions

---

## 🔐 Authentication Flow

### User Registration
1. User registers with:
   - Username (unique identifier)
   - Password
   - Full Name
   - Email (optional)
   - Phone (optional)
   - Role selection (Partner or Agent)

2. Status: **Pending Approval**
   - Account created but inactive
   - Cannot login until approved

3. **Admin Approval Required**
   - Admin reviews pending users
   - Can approve or reject
   - Only approved users can access the platform

### Login Process
- Login with username and password
- Session persists across browser refresh
- Role-based dashboard routing
- Secure logout functionality

### Admin Account
- **Auto-created on server startup**
- Username: `admin`
- Password: `admin123`
- No approval needed (always active)

---

## 📦 Shipment Creation (Partner)

### Step 1: Select Shipment Type
Partners choose between two shipment types:

**Option A: Pickup Only**
- Agent only picks up cargo from origin
- No destination address required
- Suitable for cargo collection services

**Option B: Door to Door Delivery**
- Agent picks up from origin AND delivers to destination
- Destination address required
- Full delivery service

### Step 2: Enter Shipment Details

**Required Information:**
- **Shipment Type:** Pickup Only or Door to Door Delivery
- **Origin Address:** Full pickup location
- **Destination Address:** Full delivery location (only for Door to Door)
- **Cargo Type:** Description of goods (e.g., Electronics, Furniture)
- **Weight:** In kilograms (kg)
- **Distance:** In kilometers (km)
- **Pickup Date:** When agent should pick up
- **Currency:** NGN, USD, EUR, GBP, ZAR, or KES
- **Offered Amount:** Partner's initial price offer

**Optional Information:**
- **Additional Notes:** Special instructions or requirements

**Important:** Expected completion date is NOT set during creation - it's determined when the agent accepts the shipment.

### Step 3: Shipment Status Lifecycle

1. **Pending** - Waiting for agent acceptance
2. **Agent Accepted** - Agent accepted, expected completion date now set
3. **In Transit** - Agent is transporting cargo
4. **Delivered (Pending Code)** - Agent marks as delivered, awaits verification
5. **Code Verified** - Partner verifies with customer code
6. **Completed** - Shipment fully completed

---

## 💰 Payment & Financial Flow

### Phase 1: Partner Payment
**After agent accepts shipment:**

1. Partner clicks "Make Payment"
2. Enters 8-character customer code
3. System validates code format
4. Payment processed to admin account
5. Customer code securely stored (hashed)
6. Shipment status: **Partner Paid**

### Phase 2: Agent Payout (95/5 Split)
**After successful delivery:**

1. Agent marks shipment as delivered
2. Partner verifies delivery with customer code
3. Agent requests payout
4. Admin reviews payout request
5. **Automated Split:**
   - 95% → Agent
   - 5% → Admin (platform fee)
6. Payout marked as completed

### Payment Tracking
- Partners can view all spending
- Agents can view all earnings
- Admin tracks all platform transactions
- Currency support for multi-region operations

---

## 💬 Communication Features

### In-App Chat
- Partners and agents can message each other
- Real-time message delivery
- Message history per shipment
- Facilitates negotiation and coordination

### In-App Calling
- Direct voice communication
- Integrated with shipment context
- Quick resolution of delivery issues

---

## 🔄 Real-Time Price Negotiation

### Negotiation Process
1. Partner creates shipment with offered amount
2. Agent views offer and can propose counter-offer
3. Partner can accept or propose new amount
4. Continues until both parties agree
5. Negotiated amount becomes final price

### Benefits
- Fair pricing for both parties
- Transparent negotiation history
- Market-driven rates

---

## ✅ Proof of Delivery System

### Digital Verification Flow

1. **Agent Marks Delivered**
   - Agent arrives at destination
   - Marks shipment as "Delivered"
   - Status: Delivered (Pending Code)

2. **Partner Verification**
   - Partner receives delivery notification
   - Confirms delivery quality with recipient
   - Enters 8-character customer code for verification

3. **Code Verification**
   - System validates customer code
   - If correct: Status → Code Verified → Completed
   - If incorrect: Error message, try again

4. **Completion**
   - Shipment fully completed
   - Agent eligible for payout request
   - Transaction recorded in financial records

---

## 📊 Dashboard Features

### Partner Dashboard
- **Statistics:**
  - Total shipments created
  - Active deliveries count
  - Completed shipments
  - Total spending

- **Shipment Management:**
  - Create new shipments
  - View pending requests
  - Track active deliveries
  - Review completed shipments

- **Actions:**
  - Make payments
  - Chat with agents
  - Call agents
  - Verify deliveries

### Agent Dashboard
- **Statistics:**
  - Available shipments
  - Active jobs
  - Completed deliveries
  - Total earnings

- **Job Management:**
  - Browse available shipments
  - Accept shipment offers
  - Track active deliveries
  - Request payouts

- **Actions:**
  - Accept/decline shipments
  - Negotiate prices
  - Mark delivered
  - Chat/call partners

### Admin Dashboard
- **User Management:**
  - View pending registrations
  - Approve/reject new users
  - Monitor user activity

- **Financial Operations:**
  - Review payout requests
  - Approve agent payouts (95/5 split)
  - Track platform revenue (5% fees)
  - Monitor all transactions

- **Platform Statistics:**
  - Total users (partners/agents)
  - Active shipments
  - Revenue metrics

---

## 🔒 Security Features

### Data Protection
- **Password Hashing:** bcrypt encryption
- **Session Management:** PostgreSQL-backed sessions
- **Customer Code Security:** Hashed storage for verification
- **Role-Based Access:** Users only see authorized data

### Session Security
- **HTTP-only cookies** prevent JavaScript access
- **Secure flag** for HTTPS in production
- **SameSite: lax** for CSRF protection
- **30-day session expiration**

### Payment Security
- **8-character customer code** verification
- **Code validation** prevents unauthorized completion
- **Transaction logging** for audit trail
- **Automated payout split** prevents manual errors

---

## 🗄️ Database Architecture

### Technology Stack
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **Session Store:** PostgreSQL sessions
- **Connection:** HTTP-based (neon driver)

### Key Tables
1. **Users** - All user accounts (partners, agents, admins)
2. **Shipments** - All shipment requests and tracking
3. **Payments** - Financial transactions and payouts
4. **Messages** - In-app chat messages
5. **Sessions** - User session management

### Data Consistency
- **Foreign keys** ensure referential integrity
- **Enums** enforce valid status values
- **Timestamps** track creation and updates
- **Nullable fields** for optional data

---

## 🚀 Deployment & Production

### Environment Setup
- **Development:** Local testing with hot reload
- **Production:** Published on Replit domain
- **Database:** Separate dev/prod databases
- **Sessions:** PostgreSQL-backed for persistence

### Auto-Initialization
- **Admin seeding** on server startup
- **Session table** auto-creation
- **Database migrations** via Drizzle Kit

### Scalability
- **Currency support** for international expansion
- **Multi-region ready** with ZAR, KES support
- **Session persistence** for high availability

---

## 📈 Key Business Metrics

### Revenue Model
- **5% platform fee** on all completed deliveries
- **Automated collection** through payout split
- **Transparent to users** - agents see their 95%

### User Growth Tracking
- Pending registrations
- Approved partners vs agents
- Active shipments
- Completion rate

### Financial Tracking
- Total platform revenue (5% fees)
- Agent payouts (95% shares)
- Partner spending
- Transaction volume by currency

---

## 🎯 MVP Success Criteria

✅ **User Management**
- Registration and approval system
- Role-based access control
- Secure authentication

✅ **Shipment Lifecycle**
- Creation with type selection
- Agent acceptance and tracking
- Delivery and verification

✅ **Payment Processing**
- Partner to admin payments
- 95/5 payout split
- Customer code verification

✅ **Communication**
- In-app chat
- In-app calling
- Message history

✅ **Financial Records**
- Comprehensive transaction logs
- User-specific financial views
- Admin oversight

---

## 🔧 Technical Highlights

### Frontend
- **React 18** with TypeScript
- **Shadcn/UI** component library
- **TanStack Query** for data management
- **Wouter** for routing
- **Real-time updates** via query invalidation

### Backend
- **Express.js** HTTP server
- **Session-based authentication**
- **RESTful API** design
- **Input validation** with Zod

### Developer Experience
- **Hot reload** in development
- **Type safety** across stack
- **Shared schemas** between client/server
- **Automated migrations** with Drizzle

---

## 📝 Next Steps for Testing

1. **Publish the application** to deploy latest fixes
2. **Create test partner account** for customer testing
3. **Create test agent account** for driver testing
4. **Admin approves both** test accounts
5. **Test complete flow:**
   - Partner creates shipment
   - Agent accepts
   - Partner pays
   - Agent delivers
   - Partner verifies
   - Agent requests payout
   - Admin approves payout

---

## 🎉 Platform Benefits

### For Partners (Shippers)
- Easy shipment creation
- Choose service type (pickup vs delivery)
- Transparent pricing
- Secure payments
- Real-time tracking
- Direct communication with agents

### For Agents (Carriers)
- Access to shipment opportunities
- Fair negotiation
- 95% payout (only 5% platform fee)
- Digital proof of delivery
- Automated payment processing

### For Platform (Admin)
- User vetting and approval
- 5% revenue on all transactions
- Automated payout calculations
- Complete financial oversight
- Scalable business model

---

**Corelynx Solution** - Connecting logistics needs with logistics professionals efficiently and securely.
