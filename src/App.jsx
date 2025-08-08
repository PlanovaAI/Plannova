// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import AppLayout from "./components/AppLayout";
import PrivateRoute from "./components/PrivateRoute";

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
import AdminTools from "./components/AdminTools";
import SystemHealth from "./components/SystemHealth";
import RescheduleAuditLog from "./components/RescheduleAuditLog";
import BackupRestore from "./components/BackupRestore";
import UserManagement from "./components/UserManagement";

export default function App() {
  const withLayout = (el) => (
    <PrivateRoute>
      <AppLayout>{el}</AppLayout>
    </PrivateRoute>
  );

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />

      <Route path="/orders" element={withLayout(<OrderList />)} />
      <Route path="/new-order" element={withLayout(<NewOrderForm />)} />
      <Route path="/completed-orders" element={withLayout(<CompletedOrders />)} />
      <Route path="/shift-production" element={withLayout(<ShiftProductionForm />)} />
      <Route path="/shift-production-list" element={withLayout(<ShiftProductionList />)} />
      <Route path="/raw-material-intake" element={withLayout(<RawMaterialIntakeForm />)} />
      <Route path="/raw-material-intake-list" element={withLayout(<RawMaterialIntakeList />)} />
      <Route path="/products" element={withLayout(<ProductManagement />)} />
      <Route path="/wip-list" element={withLayout(<WIPList />)} />
      <Route path="/byproduct-list" element={withLayout(<ByproductList />)} />
      <Route path="/analytics" element={withLayout(<AnalyticsDashboard />)} />
      <Route path="/scheduler" element={withLayout(<SmartScheduleCalendar />)} />
      <Route path="/client-upload" element={withLayout(<ClientUpload />)} />
      <Route path="/forecast-viewer" element={withLayout(<ForecastViewer />)} />
      <Route path="/production-schedule" element={withLayout(<ProductionScheduleViewer />)} />
      <Route path="/inventory-stock-list" element={withLayout(<InventoryStockList />)} />
      <Route path="/inventory-stock" element={withLayout(<StocktakeUpdateForm />)} />
      <Route path="/material-usage-tracker" element={withLayout(<MaterialUsageTracker />)} />
      <Route path="/admin-tools" element={withLayout(<AdminTools />)} />
      <Route path="/system-health" element={withLayout(<SystemHealth />)} />
      <Route path="/reschedule-audit-log" element={withLayout(<RescheduleAuditLog />)} />
      <Route path="/backup-restore" element={withLayout(<BackupRestore />)} />
      <Route path="/user-management" element={withLayout(<UserManagement />)} />

      <Route path="*" element={<Homepage />} />
    </Routes>
  );
}
