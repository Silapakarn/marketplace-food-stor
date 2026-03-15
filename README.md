# 🍽️ Food Marketplace Application

A full-stack marketplace application with cart management, inventory locking, and dynamic pricing.

**Tech Stack:** Next.js • NestJS • PostgreSQL • Prisma • Ant Design • Tailwind CSS

## ✨ Features

- 🛒 Smart cart with real-time updates
- 🔐 Red Set inventory locking (1-hour exclusive access)
- 💰 Dynamic pricing (Pair 5% + Member 10% discounts)
- 🎨 Modern UI with Ant Design
- 🚀 Production-ready database locks

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+, PostgreSQL 14+, npm

### Install & Run
```bash
# 1. Clone & install
git clone <repo-url> && cd marketplace-food-stor
cd apps/backend && npm install
cd ../frontend && npm install

# 2. Setup database
createdb food_store_calculator
cd apps/backend
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/food_store_calculator"' > .env

# 3. Run migrations & seed
npx prisma migrate dev
npx prisma db seed

# 4. Start services
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Frontend  
cd ../frontend && npm run dev
```

## 🌐 Access
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: `npx prisma studio`

## 📚 Key APIs
```bash
GET /api/products                           # List products
POST /api/orders                            # Create order
GET /api/orders/red-set/:id/availability    # Check Red Set lock
```

## 🧪 Test Red Set Locking
```bash
# Terminal 1: First order (succeeds)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": 1, "quantity": 2}]}'

# Terminal 2: Second order (blocked for 1 hour)
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": 1, "quantity": 2}]}'
```

## 🛠️ Database Management
```bash
cd apps/backend
npx prisma migrate dev          # Apply changes
npx prisma studio              # View data
npx prisma migrate reset       # Reset (dev only)
```

## 📁 Project Structure
```
marketplace-food-stor/
├── apps/backend/              # NestJS API
├── apps/frontend/             # Next.js UI  
├── database/                  # SQL scripts
└── README.md                  # This file
```

## 🔧 Troubleshooting
- **DB Connection:** Check PostgreSQL is running
- **CORS Issues:** Verify backend on port 3001
- **Stuck Locks:** `DELETE FROM inventory_locks WHERE expires_at < NOW();`

See `INVENTORY_LOCK.md` for detailed locking system documentation.

---
**Status:** ✅ Production Ready
