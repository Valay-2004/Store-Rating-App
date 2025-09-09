# Project README.md

```markdown
# Store Rating System

A full-stack web application that allows users to rate stores on a platform. Built with React.js frontend, Express.js backend, and PostgreSQL database.

## Features

### User Roles
- **System Administrator**: Manage users, stores, and view analytics
- **Normal User**: Register, login, browse stores, and submit ratings
- **Store Owner**: View store ratings and user feedback

### Key Functionalities
- User registration and authentication with JWT
- Role-based access control
- Store management (CRUD operations)
- Rating system (1-5 stars)
- Search and filtering capabilities
- Dashboard analytics
- Form validation
- Responsive design

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React.js** with hooks
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## Installation & Setup

### Prerequisites
- Node.js (v20+)
- PostgreSQL (v17+)
- Git

```
### Backend Setup
1. Clone the repository:

```bash
git clone <your-repo-url>
cd fullstack-rating-app/server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Run the database initialization script
\i database/init.sql
```

5. Start the server:
```bash
npm run dev  # Development
npm start    # Production
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd ../client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API endpoint
```

4. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/password` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create store (Admin only)
- `PUT /api/stores/:id` - Update store (Admin only)
- `DELETE /api/stores/:id` - Delete store (Admin only)
- `GET /api/stores/dashboard/my-store` - Get store dashboard (Store Owner)

### Ratings
- `POST /api/ratings/store/:storeId` - Submit rating
- `GET /api/ratings/store/:storeId/my-rating` - Get user's rating for store
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating
- `GET /api/ratings/my-ratings` - Get user's all ratings
- `GET /api/ratings/store/:storeId` - Get store ratings

## Database Schema

### Users Table
- id (Primary Key)
- name (20-60 characters)
- email (Unique)
- password (Hashed)
- address (Max 400 characters)
- role (admin, user, store_owner)
- created_at, updated_at

### Stores Table
- id (Primary Key)
- name
- email (Unique)
- address (Max 400 characters)
- owner_id (Foreign Key to users)
- average_rating
- total_ratings
- created_at, updated_at

### Ratings Table
- id (Primary Key)
- user_id (Foreign Key to users)
- store_id (Foreign Key to stores)
- rating (1-5)
- created_at, updated_at
- Unique constraint on (user_id, store_id)

## Validation Rules

- **Name**: 20-60 characters, letters and spaces only
- **Email**: Standard email format validation
- **Password**: 8-16 characters, at least one uppercase letter and one special character
- **Address**: Maximum 400 characters
- **Rating**: Integer between 1 and 5

## Default Accounts

### Admin Account
- Email: admin@example.com
- Password: Admin@123

### Test Users
- Email: john@example.com, sarah@example.com
- Password: Admin@123

## Deployment

### Free Hosting Options
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render (free tiers)
- **Database**: Neon, Supabase (PostgreSQL)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
<!-- 
## License

MIT License - see LICENSE file for details
``` -->
