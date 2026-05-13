import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { Button } from '@/components/ui/button';
import { customerService } from '@/services/customer.service';
import { PasswordFormField } from './ProfileUIComponents';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleClose = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setShowPasswords({ current: false, new: false, confirm: false });
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (data: any) => customerService.changePassword(data),
    onSuccess: (res) => {
      toast.success(res || 'Đổi mật khẩu thành công');
      handleClose();
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        setPasswordErrors(responseData.errors);
      } else {
        toast.error(responseData?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Xác nhận mật khẩu mới không khớp' });
      return;
    }

    mutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      passwordConfirm: passwordForm.confirmPassword,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Chỉnh Sửa Mật Khẩu">
      <form onSubmit={handleSubmit} className="space-y-3">
        <PasswordFormField
          label="Mật khẩu hiện tại"
          placeholder="Nhập mật khẩu hiện tại"
          value={passwordForm.currentPassword}
          onChange={(val) => setPasswordForm({ ...passwordForm, currentPassword: val })}
          show={showPasswords.current}
          onToggle={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
          error={passwordErrors.currentPassword}
        />

        <PasswordFormField
          label="Mật khẩu mới"
          placeholder="Nhập mật khẩu mới"
          value={passwordForm.newPassword}
          onChange={(val) => setPasswordForm({ ...passwordForm, newPassword: val })}
          show={showPasswords.new}
          onToggle={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
          error={passwordErrors.newPassword}
        />

        <PasswordFormField
          label="Xác nhận mật khẩu mới"
          placeholder="Xác nhận mật khẩu mới"
          value={passwordForm.confirmPassword}
          onChange={(val) => setPasswordForm({ ...passwordForm, confirmPassword: val })}
          show={showPasswords.confirm}
          onToggle={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
          error={passwordErrors.passwordConfirm || passwordErrors.confirmPassword}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-alpha-orange hover:bg-orange-600 text-white font-medium py-3 rounded-md shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                ĐANG XỬ LÝ...
              </>
            ) : (
              'CẬP NHẬT MẬT KHẨU MỚI'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
