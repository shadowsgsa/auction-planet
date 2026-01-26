# Auction Planet - MERN Stack Auction Platform

A full-featured online auction platform built with the MERN stack (MongoDB, Express.js, React, Node.js), inspired by theauctionplanet.com.

## Features

### User Features
- **User Authentication**: Secure registration and login with JWT
- **Browse Auctions**: View all active, upcoming, and ended auctions
- **Search & Filter**: Search auctions by keywords and filter by category/status
- **Real-time Bidding**: Place bids with live updates using Socket.IO
- **User Dashboard**: Manage your auctions, bids, and wins
- **Create Auctions**: List items for auction with images and details

### Auction Features
- Multiple auction statuses (pending, active, ended, cancelled)
- Image upload support (up to 5 images per auction)
- Bid increment system
- Reserve price option
- Auction categories
- Time-based auction management
- Bid history tracking

### Technical Features
- Real-time updates with Socket.IO
- RESTful API architecture
- JWT-based authentication
- File upload with Multer
- Responsive design
- MongoDB database with Mongoose ODM

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Socket.IO Client for real-time updates
- CSS3 for styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auction-planet
JWT_SECRET=your_jwt_secret_key_change_this_in_production
CLIENT_URL=http://localhost:5173
```

3. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

4. Run the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the client directory:
```
VITE_API_URL=http://localhost:5000/api
```

4. Run the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:5173

## Usage

1. **Register an Account**: Create a new user account
2. **Browse Auctions**: View available auctions on the homepage or auctions page
3. **Create an Auction**: Click "Create Auction" to list an item
4. **Place Bids**: Click on an auction to view details and place bids
5. **Monitor Dashboard**: Track your auctions, bids, and wins in the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Auctions
- `GET /api/auctions` - Get all auctions (with filters)
- `GET /api/auctions/:id` - Get single auction
- `POST /api/auctions` - Create auction (auth required)
- `PUT /api/auctions/:id` - Update auction (auth required)
- `DELETE /api/auctions/:id` - Delete auction (auth required)

### Bids
- `POST /api/bids` - Place a bid (auth required)
- `GET /api/bids/auction/:auctionId` - Get auction bids
- `GET /api/bids/my-bids` - Get user's bids (auth required)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users/my-auctions` - Get user's auctions (auth required)
- `GET /api/users/my-wins` - Get user's wins (auth required)

## Project Structure

```
newAuction/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app component
│   └── package.json
├── models/                # MongoDB models
│   ├── User.js
│   ├── Auction.js
│   ├── Bid.js
│   └── Category.js
├── routes/                # Express routes
│   ├── auth.js
│   ├── auctions.js
│   ├── bids.js
│   ├── categories.js
│   └── users.js
├── middleware/            # Custom middleware
│   └── auth.js
├── uploads/              # Uploaded images
├── server.js             # Express server
└── package.json
```

## License

MIT

## Author

Built with ❤️ using the MERN stack

