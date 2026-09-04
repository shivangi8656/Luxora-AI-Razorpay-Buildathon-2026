# ✦ LUXORA — AI-Powered Fashion Commerce Platform

> **FASHION MEETS INTELLIGENCE — Shop Smarter. Sell Better.**

LUXORA is a full-stack AI-native fashion commerce platform that connects intelligent shopping experiences for buyers with AI-powered revenue and growth tools for fashion merchants.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-cyan?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Backend%20%26%20Auth-FFCA28?logo=firebase)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Layer-4285F4?logo=google)
![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-0c2340?logo=razorpay)

---

## 👤 Project

| Detail | Information |
|---|---|
| **Project** | LUXORA |
| **Created By** | Shivangi Sharma |
| **Category** | AI Growth & Agentic Commerce |
| **Platform** | AI-Powered Fashion Commerce |
| **Backend** | Firebase |
| **AI Layer** | Google Gemini |
| **Payment Gateway** | Razorpay Test Mode |

---

## 📌 Executive Summary

Modern fashion commerce often separates product discovery, personalization, checkout, customer insights, and merchant growth into disconnected systems.

**LUXORA** brings these capabilities together through an AI-native commerce platform that serves both shoppers and merchants.

### What LUXORA Provides

- AI-powered fashion discovery
- Personalized AI styling
- Intelligent product search and comparison
- Bounded AI Checkout
- Smart upsell and cross-sell recommendations
- Intelligent coupon handling
- Payment failure recovery
- Real-time inventory synchronization
- AI-powered merchant revenue analysis
- Personalized customer campaigns
- AI-assisted catalog management
- Telemetry and Audit Trail

> **Every money-related AI action should be Explainable, Bounded, and Gated.**

---

## 🎯 Key Objectives & Evaluation Capabilities

| Capability | How LUXORA Solves It |
|---|---|
| **AI-Powered Shopping** | AI Stylist and AI Buyer understand natural-language intent and recommend relevant fashion products. |
| **Agentic Commerce** | AI Checkout guides the customer through a controlled purchase flow with authorization and guardrails. |
| **Merchant Revenue Intelligence** | Business AI Agent identifies revenue bottlenecks and recommends recovery strategies. |
| **Personalized Growth** | Patron behavior can be analyzed to create targeted VIP offers and campaigns. |
| **Real-Time Inventory** | Firebase keeps Buyer and Business inventory states synchronized in real time. |
| **AI Catalog Intelligence** | Merchants can Load Sample → Parse → Fix with AI → Sync to Live Store. |
| **Upsell & Cross-Sell** | AI recommends complementary and higher-value products to increase basket value. |
| **Failure Handling** | Expired/invalid coupons, payment failures, and checkout timeout states are handled without losing cart state. |
| **Telemetry** | AI-driven commerce activities and system events can be tracked. |
| **Audit Trail** | Important AI, inventory, campaign, and authorization actions are recorded for traceability. |

---

# 🏗️ Architecture

```text
                         ┌─────────────────────────┐
                         │       BUYER PORTAL      │
                         │                         │
                         │ AI Stylist              │
                         │ AI Buyer                 │
                         │ AI Checkout              │
                         │ Cart • Wishlist • Orders│
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │        AI LAYER         │
                         │                         │
                         │    Google Gemini        │
                         │ AI Stylist • AI Buyer   │
                         │ AI Checkout              │
                         │ Business AI Agent       │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    FIREBASE BACKEND     │
                         │                         │
                         │ Authentication          │
                         │ Cloud Firestore         │
                         │ Real-Time Sync          │
                         │ Orders • Products       │
                         │ Inventory • Campaigns   │
                         │ Storage • Security      │
                         └──────────┬───────┬──────┘
                                    │       │
                       ┌────────────┘       └────────────┐
                       ▼                                 ▼
              ┌──────────────────┐             ┌──────────────────┐
              │ BUSINESS PORTAL  │             │ EXTERNAL SERVICES│
              │                  │             │                  │
              │ AI Sales Agent   │             │ Google Gemini    │
              │ Patrons          │             │ Razorpay         │
              │ Campaigns        │             │ Test Mode        │
              │ Orders           │             └──────────────────┘
              │ Catalog          │
              │ Inventory        │
              │ Telemetry        │
              │ Audit Trail      │
              └──────────────────┘
```

