import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../../../services/customer.service';
import type { CustomerProfile, Gender } from '../../../types/customer';
import { Loader2, User, Star, Wallet, Phone, Mail, Calendar, Lock, Eye, EyeOff } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { Container, Section } from '@/components/common/Layout';
import { Button } from '@/components/ui/button';

type Tab = 'profile' | 'history' | 'notifications' | 'gifts' | 'policy';

const TABS: { key: Tab; label: string }[] = [
  { key: 'history', label: 'Lịch Sử Giao Dịch' },
  { key: 'profile', label: 'Thông Tin Cá Nhân' },
  { key: 'notifications', label: 'Thông Báo' },
  { key: 'gifts', label: 'Quà Tặng' },
  { key: 'policy', label: 'Chính Sách' },
];

// --- INTERNAL SUB-COMPONENTS ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-sm shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const FormField: React.FC<{
  label: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, icon, error, className = '', children }) => (
  <div className={className}>
    <label className="block text-sm font-medium mb-2 text-slate-700">{label}</label>
    <div className="relative">
      {React.isValidElement(icon) && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
          {React.cloneElement(icon as React.ReactElement<any>, { size: 15 })}
        </div>
      )}
      {children}
    </div>
    {error && <p className="text-red-500 text-[11px] mt-1.5 font-medium ml-1">{error}</p>}
  </div>
);

const SidebarAction: React.FC<{
  label: string;
  subLabel?: string;
  href?: string;
  to?: string;
  onClick?: () => void;
}> = ({ label, subLabel, href, to, onClick }) => {
  const content = (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="flex-1">
        <p className={`text-xs text-slate-500 ${subLabel ? 'mb-0.5' : ''}`}>{label}</p>
        {subLabel && <p className="text-sm font-bold text-alpha-blue">{subLabel}</p>}
      </div>
      <span className="text-slate-300 group-hover:text-alpha-blue transition-colors text-xl font-light">›</span>
    </div>
  );

  if (href) return <a href={href} className="block">{content}</a>;
  if (to) return <Link to={to} className="block">{content}</Link>;
  return <div onClick={onClick} className="block">{content}</div>;
};

const PasswordFormField: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
}> = ({ label, placeholder, value, onChange, show, onToggle, error }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-2">{label}</label>
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-2.5 py-2 rounded-sm text-sm border focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all pr-10 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-alpha-blue'}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
    {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error}</p>}
  </div>
);

