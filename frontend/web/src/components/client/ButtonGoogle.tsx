import { userService } from "@/services/user.service";
import { setCredentials } from "@/store/slices/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ButtonGoogle = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);

      setIsGoogleLoading(true);
      try {
        const data = await userService.google_login(tokenResponse.access_token);

        if (data.success) {
          toast.success("Đăng nhập bằng Google thành công!");
          dispatch(
            setCredentials({
              user: data.data.user,
              accessToken: data.data.accessToken,
              role: data.data.user.role,
            }),
          );
          navigate("/");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: any) {
        toast.error("Đăng ký bằng Google thất bại!");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => toast.error("Kết nối với Google thất bại"),
  });
  return (
    <button
      type="button"
      disabled={isGoogleLoading}
      onClick={() => handleGoogleAuth()}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all transform active:scale-95 shadow-sm"
    >
      {isGoogleLoading ? (
        <Loader2 className="animate-spin" size={20} />
      ) : (
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          className="w-5 h-5"
          alt="gg"
        />
      )}
      <span>{isGoogleLoading ? "ĐANG XỬ LÝ..." : "TIẾP TỤC VỚI GOOGLE"}</span>
    </button>
  );
};

export default ButtonGoogle;
