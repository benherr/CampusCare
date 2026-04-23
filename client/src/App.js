import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ComplaintForm from "./components/ComplaintForm";
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import WorkerLogin from './components/WorkerLogin';
import WorkerDashboard from './components/WorkerDashboard';
import GiveFeedback from './components/GiveFeedback'; // New Component for feedback
import ComplaintHistory from './components/ComplaintHistory'; // New Component for history
import ComplaintDetails from './components/ComplaintDetails'; // Complaint details page
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/complaint-form" element={<ComplaintForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/worker/login" element={<WorkerLogin />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        
        {/* New Routes */}
        <Route path="/give-feedback/:complaintId" element={<GiveFeedback />} /> 
        <Route path="/complaint-history" element={<ComplaintHistory />} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
