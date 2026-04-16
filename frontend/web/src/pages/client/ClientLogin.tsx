import React, { useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/user.service";
import type LoginRequest from "@/types/loginRequest";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/slices/authSlice";

const ClientLogin: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handelLogin = async () => {
      try {
        const data = await userService.login(loginData);
        if (data.success) {
          toast.success("Đăng nhập thành công");
          dispatch(
            setCredentials({
              user: data.data.user,
              accessToken: data.data.accessToken,
              role: data.data.user.role,
            }),
          );
          navigate("/");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.response?.data?.message) {
          toast.error(error.response?.data?.message);
        }
      }
    };

    handelLogin();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white py-20">
      <div className="max-w-md w-full border border-slate-100 bg-white p-10 md:p-12 rounded-3xl shadow-2xl shadow-slate-200/50">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-alpha-blue italic uppercase tracking-tighter mb-2">
            Đăng Nhập
          </h2>
          <div className="h-1 w-12 bg-alpha-orange mx-auto"></div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="email@example.com"
                value={loginData.email}
                onChange={handleChange}
                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={loginData.password}
                onChange={handleChange}
                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:outline-none focus:border-alpha-blue transition-colors font-bold text-slate-700 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Utils Section */}
          <div className="flex justify-center items-center text-[10px] md:text-xs font-bold uppercase tracking-widest">
            <Link
              to={'/forget-password'}
              className="text-alpha-blue hover:text-alpha-orange transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-alpha-blue py-4 rounded-xl font-black text-white hover:bg-slate-900 transition-all transform active:scale-95 shadow-lg shadow-blue-100 uppercase tracking-widest"
          >
            ĐĂNG NHẬP
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

export default ClientLogin;
