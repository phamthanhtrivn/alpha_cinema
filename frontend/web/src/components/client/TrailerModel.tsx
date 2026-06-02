import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2, PlayCircle } from 'lucide-react';

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    trailerUrl: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const videoId = useMemo(() => {
        if (!trailerUrl) return null;

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = trailerUrl.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }, [trailerUrl]);

    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
    const previewUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsLoading(false);
            setIsPlaying(false);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handlePlay = () => {
        setIsLoading(true);
        setIsPlaying(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-8">
            <div
                className="absolute inset-0 bg-black/75 transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-7xl aspect-video rounded-md bg-black overflow-hidden shadow-2xl z-10 animate-in zoom-in duration-300">

                {embedUrl ? (
                    <>
                        {!isPlaying && (
                            <button
                                type="button"
                                onClick={handlePlay}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden text-white group"
                            >
                                <img
                                    src={previewUrl}
                                    alt="Trailer preview"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(event) => {
                                        event.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/35" />
                                <div className="absolute flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/50 transition-transform group-hover:scale-110">
                                    <PlayCircle size={52} className="text-white" fill="rgba(255,255,255,0.18)" />
                                </div>
                            </button>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white gap-3 bg-black">
                                <Loader2 size={40} className="animate-spin text-alpha-orange" />
                                <span className="text-sm font-medium animate-pulse">Đang tải trailer...</span>
                            </div>
                        )}

                        {isPlaying && (
                            <iframe
                                src={embedUrl}
                                title="YouTube video player"
                                className={`h-full w-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                onLoad={() => setIsLoading(false)}
                            />
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
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
