# AgroConnect - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AGROCONNECT SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐    ┌───────────┐
│     FRONTEND         │◄────────┤     BACKEND API      │◄───┤ MONGODB   │
│  (React + Vite)     │  HTTP    │ (Node + Express)     │    │ Database  │
│                      │         │                      │    └───────────┘
│ - Login/Register    │         │ - Authentication     │
│ - Admin Dashboard   │         │ - Business Logic     │
│ - Mill Dashboard    │         │ - Data Validation    │
│ - Farmer Dashboard  │         │ - Authorization      │
│ - Inspector Panel   │         │ - OTP Generation     │
│                     │         │                      │
└──────────────────────┘         └──────────────────────┘
     (Port 5173)                       (Port 5000)
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                              │
└──────────────────────────────────────────────────────────────────────────┘

USER REGISTRATION & LOGIN
───────────────────────────

User (Frontend)
    │
    ├──POST /auth/register──────────────────┐
    │                                      │
    │                    Backend Validation & Processing
    │                    ├─ Validate inputs
    │                    ├─ Hash password
    │                    ├─ Save to MongoDB
    │                    ├─ Generate JWT token
    │                    └─ Auto-verify if farmer
    │
    └──Response with token────────────▶ Store in localStorage
                                       & Set Auth Context


CROP REQUIREMENT WORKFLOW
────────────────────────────

Step 1: Admin Creates Crops
────────────────────────────
Admin ──POST /admin/crops──► Backend ──► MongoDB
  │                            │
  │                    Save Crop Document
  │
  └──Response────────► Admin Dashboard

Step 2: Mill Owner Creates Requirement
───────────────────────────────────────
Mill Owner ──POST /mill-requirements/create──► Backend ──► MongoDB
    │                                            │
    │                                   ├─ Validate JWT
    │                                   ├─ Check verification
    │                                   ├─ Create requirement
    │                                   └─ Link to crop & mill owner
    │
    └──Response────────► Mill Owner Dashboard


TRANSACTION WORKFLOW
──────────────────────

┌──────────────┐        ┌──────────────┐       ┌──────────────┐
│   FARMER     │        │     ADMIN    │       │  INSPECTOR   │
└──────────────┘        └──────────────┘       └──────────────┘
    │                         │                      │
    │                         │                      │
    │ 1. View Requirements    │                      │
    │ (GET /active-requirements)                     │
    │                         │                      │
    │ 2. Create Sell Offer    │                      │
    │ (POST /sell-offers/create)                     │
    │ ├─ Generate OTP         │                      │
    │ └─ Save to MongoDB      │                      │
    │                         │                      │
    │ 3. Show OTP (secret)    │                      │
    │                         │                      │
    │                         │ 4. View Pending Offers
    │                         │ (GET /sell-offers/all-pending)
    │                         │                      │
    │                         │ 5. Assign Inspector  │
    │                         │ (POST /inspections/assign)─────┐
    │                         │    ├─ Create inspection record │
    │                         │    └─ Update offer status      │
    │                         │                      │
    │                         │                 6. Get Assignment
    │                         │                 (GET /my-inspections)
    │                         │                      │
    │                         │                 7. Complete Inspection
    │                         │                 (PUT /complete)
    │                         │                      │
    │                         │              ├─ Verify farmer OTP
    │◄─ Transaction Status ─◄─┼──────────────┤
    │   Updated                │              ├─ Calculate amount
    │                          │              ├─ Update requirement
    │                          │              └─ Mark completed
    │
    └──────────────────────────────────────────────────────────┘
