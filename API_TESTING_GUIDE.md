# AgroConnect API Testing Guide

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Farmer",
  "email": "farmer@example.com",
  "phone": "9876543210",
  "address": "Village XYZ",
  "password": "password123",
  "role": "farmer"
}
```

**For Mill Owner (additional fields):**
```json
{
  "name": "Mill Owner",
  "email": "mill@example.com",
  "phone": "9876543210",
  "address": "Industrial Area",
  "password": "password123",
  "role": "mill_owner",
  "licenseNo": "MILL123456",
  "millName": "Premier Mills",
  "millLocation": "District XYZ"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "farmer@example.com",
    "role": "farmer",
    "isVerified": true
  }
}
```

### 1.2 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "farmer@example.com",
    "role": "farmer",
    "isVerified": true
  }
}
```

---

## 2. Admin Endpoints

### 2.1 Get All Users
**GET** `/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "farmer@example.com",
    "role": "farmer",
    "isVerified": true
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mill Owner",
    "email": "mill@example.com",
    "role": "mill_owner",
    "isVerified": false,
    "millName": "Premier Mills"
  }
]
```

### 2.2 Verify/Unverify User
**PUT** `/admin/users/:userId/verify`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isVerified": true
}
```

**Response:**
```json
{
  "message": "User verification status updated",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Mill Owner",
    "email": "mill@example.com",
    "isVerified": true
  }
}
```

### 2.3 Create Crop
**POST** `/admin/crops`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Rice",
  "season": "Monsoon",
  "type": "Basmati"
}
```

**Response:**
```json
{
  "message": "Crop created successfully",
  "crop": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Rice",
    "season": "Monsoon",
    "type": "Basmati"
  }
}
```

### 2.4 Get All Crops
**GET** `/admin/crops`

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Rice",
    "season": "Monsoon",
    "type": "Basmati"
  },
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Wheat",
    "season": "Spring",
    "type": "Common"
  }
]
```

### 2.5 Delete Crop
**DELETE** `/admin/crops/:cropId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Crop deleted successfully"
}
```

---

## 3. Mill Requirement Endpoints

### 3.1 Create Mill Requirement
**POST** `/mill-requirements/create`

**Headers:**
```
Authorization: Bearer <mill_owner_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "cropId": "507f1f77bcf86cd799439013",
  "quality": 100,
  "requiredTotalQuantity": 100,
  "expectedRate": 25.50
}
```

**Response:**
```json
{
  "message": "Requirement created successfully",
  "requirement": {
    "_id": "507f1f77bcf86cd799439015",
    "millOwnerId": "507f1f77bcf86cd799439012",
    "cropId": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Rice"
    },
    "quality": 100,
    "requiredTotalQuantity": 100,
    "expectedRate": 25.50,
    "status": "active"
  }
}
```

### 3.2 Get My Requirements
**GET** `/mill-requirements/my-requirements`

**Headers:**
```
Authorization: Bearer <mill_owner_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "cropId": {
      "name": "Rice",
      "season": "Monsoon"
    },
    "quality": 100,
    "requiredTotalQuantity": 100,
    "expectedRate": 25.50,
    "status": "active"
  }
]
```

### 3.3 Get All Active Requirements (For Farmers)
**GET** `/mill-requirements/active-requirements`

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "cropId": {
      "name": "Rice"
    },
    "quality": 100,
    "requiredTotalQuantity": 100,
    "expectedRate": 25.50,
    "millOwnerId": {
      "name": "Mill Owner",
      "millName": "Premier Mills"
    },
    "status": "active"
  }
]
```

### 3.4 Update Requirement Status
**PUT** `/mill-requirements/:requirementId/status`

**Headers:**
```
Authorization: Bearer <mill_owner_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "closed"
}
```

**Response:**
```json
{
  "message": "Requirement status updated",
  "requirement": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "closed"
  }
}
```

---

## 4. Sell Offer Endpoints

### 4.1 Create Sell Offer
**POST** `/sell-offers/create`

**Headers:**
```
Authorization: Bearer <farmer_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "requirementId": "507f1f77bcf86cd799439015",
  "approxQuantitySell": 50
}
```

**Response:**
```json
{
  "message": "Sell offer created successfully",
  "offer": {
    "_id": "507f1f77bcf86cd799439016",
    "requirementId": "507f1f77bcf86cd799439015",
    "farmerId": "507f1f77bcf86cd799439011",
    "approxQuantitySell": 50,
    "status": "pending",
    "otp": "123456"
  },
  "otp": "123456"
}
```

### 4.2 Get My Offers (Farmer)
**GET** `/sell-offers/my-offers`

**Headers:**
```
Authorization: Bearer <farmer_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "approxQuantitySell": 50,
    "status": "pending",
    "requirementId": {
      "cropId": {
        "name": "Rice"
      },
      "expectedRate": 25.50
    }
  }
]
```