// --- MAIN COMPONENT ---
const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = React.useState<Record<string, string>>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profile, isLoading } = useQuery<CustomerProfile>({
    queryKey: ['customer-profile'],
    queryFn: () => customerService.getProfile().then((res) => res.data),
  });

  // Form state for editable profile
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    gender: 'MALE' as Gender,
    dateOfBirth: '',
    password: '',
  });

  // Sync form when profile loads
  React.useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName,
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
          : '',
        password: '',
      });
    }
  }, [profile]);

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: any) => customerService.updateProfile(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'Cập nhật thông tin thành công');
        setFieldErrors({});
        queryClient.setQueryData(['customer-profile'], res.data);
      } else {
        toast.error(res.message || 'Cập nhật thất bại');
      }
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        setFieldErrors(responseData.errors);
        toast.error('Vui lòng kiểm tra lại thông tin nhập vào');
      } else {
        const errorMsg = responseData?.message || 'Có lỗi xảy ra khi cập nhật';
        toast.error(errorMsg);
      }
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Map data to DTO
    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
    };

    updateMutation.mutate(payload);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => customerService.changePassword(data),
    onSuccess: (res) => {
      toast.success(res || 'Đổi mật khẩu thành công');
      closePasswordModal();
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

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Xác nhận mật khẩu mới không khớp' });
      return;
    }

    const payload = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      passwordConfirm: passwordForm.confirmPassword,
    };

    changePasswordMutation.mutate(payload);
  };

  const tierProgress = () => {
    const spending = profile?.totalSpending ?? 0;
    const maxTier = 4_000_000;
    return Math.min((spending / maxTier) * 100, 100);
  };

  const tierLabel = (type: string) => {
    switch (type) {
      case 'MEMBER': return 'Member';
      case 'SILVER': return 'Silver';
      case 'GOLD': return 'Gold';
      default: return type;
    }
  };

  return (
    <Section className="bg-slate-50 min-h-screen">
      <Container className="flex flex-col md:flex-row gap-6">
        {/* ===== LEFT SIDEBAR ===== */}
        <aside className="sm:w-full md:w-72 lg:w-96 flex flex-col gap-4">

          {/* User Card */}
          <Card className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-alpha-blue" size={32} /></div>
            ) : (
              <>
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 shrink-0">
                    <User size={32} className="text-slate-400" />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className="font-bold text-slate-800 text-lg leading-tight">{profile?.fullName || '—'}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="text-alpha-orange fill-alpha-orange" />
                      <span className="text-sm font-medium">
                        {tierLabel(profile?.customerType ?? 'MEMBER')} · {profile?.points ?? 0} điểm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Spending Progress */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base text-slate-700 font-medium mb-4">Tổng chi tiêu 2026</span>
                    <span className="text-base font-bold text-alpha-orange">
                      {formatCurrency(profile?.totalSpending ?? 0)}
                    </span>
                  </div>

                  {/* Tier bar */}
                  <div className="relative h-1.5 rounded-full bg-slate-100 mt-12 mb-4">
                    {/* Progress Fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-alpha-blue transition-all duration-700"
                      style={{ width: `${tierProgress()}%` }}
                    />

                    {/* Milestones */}
                    {[
                      { pos: '0%', label: 'Member' },
                      { pos: '50%', label: 'Silver' },
                      { pos: '100%', label: 'Gold' }
                    ].map((m, idx) => (
                      <div
                        key={idx}
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ left: m.pos }}
                      >
                        {/* Tag Label */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <div className={`text-[10px] font-bold px-2.5 py-1 rounded-md border shadow-sm relative transition-colors ${tierProgress() >= parseFloat(m.pos)
                            ? 'bg-alpha-blue text-white border-alpha-blue'
                            : 'bg-white text-slate-500 border-slate-200'
                            }`}>
                            {m.label}
                            {/* Arrow down */}
                            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-r border-b rotate-45 ${tierProgress() >= parseFloat(m.pos)
                              ? 'bg-alpha-blue border-alpha-blue'
                              : 'bg-white border-slate-200'
                              }`} />
                          </div>
                        </div>

                        {/* Dot */}
                        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${tierProgress() >= parseFloat(m.pos)
                          ? 'bg-white border-alpha-blue scale-110'
                          : 'bg-white border-slate-300'
                          } -translate-x-1/2`} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>0 đ</span>
                    <span>2.000.000 đ</span>
                    <span>4.000.000 đ</span>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Support Card */}
          <Card className="divide-y divide-slate-50 overflow-hidden">
            <SidebarAction label="HOTLINE hỗ trợ" subLabel="19002224 (9:00 – 22:00)" href="tel:19002224" />
            <SidebarAction label="Email" subLabel="hotro@alphastudio.vn" href="mailto:hotro@alphastudio.vn" />
            <SidebarAction label="Câu hỏi thường gặp" to="#" />
          </Card>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-slate-100 flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${activeTab === tab.key
                  ? 'border-alpha-blue text-alpha-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'profile' && (
              <>
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-alpha-blue" size={36} />
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <FormField label="Họ và tên" icon={<User />} error={fieldErrors.fullName}>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${fieldErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-alpha-blue'}`}
                        />
                      </FormField>

                      <FormField label="Ngày sinh" icon={<Calendar />} error={fieldErrors.dateOfBirth}>
                        <input
                          type="date"
                          value={form.dateOfBirth}
                          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${fieldErrors.dateOfBirth ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-alpha-blue'}`}
                        />
                      </FormField>

                      <FormField label="Email">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email"
                          value={profile?.email ?? ''}
                          readOnly
                          className="w-full pl-9 pr-16 py-2.5 text-sm border border-slate-200 rounded-md bg-slate-100 text-slate-400 cursor-not-allowed"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-alpha-orange font-semibold">
                          Thay đổi
                        </span>
                      </FormField>

                      <FormField label="Số điện thoại" icon={<Phone />} error={fieldErrors.phone}>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 transition-all ${fieldErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-alpha-blue'}`}
                        />
                      </FormField>

                      <FormField label="Giới tính" error={fieldErrors.gender}>
                        <div className="flex gap-6 pt-1">
                          {[
                            { value: 'MALE', label: 'Nam' },
                            { value: 'FEMALE', label: 'Nữ' },
                            { value: 'OTHER', label: 'Khác' },
                          ].map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="gender"
                                value={opt.value}
                                checked={form.gender === opt.value}
                                onChange={() => setForm({ ...form, gender: opt.value as Gender })}
                                className="accent-alpha-blue w-4 h-4"
                              />
                              <span className="text-sm text-slate-700">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </FormField>

                      <FormField label="Mật khẩu" icon={<Lock />}>
                        <input
                          readOnly
                          type="password"
                          placeholder="••••••••••"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full pl-9 pr-16 py-2.5 text-sm border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-2 focus:ring-alpha-blue/20 focus:border-alpha-blue transition-all"
                        />
                        <span
                          onClick={() => setIsPasswordModalOpen(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-alpha-orange font-semibold cursor-pointer hover:underline"
                        >
                          Thay đổi
                        </span>
                      </FormField>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-alpha-orange hover:bg-orange-600 text-white font-medium px-8 py-2.5 rounded-md transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-100 flex items-center gap-2"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          'Cập nhật'
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Wallet size={48} className="mb-4 opacity-30" />
                <p className="font-semibold text-lg">Chưa có giao dịch nào</p>
                <p className="text-sm mt-1">Lịch sử mua vé của bạn sẽ hiển thị tại đây.</p>
              </div>
            )}

            {(activeTab === 'notifications' || activeTab === 'gifts' || activeTab === 'policy') && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <p className="font-semibold text-lg">Đang cập nhật</p>
                <p className="text-sm mt-1">Tính năng này sẽ sớm được ra mắt.</p>
              </div>
            )}
          </div>
        </main>
      </Container>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        title="Chỉnh Sửa Mật Khẩu"
      >
        <form onSubmit={handlePasswordUpdate} className="space-y-3">
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
              disabled={changePasswordMutation.isPending}
              className="w-full bg-alpha-orange hover:bg-orange-600 text-white font-bold py-3 rounded-md shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {changePasswordMutation.isPending ? (
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
    </Section>
  );
};

export default ProfilePage;