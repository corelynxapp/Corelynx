# Corelynx Solution Design Guidelines

## Design Approach

**Selected System**: Carbon Design System
**Justification**: Enterprise-grade logistics platform requiring robust data visualization, complex forms, and multi-role dashboards. Carbon excels at information-dense interfaces with clear hierarchy and accessibility.

**Design Principles**:
- Clarity over decoration - prioritize data readability
- Consistent patterns across Partner, Agent, and Admin interfaces
- Mobile-first responsive design with large touch targets (minimum 44px)
- Progressive disclosure - show relevant information based on context and role

## Typography System

**Font Family**: IBM Plex Sans (via Google Fonts CDN)
- Primary: IBM Plex Sans (400, 500, 600)
- Monospace: IBM Plex Mono (for tracking numbers, IDs)

**Hierarchy**:
- Page Headers: text-4xl font-semibold (36px)
- Section Headers: text-2xl font-semibold (24px)
- Card/Component Headers: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Secondary/Meta Text: text-sm (14px)
- Captions/Labels: text-xs font-medium uppercase tracking-wide (12px)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Card spacing: p-6 on desktop, p-4 on mobile
- Section margins: mb-8 to mb-12
- Grid gaps: gap-4 to gap-6
- Page padding: px-4 md:px-8 lg:px-12

**Container Structure**:
- Dashboard containers: max-w-7xl mx-auto
- Form containers: max-w-2xl mx-auto
- Content sections: max-w-6xl mx-auto

**Grid Patterns**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stat tiles: grid-cols-2 md:grid-cols-4
- Data tables: Single column with horizontal scroll on mobile
- Forms: Single column with logical groupings

## Component Library

### Navigation & Header
**Top Navigation Bar**:
- Fixed header with shadow on scroll
- Logo (left), navigation links (center), user menu (right)
- Height: h-16
- Mobile: Hamburger menu transforming to slide-out drawer

**Role Indicator Badge**:
- Display user role (Partner/Agent/Admin) prominently in header
- Medium size badge with icon prefix

### Dashboard Components

**Stat Cards** (for metrics like active shipments, completion rate):
- Border with subtle shadow
- Icon (top-left), metric value (large, center), label (below)
- Grid layout: 2 columns mobile, 4 columns desktop
- Padding: p-6

**Shipment Cards**:
- Structured layout: Header (status badge + ID), body (origin/destination with arrow icon), footer (agent info + CTA)
- Border treatment with hover elevation
- Padding: p-4
- Include small map preview thumbnail (150x100px) for active shipments

**Agent Profile Cards** (for selection):
- Avatar/icon (left), name + rating stars (top-right), metrics row (completion rate, vehicle type), action button (bottom)
- 2-column grid on tablet+, single column on mobile
- Border with clear hierarchy

### Forms

**Shipment Creation Form**:
- Progressive multi-step layout: Step indicator at top
- Grouped sections with clear labels
- Input fields: Full-width with labels above, helper text below
- Spacing between fields: mb-6
- CTAs: Full-width on mobile, max-w-xs on desktop
- Include location picker with map integration (use placeholder: "<!-- MAP INTEGRATION: Google Maps/Mapbox -->")

**Input Styling**:
- Border-based inputs with focus rings
- Label: text-sm font-medium mb-2
- Input height: h-12 (large touch target)
- Error states: border change + helper text below

### Data Display

**Shipment Tracking Timeline**:
- Vertical stepper pattern
- Each step: Icon (left, connected by line), label + timestamp (right)
- Current step highlighted, completed steps checked
- Mobile-optimized with compact spacing

**Data Tables** (for reports):
- Sticky header row
- Zebra striping for rows
- Action column (right-aligned)
- Responsive: Horizontal scroll on mobile OR transform to stacked cards
- Pagination: Center-aligned below table
- Export button: Top-right of table header

**Map Display** (for tracking):
- Minimum height: h-96 on desktop, h-64 on mobile
- Include: Route polyline, origin/destination markers, current location marker
- Overlay controls: Top-right corner
- Full-width within container

### Notifications & Alerts

**Push Notification Toast**:
- Slide in from top-right
- Icon (left), message (center), dismiss (right)
- Auto-dismiss after 5 seconds
- Multiple toasts stack vertically with gap-2

**Status Badges**:
- Pill-shaped, uppercase text-xs font-semibold
- Different treatments for: Pending, Accepted, In Transit, Delivered, Declined
- Inline with shipment IDs

### Mobile-Specific Patterns

**Bottom Navigation** (for mobile apps):
- Fixed bottom bar with 4 primary actions
- Icon + label pattern
- Active state clearly indicated
- Height: h-16
- Icons: Use Heroicons via CDN

**Action Buttons** (Agent accept/decline):
- Full-width or side-by-side (50/50 split)
- Large height: h-14
- Primary action (Accept) and secondary action (Decline) clearly differentiated
- Include loading states

**Proof of Delivery Module**:
- Signature canvas: Full-width, h-64, with clear/submit actions below
- Photo upload: Camera icon button (large, h-32 w-32), preview thumbnails below
- Two-column on tablet: Signature (left), Photo (right)

### Admin Dashboard

**User Management Table**:
- Columns: Name, Role, Status, Registration Date, Actions
- Filters: Role dropdown, status toggle, search bar (top)
- Bulk actions: Checkbox column (left) with action bar when selected
- Approval workflow: Pending users highlighted with approval/reject inline actions

**Regional Boundary Config**:
- Map interface (left, 60% width), region list (right, 40% width)
- Drawing tools for region creation
- Region cards showing: Name, agent count, coverage area

### Reporting Interface

**Report Generator**:
- Filter panel (left sidebar or collapsible top section)
- Date range picker, agent filter, cargo type selector
- Visualization area: Charts using Chart.js placeholders
- Export options: CSV, PDF buttons (top-right)

**Chart Types**:
- Cost Report: Line chart (time series)
- Completion Time: Bar chart (comparative)
- Usage Report: Horizontal bar chart + data table

## Images

**Hero Section** (Login/Landing):
- Full-width hero image showing logistics in action (warehouse, delivery trucks, happy workers)
- Dimensions: 1920x600px
- Overlay: Semi-transparent layer for text readability
- CTA buttons with backdrop-blur-sm backgrounds

**Empty States**:
- Illustration for "No Active Shipments" - centered, max-w-md
- Illustration for "No Available Agents" - centered, max-w-md
- Use placeholder comment: "<!-- ILLUSTRATION: [description] -->"

**Dashboard Graphics**:
- Small map thumbnails in shipment cards (150x100px)
- Agent avatar placeholders (40x40px circular)
- Vehicle type icons via Heroicons

## Responsive Breakpoints

- Mobile: Base (< 768px) - single column, stacked layouts, bottom nav
- Tablet: md (768px+) - 2-column grids, sidebar appears
- Desktop: lg (1024px+) - 3-column grids, full feature set
- Large: xl (1280px+) - Maximum container widths utilized

## Accessibility Standards

- All interactive elements minimum 44x44px
- Form labels explicitly associated
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Focus indicators visible and distinct
- Contrast ratios WCAG AA compliant (will be ensured with final colors)

## Animation Guidelines

Use extremely sparingly:
- Page transitions: None (instant navigation)
- Loading states: Simple spinner, no complex animations
- Hover states: Subtle elevation change on cards (shadow transition)
- Avoid: Scroll-triggered animations, parallax, complex micro-interactions