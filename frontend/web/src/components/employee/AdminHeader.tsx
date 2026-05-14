import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { cinemaService } from "@/services/cinema.service";
import EmployeeProfileModal from "@/components/employee/EmployeeProfileModal";

const AdminHeader: React.FC = () => {
  const { role, user } = useSelector((state: RootState) => state.auth);
  const [cinemaName, setCinemaName] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const loadCinemaName = async () => {
      if (role === "ADMIN" || !user?.cinemaId) {
        setCinemaName("");
        return;
      }

      try {
        const response = await cinemaService.getCinemaInfo(user.cinemaId);
        const cinema = response?.data ?? response;
        setCinemaName(cinema?.name || cinema?.label || "");
      } catch {
        setCinemaName("");
      }
    };
    loadCinemaName();
  }, [role, user?.cinemaId]);
  

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-2 py-2 shadow-sm">
      <div className="flex items-center space-x-4 pl-6">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {user?.fullName}
          </p>
          {role !== "ADMIN" && cinemaName ? (
            <p className="text-xs font-semibold text-sky-600">{cinemaName}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold border-2 border-sky-400 hover:border-sky-500 hover:bg-sky-50 transition cursor-pointer"
          aria-label="Cập nhật thông tin cá nhân"
          title="Cập nhật thông tin cá nhân"
        >
          {user?.fullName
            ? user.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
            : "?"}
        </button>
      </div>
      <EmployeeProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </header>
  );
};

export default AdminHeader;
