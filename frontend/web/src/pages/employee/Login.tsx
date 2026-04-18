import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { userService } from "../../services/user.service";
import { setCredentials } from "@/store/slices/authSlice";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import type LoginRequest from "../../types/loginRequest";

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const handelLogin = async () => {
      try {
        const response = await userService.login(formData);
        if (response) {
          toast.success("Đăng nhập thành công");
          dispatch(
            setCredentials({
              user: response.data.user,
              accessToken: response.data.accessToken,
              role: response.data.user.role,
            }),
          );
          if (response.data.user.role == "ADMIN")
            navigate("/employee/admin/dashboard");
          if (response.data.user.role == "MANAGER")
            navigate("/employee/manager/dashboard");
          if (response.data.user.role == "STAFF")
            navigate("/employee/staff/dashboard");
        }
      } catch (err) {
        toast.error("Sai email hoặc password");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    handelLogin();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-10 md:p-12 border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/60">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 text-white rounded-2xl mb-6 shadow-xl shadow-slate-200">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 italic uppercase tracking-tighter mb-1">
            Alpha Cinema{" "}
            <span className="text-slate-400 font-light">Staff</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Hệ thống quản trị nội bộ
          </p>
          <div className="h-1 w-12 bg-alpha-orange mx-auto mt-4"></div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Email Nhân Viên
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@alphacinema.com"
                className="w-full h-12 pl-12 pr-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-slate-900 transition-all font-bold text-slate-700 placeholder:text-slate-300"
              />
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-12 pl-12 pr-12 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-slate-900 transition-all font-bold text-slate-700 placeholder:text-slate-300"
              />
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 py-4 rounded-xl font-black text-white hover:bg-black transition-all transform active:scale-[0.98] shadow-xl shadow-slate-200 uppercase tracking-widest flex items-center justify-center disabled:opacity-70 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : null}
            {loading ? "ĐANG XÁC THỰC..." : "VÀO HỆ THỐNG"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
            Secure Terminal Access v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
