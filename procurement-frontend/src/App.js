import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PurchaseRequestForm from "./pages/PurchaseRequestForm";
import WorkflowTracker from "./pages/WorkflowTracker";
import ApprovalHistory from "./pages/ApprovalHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/employee" element={<EmployeeDashboard />} />

        <Route path="/manager" element={<ManagerDashboard />} />

        <Route path="/procurement" element={<ProcurementDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/create-request" element={<PurchaseRequestForm />} />

        <Route path="/workflow" element={<WorkflowTracker />} />

        <Route path="/history" element={<ApprovalHistory />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;