import React from "react";
import BaseManagementLayout from "../../../components/employee/BaseManagementLayout";

const StaffManagement: React.FC = () => {
  return (
    <BaseManagementLayout
      title="Quản lý Nhân viên"
      subtitle="Phân quyền và quản lý tài khoản nhân viên hệ thống."
      onAdd={() => console.log("Add staff")}
    >
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
        <p className="italic font-medium">
          Danh sách nhân viên sẽ hiển thị tại đây.
        </p>
      </div>
    </BaseManagementLayout>
  );
};

export default StaffManagement;
