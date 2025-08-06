import Sidebar from "../components/Sidebar";
import OrderList from "../components/OrderList";

export default function OrdersPage() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <OrderList />
      </div>
    </div>
  );
}

