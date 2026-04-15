import React from 'react';
import BaseManagementLayout from '../../../components/employee/BaseManagementLayout';

const PriceManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Giá vé" 
      subtitle="Cấu hình bảng giá theo loại ghế, suất chiếu và ngày lễ."
      onAdd={() => console.log('Add price')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Bảng giá vé sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default PriceManagement;
