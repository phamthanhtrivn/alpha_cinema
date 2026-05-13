import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { User, Phone, Calendar, Users, KeyRound } from "lucide-react";
import Modal from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/pages/client/customer/profile/ProfileUIComponents";
import { employeeService } from "@/services/employee.service";
import { genderOptions } from "@/constants/customer.constants";
import { selectAuth, setCredentials } from "@/store/slices/authSlice";
import type { Gender } from "@/types/customer";
import ChangeEmailModal from "@/components/employee/ChangeEmailModal";
import ChangePasswordModal from "@/components/employee/ChangePasswordModal";

type EmployeeUser = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string | Date;
};

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const {
    accessToken,
    role,
    cinemaId,
    user: authUser,
  } = useSelector(selectAuth);
  const queryClient = useQueryClient();

  const { data: profileData } = useQuery<EmployeeUser | null>({
    queryKey: ["employee", "profile"],
    queryFn: async () => {
      const response = await employeeService.getProfile();
      return response?.data ?? null;
    },
    enabled: !!isOpen,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [form, setForm] = useState<
    Partial<{
      fullName: string;
      phone: string;
      gender: Gender;
      dateOfBirth: string;
    }>
  >({});

  const sourceUser = profileData || authUser;

  const initialForm = useMemo(() => {
    return {
      fullName: sourceUser?.fullName || "",
      phone: sourceUser?.phone || "",
      gender: (sourceUser?.gender || "MALE") as Gender,
      dateOfBirth: sourceUser?.dateOfBirth
        ? new Date(sourceUser.dateOfBirth).toISOString().split("T")[0]
        : "",
    };
  }, [sourceUser]);

  const displayForm = {
    fullName: form.fullName ?? initialForm.fullName,
    phone: form.phone ?? initialForm.phone,
    gender: form.gender ?? initialForm.gender,
    dateOfBirth: form.dateOfBirth ?? initialForm.dateOfBirth,
  };

  const updateMutation = useMutation({
    mutationFn: (data: {
      fullName: string;
      phone: string;
      gender: Gender;
      dateOfBirth: string;
    }) => employeeService.updateProfile(data),
    onSuccess: (res: unknown) => {
      type UpdateRes = {
        success?: boolean;
        data?: EmployeeUser;
        user?: EmployeeUser;
        message?: string;
      };
      const response = res as UpdateRes;
      const hasData = response?.data;
      const ok =
        hasData ||
        response?.success === undefined ||
        response?.success === true;
      if (ok) {
        const updatedUser: EmployeeUser = hasData
          ? (response.data as EmployeeUser)
          : {
              ...sourceUser,
              fullName: displayForm.fullName,
              phone: displayForm.phone,
              gender: displayForm.gender,
              dateOfBirth: displayForm.dateOfBirth,
            };

        dispatch(
          setCredentials({
            user: updatedUser,
            accessToken: accessToken || "",
            role,
            cinemaId: cinemaId || null,
          }),
        );
        toast.success(response?.message || "Cập nhật thông tin thành công");
        setFieldErrors({});
        // update cached profile so modal & other UI get freshest data
        queryClient.setQueryData(["employee", "profile"], updatedUser);
        onClose();
      } else {
        toast.error(response?.message || "Cập nhật thất bại");
      }
    },
    onError: (error: unknown) => {
      const responseData = (
        error as {
          response?: {
            data?: { errors?: Record<string, string>; message?: string };
          };
        }
      )?.response?.data;
      if (responseData?.errors) {
        setFieldErrors(responseData.errors);
        toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
      } else {
        toast.error(responseData?.message || "Có lỗi xảy ra khi cập nhật");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    updateMutation.mutate({
      fullName: displayForm.fullName,
      phone: displayForm.phone,
      gender: displayForm.gender,
      dateOfBirth: displayForm.dateOfBirth,
    });
  };

  // always render modal; use auth user as fallback until profileData loads

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật thông tin cá nhân"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Họ và tên"
          icon={<User />}
          error={fieldErrors.fullName}
        >
          <input
            type="text"
            value={displayForm.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full pl-10 pr-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all border-slate-200 focus:border-alpha-blue"
            placeholder="Nhập họ và tên"
          />
        </FormField>

        <FormField label="Email" icon={<Users />}>
          <div className="relative">
            <input
              type="email"
              value={sourceUser.email || ""}
              disabled
              className="w-full pl-10 pr-20 py-2.5 text-sm border rounded-md bg-slate-50 text-slate-400 border-slate-200"
            />
            <button
              type="button"
              onClick={() => {
                setIsEmailModalOpen(true);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-alpha-blue border border-slate-200 px-3 py-1 rounded-md bg-white hover:bg-slate-50 cursor-pointer *:"
            >
              Đổi email
            </button>
          </div>
        </FormField>

        <FormField label="Mật khẩu" icon={<KeyRound />}>
          <div className="relative">
            <input
              type="password"
              value={"********"}
              disabled
              className="w-full pl-10 pr-20 py-2.5 text-sm border rounded-md bg-slate-50 text-slate-400 border-slate-200"
            />
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-alpha-blue border border-slate-200 px-3 py-1 rounded-md bg-white hover:bg-slate-50 cursor-pointer"
            >
              Đổi password
            </button>
          </div>
        </FormField>

        <FormField
          label="Số điện thoại"
          icon={<Phone />}
          error={fieldErrors.phone}
        >
          <input
            type="tel"
            value={displayForm.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full pl-10 pr-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all border-slate-200 focus:border-alpha-blue"
            placeholder="Nhập số điện thoại"
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Giới tính" error={fieldErrors.gender}>
            <select
              value={displayForm.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as Gender })
              }
              className="w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all border-slate-200 focus:border-alpha-blue"
            >
              {genderOptions
                .filter((option) => option.value !== "ALL")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField
            label="Ngày sinh"
            icon={<Calendar />}
            error={fieldErrors.dateOfBirth}
          >
            <input
              type="date"
              value={displayForm.dateOfBirth}
              onChange={(e) =>
                setForm({ ...form, dateOfBirth: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all border-slate-200 focus:border-alpha-blue"
            />
          </FormField>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-alpha-blue hover:bg-alpha-blue/90 text-white"
          >
            {updateMutation.isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>

      <ChangeEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSuccess={() => onClose()}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => onClose()}
      />
    </Modal>
  );
};

export default EmployeeProfileModal;
