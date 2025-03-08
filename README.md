# Product Order Manager

## Overview

**Product Order Manager** is a Purchase Order Management System built using **ASP.NET Core** for the backend and **React.js** for the frontend. It provides CRUD operations for managing users, suppliers, purchase orders, PO items, payments, and audit logs.

## Features

- **User Management** (Create, Update, Delete Users)
- **Supplier Management**
- **Purchase Order (PO) Processing**
- **PO Item Management**
- **Payment Tracking**
- **JWT Authentication**
- **CORS Support**

## Tech Stack

### Backend
- **ASP.NET Core**
- **Entity Framework Core**
- **MySQL** (via `Pomelo.EntityFrameworkCore.MySql`)
- **JWT Authentication**
- **Swagger for API Documentation**

### Frontend
- **React.js**
- **Axios for API Requests**

---

## API Endpoints

### 📌 User Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get a user by ID |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/{id}` | Update user details |
| DELETE | `/api/users/{id}` | Delete a user |

### 📌 Supplier Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/suppliers` | Get all suppliers |
| GET | `/api/suppliers/{id}` | Get supplier by ID |
| POST | `/api/suppliers` | Create new supplier |
| PUT | `/api/suppliers/{id}` | Update supplier |
| DELETE | `/api/suppliers/{id}` | Delete supplier |

### 📌 Purchase Order Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/purchaseorders` | Get all purchase orders |
| GET | `/api/purchaseorders/{id}` | Get purchase order by ID |
| POST | `/api/purchaseorders` | Create a new purchase order |
| PUT | `/api/purchaseorders/{id}` | Update purchase order |
| DELETE | `/api/purchaseorders/{id}` | Delete purchase order |

### 📌 PO Items Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/poitems` | Get all PO items |
| GET | `/api/poitems/{id}` | Get PO item by ID |
| POST | `/api/poitems` | Create a new PO item |
| PUT | `/api/poitems/{id}` | Update PO item |
| DELETE | `/api/poitems/{id}` | Delete PO item |

### 📌 Payment Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/{id}` | Get payment by ID |
| POST | `/api/payments` | Create new payment |
| PUT | `/api/payments/{id}` | Update payment |
| DELETE | `/api/payments/{id}` | Delete payment |

---

## Installation

### 📌 Backend Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/santosh-shetty/ProductOrderManager.git
   cd ProductOrderManager/backend
   ```

2. Install dependencies:
   ```sh
   dotnet restore
   ```

3. Configure the database in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "server=localhost;database=productOrderManager;user=root;password=yourpassword;"
   }
   ```

4. Run migrations:
   ```sh
   dotnet ef database update
   ```

5. Start the server:
   ```sh
   dotnet run
   ```

### 📌 Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd ProductOrderManager/frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm start
   ```

---

## Authentication

- The system uses **JWT authentication**.
- When a user logs in, they receive a **JWT token** that must be included in all API requests as a **Bearer token**.

---

## Deployment

### 📌 Backend Deployment
1. Build and publish the application:
   ```sh
   dotnet publish -c Release -o out
   ```
2. Use a hosting provider like **Azure, AWS, or Docker**.

### 📌 Frontend Deployment
1. Build the frontend for production:
   ```sh
   npm run build
   ```
2. Deploy to **Vercel, Netlify, or any static hosting provider**.

---

## Contributing

1. **Fork** the repository.
2. Create a **new branch**:
   ```sh
   git checkout -b feature-branch
   ```
3. Commit your changes:
   ```sh
   git commit -m "Added new feature"
   ```
4. Push to your branch:
   ```sh
   git push origin feature-branch
   ```
5. Create a **pull request**.

---

## License

This project is licensed under the **MIT License**.
