import { BrowserRouter, Routes, Route } from "react-router-dom";

import VendorDashboard from "./pages/VendorDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PurchaseRequestForm from "./pages/PurchaseRequestForm";
import WorkflowTracker from "./pages/WorkflowTracker";
import ApprovalHistory from "./pages/ApprovalHistory";
import ProcurementCategoryManagement from "./pages/ProcurementCategoryManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import ApprovalHierarchyManagement from "./pages/ApprovalHierarchyManagement";
import VendorManagement from "./pages/VendorManagement";
import ActivityMonitoring from "./pages/ActivityMonitoring";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/employee" element={<EmployeeDashboard />} />

        <Route path="/manager" element={<ManagerDashboard />} />

        <Route path="/procurement" element={<ProcurementDashboard />} />

        <Route path="/vendor" element={<VendorDashboard />} 
/>

        <Route path="/admin" element={<AdminDashboard />} />
        <Route
    path="/admin/vendors"
    element={<VendorManagement />}
/>

        <Route 
    path="/admin/categories" 
    element={<ProcurementCategoryManagement />} 
        />

        <Route 
            path="/admin/departments" 
            element={<DepartmentManagement />} 
        />

        <Route 
            path="/admin/approval-hierarchy" 
            element={<ApprovalHierarchyManagement />} 
        />

        <Route path="/create-request" element={<PurchaseRequestForm />} />

        <Route path="/workflow" element={<WorkflowTracker />} />

        <Route path="/history" element={<ApprovalHistory />} />
        <Route
    path="/activity-monitoring"
    element={<ActivityMonitoring />}
/>
        

      </Routes>
    </BrowserRouter>
  );
}

export default App;