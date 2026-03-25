import React from 'react';
import BaseManagementLayout from '../../components/admin/BaseManagementLayout';

const CustomerManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Khách hàng" 
      subtitle="Thông tin thành viên và lịch sử giao dịch khách hàng."
      onAdd={() => console.log('Add customer')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Danh sách khách hàng sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default CustomerManagement;
