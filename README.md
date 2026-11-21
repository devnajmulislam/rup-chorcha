
# RupChorcha - Salon Booking Platform

**Beauty, Elegance & Confidence.**

RupChorcha is a full-stack salon booking platform where customers can explore salon services, book appointments, and make secure payments. Admins can manage services, appointments, customers, and transactions from a dashboard.

## Live Demo

- **Frontend:** https://rup-chorcha.vercel.app
- **Backend API:** https://rup-chorcha-backend.vercel.app

## Features

### Customer Features

- Browse and search available salon services.
- Filter services by category and price.
- View service details and available appointment slots.
- Book appointments based on salon hours (9:00 AM – 6:00 PM, Asia/Dhaka).
- View and manage appointments.
- Cancel pending appointments.
- Pay for confirmed appointments using Stripe Checkout.
- View payment history.
- Update profile information and profile image.

### Admin Features

- View dashboard statistics.
- Add, edit, activate, and manage salon services.
- Upload service images.
- View and manage customer appointments.
- Confirm or cancel appointments.
- Search, view, block, and unblock customer accounts.
- View and filter payment transactions.

### Other Features

- Email and password authentication.
- Google authentication.
- Role-based access for **customers** and **admins**.
- Protected routes and API endpoints.
- Server-side payment verification using Stripe webhooks.
- Responsive design for mobile, tablet, and desktop.
- Loading, error, empty, and 404 states.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui, Base UI |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | Better Auth, JWT |
| Payments | Stripe Checkout |
| Image Hosting | ImgBB |
| Validation | Zod |
| Deployment | Vercel |

## Project Structure

The project uses two separate repositories:

- **Frontend:** Next.js application and same-origin Backend-for-Frontend (BFF).
- **Backend:** Express REST API that handles authentication, database operations, appointments, and payments.

The frontend communicates with the backend through Next.js server-side code and API routes. It does not directly connect to MongoDB.

## Local Installation

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account
- Backend repository configured and running

### 1. Clone the frontend repository

```bash
git clone https://github.com/devnajmulislam/rup-chorcha.git
cd rup-chorcha
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:5000
```

See `.env.example` for the required configuration.

### 4. Start the backend

Clone and configure the backend repository separately.

Follow its README to set up MongoDB Atlas, authentication, Stripe, ImgBB, and the admin account.

Make sure the backend is running at:

```text
http://localhost:5000
```

### 5. Start the frontend

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

Run the following commands to check and build the application:

```bash
npx next typegen
npx tsc --noEmit
npm run lint
npm run build
```

To start the production server locally:

```bash
npm start
```

## Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public | Frontend application URL |
| `API_URL` | Server-only | Express backend API URL |

Database credentials, authentication secrets, Google OAuth credentials, and Stripe secret keys are managed in the backend repository.

**Important:** Never commit `.env` files or expose secret keys in frontend code.

## Repositories

- **Frontend:** https://github.com/devnajmulislam/rup-chorcha
- **Backend:** https://github.com/devnajmulislam/rup-chorcha-backend

---

Built as a full-stack project to practice and improve my skills in modern web development.
