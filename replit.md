# Corelynx Solution

## Overview

Corelynx Solution is a comprehensive logistics matching and tracking platform that connects logistics Partners (requestors) with certified Logistics Agents (fulfillers) for efficient shipment execution. The platform provides role-based dashboards for three user types: Partners who create and manage shipment requests, Agents who accept and fulfill delivery jobs, and Administrators who manage user approvals and platform oversight.

The application features a modern, enterprise-grade interface built with React and TypeScript, utilizing the shadcn/ui component library with Carbon Design System principles for information-dense logistics workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for fast HMR and optimized production builds
- Client-side routing handled through role-based conditional rendering rather than traditional routing libraries

**Component Architecture**
- Atomic design pattern with reusable UI components in `client/src/components/ui/`
- Feature-specific components organized by domain (AgentCard, ShipmentCard, JobOfferCard, etc.)
- Role-based page components (PartnerDashboard, AgentDashboard, AdminDashboard) that compose smaller components
- shadcn/ui component library providing accessible, customizable primitives built on Radix UI

**State Management**
- TanStack Query (React Query) v5 for server state management and caching
- Local component state with React hooks for UI-specific state
- Custom hooks pattern for reusable logic (use-mobile, use-toast)

**Styling Approach**
- Tailwind CSS for utility-first styling with extensive customization
- CSS custom properties for theming (light/dark mode support via class-based system)
- IBM Plex Sans and IBM Plex Mono fonts for enterprise typography
- Design tokens following Carbon Design System principles with custom color schemes and elevation system

**Path Aliasing**
- `@/` maps to `client/src/` for application code
- `@shared/` maps to `shared/` for code shared between client and server
- `@assets/` maps to `attached_assets/` for static resources

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript for type safety across the stack
- Modular route registration pattern in `server/routes.ts`

**Data Layer Strategy**
- Storage interface abstraction (`IStorage`) allowing multiple implementations
- In-memory storage implementation (`MemStorage`) for development
- Designed to support database integration via the storage interface pattern
- Drizzle ORM configured for PostgreSQL (via Neon serverless) for production database access

**API Design**
- RESTful API convention with `/api` prefix for all application routes
- JSON request/response format
- Request logging middleware for debugging and monitoring
- Raw body capture for webhook/payment processing scenarios

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM v0.39+ as the primary database toolkit
- PostgreSQL as the target database (configured for Neon serverless)
- Schema definitions in `shared/schema.ts` for client-server type sharing
- Migration management via Drizzle Kit with migrations stored in `migrations/`

**Schema Design Pattern**
- Zod schema integration for runtime validation via drizzle-zod
- Type inference from database schema for compile-time safety
- Shared types between client and server to ensure consistency

**Session Management**
- connect-pg-simple configured for PostgreSQL-backed session storage
- Cookie-based session authentication strategy

### Authentication & Authorization

**Current Implementation**
- Role-based access control with three distinct roles: partner, agent, admin
- Client-side role state management with mock authentication flow
- Designed to integrate with session-based authentication on the backend

**Planned Architecture**
- Server-side session validation using Express sessions
- PostgreSQL session store for production persistence
- Role-based route protection at the API level
- User schema supports username/password authentication with hashed credentials

### External Dependencies

**UI Component Libraries**
- shadcn/ui component system (Radix UI primitives)
- @radix-ui packages for accessible UI patterns (dialogs, dropdowns, popovers, etc.)
- Lucide React for consistent iconography
- embla-carousel-react for carousel/slider interactions
- cmdk for command palette functionality

**Form Handling**
- React Hook Form ecosystem via @hookform/resolvers
- Zod for schema validation
- Integration with shadcn/ui form components

**Data Fetching & Caching**
- TanStack Query for server state synchronization
- Custom query client configuration with infinite stale time for development

**Date & Time**
- date-fns for date manipulation and formatting

**Styling & Design**
- Tailwind CSS with extensive custom configuration
- PostCSS for CSS processing
- class-variance-authority for component variant management
- clsx and tailwind-merge for conditional class composition

**Database & ORM**
- Drizzle ORM with PostgreSQL dialect
- @neondatabase/serverless for serverless database connections
- Drizzle Zod for schema validation

**Development Tools**
- Vite plugins for development experience (@replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner)
- TypeScript for static type checking
- ESBuild for server bundling

**Fonts**
- Google Fonts CDN for IBM Plex Sans and IBM Plex Mono