## ⚙️ Core Technologies

- **Frontend:** React, TypeScript, Responsive Web UI
- **Backend:** Firebase
- **Database:** Cloud Firestore
- **Authentication:** Firebase Authentication
- **AI:** Google Gemini
- **Payments:** Razorpay Test Mode
- **Catalog:** Structured Product Data / CSV
- **Development:** Google AI Studio / Stitch
- **Version Control:** GitHub

---

# 🚀 Core Features

## 1. Buyer Portal

LUXORA provides a premium fashion shopping experience where buyers can:

- Browse women's luxury fashion
- Search and discover products
- Get AI-powered recommendations
- Add products to Bag
- Buy Now
- Manage Wishlist
- View Orders
- Check live stock availability
- Apply coupons and offers
- Complete payment

### Buyer Journey

```text
Discover
   ↓
Personalize
   ↓
Decide
   ↓
Checkout
   ↓
Purchase
```

---

## 2. AI Stylist

The AI Stylist understands natural-language fashion intent and provides personalized recommendations.

### Example

> "Show silk evening gowns for a black-tie gala under ₹15,000."

The AI can understand:

- Occasion
- Product type
- Style
- Budget
- User preferences

and return relevant products.

---

## 3. AI Buyer

The AI Buyer acts as an intelligent shopping assistant for:

- Product discovery
- Search refinement
- Product comparison
- Preference-aware recommendations
- Fashion discovery

---

## 4. AI Checkout

LUXORA's AI Checkout follows a bounded commerce workflow:

```text
Agent Initialization
        ↓
Inventory Integrity Check
        ↓
Bounded Guardrail Check
        ↓
Human Authorization Check
        ↓
Payment / Settlement
        ↓
Executed & Confirmed
```

### Commerce Safety Model

**Explainable → Bounded → Gated**

This keeps AI-driven money-related actions controlled and traceable.

---

# 🛡️ Failure Scenarios & Graceful Recovery

## 1. Expired Coupon

```text
Expired Coupon
      ↓
Coupon Validation
      ↓
Coupon Rejected
      ↓
Available 10% Offer
      ↓
Buyer Continues Checkout
```

If an expired coupon is entered, LUXORA can automatically provide an available **10% offer**, allowing the customer to continue instead of abandoning the purchase.

---

## 2. Invalid Coupon

A wrong coupon such as:

```text
SUMMER2024
```

is detected immediately.

The system displays:

> **Invalid Coupon**

The cart remains unaffected.

---

## 3. Payment Failure — Insufficient Funds

```text
Enter Card
     ↓
Tap Pay
     ↓
Payment Authorization
     ↓
Insufficient Funds
     ↓
Payment Declined
     ↓
Retry / Another Payment Method
```

The cart remains intact so the customer can retry payment or choose another payment method.

---

## 4. Checkout Session Timeout

```text
Checkout Timer
      ↓
Session Expired
      ↓
Integrity Protection
      ↓
Retry / Renew
      ↓
Bag Preserved
```

The buyer does not lose the contents of the shopping bag.

---

# 🛍️ Upsell & Cross-Sell

LUXORA uses AI to recommend products relevant to the current purchase.

### Cross-Sell Example

```text
Dress
  ├── Earrings
  ├── Handbag
  └── Slim Belt
```

### Upsell Example

The system can recommend a higher-value alternative when it is relevant to the customer's intent.

These recommendations can help improve:

- Average Order Value
- Basket Size
- Product Discovery
- Conversion Opportunities

---

# 💼 Business Portal

The Business Portal converts customer and commerce data into actionable merchant intelligence.

### Business Modules

- AI Sales Agent
- Patrons
- Campaigns
- Orders
- Catalog
- Inventory
- Telemetry
- Audit Trail

