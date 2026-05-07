import OrderManagementPage from "../../../components/employee/OrderManagementPage";

const OrderManagement = () => {
  return (
    <OrderManagementPage
      scope="MANAGER"
      title="Quản lý đơn hàng"
      subtitle="Chỉ xem đơn hàng thuộc rạp mình quản lý, vẫn có thể tìm kiếm và xem chi tiết đầy đủ."
    />
  );
};

export default OrderManagement;
