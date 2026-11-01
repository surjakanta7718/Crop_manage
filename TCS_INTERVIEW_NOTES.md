# AgroConnect — TCS Interview Notes

## 1. Project introduction (30–45 seconds)

**AgroConnect is a MERN-stack crop trading platform that connects farmers directly with mill owners.** Mill owners publish crop requirements, farmers submit sell offers, and an admin assigns an inspector to verify the actual quantity, final rate, and farmer OTP. The platform reduces dependence on middlemen and makes the transaction workflow traceable.

I built it with React and Vite on the frontend, Node.js and Express on the backend, MongoDB with Mongoose for data storage, JWT for authentication, and bcrypt for password hashing.

## 2. Problem statement

In a traditional crop-selling process, farmers may have limited direct access to buyers, and quantity/quality verification can be unclear. AgroConnect provides:

- Direct farmer-to-mill requirement matching.
- Separate, controlled roles for farmer, mill owner, inspector, and admin.
- Inspection before accepting a transaction.
- OTP confirmation from the farmer to prevent unauthorised acceptance.

## 3. Your role — say this in first person

> I designed and developed the full-stack application. I created the React role-based dashboards and API integration, built Express REST APIs, designed MongoDB schemas, implemented JWT authentication and role-based authorization, and implemented the offer-to-inspection transaction flow including OTP validation and automatic amount calculation.

Only say “I developed it end-to-end” if that is true for you. If it was a team project, state your specific modules instead.

## 4. Users and permissions

| Role | What it can do |
|---|---|
| Farmer | Registers automatically as verified, views active requirements, creates sell offers, tracks offers and OTP. |
| Mill owner | Registers with licence and mill information; after admin verification, creates and closes crop requirements. |
| Inspector | Registers and waits for verification, views assignments, then accepts/rejects an inspection. |
| Admin | Verifies users, manages crop master data, views pending offers/inspections, and assigns inspectors. |

## 5. End-to-end workflow (explain in this order)

1. Admin creates the crop catalogue.
2. A mill owner registers; the admin verifies the account.
3. The verified mill owner creates an active requirement with crop, quality, target quantity, and expected rate.
4. A farmer views active requirements and creates a sell offer with an approximate quantity. The backend generates a six-digit OTP.
5. Admin assigns the offer to an inspector. The offer moves from `pending` to `assignedToInspector`.
6. Inspector records actual quantity and final rate. For acceptance, the inspector must enter the OTP given by the farmer.
7. On acceptance, the backend calculates `amount = quantityReal × finalRate`, marks the inspection complete, marks the offer `accept`, and deducts accepted quantity from the requirement. The requirement closes when its remaining quantity is zero or less.

## 6. Architecture explanation

```text
React + Vite dashboards
        |
        | Axios (Bearer JWT)
        v
Express REST API
  ├── auth middleware: verifies JWT
  ├── role middleware: checks allowed role
  ├── controllers: business workflow
  └── Mongoose models
        |
        v
MongoDB: Users, Crops, MillRequirements, SellOffers, Inspections
```

The frontend uses `AuthContext` for login state and `localStorage` for token persistence. Axios adds the JWT to API requests with a request interceptor. On the server, `auth` verifies the token and sets `req.user`; `roleCheck` permits only the required roles.

## 7. Data model — explain relationships

| Collection | Important fields | Relationship |
|---|---|---|
| `User` | name, email, phone, password, role, `isVerified` | One user may be a farmer, mill owner, inspector, or admin. |
| `Crop` | name, season, type | Referenced by mill requirements. |
| `MillRequirement` | millOwnerId, cropId, quality, requiredTotalQuantity, expectedRate, status | Belongs to a mill owner and crop. |
| `SellOffer` | requirementId, farmerId, approxQuantitySell, status, otp | Links a farmer to a requirement. |
| `Inspection` | inspectorId, offerId, quantityReal, finalRate, amount, transactionStatus | Links an inspector to one offer. |

Use this phrasing: “MongoDB fits well because user profiles and workflow records have flexible document structures, while Mongoose gives schema validation, references, and population for related data.”

## 8. Key implementation details

### Authentication and security

