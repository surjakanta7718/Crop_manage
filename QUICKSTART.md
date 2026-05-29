# Quick Start Guide for AgroConnect

## Prerequisites
- Node.js installed on your system
- MongoDB running (can use MongoDB community edition)

## Step-by-Step Guide

### 1. Start MongoDB
If MongoDB is installed locally:
```bash
mongod
```

### 2. Start Backend Server

**Terminal 1:**
```bash
cd backend
npm install
npm start
```

The server will:
- Start on http://localhost:5000
- Create admin user (admin@t.com / admin@123)
- Connect to MongoDB

### 3. Start Frontend Server

**Terminal 2:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will start on http://localhost:5173 (or next available port)

## Test the Application

### Step 1: Login as Admin
- Go to http://localhost:5173/login
- Email: `admin@t.com`
- Password: `admin@123`
- Click "Admin Dashboard"
- Create some crops to get started

### Step 2: Register as Mill Owner
- Logout or open in incognito window
- Go to Register page
- Select role: "Mill Owner"
- Fill all details including License No, Mill Name, Mill Location
- Wait for admin to verify your account

### Step 3: Admin Verify Mill Owner
- Login as admin
- Go to "Manage Users" tab
- Find the mill owner and click "Verify"

### Step 4: Register as Farmer
- Go to Register page
- Select role: "Farmer"
- Fill details and register (auto-verified)
- List of available requirements will be visible

### Step 5: Register as Inspector
- Go to Register page
- Select role: "Inspector"
- Fill details and register
- Wait for admin to verify

### Step 6: Admin Verify Inspector
- Login as admin
- Go to "Manage Users" tab
- Find inspector and click "Verify"

## Complete Workflow Example

### Create a Transaction:

1. **Admin** creates crops (e.g., Rice, Wheat, Corn)
2. **Mill Owner** (verified) creates requirement:
   - Selects crop: Rice
   - Quality Need: 100 units
   - Required Quantity: 100 units
   - Expected Rate: $10/unit

3. **Farmer** creates sell offer:
   - Selects Mill Owner's requirement
   - Enters quantity: 50 units
   - Gets OTP (e.g., 123456)

4. **Admin** assigns inspector to the offer

5. **Inspector** completes inspection:
   - Enters actual quantity: 50 units
   - Final rate: $10/unit
   - OTP from farmer: 123456
   - Status: Accept

6. **Transaction Complete!**
   - Amount calculated: 50 × $10 = $500
   - Requirement quality reduced by 50 units
   - Offer status updated to "accept"

## Important Notes

- **Farmers** are auto-verified on registration
- **Mill Owners** and **Inspectors** must be verified by admin before using full features
- **OTP** is critical - it's how inspector verifies the farmer
- Keep your JWT token in localStorage - it's used for all requests
- Each role has different page access - cannot access other role's pages

## Common Issues

### "Requirement not found"
- Make sure the requirement is still active (admin may have closed it)

### "OTP does not match"
- Enter the exact OTP from the farmer's sell offer

### "Cannot create requirement"
- Wait for admin to verify your mill owner account

### "Port already in use"
- Change PORT in backend .env file or kill process using the port

## File Structure Quick Reference

- Backend API: `backend/server.js`
- Frontend App: `frontend/src/App.jsx`
- Routes: `frontend/src/pages/` & `frontend/src/dashboards/`
- Authentication: `frontend/src/context/AuthContext.jsx`
- API Calls: `frontend/src/services/api.js`

## Next Steps

1. Explore each dashboard
2. Try creating a complete transaction
3. Check error messages and understand the flow
4. Customize styling in `frontend/src/App.css`
5. Add more features as needed

Happy coding! 🚀