```

---

## Database Schema Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       MONGODB COLLECTIONS                                │
└──────────────────────────────────────────────────────────────────────────┘

USERS COLLECTION
─────────────────
{
  _id: ObjectId
  name: String
  email: String (unique)
  phone: String
  address: String
  password: String (hashed)
  role: String (farmer, mill_owner, admin, inspector)
  isVerified: Boolean
  
  // Mill Owner Only
  licenseNo: String
  millName: String
  millLocation: String
  
  createdAt: Date
  updatedAt: Date
}

        │
        ├─────────────────────────────────────────┐
        │                                         │
        ▼                                         ▼
    
CROPS COLLECTION              MILLREQUIREMENTS COLLECTION
─────────────────              ─────────────────────────
{                               {
  _id: ObjectId                 _id: ObjectId
  name: String                  millOwnerId: ObjectId ──┐
  season: String                cropId: ObjectId ───────┼──► CROPS
  type: String                  quality: Number         │
  createdAt: Date               requiredTotalQuantity   │
  updatedAt: Date               expectedRate: Number
}                               status: String (active, closed)
                                createdAt: Date
                                updatedAt: Date
                              }
                                  │
                                  ▼
                  
                     SELLOFFERS COLLECTION
                     ─────────────────────
                     {
                       _id: ObjectId
                       requirementId: ObjectId ─┐
                       farmerId: ObjectId       │
                       approxQuantitySell       │
                       status: String           │─ Linked
                       otp: String              │
                       createdAt: Date          │
                       updatedAt: Date          │
                     }                          │
                       │                        │
                       └────────────────────────┘
                           │
                           ▼
                    
                   INSPECTIONS COLLECTION
                   ──────────────────────
                   {
                     _id: ObjectId
                     inspectorId: ObjectId
                     offerId: ObjectId ────────── Linked to SellOffer
                     quantityReal: Number
                     finalRate: Number
                     amount: Number
                     isTransactionCompleted: Boolean
                     transactionStatus: String
                     createdAt: Date
                     updatedAt: Date
                   }
```

---

## API Request Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    REQUEST PROCESSING PIPELINE                           │
└──────────────────────────────────────────────────────────────────────────┘

CLIENT REQUEST
    │
    ├─ HTTP Method & Path
    ├─ Headers (Authorization: Bearer <token>)
    └─ Body (JSON data)
         │
         ▼
    
FRONTEND (src/services/api.js)
    │
    ├─ Axios interceptor adds JWT token
    └─ Sends request to backend
         │
         ▼
    
BACKEND SERVER (server.js)
    │
    ├─ Body parser middleware
    ├─ CORS middleware
    └─ Route matching
         │
         ▼
    
MIDDLEWARE CHAIN
    │
    ├─ auth middleware (checks JWT)
    ├─ roleCheck middleware (verifies role)
    └─ Next → Controller
         │
         ▼
    
CONTROLLER (Business Logic)
    │
    ├─ Validate inputs
    ├─ Process request
    ├─ Database operations
    └─ Return response
         │
         ▼
    
DATABASE (MongoDB)
    │
    └─ CRUD operations
         │
         ▼
    
RESPONSE
    │
    ├─ Status code
    ├─ JSON data
    └─ Send to client
         │
         ▼
    
FRONTEND
    │
    ├─ Error handling
    ├─ State update
    └─ UI refresh
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     JWT AUTHENTICATION FLOW                              │
└──────────────────────────────────────────────────────────────────────────┘

REGISTER/LOGIN
    │
    ▼
PASSWORD HASHING (bcryptjs)
    │
    ├─ Generate salt
    ├─ Hash password
    └─ Store in database
    
    
LOGIN REQUEST
    │
    ├─ Email & Password
    ├─ Compare password hash
    │
    ├─ SUCCESS
    │   │
    │   └─► JWT Token Generated
    │       {
    │         id: user._id
    │         email: user.email
    │         role: user.role
    │       }
    │       └─► Signed with JWT_SECRET
    │           └─► Expires in 7 days
    │
    └─► Send to frontend
        └─► Store in localStorage
            └─► Attach to every request header


PROTECTED REQUEST
    │
    ├─ Client sends: Authorization: Bearer <token>
    │
    ▼
AUTH MIDDLEWARE
    │
    ├─ Extract token from header
    ├─ Verify signature with JWT_SECRET
    ├─ Check expiration
    │
    ├─ VALID
    │   │
    │   ├─ Decode payload
    │   ├─ Attach to req.user
    │   └─ Continue to next middleware
    │
    └─ INVALID
        │
        └─► Send 401 Unauthorized
