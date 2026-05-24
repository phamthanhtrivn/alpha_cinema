import React from "react";
import { useSelector } from "react-redux";
import AdminScheduleManagement from "../admin/ScheduleManagement";
import { selectAuth } from "@/store/slices/authSlice";

const ScheduleManagement: React.FC = () => {
  const auth = useSelector(selectAuth);
  const cinemaId = auth.cinemaId || auth.user?.cinemaId || "";
  const cinemaLabel =
    auth.user?.cinemaName ||
    auth.user?.cinema?.name ||
    auth.user?.cinema?.label ||
    undefined;

  return (
    <AdminScheduleManagement
      scopeToCurrentCinema
      scopedCinemaId={cinemaId}
      scopedCinemaLabel={cinemaLabel}
    />
  );
};

export default ScheduleManagement;
