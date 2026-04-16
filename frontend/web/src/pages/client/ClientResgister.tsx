import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/user.service";
import type RegisterRequest from "@/types/registerRequest";
import { toast } from "react-toastify";

const ClientRegister: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: "",
    gender: "MALE",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.password !== formData.passwordConfirm){
        toast.error("ConfirmPassword khác Password!");
        return;
    }
    const handelRegister = async () => {
      try {
        const data = await userService.clientRegister(formData);
        if (data.success) {
          toast.success("Đăng kí thành công");
          navigate("/login");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        }
      }
    };
    handelRegister();
    console.log("Dữ liệu đăng ký:", formData);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-lg w-full border border-slate-100 bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">
            Đăng Ký Tài Khoản
          </h2>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="NGUYEN VAN A"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700"
              required
            />
          </div>

          {/* Gender & Email Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full h-12 px-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700"
              >
                <option value="MALE">NAM</option>
                <option value="FEMALE">NỮ</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              name="passwordConfirm"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700"
              required
            />
          </div>

          {/* Term Checkbox */}
          <div className="flex align-items-center  items-start space-x-2 px-2">
            <input
              type="checkbox"
              id="terms"
              className=" w-4 h-4 rounded border-slate-300 accent-alpha-blue"
              required
            />
            <label
              htmlFor="terms"
              className="text-[11px] font-bold uppercase tracking-tighter text-slate-400 leading-tight"
            >
              Tôi đồng ý với{" "}
              <span className="text-alpha-blue">điều khoản sử dụng</span> và{" "}
              <span className="text-alpha-blue">chính sách bảo mật</span>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-alpha-blue py-4 rounded-xl font-black text-white hover:bg-slate-900 transition-all transform active:scale-95 shadow-lg shadow-blue-100 mt-4 uppercase tracking-widest"
          >
            Tạo tài khoản ngay
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center text-sm font-bold text-slate-400">
          Đã có tài khoản?{" "}
          <Link
            to="/login"
            className="text-alpha-orange hover:underline decoration-2 underline-offset-4"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;
