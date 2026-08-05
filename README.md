# 💼 JobTrail – Job Application Tracking System

JobTrail is a modern full-stack web application that helps job seekers organize, monitor, and optimize their job search. It centralizes job applications, interview schedules, resumes, analytics, and application progress into a single, intuitive platform.

**🌐 Live Demo:** https://jobtrailapp.vercel.app

---

# ✨ Features

## 📋 Job Management

* Create, edit, and delete job applications
* Track application status
* Store company and job details
* Record application deadlines
* Monitor application progress

## 📅 Interview Management

* Schedule interviews
* Track interview stages
* Record interview outcomes
* Upcoming interview reminders

## 📄 Resume Management

* Upload resumes
* Manage multiple resume versions
* Associate resumes with job applications

## 📊 Analytics Dashboard

* Application statistics
* Interview success tracking
* Job pipeline visualization
* Progress monitoring

## 👤 User Authentication

* Secure user registration
* Login and logout
* Protected routes
* User profile management

## 🔍 Search & Filtering

* Search applications
* Filter by status
* Filter by company
* Sort applications

## 📱 Responsive Design

* Mobile-friendly interface
* Tablet support
* Desktop optimized

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* FullCalendar
* Radix UI
* Lucide React
* Sonner

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## Security

* JWT Authentication
* bcrypt
* Protected Routes
* Environment Variables

## Development Tools

* Git
* GitHub
* VS Code
* Postman

---

# 📁 Project Structure

```text
JobTrail
├── client
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   ├── types
│   │   ├── context
│   │   └── utils
│   └── package.json
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   └── package.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

* Node.js 18+
* pnpm or npm
* MongoDB

## Clone the Repository

```bash
git clone https://github.com/Clementwa0/JobTrail.git

cd JobTrail
```

---

## Install Dependencies

### Backend

```bash
cd server
pnpm install
```

### Frontend

```bash
cd ../client
pnpm install
```

---

# ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# ▶️ Running the Project

Start the backend:

```bash
cd server
pnpm dev
```

Start the frontend:

```bash
cd client
pnpm dev
```

Open:

```text
http://localhost:5173
```

---

# 🔌 API Modules

* Authentication
* Users
* Jobs
* Interviews
* Resume
* Dashboard Analytics

---

# 🔒 Security Features

* JWT Authentication
* Password hashing with bcrypt
* Protected API routes
* Environment variable management
* Secure user sessions

---

# 📸 Screenshots

Add screenshots of the following pages:

* Landing Page
* Login
* Dashboard
* Job Applications
* Add Job
* Interview Calendar
* Analytics
* Resume Manager

Example:

```markdown
![Dashboard](screenshots/dashboard.png)
```

---

# 🏗️ Architecture

```text
React + TypeScript
        │
      Axios
        │
REST API (Express.js)
        │
Controllers
        │
Business Logic
        │
MongoDB (Mongoose)
```

---

# 🚀 Future Enhancements

* AI-powered resume analysis
* AI job description matching
* Automated application reminders
* Email notifications
* Calendar synchronization
* Company insights
* Cover letter generator
* Multi-language support
* Docker deployment
* GitHub Actions CI/CD
* Unit and integration testing

---

# 📚 Learning Outcomes

This project strengthened my experience in:

* Full-stack application development
* RESTful API design
* Authentication and authorization
* Database modeling with MongoDB
* React state management
* Responsive UI development
* CRUD operations
* Software architecture
* API integration
* Git and GitHub workflows
* Debugging and testing

---

# 👨‍💻 Author

**Clement Wambua Muli**

* **Portfolio:** https://codewithmuli.vercel.app
* **GitHub:** https://github.com/Clementwa0
* **Email:** [clementwa01@gmail.com](mailto:clementwa01@gmail.com)
* **LinkedIn:** *Add your LinkedIn profile URL*

---

# 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## ⭐ Support

If you found this project helpful, consider giving it a **star** on GitHub. Contributions, feedback, and suggestions are welcome!
