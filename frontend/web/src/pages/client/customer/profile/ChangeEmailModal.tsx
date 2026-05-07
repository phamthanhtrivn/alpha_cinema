import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { customerService } from '@/services/customer.service';
import { useQueryClient } from '@tanstack/react-query';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'email' | 'otp';

const OTP_LENGTH = 6;

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('email');
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleClose = () => {
    setStep('email');
    setNewEmail('');
    setEmailError('');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    onClose();
  };

  // Step 1: Request OTP
  const requestMutation = useMutation({
    mutationFn: (email: string) => customerService.requestUpdateEmail(email),
    onSuccess: () => {
      toast.success('Mã OTP đã được gửi vào email mới của bạn');
      setStep('otp');
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors?.newEmail) {
        setEmailError(responseData.errors.newEmail);
      } else {
        toast.error(responseData?.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    },
  });

  // Step 2: Verify OTP & update email
  const verifyMutation = useMutation({
    mutationFn: (otpCode: string) => customerService.verifyUpdateEmail({ newEmail, otp: otpCode }),
    onSuccess: (res) => {
      toast.success(res.message || 'Cập nhật email thành công!');
      // Cập nhật cache với email mới
      queryClient.setQueryData(['customer-profile'], (old: any) =>
        old ? { ...old, email: res.data } : old
      );
      handleClose();
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors?.otp) {
        setOtpError(responseData.errors.otp);
      } else {
        setOtpError(responseData?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn');
      }
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    requestMutation.mutate(newEmail);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const otpValue = otpDigits.join('');
    if (otpValue.length !== OTP_LENGTH) {
      setOtpError(`Mã OTP phải đủ ${OTP_LENGTH} chữ số`);
      return;
    }
    verifyMutation.mutate(otpValue);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError('');
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    text.split('').forEach((ch, i) => { next[i] = ch; });
    setOtpDigits(next);
    setOtpError('');
    // Focus the next empty box or the last one
    const nextEmpty = next.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  // ===== STEP 1: Email Form =====
  const emailHeader = (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
        <Mail size={28} className="text-alpha-blue" />
      </div>
      <h2 className="text-lg font-bold text-slate-800">Đổi địa chỉ Email</h2>
      <p className="text-sm text-slate-500 text-center">
        Nhập địa chỉ email mới. Chúng tôi sẽ gửi mã OTP để xác nhận.
      </p>
    </div>
  );

  // ===== STEP 2: OTP Form =====
  const otpHeader = (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
        <KeyRound size={28} className="text-alpha-orange" />
      </div>
      <h2 className="text-lg font-bold text-slate-800">Xác nhận OTP</h2>
      <p className="text-sm text-slate-500 text-center">
        Mã OTP đã được gửi đến <span className="font-semibold text-slate-700">{newEmail}</span>. Vui lòng kiểm tra hộp thư.
      </p>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'email' ? emailHeader : otpHeader}>

      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Email mới
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Nhập địa chỉ email mới"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setEmailError(''); }}
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${emailError ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-alpha-blue'}`}
              />
            </div>
            {emailError && <p className="text-red-500 text-[10px] mt-1 font-medium">{emailError}</p>}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={requestMutation.isPending}
              className="w-full bg-alpha-orange hover:bg-orange-600 text-white font-medium rounded-md shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {requestMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> ĐANG GỬI...</>
              ) : ('GỬI MÃ OTP')}
            </Button>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-3 text-center">
              Nhập mã OTP gồm {OTP_LENGTH} chữ số
            </label>
            {/* 6 OTP Input Boxes */}
            <div className="flex gap-2 justify-center">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={`w-11 h-12 text-center text-xl font-bold rounded-md border-2 focus:outline-none transition-colors caret-transparent
                    ${digit ? 'border-alpha-blue bg-blue-50 text-alpha-blue' : 'border-slate-200 bg-slate-50 text-slate-800'}
                    ${otpError ? 'border-red-400' : ''}
                    focus:border-alpha-blue focus:bg-blue-50`}
                />
              ))}
            </div>
            {otpError && <p className="text-red-500 text-[10px] mt-2 font-medium text-center">{otpError}</p>}
          </div>
          <div className="text-center text-xs text-slate-500">
            Bạn chưa nhận được mã OTP?{' '}
            <button
              type="button"
              onClick={() => requestMutation.mutate(newEmail)}
              disabled={requestMutation.isPending}
              className="font-semibold text-alpha-blue hover:underline disabled:opacity-50 cursor-pointer"
            >
              Gửi lại OTP
            </button>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled={verifyMutation.isPending || otpDigits.join('').length !== OTP_LENGTH}
              className="w-full bg-alpha-orange hover:bg-orange-600 text-white font-medium rounded-md shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {verifyMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> ĐANG XÁC NHẬN...</>
              ) : ('HOÀN TẤT')}
            </Button>

            <Button
              type="button"
              onClick={() => { setStep('email'); setOtpDigits(Array(OTP_LENGTH).fill('')); setOtpError(''); }}
              className="text-sm text-slate-600 hover:text-alpha-blue"
            >
              <ArrowLeft size={13} /> Quay lại đổi email khác
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ChangeEmailModal;
