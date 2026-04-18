import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import React from "react";

const ArtistManagement: React.FC = () => {
  return (
    <BaseManagementLayout
      title="Quản lý Nghệ sĩ"
      subtitle="Danh sách diễn viên, đạo diễn và biên kịch."
      onAdd={() => console.log("Add artist")}
    >
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-4 text-slate-300">
        <p className="italic font-medium">
          Bảng dữ liệu nghệ sĩ sẽ hiển thị tại đây.
        </p>
      </div>
    </BaseManagementLayout>
  );
};

export default ArtistManagement;
