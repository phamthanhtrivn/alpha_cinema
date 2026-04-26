/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { FilterSelect } from "@/components/employee/FilterSelect";
import BaseManagementLayout from "@/components/employee/BaseManagementLayout";
import ManagementFilterBar from "@/components/employee/ManagementFilterBar";
import ManagementTable from "@/components/employee/ManagementTable";
import StatusBadge from "@/components/employee/StatusBadge";
import TableActions from "@/components/employee/TableActions";
import { roomService } from "@/services/room.service";
import { cinemaService } from "@/services/cinema.service";
import type { RoomFilterParams, Room } from "@/types/room";
import { seatService } from "@/services/seat.service";
import CinemaRoomPreviewModal from "@/components/employee/CinemaDynamicGrid";
import CinemaSeatEditModal from "@/components/employee/CinemaSeatEditModal";

const RoomManagement: React.FC = () => {
  const pageSize = 5;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<RoomFilterParams>({
    cinemaId: undefined,
    roomNumber: undefined,
    projectionType: undefined,
    status: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState<RoomFilterParams>({
    cinemaId: undefined,
    roomNumber: undefined,
    projectionType: undefined,
    status: undefined,
  });
  
  const [isOpenView, setIsOpenView] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [seatData, setSeatData] = useState<any>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);


  const buildParams = () => {
    return Object.fromEntries(
      Object.entries({
        ...appliedFilters,
        page: currentPage - 1,
        size: pageSize,
      }).filter(([_, v]) => v !== undefined && v !== ""),
    );
  };

  const handleFetchCinemas = async () => {
    try {
      const res = await cinemaService.getAllCinemas();
      if (res?.success || res?.data) {
        setCinemas(res.data || res); // Handle both formats if data wrapped or not
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFetchRooms = async () => {
    try {
      setLoading(true);

      const res = await roomService.getAllRooms(buildParams());

      if (res?.success) {
        setRooms(res.data.content);
        setTotalItems(res.data.totalElements);
      } else {
        toast.error(res?.message || "Lỗi tải danh sách phòng chiếu");
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi tải danh sách phòng chiếu");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    const reset = {
      cinemaId: undefined,
      roomNumber: undefined,
      projectionType: undefined,
      status: undefined,
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setCurrentPage(1);
  };


  useEffect(() => {
    handleFetchCinemas();
  }, []);

  useEffect(() => {
    handleFetchRooms();
  }, [currentPage, appliedFilters]);

  const FilterContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Cinema */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Rạp chiếu
        </label>
        <FilterSelect
          placeholder="Tất cả rạp"
          options={["Tất cả", ...cinemas.map((c) => c.name)]}
          value={
            cinemas.find((c) => c.id === filters.cinemaId)?.name || "Tất cả"
          }
          onChange={(value) =>
            setFilters({
              ...filters,
              cinemaId:
                value === "Tất cả"
                  ? undefined
                  : cinemas.find((c) => c.name === value)?.id,
            })
          }
        />
      </div>

      {/* Room Number */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Phòng số
        </label>
        <Input
          type="number"
          placeholder="Nhập số phòng..."
          value={filters.roomNumber || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              roomNumber: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Projection Type */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Loại trình chiếu
        </label>
        <FilterSelect
          placeholder="Tất cả loại"
          options={["Tất cả", "_2D", "_3D", "IMAX"]}
          value={filters.projectionType || "Tất cả"}
          onChange={(value) => {
            setFilters({
              ...filters,
              projectionType: value === "Tất cả" ? undefined : value,
            });
          }}
        />
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Trạng thái
        </label>
        <FilterSelect
          placeholder="Tất cả trạng thái"
          options={["Tất cả", "Hoạt động", "Ngừng hoạt động"]}
          value={
            filters.status === undefined
              ? "Tất cả"
              : filters.status
                ? "Hoạt động"
                : "Ngừng hoạt động"
          }
          onChange={(value) => {
            let status;
            if (value === "Tất cả") status = undefined;
            else if (value === "Hoạt động") status = true;
            else status = false;

            setFilters({ ...filters, status });
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-end gap-3 md:col-span-4">
        <Button
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer"
          onClick={() => {
            setCurrentPage(1);
            setAppliedFilters(filters);
          }}
          disabled={loading}
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </Button>
        <Button
          variant="outline"
          className="h-11 px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800 transition-all cursor-pointer"
          onClick={handleRefresh}
        >
          Reset
        </Button>
      </div>
    </div>
  );

  const handleSeatAction = async (room: Room, mode: 'view' | 'edit') => {
    try{
      const res = await seatService.getSeatByRoomId(room.id);
      if(res?.success || res?.data){
        setSeatData(res.data);
        setSelectedRoom(room);
        if (mode === 'view') setIsOpenView(true);
        else setIsOpenEdit(true);
      } else if (Array.isArray(res)) {
        setSeatData(res);
        setSelectedRoom(room);
        if (mode === 'view') setIsOpenView(true);
        else setIsOpenEdit(true);
      }
    }
    catch(error){
      console.log(error);
      setSeatData([]);
      setSelectedRoom(room);
      if (mode === 'view') setIsOpenView(true);
      else setIsOpenEdit(true);
    }
  }

  


  return (
    <BaseManagementLayout
      title="Quản lý ghế ngồi"
      subtitle="Quản lý thông tin ghế ngồi tại các rạp."
      totalItems={totalItems}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={(p) => setCurrentPage(p)}
      filterContent={
        <ManagementFilterBar
          onRefresh={handleRefresh}
          onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
          isFilterActive={isFilterOpen}
        >
          {FilterContent}
        </ManagementFilterBar>
      }
    >

      
      <CinemaRoomPreviewModal 
        rawData={seatData}
        isOpen={isOpenView}
        onClose={()=>{setIsOpenView(false)}}
      />
      
      <CinemaSeatEditModal 
        isOpen={isOpenEdit}
        onClose={()=>{setIsOpenEdit(false)}}
        roomId={selectedRoom?.id}
        capacity={selectedRoom?.capacity}
        existingSeats={seatData}
        onSaveSuccess={() => {
          if (selectedRoom) {
            handleSeatAction(selectedRoom, 'edit');
          }
        }}
      />

      <ManagementTable
        headers={[
          "Mã phòng",
          "Rạp phim",
          "Phòng số",
          "Loại chiếu",
          "Sức chứa",
          "Trạng thái",
          "Hành động",
        ]}
        isLoading={loading}
      >
        {rooms.map((room) => (
          <TableRow
            key={room.id}
            className="group hover:bg-slate-50/80 transition"
          >
            {/* ID */}
            <TableCell className="px-6 py-4 font-semibold text-slate-700">
              {room.id}
            </TableCell>

            {/* Cinema Name */}
            <TableCell className="px-6 py-4">
              <span className="font-semibold text-slate-800 leading-tight">
                {room.cinema?.name}
              </span>
            </TableCell>

            {/* Room Number */}
            <TableCell className="px-6 py-4">
              <span className="text-sm font-bold text-slate-600">
                {room.roomNumber}
              </span>
            </TableCell>

            {/* Projection Type */}
            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                {room.projectionType?.replace("_", "")}
              </span>
            </TableCell>


            <TableCell className="px-6 py-4">
              <span className="text-xs font-bold px-2 py-1">
                {room.capacity}
              </span>
            </TableCell>

            {/* Status */}
            <TableCell className="px-6 py-4">
              <StatusBadge
                status={room.status ? "Hoạt động" : "Ngừng hoạt động"}
                type={room.status ? "success" : "error"}
              />
            </TableCell>

            {/* Actions */}
            <TableCell className="px-6 py-4 text-right">
              <TableActions
                onView={()=>{handleSeatAction(room, 'view')}}
                onEdit={()=>{handleSeatAction(room, 'edit')}}
              />
            </TableCell>
          </TableRow>
        ))}
      </ManagementTable>




    </BaseManagementLayout>
  );
};

export default RoomManagement;