```

---

## Role-Based Access Control

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ROLE-BASED ACCESS CONTROL                             │
└──────────────────────────────────────────────────────────────────────────┘

ADMIN
├─ GET /admin/users ........... List all users
├─ PUT /admin/users/:id/verify  Verify mill owners & inspectors
├─ POST /admin/crops .......... Create crops
├─ GET /admin/crops .......... List crops
├─ DELETE /admin/crops/:id ... Delete crops
├─ GET /inspections/all ....... View all inspections
├─ POST /inspections/assign .... Assign to inspector
└─ GET /sell-offers/all-pending  View pending offers


MILL OWNER (Must be verified)
├─ POST /mill-requirements/create ... Create requirement
├─ GET /mill-requirements/my-requirements ... View own
├─ PUT /mill-requirements/:id/status .... Close requirement
├─ PUT /mill-requirements/:id/quality ... Update quality
└─ Can view: Own requirements & related inspections


FARMER (Auto-verified)
├─ GET /mill-requirements/active-requirements  Browse all
├─ POST /sell-offers/create ................... Create offer
├─ GET /sell-offers/my-offers ................ View own offers
└─ Sees: OTP, Inspection status, Results


INSPECTOR (Must be verified)
├─ GET /inspections/my-inspections .... View assignments
├─ GET /inspections/:id ............... View details
├─ PUT /inspections/:id/complete ..... Complete inspection
└─ Verifies: Farmer OTP, Quantity, Rate
```

---

## OTP System

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        OTP VERIFICATION SYSTEM                           │
└──────────────────────────────────────────────────────────────────────────┘

FARMER CREATES OFFER
    │
    ▼
BACKEND GENERATES OTP
    │
    ├─ Random 6-digit number
    ├─ Saved in SellOffer.otp
    └─ Returned to frontend
    
    
FARMER RECEIVES OTP
    │
    │ Display in Dashboard
    │ "Keep OTP Safe: 123456"
    │
    └─► Only visible to this farmer


INSPECTION TIME
    │
    └─► Inspector sees farmer details
        └─► Completes inspection
            └─► Tries to ACCEPT
                │
                ├─► Requests OTP from farmer
                │
                ├─► Inspector enters OTP
                │
                └─► Backend validates
                    │
                    ├─ OTP matches?
                    │   │
                    │   ├─ YES: Accept transaction
                    │   │       └─ Update status to "accept"
                    │   │
                    │   └─ NO: Reject
                    │           └─ Show error
                    │
                    └─ OTP not required for REJECT
```

---

## Status Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        STATUS TRANSITIONS                                │
└──────────────────────────────────────────────────────────────────────────┘

SELL OFFER STATUS
────────────────
    pending
        │
        ▼
    assignedToInspector
        │
        ├─► accept
        │
        └─► reject


INSPECTION STATUS
─────────────────
    pending (created on assignment)
        │
        ├─► accept  (with valid OTP)
        │   └─► isTransactionCompleted = true
        │
        └─► reject
            └─► isTransactionCompleted = true


MILL REQUIREMENT STATUS
──────────────────────
    active
        │
        ├─ Manual close: Status→closed
        │
        └─ Auto close: When requiredTotalQuantity ≤ 0
             └─ Happens after accepted transactions

    closed (FINAL - cannot reopen)


TRANSACTION FLOW
────────────────
Farmer creates offer → pending
                       │
Admin assigns inspector → assignedToInspector
                          │
Inspector completes      → accept/reject
                          │
                          └─► Transaction COMPLETED
```

---

## Component Hierarchy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      REACT COMPONENT TREE                                │
└──────────────────────────────────────────────────────────────────────────┘

