import React from 'react';
import BaseManagementLayout from '../../components/admin/BaseManagementLayout';

const ScheduleManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Lịch chiếu" 
      subtitle="Cấu hình suất chiếu theo phim, phòng và cụm rạp."
      onAdd={() => console.log('Add schedule')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Lịch chiếu chi tiết sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default ScheduleManagement;
