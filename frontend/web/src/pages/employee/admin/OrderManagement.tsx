import OrderManagementPage from "../../../components/employee/OrderManagementPage";

const OrderManagement = () => {
  return (
    <OrderManagementPage
      scope="ADMIN"
      title="Quản lý đơn hàng"
      subtitle="Xem toàn bộ đơn đặt vé của hệ thống, lọc theo rạp, thời gian và tổng thanh toán."
    />
  );
};

export default OrderManagement;
