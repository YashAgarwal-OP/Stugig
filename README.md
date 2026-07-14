# StuGig - Student Freelance Marketplace

A full-stack freelance marketplace platform tailored for students, featuring job postings, bidding, real-time chat, payments, and AI-powered matching.

## 🚀 Features

- **User Authentication** - JWT-based signup/login with role-based access (Freelancer, Client, Admin)
- **Job Marketplace** - Post jobs, browse opportunities, submit bids
- **Service Listings** - Freelancers can create service offerings
- **Real-time Chat** - Socket.io powered messaging between clients and freelancers
- **Payment System** - Stripe integration with 15% platform commission
- **Reviews & Ratings** - Rate and review completed jobs
- **AI Features** - Gemini-powered job matching and bid assistance
- **Admin Dashboard** - User management, analytics, dispute resolution
- **Email Notifications** - Welcome emails, bid notifications, password reset

## 📦 Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Nodemailer** - Email delivery

## 📁 Project Structure

```
stugig/
├── backend/              # Express.js API
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions (email, etc.)
│   ├── app.js           # Express app setup
│   └── server.js        # HTTP + Socket.io server
│
├── client/              # React frontend
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── api/         # Axios client
│   │   ├── components/  # React components (atoms/molecules/organisms)
│   │   ├── context/     # React Context (Auth, Theme)
│   │   ├── pages/       # Page components
│   │   └── App.jsx      # Root component
│   └── vite.config.js   # Vite configuration
│
└── render.yaml          # Render deployment config
```

## 🛠️ Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Stripe account (test mode)
- (Optional) Gmail app password for emails

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/stugig
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_your_key
CLIENT_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```
Note: In development, `VITE_API_URL` is NOT needed (Vite proxy handles it)

5. Start the dev server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## 🌐 Deployment to Render

### Quick Deploy

1. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **MongoDB Atlas Setup**:
   - Create cluster at https://cloud.mongodb.com/
   - Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
   - Copy connection string

3. **Deploy Backend**:
   - Render Dashboard → New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add environment variables (see `backend/.env.render`)

4. **Deploy Frontend**:
   - Render Dashboard → New → Static Site
   - Connect GitHub repo
   - Root Directory: `client`
   - Build: `npm install && npm run build`
   - Publish: `dist`
   - Add environment variables:
     - `VITE_API_URL=https://your-backend.onrender.com`
     - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

5. **Update Backend**:
   - Go to backend service → Environment
   - Update `CLIENT_URL` to frontend URL
   - Manually redeploy

📖 **Detailed Guide**: See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)

## 🧪 Testing

### Test Backend API:
```bash
cd backend
npm test
```

### Test Signup Endpoint:
```bash
node test-signup.js http://localhost:5000
# or for production:
node test-signup.js https://your-backend.onrender.com
```

### Manual API Testing:
```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","role":"freelancer"}'
```

## 🔧 Common Issues

### "Signup not working on Render"

1. **Check backend logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Test backend health**: Visit `https://your-backend.onrender.com/api/health`
4. **Check browser console** for error messages (F12 → Console)
5. **Verify MongoDB Atlas** allows access from 0.0.0.0/0

Common causes:
- Missing `VITE_API_URL` in frontend env vars
- Wrong `MONGO_URI` or MongoDB network access blocked
- CORS issues (already handled in code)

### "Database connection failed"

- Verify MongoDB Atlas connection string
- Check Network Access allows 0.0.0.0/0
- Ensure password in URI is URL-encoded if it contains special characters

### "JWT errors"

- Verify `JWT_SECRET` is set and consistent between deployments
- Check token is being sent in Authorization header

## 📚 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job (Client only)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Bids
- `GET /api/bids` - List bids
- `POST /api/bids` - Submit bid (Freelancer only)
- `PUT /api/bids/:id/accept` - Accept bid (Client only)
- `PUT /api/bids/:id/reject` - Reject bid

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout session
- `POST /api/payments/webhook` - Stripe webhook handler

### Messages
- `GET /api/messages/:jobId` - Get conversation messages
- WebSocket events: `send-message`, `typing`, `new-message`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Yash Agarwal

## 🆘 Support

For issues and questions:
1. Check [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
2. Review backend logs in Render dashboard
3. Check browser console for frontend errors
4. Open an issue on GitHub with:
   - Error message
   - Backend logs
   - Steps to reproduce
