import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { userService } from "../../services/user.service";
import { Loader2, ShieldCheck } from "lucide-react"; // Icon bảo mật cho phù hợp xác thực

const VerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit =  (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const handelVerify = async () => {
        try {
            const data = await userService.forget_password_otp(formData.email,formData.otp);
            console.log(data);
            if(data.success){
                toast.success("OTP đã đúng");
                const token = data.data;
                navigate("/reset-password", { state: { email : formData.email, token :  token} });
            }
            else toast.success("OTP không hợp lệ");
        } catch (error) {
            console.log(error);
            toast.success("OTP không hợp lệ");
        }
        finally{
            setLoading(false);
        }
    }
    handelVerify();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-md w-full border border-slate-100 bg-white p-10 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-alpha-blue">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">
            Xác thực OTP
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">
            Mã xác thực đã được gửi đến: <br/>
            <span className="text-slate-600 lowercase">{formData.email || "email của bạn"}</span>
          </p>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                required
                placeholder="000000"
                value={formData.otp}
                maxLength={6}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                className="w-full h-14 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-black text-center text-2xl tracking-[1em] text-slate-700 placeholder:text-slate-200 placeholder:tracking-normal"
              />
            </div>
          </div>

          {/* Utils Section */}
          <div className="flex flex-col space-y-4 items-center text-[10px] md:text-xs font-bold uppercase tracking-widest">
            <Link
              to="/forget-password"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              Thay đổi email
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
            {loading ? "ĐANG KIỂM TRA..." : "XÁC NHẬN"}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-12 text-center text-sm font-bold text-slate-400">
          Quay lại{" "}
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

export default VerifyOtp;