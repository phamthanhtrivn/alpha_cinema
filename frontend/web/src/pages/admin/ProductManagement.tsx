import React from 'react';
import BaseManagementLayout from '../../components/admin/BaseManagementLayout';

const ProductManagement: React.FC = () => {
  return (
    <BaseManagementLayout 
      title="Quản lý Sản phẩm" 
      subtitle="Quản lý bắp, nước, combo và các dịch vụ đi kèm."
      onAdd={() => console.log('Add product')}
    >
       <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
          <p className="italic font-medium">Bảng dữ liệu sản phẩm sẽ hiển thị tại đây.</p>
       </div>
    </BaseManagementLayout>
  );
};

export default ProductManagement;
