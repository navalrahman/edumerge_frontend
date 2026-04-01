#  Edumerge Admission Management - Frontend

##  Overview

This is the frontend for the Edumerge Admission Management System. It provides a role-based dashboard to manage programs, applicants, seat allocation, and admissions.

---

##  Features

*  Login & Signup (Role-based)
*  Dashboard with sidebar navigation
*  Master Setup (Programs & Quotas)
*  Applicant Management
*  Seat Allocation with quota validation
*  Admission Confirmation
*  Basic Dashboard insights

---

##  User Roles

* **Admin**

  * Configure programs and quotas

* **Admission Officer**

  * Add applicants
  * Allocate seats
  * Verify documents
  * Confirm admissions

* **Management**

  * View dashboard (read-only)

---

##  Tech Stack

* Next.js (App Router)
* React
* Tailwind CSS
* React Hook Form
* Zod (Validation)
* js-cookie
* lucide-react (icons)

---

##  Project Structure

```id="7j3wcz"
app/
│── _components/        # Reusable components
│── admissions/         # Admission pages
│── applicants/         # Applicant management
│── login/              # Login page
│── signup/             # Signup page
│── mastersetup/        # Program & quota setup
│── seat-matrix/        # Seat allocation
│── layout.tsx
│── page.tsx
```

---

##  Getting Started

```bash id="wq2c6h"
git clone https://github.com/navalrahman/edumerge_frontend.git
cd edumerge_frontend
npm install
npm run dev
```

---

##  Environment Variables

Create a `.env` file:
i already added the env file if it is missing please add this
```env id="p1gq2h"
NEXT_PUBLIC_API_NODE_ENV='development'
NEXT_PUBLIC_API_DEVELOPMENT_BASE_URL=http://localhost:5000/api/v1
```

>  Do not include sensitive data in `.env`. Use `.env.example` for sharing.

---

##  Authentication

* Token is stored using cookies
* Users are redirected to login if not authenticated
* UI is rendered based on user role

---

##  Pages

* `/login` → Login page
* `/signup` → Signup page
* `/` → Dashboard
* `/mastersetup` → Program setup
* `/applicants` → Applicant management
* `/seat-matrix` → Seat allocation
* `/admissions` → Admission confirmation

---

##  Note

This is a minimal frontend built for assignment purposes. It focuses on UI, validation, and core workflow without advanced integrations.
