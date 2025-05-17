# 🌴 Tree Risk Reporter - Design Thinking Project

## 📌 Overview

**Tree Risk Reporter** is a responsive and user-friendly web application developed as part of a **Design Thinking Project**. It empowers students and faculty to report **unsafe coconut trees** on campus, and allows administrators to **track risks**, **take action**, and **record Ethephon treatments** to prevent coconut formation and accidents.

---

## 💡 Problem Statement

> Falling coconuts and branches from coconut trees on campus pose a safety risk to students and faculty. 

---

## ✅ Our Solution

We developed a two-pronged digital solution:

1. **Risk Reporting System** – Allows users to report unsafe trees with images and locations.
2. **Ethephon Treatment Tracker** – Enables admins to mark trees that have undergone chemical treatment to prevent coconut formation and automatically tracks due dates for retreatment.

---

## 🧑‍💻 Features

### 👤 User Side (`index.html`)
- Login/Signup authentication (via Supabase)
- Select tree location from categorized dropdown
- Upload image of risky tree
- Submit reports to Supabase database (`tree_reports`)

### 🔐 Admin Side (`admin.html`)
- Secure login with admin role redirection
- Dashboard with filters for **risky/safe/all** reports
- Mark **Action Taken** with timestamp
- Ethephon Treatment tab:
  - View all campus trees
  - Mark trees as treated / undo
  - Auto-calculate next due date (6 months)

---

## 🛠️ Technologies Used

| Technology    | Purpose                        |
|---------------|--------------------------------|
| **HTML/CSS**  | Frontend structure & styling   |
| **JavaScript**| Frontend interactivity         |
| **Supabase**  | Authentication & database      |
| **FontAwesome**| Icons and visuals             |

---

## 📁 Project Structure

├── index1.html # User reporting page

├── admin.html # Admin dashboard

├── index.html # Login/Sign up page

├── auth.js # Auth logic using Supabase

├── admin.js # Admin logic for both dashboards

├── auth.css # Stylish responsive auth form

├── admin.css # Clean dashboard styling

├── README.md # Project documentation
