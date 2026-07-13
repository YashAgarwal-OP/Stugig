# StuGig Project Overview and Guidelines

## Project Summary
StuGig is a student-focused freelance marketplace where students can offer services, post job requests, bid on tasks, communicate securely, and complete payments with ratings and reviews. It is tailored for academic and peer-to-peer work, operating similarly to Fiverr/Upwork.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS, axios
- **State Management:** Context API or Redux Toolkit
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens) + Bcrypt
- **Real-time Communication:** Socket.io (for chat and typing indicators)
- **Payments:** Stripe (sandbox mode)

## Folder Structure (Monorepo)
The project will be organized as a monorepo with clear separation between the client and server:
- `/client` (React App)
  - `/pages`
  - `/components`
  - `/context`
  - `/api`
- `/server` (Express API)
  - `/routes`
  - `/controllers`
  - `/models`
  - `/middleware`

## Coding Conventions
- Use functional React components.
- Prefer `async/await` over `.then()` chains.
- Use RESTful route naming that exactly matches the API documentation (e.g., `/api/auth/signup`, `/api/jobs/new`).
- Store environment variables in a `.env` file; never hardcode secrets or sensitive information.

## System Roles & Permissions
- **Student Freelancer:** Can list services, browse jobs, submit bids, chat, view payments, and receive reviews.
- **Job Poster (Client):** Can post jobs, review bids, hire freelancers, chat, make payments, and leave reviews.
- **Admin:** Manages users, moderates jobs/services, resolves disputes, and views analytics.
*Note: Most entities (Users, Jobs, Bids, Services) will require a role/type field to enforce permissions appropriately.*

## Payments & Commission
- The **15% platform commission** logic must be strictly implemented in the backend payment flow via Stripe, not in the UI.
