# Backend API

Production-ready Node.js/Express backend with modular architecture, comprehensive validation, error handling, and security features.

## 🚀 Features

- **Modular Architecture**: Organized with Controllers, Services, Models, and Routes
- **Security**: Helmet, CORS, Rate Limiting, JWT Authentication
- **Validation**: Express-validator with comprehensive input validation
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Winston logger with file rotation and console output
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based auth with refresh tokens
- **Role-Based Access Control**: Authorization middleware for protected routes

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Auth endpoints
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── notFoundHandler.js   # 404 handler
│   │   └── validate.js          # Validation middleware
│   ├── models/
│   │   └── User.js              # User model
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   └── index.js             # Route aggregator
│   ├── services/
│   │   └── authService.js       # Business logic
│   ├── utils/
│   │   ├── AppError.js          # Custom error class
│   │   ├── asyncHandler.js      # Async wrapper
│   │   ├── jwtUtils.js          # JWT utilities
│   │   └── logger.js            # Winston logger
│   ├── validators/
│   │   └── authValidator.js     # Validation rules
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── logs/                        # Log files
├── .env.example                 # Environment template
├── .gitignore
└── package.json
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `CORS_ORIGIN`: Frontend URL (default: http://localhost:3000)

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| GET | `/api/v1/auth/profile` | Get user profile | Private |
| PUT | `/api/v1/auth/profile` | Update profile | Private |

### Example Requests

**Register User**:
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Login**:
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Get Profile** (Protected):
```bash
GET /api/v1/auth/profile
Authorization: Bearer <your-jwt-token>
```

## 🔒 Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents brute-force attacks
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password encryption
- **Input Validation**: Express-validator for request validation
- **Error Sanitization**: Prevents sensitive data leakage

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/myapp_db |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed origin | http://localhost:3000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🧪 Testing

```bash
npm test
```

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🏗️ Architecture Patterns

### Controller-Service Pattern
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define data structure and validation

### Middleware Chain
1. Security (Helmet, CORS)
2. Rate Limiting
3. Body Parsing
4. Logging
5. Routes
6. 404 Handler
7. Error Handler

## 📚 Adding New Features

1. **Create Model** in `src/models/`
2. **Create Service** in `src/services/`
3. **Create Controller** in `src/controllers/`
4. **Create Validator** in `src/validators/`
5. **Create Routes** in `src/routes/`
6. **Register Routes** in `src/routes/index.js`

## 🤝 Contributing

Follow the existing code structure and patterns. Ensure all new code includes:
- Input validation
- Error handling
- Logging
- JSDoc comments

## 📄 License

ISC