### 4.3 Get All Pending Offers (Admin)
**GET** `/sell-offers/all-pending`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "requirementId": "507f1f77bcf86cd799439015",
    "farmerId": {
      "name": "John Farmer",
      "email": "farmer@example.com"
    },
    "status": "pending"
  }
]
```

---

## 5. Inspection Endpoints

### 5.1 Assign Inspection (Admin)
**POST** `/inspections/assign`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "offerId": "507f1f77bcf86cd799439016",
  "inspectorId": "507f1f77bcf86cd799439017"
}
```

**Response:**
```json
{
  "message": "Inspection assigned successfully",
  "inspection": {
    "_id": "507f1f77bcf86cd799439018",
    "inspectorId": {
      "name": "Inspector Name"
    },
    "offerId": "507f1f77bcf86cd799439016"
  }
}
```

### 5.2 Get My Inspections (Inspector)
**GET** `/inspections/my-inspections`

**Headers:**
```
Authorization: Bearer <inspector_token>
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "offerId": {
      "requirementId": {
        "cropId": {
          "name": "Rice"
        }
      },
      "farmerId": {
        "name": "John Farmer",
        "phone": "9876543210"
      }
    },
    "isTransactionCompleted": false
  }
]
```

### 5.3 Complete Inspection (Inspector)
**PUT** `/inspections/:inspectionId/complete`

**Headers:**
```
Authorization: Bearer <inspector_token>
Content-Type: application/json
```

**Request Body (Accept):**
```json
{
  "quantityReal": 50,
  "finalRate": 25.50,
  "otpFromFarmer": "123456",
  "transactionStatus": "accept"
}
```

**Request Body (Reject):**
```json
{
  "quantityReal": 0,
  "finalRate": 0,
  "transactionStatus": "reject"
}
```

**Response:**
```json
{
  "message": "Inspection completed successfully",
  "inspection": {
    "_id": "507f1f77bcf86cd799439018",
    "quantityReal": 50,
    "finalRate": 25.50,
    "amount": 1275,
    "transactionStatus": "accept",
    "isTransactionCompleted": true
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions"
}
```

### 400 Bad Request
```json
{
  "error": "Please fill all required fields"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "error": "Error message"
}
```

---

## Testing Workflow

### Step 1: Create Admin (Auto-created)
- Already created with admin@t.com / admin@123

### Step 2: Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@t.com","password":"admin@123"}'
```

### Step 3: Create Crops
```bash
curl -X POST http://localhost:5000/api/admin/crops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"Rice","season":"Monsoon","type":"Basmati"}'
```

### Step 4: Register Mill Owner
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Mill Owner",
    "email":"mill@example.com",
    "phone":"9876543210",
    "address":"Industrial Area",
    "password":"password123",
    "role":"mill_owner",
    "licenseNo":"MILL123456",
    "millName":"Premier Mills",
    "millLocation":"District XYZ"
  }'
```

### Step 5: Verify Mill Owner (as Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/users/<mill_owner_id>/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"isVerified":true}'
```

### Step 6: Create Requirement (as Mill Owner)
```bash
curl -X POST http://localhost:5000/api/mill-requirements/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <mill_owner_token>" \
  -d '{
    "cropId":"<crop_id>",
    "quality":100,
    "requiredTotalQuantity":100,
    "expectedRate":25.50
  }'
```

### Step 7: Register Farmer & Create Offer
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Farmer",
    "email":"farmer@example.com",
    "phone":"9876543210",
    "address":"Village XYZ",
    "password":"password123",
    "role":"farmer"
  }'

# Create Offer
curl -X POST http://localhost:5000/api/sell-offers/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <farmer_token>" \
  -d '{"requirementId":"<requirement_id>","approxQuantitySell":50}'
```

### Step 8: Verify Inspector & Complete Transaction
- Similar workflow as mill owner
- Admin assigns inspection
- Inspector completes with OTP

---

## Using Postman

1. Create a new Collection: "AgroConnect"
2. Create requests for each endpoint
3. Use {{base_url}} as Variable: http://localhost:5000/api
4. Store token in {{token}} variable after login
5. Set Authorization header: Bearer {{token}}

Sample Postman environment:
```json
{
  "base_url": "http://localhost:5000/api",
  "token": "",
  "admin_id": "",
  "mill_owner_id": "",
  "farmer_id": "",
  "crop_id": "",
  "requirement_id": "",
  "offer_id": ""
}
```

---

## Tips

- Always save the token after login/register
- Use the correct role credentials for role-specific endpoints
- Remember OTP is case-sensitive (numeric)
- Requirement status auto-closes when quality reaches 0
- Only verified users can perform role-specific actions
- Update MongoDB URI if not using default localhost
