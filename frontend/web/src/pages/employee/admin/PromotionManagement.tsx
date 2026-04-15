import React from 'react';
import BaseManagementLayout from '../../../components/employee/BaseManagementLayout';

const PromotionManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Khuyến mãi" 
      subtitle="Chương trình ưu đãi, mã giảm giá và chiến dịch marketing."
      onAdd={() => console.log('Add promotion')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Danh sách khuyến mãi sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default PromotionManagement;