App.jsx
├─ AuthProvider (Context)
│
└─ BrowserRouter
   ├─ Routes
   │
   ├─ /login
   │  └─ Login.jsx
   │
   ├─ /register
   │  └─ Register.jsx
   │
   ├─ /dashboard (ProtectedRoute)
   │  └─ Dashboard.jsx
   │      └─ Role detection
   │          ├─ Navigate to /admin
   │          ├─ Navigate to /mill-owner
   │          ├─ Navigate to /farmer
   │          └─ Navigate to /inspector
   │
   ├─ /admin (ProtectedRoute - admin only)
   │  └─ AdminDashboard.jsx
   │      ├─ Users Tab
   │      │  └─ Verify/Unverify buttons
   │      │
   │      ├─ Crops Tab
   │      │  ├─ Create Crop Form
   │      │  └─ Crops Table
   │      │
   │      ├─ Offers Tab
   │      │  └─ Pending Offers List
   │      │
   │      └─ Inspections Tab
   │         └─ Inspections Table
   │
   ├─ /mill-owner (ProtectedRoute - mill_owner only)
   │  └─ MillOwnerDashboard.jsx
   │      ├─ Create Requirement Tab
   │      │  └─ Form
   │      │
   │      └─ My Requirements Tab
   │         └─ Requirements List
   │
   ├─ /farmer (ProtectedRoute - farmer only)
   │  └─ FarmerDashboard.jsx
   │      ├─ Available Requirements Tab
   │      │  └─ Requirements List
   │      │
   │      └─ My Offers Tab
   │         └─ Offers List
   │
   ├─ /inspector (ProtectedRoute - inspector only)
   │  └─ InspectorDashboard.jsx
   │      └─ My Inspections Tab
   │         ├─ Inspection details
   │         └─ Completion form
   │
   └─ /admin/assign-inspector (ProtectedRoute - admin only)
      └─ AssignInspector.jsx
         └─ Inspector selection & assignment


CONTEXT
───────
AuthContext.jsx
├─ user: Current logged-in user
├─ token: JWT token
├─ login(): Set user & token
├─ logout(): Clear user & token
└─ loading: Initial load state
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING FLOW                               │
└──────────────────────────────────────────────────────────────────────────┘

Frontend Request
    │
    ▼
API Call (try-catch)
    │
    ├─ Success
    │   └─► Update state
    │       └─► Render response
    │
    └─ Error
        │
        ├─ Error Response
        │   ├─ 401: Token invalid/expired
        │   │  └─ Clear localStorage
        │   │  └─ Redirect to login
        │   │
        │   ├─ 403: Insufficient permissions
        │   │  └─ Show error message
        │   │
        │   ├─ 400: Invalid input
        │   │  └─ Display validation error
        │   │
        │   ├─ 404: Not found
        │   │  └─ Show "Not found" message
        │   │
        │   └─ 500: Server error
        │      └─ Log error
        │      └─ Show user-friendly message
        │
        └─ Network Error
            └─ Show connection error
            └─ Retry button
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                  PRODUCTION DEPLOYMENT SETUP                             │
└──────────────────────────────────────────────────────────────────────────┘

CLIENT BROWSER
    │
    │ HTTPS
    ▼
┌─────────────────┐
│   Nginx/Apache  │  Load balancer
│  (Reverse Proxy)│  File server
└────────┬────────┘
         │
         ├───────────────────────┐
         │                       │
         ▼                       ▼
    ┌────────┐            ┌────────┐
    │ React  │            │ PM2    │
    │ SPA    │            │ Node   │
    │ (dist) │            │ App 1  │
    └────────┘            └────────┘
                              │
                         ┌────┴─────┐
                         │           │
                         ▼           ▼
                    ┌────────┐  ┌────────┐
                    │ PM2    │  │ PM2    │
                    │ App 2  │  │ App 3  │
                    └────────┘  └────────┘
                         │
                         └──────┬──────┘
                                │
                        ┌───────▼────────┐
                        │  Load Balance  │
                        │   (PM2, HAProxy)
                        └───────┬────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
            ┌─────────┐    ┌─────────┐   ┌─────────┐
            │MongoDB  │    │ MongoDB │   │ MongoDB │
            │ Primary │    │Secondary│   │Secondary│
            │ (Replica Set)        │      │
            └─────────┘    └─────────┘   └─────────┘
                 │
                 └─── Automatic Failover
                      Sharding (optional)
                      Backup & Recovery
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Performance
- ✅ Maintainability
- ✅ Reliability

For detailed deployment info, see DEPLOYMENT_GUIDE.md