- Passwords are hashed with `bcryptjs` using a generated salt before storing them.
- Login compares the submitted password with the hash.
- On registration/login, the server creates a JWT containing user ID, email, and role. It expires after seven days.
- Sensitive routes use both JWT middleware and role middleware.
- The frontend protects dashboard routes too, but server-side authorization is the real security boundary.

### OTP logic

- A six-digit OTP is generated with `Math.random()` when a farmer creates an offer.
- It is stored with the offer.
- The inspector must submit the matching OTP only when accepting an inspection.
- Rejected transactions do not need quantity, rate, or OTP.

### Transaction calculation

On accepted inspection:

```js
amount = quantityReal * finalRate;
requirement.requiredTotalQuantity -= quantityReal;
```

If remaining required quantity is less than or equal to zero, requirement status becomes `closed`.

## 9. Important API examples

| Method and endpoint | Purpose | Access |
|---|---|---|
| `POST /api/auth/register` | Register a user | Public |
| `POST /api/auth/login` | Login and receive JWT | Public |
| `POST /api/admin/crops` | Add a crop | Admin |
| `PUT /api/admin/users/:userId/verify` | Verify a mill owner/inspector | Admin |
| `POST /api/mill-requirements/create` | Create a requirement | Mill owner |
| `GET /api/mill-requirements/active-requirements` | Browse requirements | Authenticated user |
| `POST /api/sell-offers/create` | Create farmer offer | Farmer |
| `POST /api/inspections/assign` | Assign an inspector | Admin |
| `PUT /api/inspections/:inspectionId/complete` | Accept/reject inspection | Inspector |

## 10. Likely TCS questions and strong answers

### Why did you choose MERN?

JavaScript is used on both client and server, which reduces context switching. React supports component-based dashboards, Express is lightweight for REST APIs, and MongoDB works naturally with JSON-like data. Mongoose adds schema-level validation and convenient reference population.

### How is role-based access control implemented?

After JWT verification, the decoded payload is attached to `req.user`. The `roleCheck` middleware receives an allowed-role list and rejects any token whose role is not allowed. For example, only an admin can assign inspections, and only an inspector can complete them.

### JWT versus session authentication?

JWT is stateless: after signing, the server can validate it without keeping session data in memory. This is convenient for APIs and horizontal scaling. Sessions can be revoked more directly on the server, so for a higher-security system I would add token rotation/revocation or use secure server-managed sessions.

### Why hash passwords? Why bcrypt?

Passwords must never be stored in plaintext. bcrypt hashes them with a salt and is intentionally slow, making brute-force attacks more expensive. At login, bcrypt compares the supplied password with the stored hash.

### How does React manage authentication state?

`AuthContext` stores the current user, token, loading state, and login/logout functions. Token and user information are persisted in `localStorage`, and an Axios interceptor attaches the token to outgoing API calls.

### How do you maintain data consistency after an accepted offer?

The inspection completion controller updates the inspection result, offer status, and remaining requirement quantity. In a production version, I would wrap these related updates in a MongoDB transaction so that all updates commit together or none do.

### What is Mongoose `populate` used for?

It resolves referenced ObjectIds into useful related documents. For example, an offer response can include the crop, farmer, and mill-owner information instead of returning only IDs.

### How did you validate input?

Controllers check required fields and business conditions such as valid status, existing requirement, active requirement, and offered quantity not exceeding requested quantity. The schemas also enforce required fields and enums. For production, I would add a dedicated request-validation layer such as Zod/Joi/express-validator.

### What happens when an offer is accepted or rejected?

Accept: validate OTP, record real quantity/rate, calculate amount, complete the inspection, set offer status to `accept`, and reduce the requirement quantity. Reject: complete the inspection with zero values and set the offer to `reject`; requirement quantity is unchanged.

### How would you prevent two farmers from overselling the same requirement?

The current implementation checks quantity when an offer is created, but concurrent accepted inspections can still race. I would use a MongoDB transaction with an atomic conditional update such as `requiredTotalQuantity >= quantityReal`, reserve quantities at assignment/acceptance, and reject the update when no sufficient quantity remains.

## 11. Honest limitations in the current code (and how you would improve them)

