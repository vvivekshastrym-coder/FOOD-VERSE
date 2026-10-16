# FoodVerse 🍲🪐
### A Complete, Production-Ready 3D Food Ordering Marketplace

> **"See your food before you order it."**  
> *Know what you are ordering. Understand what you are paying. Follow your food from kitchen to door.*

---

## 🌟 The Five Signature Pillars

1. **True-Size Promise:** Every dish model is verified against actual kitchen serving weights (e.g. 450g net) and physical serving dimensions (e.g. 18cm x 7.5cm handi). If a portion delivered exhibits >15% deficit, customers can lodge an instant 1-click dispute for an operational refund processed directly to the financial ledger.
2. **Honest Ranking:** Zero paid organic rank inflation. All rankings are calculated and disclosed using an objective formula: 40% Diner Ratings, 30% Official FSSAI Hygiene Audits, 20% Kitchen Preparation Speed, and 10% True-Size 3D Verification. Sponsored placements are strictly isolated and labeled.
3. **Food Room (Group Ordering):** Real-time synchronized ordering with 6-digit invite codes (`ROOM42`, `FDV882`), member permissions, live cart updates, shared dish voting (+1/-1), spending limits, and transparent item-based or equal bill splitting with single-host checkout.
4. **Flavor DNA:** Editable 6-dimensional sensory palate (Spiciness, Sweetness, Sour, Umami, Crunch, Richness) calibrated from user ratings and orders. Features privacy-preserving Taste-Twin matching across Bengaluru diners without exposing PII.
5. **Kitchen-to-Door Story:** Authoritative state-machine tracking:  
   `PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `PLATING` ➔ `PACKED` ➔ `READY_FOR_PICKUP` ➔ `PICKED_UP` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.  
   Includes secure 4-digit customer delivery OTP handoff verification and IoT thermal bag monitoring (64.2°C hot-chain).

---

## 🗺️ Complete Inventory of All 22 PRD Modular Features

| # | Feature Name | Description | Status |
|---|---|---|---|
| **01** | **3D Dish Viewer** | Interactive Three.js food inspection with dynamic portion scaling, ingredient mesh toggles, and 2D photo fallback | ✅ Production Ready |
| **02** | **AR Tabletop Preview** | WebXR & Apple QuickLook 1:1 tabletop scale projection | ✅ Production Ready |
| **03** | **Walkable 3D Food Street** | Spatial 3D neon avenue to discover live Bengaluru restaurants | ✅ Production Ready |
| **04** | **3D Food Builder** | Custom layer assembly (patties, buns, cheeses, toppings) with live macro & price calculations | ✅ Production Ready |
| **05** | **3D Order Tracking** | 3D city delivery scene showing restaurant origin, scooter progress, and customer destination | ✅ Production Ready |
| **06** | **AI Food Companion** | Conversational assistant executing validated server tools for calories, protein, and orders | ✅ Production Ready |
| **07** | **Predictive Cravings** | Contextual recommendation engine matching time-of-day, weather, and flavor affinities | ✅ Production Ready |
| **08** | **Flavor DNA** | 6-axis radar taste profile with consent controls and profile reset | ✅ Production Ready |
| **09** | **Health & Allergen Guardian** | Kitchen cross-contact alerts and strict dietary filters (Gluten, Dairy, Soy, Peanuts) | ✅ Production Ready |
| **10** | **Budget Optimizer** | Algorithmic meal combo solver finding lowest cost options under customer constraints | ✅ Production Ready |
| **11** | **Anti-Waste Flash Deals** | Atomic surplus food deals (35%-40% discount) preventing restaurant kitchen waste | ✅ Production Ready |
| **12** | **Food Room** | Synchronized group carts with live participant voting, spending caps, and split bills | ✅ Production Ready |
| **13** | **Taste-Twin Matching** | Privacy-safe affinity matching pairing diners with similar flavor DNA profiles | ✅ Production Ready |
| **14** | **Creator Menus** | Curated tasting collections by verified chefs and food influencers with 1-click order | ✅ Production Ready |
| **15** | **Provenance & Transparency** | Farm-to-kitchen sourcing cards, FSSAI compliance verification, and hygiene certificates | ✅ Production Ready |
| **16** | **Carbon Footprint & Green Delivery** | 0.42 kg CO2e offset tracking, EV scooter delivery fleet, and compostable packaging | ✅ Production Ready |
| **17** | **Smart Packaging & Temp Alerts** | Real-time IoT thermal bag sensor telemetry (64.2°C hot delivery monitoring) | ✅ Production Ready |
| **18** | **Voice-First Ordering** | Hands-free Web Speech API recognition for voice ordering and natural intent parsing | ✅ Production Ready |
| **19** | **Kitchen Digital Twin** | Queue simulation with station throughput analytics and realistic preparation ETAs | ✅ Production Ready |
| **20** | **Autonomous Delivery Readiness** | Modular adapter layer for autonomous delivery robot/drone dispatch (Pilot flag) | ⚙️ Configurable Flag |
| **21** | **Tokenized Loyalty Ledger** | Double-entry points ledger with welcome bonuses and cart redemption | ✅ Production Ready |
| **22** | **Generative 3D Onboarding** | Photogrammetry submission workflow and quality review pipeline for restaurants | ✅ Production Ready |

---

## 👥 Multi-Role Demo Credentials

Use the **Fast Role Switcher Pill** in the top navigation bar or log in directly with these seeded credentials:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Customer** | `arjun@foodverse.io` | `Password123!` | 3D dish inspection, checkout, Food Room, Flavor DNA, orders |
| **Restaurant Partner** | `chef.vikram@spicecraft.in` | `Password123!` | Kitchen inbox, advance cooking/plating stages, menu stock toggle |
| **Delivery Partner (PWA)** | `suresh.rider@foodverse.io` | `Password123!` | Accept task, pickup confirmation, verify customer delivery OTP |
| **Admin Control HQ** | `admin@foodverse.io` | `AdminPass123!` | Dispute resolution queue, toggle 22 feature flags, financial ledger |
| **Customer Service** | `support@foodverse.io` | `SupportPass123!` | True-Size review, refund approval, support ticket management |

---

## 🛠️ Technology Architecture

- **Frontend & Fullstack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **3D & Spatial:** Three.js, WebGL with fallback detection, WebXR tabletop AR, procedural food models
- **Database & ORM:** PostgreSQL / SQLite with Prisma ORM
- **Authentication:** JWT sessions in HTTP-only secure cookies with bcrypt password hashing
- **Payments:** Razorpay Sandbox simulation with server-side signature verification & double-entry financial ledger
- **Business Logic:** India-ready configuration (INR ₹, 5% GST, FSSAI numbers, Asian/Kolkata timezone, 4-digit delivery OTP)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Authentic Data
```bash
npx prisma db push
npm run seed
```

### 3. Run Automated Acceptance & Security Tests
```bash
npm test
```
*Executes all 10 acceptance suites testing RBAC, state machine transitions, pricing engine, dispute resolution, and AI tools.*

### 4. Start the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

Build and start the containerized service:
```bash
docker-compose up --build -d
```
Accessible on port `3000`.

---

## 🔒 Security & Privacy Guarantees

- **Server-Side Authorization:** Every sensitive action (order transitions, dispute refunds, feature flag toggles) is authorized strictly on the server.
- **Price Integrity:** Prices, coupons, and cart totals are recalculated exclusively by the server; browser-supplied totals are never trusted.
- **Privacy Preservation:** Flavor DNA and Taste-Twin matching uses anonymized pseudonyms without disclosing customer names, exact home coordinates, or order histories.
- **Financial Double-Entry:** All customer payments, platform commissions, and dispute refund debits are tracked with immutable timestamps and balances.
