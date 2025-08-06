import Sidebar from "../components/Sidebar";
import NewOrderForm from "../components/NewOrderForm";

export default function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <NewOrderForm />
      </div>
    </div>
  );
}

