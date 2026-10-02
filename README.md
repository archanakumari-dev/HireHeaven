# HireHeaven

A full-stack, SaaS-style job portal built with Next.js, Node.js/TypeScript, PostgreSQL, Redis and Kafka. It handles secure authentication, asynchronous email delivery, subscription payments and AI-powered features.

## Features

- **Secure authentication** with JWT-based login and a forgot/reset password flow
- **Token revocation** using Redis, so reset links work only once and can be invalidated
- **Async email delivery** through Kafka, keeping API responses fast
- **Subscription payments** integrated with Razorpay
- **AI-driven features** powered by the Gemini API
- **Relational data model** on PostgreSQL (Neon)

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (Neon) |
| Cache / Token store | Redis |
| Messaging | Apache Kafka |
| Payments | Razorpay |
| AI | Google Gemini API |
| Auth | JWT |

## How It Works

Frontend: a Next.js app where users sign up, log in and use the portal.
Backend: a Node.js (TypeScript) REST API that handles business logic and stores data in PostgreSQL (Neon).
Authentication: users log in with JWT. For forgot-password, the API creates a short-lived JWT reset token and stores it in Redis, so it can be revoked or expire.
Emails: instead of sending emails inside the API request, the backend publishes an event to Kafka. A consumer picks it up and sends the email in the background, so the user never waits.
Payments: subscriptions are handled through Razorpay.
AI features: the Gemini API powers the AI-driven parts of the platform.

## Project Structure

```
HireHeaven/
├── backend/     # Node.js + TypeScript API
├── frontend/    # Next.js app
└── README.md

## Architecture

```
Client (Next.js)
      │
      ▼
REST API (Node.js / TypeScript)
      │
      ├── PostgreSQL (Neon)   → users, jobs, applications
      ├── Redis               → reset-token storage & revocation
      └── Kafka (producer)    → email events
                │
                ▼
          Email consumer     → sends emails asynchronously








