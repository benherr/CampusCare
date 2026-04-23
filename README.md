

<p align="center">
  <img src="./Images/bannerr.png" width="100%">
</p>

<h1 align="center">CampusCare</h1>

<p align="center">
A web platform for students to report infrastructure issues and for administrators to track and resolve complaints efficiently.
</p>


---

# 🚀 Overview

The **CampusCare** is a web-based application that allows students to report infrastructure issues within their college campus.

The system enables administrators to manage complaints, track issues, and ensure timely resolution, improving communication between students and the administration.

---

# 🖼️ Application Screenshots

### Home Page

<p align="center">
<img src="./Images/Home.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/home2.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/login.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/register.png" width="420"/>
  &nbsp;&nbsp;
</p>

---

### Complaint Submission

<p align="center">
<img src="./Images/complaint_form.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/complaint_his.png" width="420"/>
</p>

---

### Admin Dashboard

<p align="center">
<img src="./Images/admin_dash.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/admin_w_list.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/add_w.png" width="420"/>
</p>

---

### Worker Dashboard

<p align="center">
<img src="./Images/w_login.png" width="420"/>
&nbsp;&nbsp;
<img src="./Images/w_dash.png" width="420"/>
&nbsp;&nbsp;

---

# 🏗️ System Architecture

```mermaid
flowchart LR
    A[Student/User] --> B[React Frontend]
    B --> C[Node.js + Express API]
    C --> D[MongoDB Database]
    C --> E[Admin Dashboard]

```
## 🛠️ Tech Stack

**Frontend**
- React.js
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

**Tools**
- Git
- GitHub
- VS Code

## ⚙️ Installation & Setup

Follow the steps below to run the project locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/benherr/complaint-portal-MINI.git
cd complaint-portal-MINI
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables setup
Make sure to create `.env` files in both the root directory and the `client` directory using the provided `.env.example` templates. Configure your MongoDB connection string and JWT secret in the root `.env`:
```
cp .env.example .env
```

### 4️⃣ Start the Application
start the server
```
npm start
```
start the client
```bash
cd client/
npm start
```

### 4️⃣ Open in Browser

Visit the following URL in your browser:

```
http://localhost:3000
```
You can now start using the **CampusCare** locally.

👨‍💻 Author

Benher Basheer

<a href= "https://github.com/benherr" >GitHub</a>

<a href ="https://www.linkedin.com/in/benher-basheer-371347377/">LinkedIn</a>

⭐ Support

If you found this project helpful, please give it a ⭐ on GitHub.
