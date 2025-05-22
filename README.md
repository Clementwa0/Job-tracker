# 💼 JobTracker Frontend

A modern, responsive Job Application Tracking System built with **Next.js** and **Tailwind CSS**. It helps users manage and track their job applications across different stages such as *Saved*, *Applied*, *Interview*, and *Offer*.

---

## 🚀 Features

- 🧱 Modular component-based architecture
- 🎨 Clean UI with Tailwind CSS
- 📦 Global state management using Zustand
- 🖱️ Drag and drop functionality for job cards (status transitions)
- 📝 Add, edit, and delete job entries via modal form
- 📊 Job board organized by status columns
- 🔄 Local storage persistence (optional)

---

## 📁 Folder Structure

```
frontend/
├── app/                  # Next.js routing
│   ├── layout.tsx        # App shell with sidebar
│   └── page.tsx          # Job board page
├── components/           # UI components
│   ├── AppLayout.tsx
│   ├── Sidebar.tsx
│   ├── JobCard.tsx
│   ├── JobBoard.tsx
│   └── AddJobModal.tsx
├── hooks/
│   └── useJobStore.ts    # Zustand job state store
├── styles/               # Tailwind and global styles
│   └── globals.css
├── public/               # Static assets
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🛠️ Tech Stack

- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** for state management
- **React Icons** (if included)

---

## 🧪 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jobtracker-frontend.git
cd jobtracker-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Usage

- Click **“Add Job”** to create a new job entry
- Drag job cards between columns to update their status
- Edit or delete jobs using the action buttons on each JobCard
- All changes persist in app state (and optionally in localStorage)

---

## 📦 Deployment

To build the app for production:

```bash
npm run build
npm start
```

You can deploy on platforms like **Vercel**, **Netlify**, or your own server.


## 📊 Project Status

![Last Commit](https://img.shields.io/github/last-commit/Clementwa0/job-tracker)
![Issues](https://img.shields.io/github/issues/Clementwa0/job-tracker)
![Stars](https://img.shields.io/github/stars/Clementwa0/job-tracker?style=social)
![Forks](https://img.shields.io/github/forks/Clementwa0/job-tracker?style=social)


## 🧑‍💻 Author

**Muli Clement Wambua**  


## 📝 License