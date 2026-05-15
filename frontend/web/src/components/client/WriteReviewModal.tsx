import React, { useState } from 'react';
import Modal from '@/components/common/Modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import { toast } from 'react-toastify';
import { Star, ImagePlus, X, Loader2, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
  movieName: string;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ isOpen, onClose, movieId, movieName }) => {
  const [rating, setRating] = useState<number>(10);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 2) {
        toast.warning('Chỉ được phép đính kèm tối đa 2 hình ảnh.');
        return;
      }
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 2));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: () => reviewService.createReview({ movieId, rating, comment }, files),
    onSuccess: (res) => {
      toast.success(res.message || 'Đánh giá của bạn đã được gửi thành công');
      queryClient.invalidateQueries({ queryKey: ['movie-reviews', movieId] });
      queryClient.invalidateQueries({ queryKey: ['check-review', movieId] });
      setComment('');
      setFiles([]);
      setRating(10);
      onClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      title={
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center">
            <MessageSquareText size={28} className="text-alpha-orange" />
          </div>
          <h2 className="text-lg font-medium text-slate-800">Đánh giá phim</h2>
          <p className="text-2xl text-slate-500 font-normal">
            <span className="font-semibold text-alpha-orange">{movieName}</span>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Rating */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={`${star <= rating ? 'text-alpha-orange fill-alpha-orange' : 'text-slate-200 fill-slate-200'}`}
                />
              </button>
            ))}
          </div>
          <span className="text-xl font-bold text-alpha-orange">{rating}/10</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Nội dung đánh giá</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim này..."
            className="w-full min-h-[120px] p-3 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-alpha-orange/20 focus:border-alpha-orange resize-none text-sm"
            maxLength={1000}
          />
          <div className="text-right text-xs text-slate-400">{comment.length}/1000</div>
        </div>

        {/* Pictures */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-slate-700">Đính kèm hình ảnh (Tối đa 2)</label>

          <div className="flex gap-3">
            {files.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border border-slate-200 group">
                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => removeFile(idx)}
                >
                  <X className="text-white" size={20} />
                </div>
              </div>
            ))}

            {files.length < 2 && (
              <label className="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-alpha-orange hover:bg-orange-50 transition-colors text-slate-400 hover:text-alpha-orange">
                <ImagePlus size={24} />
                <span className="text-[10px] mt-1 font-medium">Thêm ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-alpha-orange hover:bg-orange-600 text-white font-medium py-2.5 rounded-md mt-2 transition-all"
        >
          {mutation.isPending ? (
            <><Loader2 size={18} className="animate-spin mr-2" /> Đang gửi đánh giá...</>
          ) : (
            'Gửi đánh giá'
          )}
        </Button>
      </form>
    </Modal>
  );
};

export default WriteReviewModal;
