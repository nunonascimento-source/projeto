# Measurements API Backend

Simple Node.js/Express backend for syncing measurements data across devices with authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Register User
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
Response: { "userId": "uuid", "token": "jwt-token", "email": "user@example.com", "name": "John Doe" }
```

### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: { "userId": "uuid", "token": "jwt-token", "email": "user@example.com", "name": "John Doe" }
```

### Add Measurement (Protected)
```
POST /api/measurements
Headers: Authorization: Bearer <token>
Body: {
  "date": "2024-01-26",
  "time": "14:30",
  "glicemia": 120,
  "insulina": 10.5,
  "observations": "After lunch"
}
```

### Get All Measurements (Protected)
```
GET /api/measurements
Headers: Authorization: Bearer <token>
Response: [{ id, userId, date, time, glicemia, insulina, observations, createdAt, updatedAt }, ...]
```

### Update Measurement (Protected)
```
PUT /api/measurements/:id
Headers: Authorization: Bearer <token>
Body: {
  "date": "2024-01-26",
  "time": "14:30",
  "glicemia": 120,
  "insulina": 10.5,
  "observations": "After lunch"
}
```

### Delete Measurement (Protected)
```
DELETE /api/measurements/:id
Headers: Authorization: Bearer <token>
```

## Deployment

You can deploy this to free platforms like:
- **Railway**: https://railway.app (recommended)
- **Render**: https://render.com
- **Fly.io**: https://fly.io

### Important: Before Deployment
1. Change the `JWT_SECRET` in `.env` to a strong, random string
2. Set `NODE_ENV=production`
3. Use a production-grade database (PostgreSQL recommended instead of SQLite)

For Railway:
1. Push to GitHub
2. Connect your GitHub repo to Railway
3. Set environment variables in Railway dashboard
4. Deploy!

## Environment Variables

```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
```


