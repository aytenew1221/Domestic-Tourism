# Ethio Tourism

Ethio Tourism is a Next.js web application that helps visitors explore Ethiopia’s historical sites, natural attractions, and cultural heritage. It supports destination discovery, trip planning, booking requests, user accounts, and administrative management.

## Features

- Explore destinations and view details.
- Plan trips and submit booking requests.
- Register, log in, and manage user accounts.
- Manage bookings, payments, and notifications.
- Provide staff and administrator dashboards.
- Support SEO and English/Amharic where configured.

## Technology Stack

- Next.js and React
- JavaScript and CSS
- Next.js Route Handlers
- Git and GitHub

## Getting Started

```bash
npm install
# Copy .env.example to .env.local and set strong unique secrets/credentials.
npm run dev
```

Open http://localhost:3000.

To build for production:

```bash
npm run build
npm start
```

## Main Routes

- `/` — Home
- `/about` — About Us
- `/destinations` — Destinations
- `/plan-trip` — Trip planning
- `/register` — Registration
- `/login` — Login
- `/dashboard` — User dashboard
- `/admin` — Admin dashboard

## Security

Protect user accounts, bookings, and payments with server-side authentication and authorization. Keep credentials and secrets out of GitHub.

## Testing

Run `npm run build` and test the main pages, authentication, booking workflows, and access permissions.

## Future Development

See [FUTURE.md](./FUTURE.md) for proposed improvements.

## Requirements

- Node.js compatible with the project's Next.js version
- npm (included with Node.js)
- Git (optional)
- A code editor such as Visual Studio Code

## Environment Variables

Create a `.env.local` file in the project root and configure the environment variables required by your application.

Example:

```env
APP_BASE_URL=http://localhost:3000
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

- `APP_BASE_URL`: The application's base URL.
- `ADMIN_EMAIL`: The administrator email, if required by your implementation.
- `ADMIN_PASSWORD`: The administrator password, if required by your implementation.

Use strong credentials and generate any required secret keys securely. Check your application's code for the exact variables it expects. Never commit `.env.local` or expose passwords and secrets in client-side code.

## Installation and Setup

1. Clone or download the repository.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create and configure `.env.local`.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Production Build

Test the application and build it for production:

```bash
npm run build
npm start
```

Configure production environment variables on your hosting platform before deployment.

## More

https://ethio-tourism-amber.vercel.app/

## Demo storage and deployment warning

This build intentionally uses an in-memory store instead of a database. It is suitable for local demos and single-process testing: users, bookings, payments, and notifications are lost when the server restarts, and separate serverless instances do not share state. Therefore it is **not reliable for a public live URL** where users expect accounts and bookings to persist. A persistent shared store is required for production; do not represent this demo as production-ready.

## Roles and demo flow

1. Set `SESSION_SECRET` (at least 32 bytes), `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env.local` or your hosting environment.
2. Start the app and sign in using the configured admin credentials. The administrator account is provisioned on first successful login.
3. Admin dashboard: create staff accounts, view accounts/bookings/payments, change roles, and remove non-admin accounts.
4. Customers register and submit bookings. Booking API accepts `destinationId` or an array `destinationIds`, travel date, optional return date, group size, and a personalized itinerary.
5. Staff can review bookings in `/staff`. Payment requests are simulated; approval must only be used for demo records or after independent payment verification. Demo payment does not transfer money.
6. Run `npm run test:security` against a running server with `TEST_BASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` set. The script tests unauthenticated writes, cross-account booking access (IDOR), role privilege boundaries, open redirects, and session tampering.

The three primary security scenarios covered by the test suite are unauthenticated write access, IDOR/cross-account access, and unsafe redirect/session manipulation. Run the suite against the deployed URL before declaring the live flow verified.

## Screenshots

<img width="866" height="411" alt="01" src="https://github.com/user-attachments/assets/efd68991-c2eb-4ddd-906d-9e69645556eb" />
<img width="911" height="425" alt="02" src="https://github.com/user-attachments/assets/670acc21-904e-4c4a-8019-2ac1e4b632c1" />
<img width="425" height="299" alt="03" src="https://github.com/user-attachments/assets/06d522c1-3f58-4539-85da-71f86e6d9277" />




## License

MIT License

Copyright (c) 2026 Aytenew.

Permission is granted to use, copy, modify, and distribute this software,
provided the copyright notice is included.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
