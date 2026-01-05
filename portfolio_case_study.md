# Case Study: Kimmy's Beauty Bar - Commission Tracker App

## 1. Project Overview
**Role:** Lead Developer & UI/UX Designer  
**Timeline:** 2 Weeks  
**Tools:** React, Ant Design, Tailwind CSS, Supabase

### The Concept
Kimmy's Beauty Bar, a bustling hair salon, needed a digital transformation for their internal financial tracking. The goal was to move away from error-prone manual calculations to a streamlined, automated web application that empowers both the business owner and the staff.

---

## 2. Business Requirements (The "Why")
The client faced specific operational challenges that dictated the design and functionality of the application:

*   **Complex Commission Structures**: The salon operates on a tiered commission model (e.g., 60% vs. 70%) based on performance or seniority. Manual math was leading to payroll errors.
*   **Staff Transparency**: Associates needed real-time visibility into their earnings to boost motivation and trust.
*   **Scalability**: The system needed to effortlessly handle adding new staff or removing old ones without breaking historical data.
*   **Mobile-First Efficiency**: As a fast-paced environment, the app needed to be accessible and quick to use on tablets or phones at the front desk.
*   **Data Persistence**: Secure, cloud-based storage was required to ensure no sales data was lost.

---

## 3. The Solution

We built a **Single Page Application (SPA)** that serves as a centralized financial dashboard.

### Key Features
1.  **Dynamic Commission Calculator**: An intuitive entry form where the admin inputs the sales amount and selects the commission rate (60/70%). The app automatically calculates the split and stores it.
2.  **Live Dashboard Stats**: "At a glance" cards showing **Total Sales** vs. **Total Commission Payouts**, allowing the owner to track business health instantly.
3.  **Staff Management Module**: A dedicated interface to onboard new associates or offboard departing ones, managed dynamically via the database.
4.  **Smart Filtering**: Powerful data tables allowing views by **Daily**, **Weekly**, or **All-Time** timeframes, and filtering by specific staff members.

---

## 4. UI/UX Design Process

### Phase 1: Exploration & The "Premium" Pivot
Initially, we explored a highly stylized, "glassmorphism" aesthetic using **HeroUI**. The goal was to match the beauty industry's focus on visuals (pinks, gradients, blur effects).
*   *Critique:* While beautiful, the complex styles sometimes distracted from the core utility—financial data density.

### Phase 2: Refinement & The "Enterprise" Shift (Final Design)
We pivoted to **Ant Design** to prioritize data clarity and usability while maintaining visual polish.
*   **Decision**: We utilized Ant Design's `Table` and `Statistic` components for their built-in sorting, pagination, and professional layout.
*   **Styling Strategy**: We adopted a "Hybrid" approach—using Ant Design for complex interactive components (Tables, Modals) and **Tailwind CSS** for layout and custom branding accents (Brand Pink `#EC5598`).
*   **Outcome**: A clean, trustworthy interface that feels professional yet distinct due to the custom color branding.

---

## 5. Technical Architecture
*   **Frontend**: React + Vite for lightning-fast performance.
*   **UI Framework**: Ant Design (Components) + Tailwind CSS v4 (Layout/Typography).
*   **Backend/Database**: Supabase (PostgreSQL) for real-time data syncing and authentication.
*   **Auth**: Passwordless "Magic Link" login for high security and low friction.


## 6. Key Learnings
*   **Function over Form**: While modern, "flashy" UI libraries like HeroUI are great for consumer sites, data-heavy enterprise tools often benefit from established systems like Ant Design.
*   **The Power of Types**: Even in JavaScript, thinking in strict data types (for the commission calculations) prevented many potential "NaN" errors during development.
*   **User Feedback Loops**: Pivoting the design early based on the client's need for "at-a-glance" clarity saved weeks of potential rework.

## 7. Project Impact
*   **100% Elimination** of manual commission calculation errors.
*   **Reduced Admin Time**: Payroll prep time reduced from hours to minutes via the "Export/Filter" features.
*   **Increased Trust**: Staff can see their logged sales immediately, fostering a transparent work culture.

## 8. User Testimonial
> "This tool has saved me hours every Sunday night. I used to dread doing payroll, but now I can see exactly what everyone earned in seconds. My staff loves seeing their sales update in real-time!"  
> — *Kimmy, Owner*

## 9. Future Roadmap
*   **Payroll Integration**: Direct API connection to QuickBooks/Gust to automate payouts completely.
*   **Visual Analytics**: Adding chart visualizations (Pie/Bar charts) for staff to track their performance trends over months.
*   **Mobile App**: Packaging the web app into a Progressive Web App (PWA) for native-like mobile experience.

---
**Created:** January 2026
**Status:** Live & Deployed
