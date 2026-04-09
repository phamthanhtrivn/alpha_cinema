import React from 'react';
import BaseManagementLayout from '../../components/admin/BaseManagementLayout';

const ReviewManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Đánh giá" 
      subtitle="Theo dõi và phản hồi các đánh giá từ khách hàng."
      onAdd={() => console.log('Add review')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Danh sách đánh giá sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default ReviewManagement;
