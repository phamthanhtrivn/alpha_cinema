/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/admin/FilterSelect";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Loader2 } from "lucide-react";
import { formatDateTimeLocal } from "@/utils/formatTime";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "textarea"
  | "file"
  | "date"
  | "datetime-local";

export type Mode = "add" | "update";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[] | { label: string; value: any }[];
  preview?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

interface Props {
  mode?: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fields: FieldConfig[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  errors?: Record<string, string>;
  loading?: boolean;
}

const BaseFormModal: React.FC<Props> = ({
  mode = "add",
  open,
  onOpenChange,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  errors = {},
  loading,
}) => {
  const renderField = (field: FieldConfig) => {
    if (field.hidden) return null;

    switch (field.type) {
      // TEXT / NUMBER / DATE
      case "text":
      case "number":
      case "date":
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            onChange={(e) => {
              let value: any = e.target.value;
              if (field.type === "number") {
                value = value ? Number(value) : "";
              }
              onChange(field.name, value);
            }}
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
          />
        );

      case "datetime-local":
        return (
          <Input
            type="datetime-local"
            value={formatDateTimeLocal(values[field.name])}
            disabled
            className="h-12 rounded-2xl border-slate-100 bg-white/50"
          />
        );

      // SELECT
      case "select": {
        const normalizedOptions = (field.options || []).map((opt: any) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt,
        );

        return (
          <FilterSelect
            placeholder={field.placeholder}
            options={normalizedOptions}
            value={values[field.name]}
            onChange={(val) => {
              let parsed: any = val;
              if (val === "true") parsed = true;
              if (val === "false") parsed = false;
              onChange(field.name, parsed);
            }}
          />
        );
      }

      // TEXTAREA
      case "textarea":
        return (
          <textarea
            placeholder={field.placeholder}
            value={values[field.name] ?? ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="w-full min-h-25 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        );

      // FILE
      case "file":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                onChange(field.name, file);
              }}
              className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
            />

            {field.preview && values[field.name] && (
              <div className="mt-2 relative w-fit">
                <img
                  src={
                    typeof values[field.name] === "string"
                      ? values[field.name]
                      : URL.createObjectURL(values[field.name])
                  }
                  className="w-32 h-32 object-cover rounded-xl border"
                />

                <button
                  type="button"
                  onClick={() => onChange(field.name, null)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md"
                >
                  X
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-225! w-full h-[80%] rounded-2xl p-6 bg-white/95 backdrop-blur-xs overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`space-y-2 ${
                field.type === "textarea" ? "md:col-span-2" : ""
              }`}
            >
              <label className="text-xs font-semibold text-slate-500">
                {field.label}
              </label>

              {renderField(field)}

              {errors?.[field.name] && (
                <p className="text-xs text-red-500 font-medium">
                  {errors[field.name]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ACTION */}
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
            disabled={loading}
          >
            Huỷ
          </Button>

          <Button
              className="bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  <span>Đang xử lý...</span>
                </div>
              ) : mode === "add" ? (
                "Thêm mới"
              ) : (
                "Cập nhật"
              )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BaseFormModal;