---

## 1. Business AI Sales Agent

The Business AI Agent acts as an AI growth assistant for merchants.

### Example Merchant Query

> "Where is revenue loss occurring, why is it happening, and how can we resolve it?"

### AI Analysis Flow

```text
Business Data
      ↓
AI Analysis
      ↓
Revenue Bottleneck Detected
      ↓
Root Cause / Opportunity
      ↓
Recovery Strategy
      ↓
Merchant Action
```

### Possible Strategies

- Personalized offers
- Recovery campaigns
- Upsell
- Cross-sell
- Low-stock campaigns
- Restock campaigns
- Win-back campaigns
- Product-specific campaigns

---

## 2. Patrons

The Patrons section helps merchants understand customer behavior.

```text
Customer
   ↓
Repeated Product Views
   ↓
Behavior Insight
   ↓
Personalized Offer
   ↓
Customer Conversion
```

A merchant can identify a customer who repeatedly views a particular product and deploy an exclusive VIP offer.

### Example

```text
VIPSHWANGI15
```

This enables merchants to move from generic marketing to personalized customer engagement.

---

## 3. Campaigns

LUXORA allows merchants to create and manage targeted campaigns.

### Campaign Types

- New Collection Launch
- Limited Stock
- Abandoned Cart
- Personalized Recommendations
- Seasonal / Occasion
- Price Drop / Offer
- Restock
- Win-Back
- Cross-Sell
- Upsell

### Campaign Flow

```text
Customer Insight
      ↓
AI Recommendation
      ↓
Merchant Approval
      ↓
Campaign Deployment
      ↓
Customer Offer
      ↓
Conversion
```

Campaign status and deployment activity remain visible in the Business Portal.

---

## 4. Orders

The Business Orders section gives merchants visibility into customer purchases.

### Order Information

- Customer
- Product
- Order
- Amount
- Purchase Status

Buyer orders are synchronized with the Business Portal through the Firebase backend.

---

## 5. Catalog & Live Inventory

LUXORA provides an AI-assisted catalog workflow:

```text
Load Sample
     ↓
Parse
     ↓
Fix with AI
     ↓
Sync to Live Store
```

After synchronization:

> **The catalog becomes available in the live Buyer store.**

### Live Inventory Demonstration

```text
Merchant Updates Stock
          ↓
       Stock = 1
          ↓
     Buyer Refresh
          ↓
      "Only 1 left"
```

The merchant can then mark the product as out of stock:

```text
Merchant
    ↓
Mark Out of Stock
    ↓
Buyer Refresh
    ↓
"Out of Stock"
    ↓
"Notify Me"
```

This demonstrates real-time inventory synchronization between the Business and Buyer portals.

---

## 6. Telemetry

Telemetry provides visibility into AI-driven commerce activities.

It can track:

- AI recommendations
- Cross-sell actions
- Accessory bundling
- AI strategies
- Campaign actions
- Commerce events
- System activity

Telemetry helps merchants understand how AI is influencing the commerce journey.

---

## 7. Audit Trail

LUXORA records important actions for traceability.

### Recorded Actions

- Inventory updates
- Campaign deployments
- AI-generated strategies
- Authorization events
- Commerce events
- Important system actions

### Traceability

```text
What happened?
      ↓
Why did it happen?
      ↓
What action was taken?
      ↓
Who / what triggered it?
```

---

# 🔥 Firebase Backend

LUXORA is a full-stack AI commerce platform, with **Firebase powering our backend, authentication, data management, and real-time synchronization across the Buyer and Business portals.**

### Firebase Responsibilities

- Authentication
- Cloud Firestore data management
- Real-time inventory synchronization
- Product and catalog data
- Orders
- Customer data
- Campaign data
- Storage
- Security Rules
- Application / backend logic

---

# 💳 Payment Integration

LUXORA uses **Razorpay Test Mode** for payment demonstration.

### Supported Payment Scenarios

- Successful payment
- Payment failure
- Insufficient-funds failure scenario
- Retry payment
- Alternate payment method
- Cart preservation after failure

