# 🌾 FarmConnect — Farmer to Buyer Marketplace

A MERN stack web app where farmers can list and sell their crops directly to buyers — like OLX but for farms.

---

## 🏗️ Tech Stack
- **Frontend**: React.js, React Router, Axios, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + OTP Verification
- **File Upload**: Multer (product images)

---

## 📁 Project Structure
```
farmConnect/
├── backend/          # Node.js + Express API
│   ├── models/       # Mongoose schemas (User, Product, Order)
│   ├── routes/       # API routes (auth, products, orders)
│   ├── middleware/   # JWT auth middleware
│   ├── server.js
│   └── .env.example
└── frontend/         # React app
    └── src/
        ├── pages/    # Home, Login, Register, Marketplace, etc.
        ├── components/ # Navbar
        └── context/  # AuthContext
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup
```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, etc.

# Create uploads folder
mkdir uploads

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 🔑 Key Features

### Auth
- Register as **Farmer** or **Buyer**
- OTP verification (sent to email/phone — dev mode shows OTP in response)
- Strong password validation (uppercase, lowercase, number, special char)
- JWT token-based sessions

### Farmers Can:
- List crops with images, price, quantity, category
- Edit or delete listings
- View and manage received orders
- Update order status (pending → confirmed → shipped → delivered)
- See revenue dashboard

### Buyers Can:
- Browse marketplace by category, search, price
- View product details and farmer contact
- Place orders with delivery address
- Track order status with progress bar
- Cancel pending orders

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/verify-otp | Verify OTP |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/resend-otp | Resend OTP |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products (filters supported) |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Create product (farmer only) |
| PUT | /api/products/:id | Update product (farmer only) |
| DELETE | /api/products/:id | Delete product (farmer only) |
| GET | /api/products/farmer/my-products | Farmer's own products |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order (buyer) |
| GET | /api/orders/my-orders | Buyer's orders |
| GET | /api/orders/farmer-orders | Farmer's received orders |
| PUT | /api/orders/:id/status | Update order status |

---

## 🔧 Production Notes
1. Remove `otp` from register/resend-otp API responses
2. Connect Nodemailer (Gmail) or Twilio for real OTP delivery
3. Use MongoDB Atlas for cloud database
4. Store images on Cloudinary instead of local disk
5. Add HTTPS and rate limiting for production

---

## 📱 Next Steps (Mobile App)
Per your notes, to build Android/iOS apps:
- Use **React Native** to share logic with this codebase
- Or **Flutter** for a truly native experience
- The backend API works as-is for mobile too!
