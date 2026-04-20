import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "../../services/user.service";
import { Loader2, Lock, Eye, EyeOff, KeyRound } from "lucide-react";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const token = location.state?.token || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      toast.error("Yêu cầu không hợp lệ. Vui lòng thực hiện lại!");
      navigate("/forgot-password");
    }
  }, [token, email, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);

    const handelResetPassword = async () => {
      try {
        const data = await userService.reset_password(
          email,
          formData.password,
          formData.confirmPassword,
          token,
        );
        if(data.success){
            toast.success("Cập nhật password thành công !");
            navigate("/login");
        }
        else toast.success("Cập nhật password thất bại !");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    handelResetPassword();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-md w-full border border-slate-100 bg-white p-10 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-50 rounded-2xl text-alpha-orange">
              <KeyRound size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">
            Đặt mật khẩu mới
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Vui lòng nhập mật khẩu mới cho tài khoản: <br />
            <span className="text-slate-600 lowercase">{email}</span>
          </p>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Password Input */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pl-12 pr-12 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700 placeholder:text-slate-300"
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-alpha-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700 placeholder:text-slate-300"
                />
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alpha-blue py-4 rounded-xl font-black text-white hover:bg-slate-900 transition-all transform active:scale-95 shadow-lg shadow-blue-100 uppercase tracking-widest flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={20} />
            ) : null}
            {loading ? "ĐANG CẬP NHẬT..." : "ĐỔI MẬT KHẨU"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-[10px] font-bold uppercase tracking-widest text-alpha-blue hover:text-alpha-orange transition-colors"
          >
            Hủy bỏ & quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
