# AgroConnect - Agriculture Crop Selling Platform

AgroConnect is a MERN stack web application that enables farmers to directly sell crops to mill owners. The platform provides role-based access for Farmers, Mill Owners, Inspectors, and Admins.

## Features

### Admin Features
- Manage user verification (Inspectors and Mill Owners)
- Create and manage available crops
- View all inspections and transactions
- Assign inspections to verified inspectors
- Monitor pending sell offers

### Mill Owner Features
- Register and wait for admin verification
- Create crop requirements after verification
- View all active requirements
- Track all inspections related to requirements
- Close requirements when fully satisfied

### Farmer Features
- Register (auto-verified)
- View all active requirements from mill owners
- Create sell offers for crops
- Track offers and their statuses
- Receive OTP for transaction verification

### Inspector Features
- Register and wait for admin verification
- View assigned inspections
- Complete inspections by verifying:
  - Actual quantity received
  - Final negotiated rate
  - OTP from farmer (for acceptance)
- Accept or reject transactions

## Project Structure

```
AgroConnect/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Crop.js
│   │   ├── MillRequirement.js
│   │   ├── SellOffer.js
│   │   └── Inspection.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── millOwnerController.js
│   │   ├── farmerController.js
│   │   └── inspectionController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── millRequirementRoutes.js
│   │   ├── sellOfferRoutes.js
│   │   └── inspectionRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── config/
│   │   ├── db.js
│   │   └── initializeAdmin.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── AssignInspector.jsx
    │   ├── dashboards/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── MillOwnerDashboard.jsx
    │   │   ├── FarmerDashboard.jsx
    │   │   └── InspectorDashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017 or update MongoDB URI in .env)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` file with your settings (already pre-configured):
```
MONGODB_URI=mongodb://localhost:27017/agroconnect
JWT_SECRET=your_jwt_secret_key_here_change_it_in_production
ADMIN_EMAIL=admin@t.com
ADMIN_PASSWORD=admin@123
PORT=5000
```

4. Start the backend server:
```bash
npm start
```

The server will:
- Connect to MongoDB
- Create the admin user automatically on first run
- Run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Admin Credentials

For testing the admin functionality:
- **Email:** admin@t.com
- **Password:** admin@123

## User Workflows

### 1. Farmer Registration & Selling
1. Register as a Farmer (auto-verified)
2. Login to view available requirements
3. Click "Make Deal" on any requirement
4. Enter quantity to sell
5. Get an OTP (keep it safe)
6. Inspector will inspect the crop
7. Inspector verifies OTP and completes transaction

### 2. Mill Owner Registration & Creating Requirements
1. Register as a Mill Owner with license details
2. Wait for admin verification
3. Once verified, login and create requirements
4. Select crop, quantity, quality, and expected rate
5. Farmers will send offers for your requirements
6. Admin assigns inspectors to verify offers
7. View inspection results and accepted transactions

### 3. Admin Workflow
1. Login with default credentials
2. Go to "Manage Users" tab to verify Mill Owners & Inspectors
3. Go to "Manage Crops" tab to create available crops
4. Go to "Pending Offers" tab to assign inspectors
5. Check "Inspections" tab to monitor all transactions

### 4. Inspector Workflow
1. Register as Inspector
2. Wait for admin verification
3. Once verified, get assigned inspections
4. Click "Complete Inspection" on each
5. Enter actual quantity, final rate, and farmer's OTP
6. Accept or reject the transaction

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/verify` - Verify/unverify user
- `POST /api/admin/crops` - Create crop
- `GET /api/admin/crops` - Get all crops
- `DELETE /api/admin/crops/:cropId` - Delete crop

### Mill Requirements
- `POST /api/mill-requirements/create` - Create requirement
- `GET /api/mill-requirements/my-requirements` - Get mill owner's requirements
- `GET /api/mill-requirements/active-requirements` - Get active requirements
- `PUT /api/mill-requirements/:requirementId/status` - Update status


### Sell Offers
- `POST /api/sell-offers/create` - Create offer
- `GET /api/sell-offers/my-offers` - Get farmer's offers
- `GET /api/sell-offers/all-pending` - Get all pending offers
- `GET /api/sell-offers/:offerId` - Get offer details

### Inspections
- `POST /api/inspections/assign` - Assign inspection
- `GET /api/inspections/all` - Get all inspections
- `GET /api/inspections/my-inspections` - Get inspector's inspections
- `GET /api/inspections/:inspectionId` - Get inspection details
- `PUT /api/inspections/:inspectionId/complete` - Complete inspection

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool

## Key Features Implementation

### OTP System
- Random 6-digit OTP generated when farmer creates offer
- OTP is visible only to the farmer
- Inspector must enter correct OTP to accept transaction
- Prevents unauthorized transactions

### Status Management
- Sell Offer: pending → assignedToInspector → accept/reject
- Inspection: pending → accept/reject → isTransactionCompleted
- Mill Requirement: active → closed (auto when quality reaches 0)

### Authorization
- Role-based access control middleware
- Protected routes for sensitive operations
- Request headers contain JWT token

## Future Enhancements

1. Email/SMS notifications for OTP and status updates
2. Payment gateway integration
3. Reviews and ratings system
4. Real-time chat between farmers and mill owners
5. Analytics dashboard for insights
6. Mobile app version
7. Advanced search and filtering
8. Document upload for verification
9. Bulk operations for admins
10. Audit logs

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Default: mongodb://localhost:27017/agroconnect

### Port Already in Use
- Backend: Change PORT in .env file
- Frontend: Vite will auto-increment if 5173 is in use

### CORS Issues
- Backend CORS is already configured to accept all origins
- If issues persist, update backend/server.js CORS settings

### Token Expiration
- Tokens expire after 7 days
- User must login again after token expires

## Contributing

This project is ready for development. Make sure to:
1. Create branches for new features
2. Follow consistent naming conventions
3. Test thoroughly before pushing changes

## License

MIT License - Feel free to use for personal and commercial projects

## Support

For issues or questions, please create an issue in the repository.

---

**Happy Farming with AgroConnect!** 🌾
