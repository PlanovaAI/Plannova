
import OrderList from "../components/OrderList";

export default function OrdersPage() {
  return (
    <div style={{ display: "flex" }}>
      
      <div style={{ flex: 1, padding: "1rem" }}>
        <OrderList />
      </div>
    </div>
  );
}

