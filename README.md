<p align="center">
  <img src="client/public/favicon.svg" alt="CampusCare Logo" width="96" />
</p>

<h1 align="center">CampusCare</h1>

<p align="center">
  <b>School Facility Condition Reporting & Repair Tracking Portal</b>
  <br/>
  A full-stack platform that lets parents & teachers report school infrastructure issues and lets administrators assign repair teams, track progress, and generate reports.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Auth-JWT-brightgreen?style=flat-square" alt="JWT" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
</p>

---

## 🎯 Problem Statement

Many schools face infrastructure issues — broken furniture, unsafe classrooms, damaged toilets, poor sanitation, and electrical hazards — that go unreported or unresolved because there is no structured reporting system. CampusCare solves this with a centralized digital portal that improves accountability, transparency, and repair turnaround time.

## ✨ Features

| Module | Highlights |
|--------|-----------|
| 🔐 **User Module** | Role-based registration & login (Parent / Teacher / Admin), secure JWT auth with bcrypt-hashed passwords |
| 📝 **Issue Reporting** | Report issues with description, category, location, priority level, and photo/video evidence |
| 🔄 **Repair Tracking** | Real-time status (Pending → In Progress → Resolved), action timeline, estimated resolution time |
| 🔔 **Notification Module** | Alerts on status updates, resolved issues, and reminders for pending repairs |
| 📊 **Dashboard** | Summary statistics, status/pie charts, priority distribution, category breakdown, recent issues |
| 🛠️ **Admin Panel** | Manage all issues, assign repair tasks, update statuses, monitor staff workload, export CSV reports |
| 🌙 **Experience** | Dark/light mode, fully responsive, animated UI (Framer Motion), professional design |

## 🖥️ Tech Stack

- **Frontend:** React 18 · Vite · Tailwind CSS · Framer Motion · Recharts · Lucide Icons
- **Backend:** Node.js · Express · JWT · bcryptjs · Multer
- **Data:** Lightweight JSON-file store (zero setup — swap for MongoDB/PostgreSQL when scaling)
- **Deployment-ready:** Serves the built SPA + API from a single server

## 🚀 Quick Start

### Option A — Single server (API + app on :5000)
```bash
cd server && npm install && npm run seed
cd ../client && npm install && npm run build
cd ../server && npm run dev
# open http://localhost:5000
```

### Option B — Dev mode with hot reload
```bash
# Terminal 1
cd server && npm install && npm run seed && npm run dev

# Terminal 2
cd client && npm install && npm run dev
# open http://localhost:5173
```

### 🔑 Demo Accounts

| Role    | Email                      | Password |
|---------|----------------------------|----------|
| Admin   | admin@campuscareschool.org | admin123 |
| Teacher | aarav.sharma@campuscare.test | user123 |
| Parent  | priya.patel@campuscare.test | user123 |

## 📁 Project Structure

```
├── client/                    # React + Vite frontend
│   └── src/
│       ├── pages/             # Login, Dashboard, ReportIssue, Tracking, IssueDetail, Notifications, AdminPanel, Profile
│       ├── components/        # Layout, Logo, Badges, StatCard, IssueCard, Modal, Toast, ThemeToggle
│       ├── context/           # AuthContext (JWT), ThemeContext (dark/light)
│       ├── hooks/             # useNotifications
│       └── lib/api.js         # Axios client + interceptors
└── server/                    # Express API
    └── src/
        ├── routes/            # auth, issues, admin, notifications
        ├── middleware/        # JWT auth + role guards
        ├── seed.js            # Realistic demo data (12 users, 24 issues, 4 schools)
        └── db.js              # JSON-file data store
```

## 📡 API Overview

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Create account | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| GET | `/api/auth/me` | Current user | Auth |
| GET/POST | `/api/issues` | List / create issues | Auth |
| GET | `/api/issues/stats` | Role-scoped summary statistics | Auth |
| POST | `/api/issues/:id/comments` | Post admin updates | Admin |
| POST | `/api/issues/:id/remind` | Reminder for pending repair | Reporter |
| POST | `/api/issues/:id/images` | Upload photos/videos | Reporter |
| GET | `/api/notifications` | Notifications + unread count | Auth |
| GET | `/api/admin/stats` | KPIs | Admin |
| PATCH | `/api/admin/:id` | Status / priority / assignee | Admin |
| GET | `/api/admin/reports/summary` | School-wise performance | Admin |

## 🗺️ Roadmap

- Mobile application
- Integration with government maintenance systems
- Automated repair scheduling
- AI-based issue detection (image recognition)
- Vendor/service provider integration

## 📄 License

MIT © Rohan Zende

---

<p align="center">Made with 💜 for safer, cleaner, well-maintained schools.</p>