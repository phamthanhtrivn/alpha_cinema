/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/user.service";
import type RegisterRequest from "@/types/registerRequest";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import ButtonGoogle from "../../components/client/ButtonGoogle";

const ClientRegister: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    fullName: "",
    gender: "MALE",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Logic Đăng ký thủ công
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await userService.clientRegister(formData);
      if (data.success) {
        toast.success("Đăng ký thành công!");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-lg w-full border border-slate-100 bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">
            Đăng Ký Tài Khoản
          </h2>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... Các trường input giữ nguyên ... */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Họ và tên</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Giới tính</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-12 px-3 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700">
                <option value="MALE">NAM</option>
                <option value="FEMALE">NỮ</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mật khẩu</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Xác nhận mật khẩu</label>
            <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleChange} className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700" required />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-alpha-blue py-4 rounded-xl font-black text-white hover:bg-slate-900 transition-all transform active:scale-95 shadow-lg shadow-blue-100 mt-4 uppercase tracking-widest flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Tạo tài khoản ngay"}
          </button>
        </form>

        {/* --- DÒNG NGĂN CÁCH --- */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400">
            <span className="bg-white px-4">Hoặc đăng ký nhanh bằng</span>
          </div>
        </div>

        {/* --- NÚT GOOGLE --- */}
        <ButtonGoogle />

        {/* Footer */}
        <div className="mt-10 text-center text-sm font-bold text-slate-400">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-alpha-orange hover:underline decoration-2 underline-offset-4">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;