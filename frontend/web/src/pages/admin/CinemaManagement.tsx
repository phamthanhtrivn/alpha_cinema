import React from 'react';
import BaseManagementLayout from '../../components/admin/BaseManagementLayout';

const CinemaManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Rạp phim" 
      subtitle="Quản lý thông tin cụm rạp, phòng chiếu và tọa độ."
      onAdd={() => console.log('Add cinema')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Danh sách cụm rạp sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default CinemaManagement;
