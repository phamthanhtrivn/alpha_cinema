import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/user.service";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react"; // Dùng icon loading cho chuyên nghiệp

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit =  (e: React.FormEvent) => {
    e.preventDefault();
    const handelReset = async () => {
      setLoading(true);
      try {
        const response = await userService.forget_password(email);

        if (response.success) {
          toast.success("Mã OTP đã được gửi về Email của bạn!");
          navigate("/verify-otp", { state: { email } });
        } else {
          console.log( response.message);
          toast.error(
            response.message || "Email không tồn tại trong hệ thống!",
          );
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error : any) {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
        );
      } finally {
        setLoading(false);
      }
    };
    handelReset();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-md w-full border border-slate-100 bg-white p-10 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">
            Quên mật khẩu
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Nhập email để nhận mã khôi phục
          </p>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Email đăng ký
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-center items-center text-[10px] md:text-xs font-bold uppercase tracking-widest">
            <Link
              to="/login"
              className="text-alpha-blue hover:text-alpha-orange transition-colors"
            >
              Quay lại đăng nhập
            </Link>
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
            {loading ? "ĐANG GỬI..." : "GỬI MÃ XÁC NHẬN"}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-12 text-center text-sm font-bold text-slate-400">
          Chưa có tài khoản?{" "}
          <Link
            to="/register"
            className="text-alpha-orange hover:underline decoration-2 underline-offset-4"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
