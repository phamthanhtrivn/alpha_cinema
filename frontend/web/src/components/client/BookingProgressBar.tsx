import React from 'react';

interface BookingProgressBarProps {
    currentStep: number; // 0-indexed: 0: Ghế, 1: Sản phẩm / giảm giá, 2: Xác nhận, 3: Thanh toán
}

const STEPS = [
    'Chọn ghế',
    'Chọn sản phẩm / giảm giá',
    'Xác nhận',
    'Thanh toán',
];

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep }) => {
    return (
        <div className="bg-slate-50 border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-center py-6 min-w-150">
                    <ul className="flex items-center gap-12 text-[13px] font-bold uppercase tracking-wider">
                        {STEPS.map((step, index) => {
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <li
                                    key={index}
                                    className={`relative transition-all duration-300 ${isActive
                                        ? "text-alpha-blue after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-alpha-blue"
                                        : isCompleted
                                            ? "text-slate-600 cursor-pointer hover:text-alpha-blue"
                                            : "text-slate-400 cursor-not-allowed opacity-40"
                                        }`}
                                >
                                    {step}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};
