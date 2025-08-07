// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage"; // 🔁 Add this at the top
import NewOrderForm from "./components/NewOrderForm";
import OrderList from "./components/OrderList";
import CompletedOrders from "./components/CompletedOrders";
import ShiftProductionForm from "./components/ShiftProductionForm";
import ShiftProductionList from "./components/ShiftProductionList";
import RawMaterialIntakeForm from "./components/RawMaterialIntakeForm";
import RawMaterialIntakeList from "./components/RawMaterialIntakeList";
import ProductManagement from "./components/ProductManagement";
import WIPList from "./components/WIPList";
import ByproductList from "./components/ByproductList";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SmartScheduleCalendar from "./components/SmartScheduleCalendar";
import ClientUpload from "./components/ClientDataUpload";
import ForecastViewer from "./components/ForecastViewer";
import ProductionScheduleViewer from "./components/ProductionScheduleViewer";
import InventoryStockList from "./components/InventoryStockList";
import StocktakeUpdateForm from "./components/InventoryStockForm";
import MaterialUsageTracker from "./components/MaterialUsageTracker";
import Login from "./components/LoginForm";

// 🔹 Admin Tools & Subpages
import AdminTools from "./components/AdminTools";
import SystemHealth from "./components/SystemHealth";
import RescheduleAuditLog from "./components/RescheduleAuditLog";
import BackupRestore from "./components/BackupRestore";
import UserManagement from "./components/UserManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/new-order" element={<NewOrderForm />} />
      <Route path="/orders" element={<OrderList />} />
      <Route path="/completed-orders" element={<CompletedOrders />} />
      <Route path="/shift-production" element={<ShiftProductionForm />} />
      <Route path="/shift-production-list" element={<ShiftProductionList />} />
      <Route path="/raw-material-intake" element={<RawMaterialIntakeForm />} />
      <Route path="/raw-material-intake-list" element={<RawMaterialIntakeList />} />
      <Route path="/products" element={<ProductManagement />} />
      <Route path="/wip-list" element={<WIPList />} />
      <Route path="/byproduct-list" element={<ByproductList />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/scheduler" element={<SmartScheduleCalendar />} />
      <Route path="/smart-calendar" element={<SmartScheduleCalendar />} /> {/* Old alias */}
      <Route path="/client-upload" element={<ClientUpload />} />
      <Route path="/forecast-viewer" element={<ForecastViewer />} />
      <Route path="/production-schedule" element={<ProductionScheduleViewer />} />
      <Route path="/inventory-stock-list" element={<InventoryStockList />} />
      <Route path="/inventory-stock" element={<StocktakeUpdateForm />} />
      <Route path="/material-usage-tracker" element={<MaterialUsageTracker />} />
      <Route path="/" element={<Homepage />} />
      {/* 🔹 Admin Tools & Subpages */}
      <Route path="/admin-tools" element={<AdminTools />} />
      <Route path="/system-health" element={<SystemHealth />} />
      <Route path="/reschedule-audit-log" element={<RescheduleAuditLog />} />
      <Route path="/backup-restore" element={<BackupRestore />} />
      <Route path="/user-management" element={<UserManagement />} />

      <Route path="/login" element={<Login />} />
      <Route path="*" element={<OrderList />} />
    </Routes>
  );
}
