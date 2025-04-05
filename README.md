This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Learning Management System (LMS)

## Description
This is a Learning Management System (LMS) web application designed for educational institutions. The platform allows students to browse and enroll in courses, while teachers can manage and create courses. Admins can manage users (students and teachers). The application is built using Next.js (with TypeScript), Express.js, PostgreSQL, and styled with CSS.

## Features
- **Student Features**:
  - View and browse available courses.
  - Enroll in courses.
  - View enrolled courses.
  
- **Teacher Features**:
  - Manage and create courses.
  - Enroll students in courses.
  - View and remove enrolled students.
  
- **Admin Features**:
  - Manage teachers and students.
  - Create and delete courses.
  
- **Authentication**:
  - User registration, login, and JWT-based authentication with role-based access (Student, Teacher, Admin).

## Tech Stack
- **Frontend**: 
  - Next.js (with TypeScript)
  - React (with hooks)
  - CSS (for styling)

- **Backend**:
  - Node.js (with Express.js)
  - JWT Authentication
  - PostgreSQL (database)

- **Authentication**: 
  - JWT tokens with bcrypt for password hashing

## Setup Instructions

 Clone the repository
```bash
git clone https://github.com/Vasu-171/LMS-project.git
cd LMS-project 

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
