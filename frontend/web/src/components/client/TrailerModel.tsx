import React, { useEffect, useState } from 'react';
import { X, Loader2, PlayCircle } from 'lucide-react';

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    trailerUrl: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Hàm tách ID từ link Youtube
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
    };

    const embedUrl = getEmbedUrl(trailerUrl);

    // Khóa cuộn trang khi đang mở Modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsLoading(true); // Reset loading state when opening
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
                className="absolute inset-0 bg-black/75 transition-opacity"
                onClick={onClose}
            />

            {/* Nội dung Modal */}
            <div className="relative w-full max-w-7xl aspect-video rounded-md bg-black overflow-hidden shadow-2xl z-10 animate-in zoom-in duration-300">

                {embedUrl ? (
                    <>
                        {/* Loading State */}
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                                <Loader2 size={40} className="animate-spin text-alpha-orange" />
                                <span className="text-sm font-medium animate-pulse">Đang tải trailer...</span>
                            </div>
                        )}

                        {/* Iframe Youtube */}
                        <iframe
                            src={embedUrl}
                            title="YouTube video player"
                            className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            onLoad={() => setIsLoading(false)}
                        ></iframe>
                    </>
                ) : (
                    /* Error / Unavailable State */
                    <div className="absolute inset-0 flex flex-col items-center justify-center  px-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                            <PlayCircle size={48} className="text-alpha-orange opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Trailer chưa sẵn sàng</h3>
                        <p className="text-slate-400 max-w-md leading-relaxed">
                            <span className="text-alpha-orange font-semibold">AlphaCinema</span> sẽ cập nhật sớm nhất có thể.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrailerModal;