Mention these if asked about challenges, testing, production readiness, or improvements. Being precise here is a strength.

| Current limitation | Production improvement |
|---|---|
| OTP uses `Math.random()`, is stored in plaintext, and is returned in the API response. | Use `crypto.randomInt`, hash OTPs, expire them, limit retries, and send through SMS/email. |
| Related acceptance updates are separate database writes. | Use a MongoDB session/transaction and atomic quantity checks. |
| Controllers do not verify ownership in every update/read route. For example, a mill owner can currently change another requirement if its ID is known; generic detail endpoints are broadly accessible to any logged-in user. | Scope queries by `req.user.id` and role; apply least-privilege authorization to every resource. |
| Admin assignment does not validate that inspector exists, has the inspector role, is verified, or that the offer is still pending/not already assigned. | Validate each condition and enforce one active inspection per offer with a unique index. |
| Numeric values accept zero/negative values in several paths. | Enforce positive numbers and sensible limits in schema and request validation. |
| JWT is kept in `localStorage`. | Prefer short-lived access token plus refresh token in secure, HttpOnly, SameSite cookies, with CSRF protection as appropriate. |
| CORS and frontend API ports are hard-coded for development. | Use environment-based configuration and a restricted production origin. |
| There are no automated tests. | Add unit tests for controllers/middleware, API integration tests with Supertest, and React component/E2E tests. |

## 12. Future enhancements

- SMS/email OTP and real-time status notifications.
- Payment gateway with payment status and receipts.
- Document/KYC upload and admin review.
- Search, filters, crop-price analytics, and reports.
- Ratings/dispute process and audit logs.
- Object storage for inspection photos and quality evidence.
- Docker, CI/CD, environment secrets, logging, monitoring, rate limiting, and automated tests.

## 13. Quick technical revision

- **REST API:** Resource-based HTTP endpoints; POST creates, GET reads, PUT updates, DELETE removes.
- **HTTP codes:** 200 success, 201 created, 400 invalid request, 401 unauthenticated/invalid token, 403 unauthorised, 404 not found, 500 server error.
- **Middleware:** Function that runs before the controller; used here for JWT and role checks.
- **CORS:** Browser restriction on cross-origin requests; backend specifies which frontend origins may call it.
- **React Context:** Shares global data, such as authentication state, without passing props through every level.
- **Axios interceptor:** Central place to add the authorization header to every request.
- **Index:** MongoDB structure that speeds lookup; `email` and `phone` are marked unique in the user schema.
- **Environment variable:** Configuration kept outside source code, e.g. database URI, JWT secret, port.

## 14. Two-minute project explanation

> My project is AgroConnect, a MERN-stack crop trading platform. Its goal is to help farmers connect directly with mill owners and to make the crop-selling process more transparent. There are four roles: farmer, mill owner, inspector, and admin.
>
> First, an admin manages crop data and verifies mill owners and inspectors. A verified mill owner creates a crop requirement with quantity, quality, and expected price. Farmers can browse active requirements and submit a sell offer. At that point the backend creates a six-digit OTP for confirmation. The admin assigns an inspector, who verifies the actual quantity and negotiated rate. If the farmer OTP is valid, the transaction is accepted, the total amount is calculated, and the remaining requirement quantity is updated automatically.
>
> The frontend uses React, Vite, Context API, React Router, and Axios. The backend is Node.js and Express with MongoDB/Mongoose. Authentication is JWT-based, passwords are hashed with bcrypt, and Express middleware enforces role-based access. One key learning was that multi-document business updates need careful consistency handling; for a production version I would use MongoDB transactions, stronger request validation, secure expiring OTP delivery, and automated tests.

## 15. Demo checklist

1. Start MongoDB, backend, then frontend.
2. Login as admin and create a crop.
3. Register/verify a mill owner and inspector.
4. Create a mill requirement.
5. Register/login as farmer, make an offer, and note the OTP.
6. As admin, assign the offer to the inspector.
7. As inspector, accept it using the OTP; show calculated amount and updated offer status.
8. Explain one improvement: atomic transactions for concurrent offers.

Do not share real default passwords, JWT secrets, database URLs, or OTP values in an interview demo or public repository.
