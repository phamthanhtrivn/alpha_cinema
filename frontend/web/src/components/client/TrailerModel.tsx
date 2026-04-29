import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    trailerUrl: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl }) => {
    // Hàm tách ID từ link Youtube
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
    };

    // Khóa cuộn trang khi đang mở Modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Lớp nền mờ (Backdrop) */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Nội dung Modal */}
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl z-10 animate-in zoom-in duration-300">

                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 md:-right-12 text-white hover:text-orange-500 transition-colors p-2"
                >
                    <X size={32} />
                </button>

                {/* Iframe Youtube */}
                <iframe
                    src={getEmbedUrl(trailerUrl)}
                    title="YouTube video player"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default TrailerModal;