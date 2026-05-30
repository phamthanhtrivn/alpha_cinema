import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, AlertCircle, X, Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  templateUrl: string;
  templateName: string;
  onImport: (file: File) => Promise<any>;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title,
  templateUrl,
  templateName,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setErrorMsg(null);
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx") {
      setErrorMsg("Chỉ hỗ trợ tệp định dạng Excel (.xlsx)");
      return;
    }
    // Limit to 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg("Kích thước tệp tối đa là 5MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await onImport(file);
      if (res.success || res.code === 200 || !res.message?.toLowerCase().includes("lỗi")) {
        toast.success(res.message || "Nhập dữ liệu thành công!");
        onSuccess();
        handleClose();
      } else {
        setErrorMsg(res.message || "Có lỗi xảy ra khi nhập dữ liệu.");
      }
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      setErrorMsg(serverMsg || err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setErrorMsg(null);
    setDragActive(false);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl w-full rounded-2xl p-6 bg-white/95 backdrop-blur-xs overflow-auto border-none shadow-2xl text-slate-800">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-500" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Download Template Panel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Tệp Excel mẫu chuẩn</p>
              <p className="text-xs text-slate-400 mt-0.5">Vui lòng tải tệp mẫu chuẩn để điền dữ liệu đúng định dạng.</p>
            </div>
            <a
              href={templateUrl}
              download={templateName}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-200 text-sky-600 text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Tải mẫu
            </a>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-red-600 text-sm font-medium leading-relaxed">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-line">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={!file ? onButtonClick : undefined}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 relative ${
              file
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 bg-slate-50/50"
            } ${dragActive ? "border-sky-400 bg-sky-50" : ""} cursor-pointer`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={loading}
            />

            {!file ? (
              <>
                <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-sky-500 transition-colors duration-300 mb-3" />
                <p className="text-sm font-bold text-slate-600">Kéo thả tệp Excel của bạn vào đây</p>
                <p className="text-xs text-slate-400 mt-1">Hoặc click để chọn tệp từ máy tính</p>
                <p className="text-[10px] text-slate-400 mt-2">Hỗ trợ tệp định dạng .xlsx tối đa 5MB</p>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <FileSpreadsheet className="w-12 h-12 text-emerald-500 mb-3 animate-pulse" />
                <p className="text-sm font-bold text-emerald-700 text-center break-all px-4">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>

                {!loading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setErrorMsg(null);
                    }}
                    className="mt-3 text-xs font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors duration-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Chọn file khác
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 border-t border-slate-100 pt-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="cursor-pointer font-semibold rounded-xl text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-50 transition-all px-5"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`font-semibold px-6 rounded-xl transition-all duration-200 shadow-md ${
              file
                ? "bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              "Nhập dữ liệu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelModal;
