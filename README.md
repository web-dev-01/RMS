🌐 Remote Monitoring System (RMS)

A Remote Monitoring System built with Next.js 15, MongoDB Atlas, and Vercel, designed to manage Station Information, Platforms & Devices, Active Trains, CAP Alerts, Event Logs in real-time, with secure role-based authentication.

🚀 Live Demo → rms-51ul.vercel.app

📂 Repository → RMS on GitHub

✨ Features
🔑 Authentication System

Register / Login / Logout

Email Verification

Forgot & Reset Password

👨‍💼 Role Management

Admin & User roles

Permission-based access

📊 Dashboard

Station Information

Platforms & Devices

Active Trains

CAP Alerts

Event Logs

📧 Email Integration

Nodemailer + SMTP

🛠️ Tech Stack

Frontend: Next.js 15 (App Router), React, TailwindCSS

Backend: Next.js API Routes

Database: MongoDB Atlas

Authentication: JWT-based auth

Deployment: Vercel

⚙️ Installation
1️⃣ Clone the repo
git clone https://github.com/web-dev-01/RMS.git
cd RMS

2️⃣ Install dependencies
npm install

3️⃣ Setup environment variables

Create a .env.local file in the root folder and add:

MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
NEXTAUTH_SECRET=your-secret

4️⃣ Run locally
npm run dev


App will start at 👉 http://localhost:3000

🚀 Deployment (Vercel)

Push project to GitHub

Import repo into Vercel

Add all Environment Variables in
Project Settings → Environment Variables

Deploy 🎉
//ready