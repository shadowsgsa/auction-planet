# ✅ Backend Port Changed to 3000

## What Was Changed

The backend server has been successfully configured to run on **port 3000** instead of port 3001.

---

## Files Updated

### Backend Configuration
1. **`.env`** - Changed `PORT=3001` to `PORT=3000`

### Frontend Configuration
2. **`client/.env`** - Changed `VITE_API_URL=http://localhost:3001/api` to `http://localhost:3000/api`
3. **`client/vite.config.js`** - Updated proxy target from port 5000 to port 3000

### Frontend API References (Fallback URLs)
4. **`client/src/services/api.js`** - Updated fallback URL
5. **`client/src/context/CartContext.jsx`** - Updated fallback URL
6. **`client/src/pages/Admin/AdminDashboard.jsx`** - Updated fallback URL
7. **`client/src/pages/Admin/UsersManagement.jsx`** - Updated fallback URL
8. **`client/src/pages/Admin/AuctionShopsManagement.jsx`** - Updated fallback URL
9. **`client/src/pages/Admin/DisputesManagement.jsx`** - Updated fallback URL
10. **`client/src/pages/Consignment.jsx`** - Updated fallback URL
11. **`client/src/pages/SellItem.jsx`** - Updated fallback URL
12. **`client/src/pages/BuyNow.jsx`** - Updated fallback URL

---

## How to Start the Application

### Terminal 1 - Backend (Port 3000)
```powershell
npm start
```
✅ Backend will run on: **http://localhost:3000**

### Terminal 2 - Frontend (Port 5173)
```powershell
cd client
npm run dev
```
✅ Frontend will run on: **http://localhost:5173**

---

## API Endpoints

All API endpoints are now accessible at:
```
http://localhost:3000/api
```

Examples:
- `http://localhost:3000/api/auth/login`
- `http://localhost:3000/api/auctions`
- `http://localhost:3000/api/admin/stats`
- `http://localhost:3000/api/products`

---

## Environment Variables

### Backend (`.env`)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Testing

1. **Start the backend**:
   ```powershell
   npm start
   ```
   You should see: `Server running on port 3000`

2. **Start the frontend**:
   ```powershell
   cd client
   npm run dev
   ```
   You should see: `Local: http://localhost:5173/`

3. **Test the connection**:
   - Open browser to `http://localhost:5173`
   - Try logging in or browsing products
   - Check browser console for any errors

---

## Troubleshooting

### Port 3000 already in use
If you get an error that port 3000 is already in use:

**Option 1: Kill the process using port 3000**
```powershell
# Find the process
netstat -ano | findstr :3000

# Kill it (replace PID with the actual process ID)
taskkill /PID <PID> /F
```

**Option 2: Use a different port**
Edit `.env` and change `PORT=3000` to another port like `PORT=3002`

### Frontend can't connect to backend
1. Make sure backend is running on port 3000
2. Check `client/.env` has `VITE_API_URL=http://localhost:3000/api`
3. Restart the frontend dev server after changing `.env`

### CORS errors
Make sure `CLIENT_URL=http://localhost:5173` is set in backend `.env`

---

## ✅ All Set!

Your backend is now configured to run on **port 3000**. 

Just run:
1. `npm start` (backend on port 3000)
2. `cd client && npm run dev` (frontend on port 5173)

And you're ready to go! 🚀

