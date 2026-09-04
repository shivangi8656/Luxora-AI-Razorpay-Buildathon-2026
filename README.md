# LUXORA --- AI-Powered Fashion Commerce Platform

> **Shop Smarter. Sell Better.**

LUXORA is a full-stack AI commerce platform designed to improve the
shopping experience for buyers and help fashion merchants increase
conversions and recover lost revenue.

## Overview

LUXORA connects an AI-powered Buyer experience with an AI-powered
Business portal.

### Buyer Portal

-   AI Stylist for personalized fashion recommendations
-   AI Buyer for product discovery, search and comparison
-   AI Checkout with bounded authorization and payment flow
-   Coupons, offers and intelligent fallback handling
-   Cart, wishlist and orders
-   Live inventory availability
-   Razorpay Test Mode payment integration

### Business Portal

-   AI Sales Agent for revenue insights and recovery strategies
-   Patron/customer behavior insights
-   Personalized campaigns and offers
-   Order management
-   AI-assisted catalog parsing and fixing
-   Live inventory synchronization
-   Telemetry for AI-driven activities
-   Audit Trail for traceability

## AI Capabilities

  -----------------------------------------------------------------------
  AI Capability                       Purpose
  ----------------------------------- -----------------------------------
  AI Stylist                          Personalized outfit recommendations

  AI Buyer                            Product search, comparison and
                                      discovery

  AI Checkout                         Guided/agentic checkout within
                                      authorization limits

  Business AI Agent                   Revenue analysis, bottleneck
                                      detection and campaign suggestions

  AI Catalog Assistant                Parse and fix catalog data before
                                      syncing it live
  -----------------------------------------------------------------------

## Architecture

``` text
                         ┌─────────────────────────┐
                         │       BUYER PORTAL       │
                         │ AI Stylist • AI Buyer   │
                         │ Checkout • Offers       │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │       AI LAYER          │
                         │ Google Gemini-powered   │
                         │ Shopping + Merchant AI  │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    FIREBASE BACKEND     │
                         │ Auth • Firestore        │
                         │ Real-time Sync • Logic  │
                         │ Storage • Security      │
                         └───────┬─────────┬───────┘
                                 │         │
                    ┌────────────┘         └────────────┐
                    ▼                                   ▼
          ┌──────────────────┐                ┌──────────────────┐
          │ BUSINESS PORTAL  │                │ EXTERNAL SERVICES│
          │ AI Sales Agent   │                │ Razorpay         │
          │ Catalog          │                │ Google Gemini    │
          │ Campaigns        │                └──────────────────┘
          │ Orders / Audit   │
          └──────────────────┘
```

The visual architecture diagram can be stored at
`docs/architecture.png`.

## Firebase Backend

LUXORA is a full-stack AI commerce platform, with **Firebase powering
our backend, authentication, data management, and real-time
synchronization across the Buyer and Business portals.**

Firebase is used for: - Authentication - Firestore data management -
Real-time inventory and catalog synchronization - Orders and customer
data - Business logic and integrations - Storage and security rules

## Payments

LUXORA integrates **Razorpay Test Mode** for the payment flow.

The demo supports successful payments, payment failures, retry payment,
alternate payment methods, and cart preservation after failure.

No real money is charged in Test Mode.

## Safety & Failure Handling

Money-related actions are designed to be:

**Explainable → Bounded → Gated**

### Expired Coupon

If an expired coupon is entered, LUXORA rejects it and can automatically
apply an available **10% offer** so the buyer can continue.

### Invalid Coupon

A wrong coupon such as `SUMMER2024` is detected and shown as **Invalid**
without affecting the cart.

### Payment Failure

If payment authorization fails due to insufficient funds, the buyer sees
the failure clearly while the cart/order state is preserved, allowing
retry or another payment method.

### Session Timeout

If the checkout session expires, LUXORA protects the transaction state
and provides a retry/renew flow without losing the buyer's bag.

### Live Inventory

Merchant-side stock changes are reflected in the Buyer store through
real-time synchronization. Products can move from available → low stock
→ out of stock, with a **Notify Me** option when unavailable.

## Merchant Revenue Recovery

The Business AI Agent can analyze business data and answer questions
such as:

> "Where is revenue loss occurring, why is it happening, and how can we
> resolve it?"

The agent identifies potential bottlenecks and recommends actionable
recovery strategies such as personalized offers, recovery campaigns,
upsell/cross-sell opportunities, low-stock or restock campaigns, and
win-back campaigns.

## Audit Trail

Important AI and commerce actions are recorded for traceability,
including: - Inventory updates - Campaign deployments - AI-generated
strategies - Authorization events - Order/payment-related events

This helps merchants understand **what happened, why it happened, and
which action was executed.**

## Tech Stack

-   **Frontend:** React / Web
-   **Backend:** Firebase
-   **Database:** Cloud Firestore
-   **Authentication:** Firebase Authentication
-   **AI:** Google Gemini
-   **Payments:** Razorpay Test Mode
-   **Catalog:** CSV / structured product data
-   **Development:** Google AI Studio + GitHub

## Suggested Repository Structure

``` text
LUXORA/
├── src/
├── public/
├── docs/
│   └── architecture.png
├── data/
│   └── luxora_womens_catalog.csv
├── README.md
├── package.json
└── ...
```

## Getting Started

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd LUXORA
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure Firebase

Create/configure your Firebase project and add the required Firebase
configuration through environment variables.

**Never commit private credentials, API secrets, or payment secrets to
GitHub.**

### 4. Run locally

``` bash
npm run dev
```

## Environment Variables

Example:

``` env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Keep sensitive server-side credentials, especially payment secrets,
outside the frontend.

## Hackathon Focus

**For Buyers:**\
Personalized discovery → intelligent recommendations → bounded AI
checkout → purchase.

**For Merchants:**\
Business insights → revenue-loss detection → AI strategy → personalized
campaign → growth.

## Key Differentiator

LUXORA brings together **AI shopping, agentic checkout, merchant revenue
intelligence, and real-time commerce infrastructure** in one platform.

> **LUXORA --- Fashion Meets Intelligence.**
