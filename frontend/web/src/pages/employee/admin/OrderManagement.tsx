import React from 'react';
import BaseManagementLayout from '../../../components/employee/BaseManagementLayout';

const OrderManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Đơn hàng" 
      subtitle="Theo dõi các giao dịch đặt vé và thanh toán."
      onAdd={() => console.log('Add order')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Danh sách đơn hàng sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default OrderManagement;
