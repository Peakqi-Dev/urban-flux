# Logistics Dispatch System - Architecture & Implementation Plan

## 1. Information Architecture (IA)

The application will follow a **Single Page Application (SPA)** pattern using a fixed Sidebar for navigation and a dynamic Main Content Area.

### Page Structure
- **Global Layout**
  - **Sidebar (`<nav>`)**: Fixed left. Contains Logo, User Profile (mini), and Navigation Links.
  - **Main Content (`<main>`)**: Dynamic container where views are injected.

### Modules & Views

1.  **Operations Dashboard (`#dashboard`)**
    - **Purpose**: High-level overview of system health.
    - **Components**:
        - **KPI Cards**: Total Orders (Today), Active Drivers, Completion Rate, Total Revenue.
        - **Live Status**: Mini text feed of recent actions (e.g., "Order #123 created").
        - **Chart Placeholder**: Visual representation of orders per hour.

2.  **Dispatch Console (`#dispatch`)**
    - **Purpose**: The "Command Center" for assigning orders to drivers.
    - **Layout**: Split View (Map dominant).
    - **Components**:
        - **Map Area**: A large container representing the city.
            - **Markers**: Dots for Drivers (Green=Idle, Red=Busy) and Orders (Blue=Pending).
        - **Order Panel**: A side/bottom panel listing "Pending" orders requiring attention.
        - **Action**: Click order -> Highlight eligible drivers -> Assign.

3.  **Order Management (`#orders`)**
    - **Purpose**: Historical and detailed list of all orders.
    - **Components**:
        - **Filter Bar**: Search by ID, Filter by Status (All, Pending, Completed).
        - **Data Table**: Columns: ID, Pickup, Dropoff, Price, Driver, Status, Actions (View/Edit).
        - **Pagination**: Simple Next/Prev controls.

4.  **Driver Management (`#drivers`)**
    - **Purpose**: Manage fleet and view driver details.
    - **Components**:
        - **Driver List**: Table or Card grid.
        - **Status Toggle**: Force driver offline/online.
        - **Metrics**: Today's earnings, rating.

5.  **System Settings (`#settings`)**
    - **Purpose**: Configuration.
    - **Components**:
        - **Pricing Form**: Base Fare input, Per KM rate input.
        - **Zone Config**: Simple list of active service areas.

---

## 2. Data Fields & Models (Mock Data Schema)

We will use a centralized `data.js` to act as our database.

### Order Object
```json
{
  "id": "ORD-2023001",
  "status": "PENDING", // PENDING, ASSIGNED, IN_TRANSIT, COMPLETED, CANCELLED
  "customer": {
    "name": "Alice Chen",
    "phone": "0912-345-678"
  },
  "pickup": {
    "address": "123 Main St, District A",
    "x": 20, // Map coordinate 0-100
    "y": 30
  },
  "dropoff": {
    "address": "456 Market Rd, District B",
    "x": 80,
    "y": 75
  },
  "driverId": null, // Assigned driver ID
  "price": 150,
  "estimatedTime": "15 mins",
  "createdAt": "2023-10-27T10:00:00"
}
```

### Driver Object
```json
{
  "id": "DRV-001",
  "name": "Bob Lin",
  "status": "IDLE", // IDLE, BUSY, OFFLINE
  "location": {
    "x": 25,
    "y": 35
  },
  "vehicle": "Scooter",
  "stats": {
    "todayOrders": 5,
    "rating": 4.8
  }
}
```

### Dashboard Stats (Derived)
- `totalOrders`: Count of all orders today.
- `activeDrivers`: Count of drivers with status != OFFLINE.
- `completionRate`: (Completed / Total) * 100.

---

## 3. UI Planning & Component Strategy

### Layout Strategy
- **CSS Grid**: Used for the main shell (Sidebar 250px + Content 1fr).
- **Flexbox**: Used for internal component layouts (Cards, Nav items, Table rows).

### Component List
1.  **`Sidebar`**: Navigation container.
2.  **`StatCard`**: Display label, big number, and trend icon.
3.  **`Badge`**: Small pill for status (e.g., `.badge-success` for Completed).
4.  **`Button`**: Primary (Brand Color), Secondary (Outline), Danger (Red).
5.  **`Table`**: Standardized table with `<thead>` and hover effects.
6.  **`MapContainer`**: Relative positioned div.
    - **`MapDot`**: Absolute positioned div (`left: x%`, `top: y%`).
7.  **`Modal`**: Overlay for viewing order details.

---

## 4. Technical Architecture (JS Modules)

We will separate concerns to keep the code maintainable without a framework.

### 1. `data.js` (The Model)
- **Responsibility**: Holds the "State".
- **Exports**:
    - `orders`: Array of Order objects.
    - `drivers`: Array of Driver objects.
    - `settings`: Object for system config.
    - `getSummary()`: Returns calculated dashboard stats.
    - `assignDriver(orderId, driverId)`: Updates state.

### 2. `render.js` (The View)
- **Responsibility**: Pure functions that generate HTML strings or DOM elements.
- **Functions**:
    - `renderTable(columns, data)`: Returns a `<table>` element.
    - `renderCard(title, value)`: Returns a card `<div>`.
    - `renderBadge(status)`: Returns a span with correct class.
    - `renderOrderRow(order)`: Returns a `<tr>`.

### 3. `map.js` (The Map Component)
- **Responsibility**: Manages the visual representation of the map.
- **Functions**:
    - `initMap(containerId)`: Sets up the map area.
    - `updateMarkers(orders, drivers)`: Clears and re-renders dots based on x/y coordinates.
    - `animateMovement()`: (Optional) Simple interval to simulate driver movement.

### 4. `ui.js` (The Controller)
- **Responsibility**: Glues everything together. Handles events and navigation.
- **Functions**:
    - `navigateTo(pageId)`: Hides all sections, shows target, updates active nav link.
    - `handleOrderClick(id)`: Opens modal.
    - `init()`: Bootstraps the app.

### 5. `app.js` (Entry Point)
- Imports modules (if using ES6 modules) or simply calls `ui.init()` after scripts load.
