# Leave Management Portal — Node + React + MongoDB

Full-stack rebuild of the leave-management spec using:
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend:** React (Vite), React Router, Axios
- **Database:** MongoDB (local or Atlas)

## Folder structure

```
leave-management/
├── backend/
│   ├── config/db.js
│   ├── models/              User, Department, LeaveCategory, LeaveRequest
│   ├── middleware/auth.js   JWT protect + role guard
│   ├── utils/leaveStatus.js computeOverallStatus() — the MD-override logic
│   ├── routes/               auth, leaves (incl. md-decision), admin
│   ├── seeder/seed.js         sample data (10 users + 6 leave requests, one showing an MD override)
│   └── server.js
└── frontend/
    └── src/
        ├── pages/            Home, Login, EmployeeDashboard, ApplyLeave, MyRequests,
        │                     HODDashboard, HRDashboard, AdminDashboard, AdminAnalytics
        ├── components/       Navbar, LeaveTable, ProtectedRoute
        ├── context/          AuthContext
        ├── utils/roleHome.js post-login redirect per role
        └── api/axios.js
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (Atlas or local, e.g. `mongodb://127.0.0.1:27017/leave_management`)
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — `http://localhost:5173` for local dev

Seed the database (adds 2 departments, 4 leave categories, 10 users across all roles, and 5 sample leave requests at different workflow stages):

```bash
npm run seed
```

Start the API:

```bash
npm run dev      # http://localhost:5000
```

### Sample logins created by the seeder

| Employee Code | Role     | DOB (login field) |
|---------------|----------|--------------------|
| MD001         | MD       | 1978-02-11         |
| HR001         | HR       | 1985-06-23         |
| ENG-HOD       | HOD      | 1982-09-14         |
| SLM-HOD       | HOD      | 1983-12-02         |
| EMP001–EMP006 | Employee | see `seeder/seed.js` |

To wipe all seeded data: `npm run seed:destroy`

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

If your API isn't on `http://localhost:5000/api`, create `frontend/.env` with:
```
VITE_API_URL=http://your-api-url/api
```

## 3. Roles and dashboards

Each role lands on its own dashboard right after login (`frontend/src/utils/roleHome.js` decides where):

| Role | Route | What they see |
|------|-------|----------------|
| Employee | `/employee` | Their own requests, "Apply for Leave", request timeline |
| HOD | `/hod` | Every request in **their own department**, any status. HOD can approve/reject/return any request they haven't already decided on, independently of HR |
| HR | `/hr` | Every request **organization-wide**, any status. HR can approve/reject/return any request they haven't already decided on, independently of HOD |
| Admin (MD) | `/admin` and `/admin/analytics` | Every request organization-wide, with **Approve/Reject available on every request regardless of stage** — this is the override power described below — plus a separate Analytics page |

All three approver dashboards show the *same* table shape (Employee, Department, Category, Dates, Reason, and a column each for the HOD/HR/MD decision), so anyone can see at a glance who approved what. Each dashboard is tinted a different accent color (indigo for Employee, teal for HOD, purple for HR, navy for Admin) so it's visually obvious which role you're in.

## 4. How the workflow works

1. Employee logs in with **employee code + date of birth**. Clicking "Apply for Leave" opens a popup: **"Have you discussed this with your HOD?"** — tapping **No** blocks the request right there; tapping **Yes** reveals a reason box, then the employee picks category/dates on the next screen to submit.
2. The request starts at `pending` and is immediately visible to HOD, HR, and Admin — nobody has to wait for anyone else to see it.
3. **HOD and HR act independently, in any order** (this is not a strict HOD-then-HR sequence). Each can approve, reject, or return the request once. If either rejects, the request is rejected. Once one of them approves and the other hasn't acted yet, the status shows `pending_hod` or `pending_hr` (waiting on whichever one hasn't decided).
4. Once **both** HOD and HR have approved, the request moves to `pending_md` — waiting on Admin — and starts a **2-hour timer**.
5. **Admin (MD) override:** the Admin is never restricted to a single stage. From `/admin`, the Admin can approve or reject **any** request at **any** point — even one HOD and HR already approved. An MD decision always wins over whatever HOD/HR decided; the UI even labels this "Overrides HOD/HR decision" when it applies.
6. **2-hour auto-approval:** if HOD and HR have both approved and the Admin has not acted within 2 hours of the original submission, the request auto-finalizes as **Approved**. This is checked every time the request list is loaded (`backend/utils/leaveStatus.js` — `autoFinalizeIfDue` / `autoFinalizeAll`), so it doesn't need a background job. The Admin dashboard shows a live "Auto-approves in Xh Ym" countdown on affected requests.
7. Every action (by HOD, HR, or MD, including overrides and the automatic 2-hour approval) is appended to an immutable `approvals` array — this is the audit trail, visible to the employee on `/employee/my-requests` and reflected in the HOD/HR/MD columns on every dashboard table.
8. The **Admin Analytics** page (`/admin/analytics`) shows totals, status breakdown, and requests by department/category.

## 5. Adding more sample data

Open `backend/seeder/seed.js` and add entries to `usersData` (or `sampleLeaves`), then re-run:

```bash
npm run seed:destroy
npm run seed
```

## 6. Deploying (e.g. on Hostinger / a VPS)

- MongoDB Atlas is the easiest managed option if your host doesn't provide MongoDB.
- Run the backend as a Node process (PM2 recommended) behind Nginx, or use a Node-friendly host.
- Build the frontend with `npm run build` in `frontend/` and serve the generated `dist/` folder as static files (or from the same Nginx config) at your domain, with the "Login" link in the top-right of the homepage pointing to `/login`.
- Set `VITE_API_URL` to your live API URL before building the frontend.

## Security notes carried over from the original spec

- Employee code + DOB is intentionally weak; consider adding OTP/password for HOD, HR, and MD accounts before going live.
- Passwords/DOB are never returned in API responses (`toJSON` transform strips them).
- Rate limiting is applied to login endpoints.
- Role checks are enforced **server-side** on every route — the React UI hiding a link is not a security control by itself.