> **Razorpay Test Mode does not charge real money.**

---

# 📊 Merchant Revenue Recovery Flow

```text
Business Data
     ↓
AI Sales Agent
     ↓
Detect Revenue Bottleneck
     ↓
Identify Customer / Product Opportunity
     ↓
Generate Recovery Strategy
     ↓
Merchant Authorization
     ↓
Deploy Campaign / Offer
     ↓
Track Result in Telemetry & Audit Trail
```

This turns AI from a passive analytics layer into an actionable merchant growth assistant.

---

# 🛡️ Safety & Guardrails

LUXORA follows the principle:

## Explainable → Bounded → Gated

### Explainable

AI recommendations and merchant strategies provide understandable reasoning and context.

### Bounded

AI Checkout operates within predefined transaction and authorization limits.

### Gated

Important money-related actions require appropriate authorization before execution.

### Failure-Safe

Invalid coupons, payment failures, inventory changes, and session expiry do not silently destroy the buyer's cart state.

---

# 🔒 Security & Secret Isolation

- Firebase Authentication protects Buyer and Business access.
- Firebase Security Rules control protected data access.
- Razorpay secret credentials must remain server-side.
- AI and payment secrets should never be hard-coded into client-side code.
- Environment variables should be used for sensitive configuration.
- Important commerce and AI actions should be recorded in the Audit Trail.

---

# 🛠️ Local Development & Setup

## Prerequisites

- Node.js 18+ or current supported version
- npm
- Firebase project
- Google Gemini API access
- Razorpay Test Mode credentials

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd LUXORA
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file using your project's configuration.

Example:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_storage
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Server-side only
GEMINI_API_KEY=your_gemini_api_key

# Razorpay server-side credentials
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

> **Never commit private secrets, payment secrets, or sensitive credentials to GitHub.**

---

## 4. Run Development Server

```bash
npm run dev
```

Open the local development URL shown by the application.

---

## 5. Build for Production

```bash
npm run build
```

---

# 📁 Suggested Repository Structure

```text
LUXORA/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── firebase/
│   └── ...
│
├── public/
│
├── docs/
│   └── architecture.png
│
├── data/
│   └── luxora_womens_catalog.csv
│
├── .env.example
├── README.md
├── package.json
└── ...
```

---

# 🎯 Hackathon Value Proposition

## For Buyers

```text
Discover
   ↓
Personalize
   ↓
Decide
   ↓
Checkout
   ↓
Purchase
```

LUXORA makes fashion shopping more intelligent, personalized, and convenient.

## For Merchants

```text
Analyze
   ↓
Identify Revenue Loss
   ↓
Generate AI Strategy
   ↓
Deploy Campaign
   ↓
Measure & Grow
```

LUXORA turns commerce data into actionable AI-driven growth opportunities.

---

# 🏆 Key Differentiator

LUXORA combines:

> **AI Shopping + Agentic Checkout + Merchant Revenue Intelligence + Real-Time Commerce**

into one connected fashion commerce platform.

### Complete Commerce Loop

```text
Customer Intent
      ↓
AI Discovery
      ↓
Personalized Recommendation
      ↓
Checkout
      ↓
Payment
      ↓
Order
      ↓
Merchant Intelligence
      ↓
AI Growth Strategy
      ↓
Personalized Campaign
      ↓
Customer Conversion
```

---

# ✨ Final Vision

LUXORA moves AI beyond simple recommendations and makes it an active part of the commerce lifecycle.

### For Buyers

A personalized, intelligent, and convenient fashion shopping journey.

### For Merchants

Actionable AI-driven insights that help identify opportunities, recover lost revenue, personalize campaigns, and grow conversions.

> **One platform. Two sides of commerce. One intelligent layer.**

---

# 📜 License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

<p align="center">

<strong>LUXORA — Fashion Meets Intelligence.</strong>

<br>

<i>Shop Smarter. Sell Better.</i>

<br><br>

Built by <strong>Shivangi Sharma</strong>

</p>
