/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/components/employee/FilterSelect";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Loader2 } from "lucide-react";
import { formatDateTimeLocal } from "@/utils/formatTime";

const MultiSelectField = ({ options, values, onChange, placeholder }: any) => {
  const unselectedOptions = options.filter((opt: any) => !values.includes(opt.value));

  return (
    <div className={`relative min-h-12 w-full pl-3 py-2.5 rounded-2xl border border-slate-100 bg-white/50 flex flex-wrap items-center gap-2 focus-within:ring-4 focus-within:ring-sky-500/10 focus-within:border-sky-500 transition-all font-medium shadow-sm ${values.length === 0 ? 'pr-3' : 'pr-10'}`}>
      {/* Selected Tags */}
      {values.map((val: any) => {
        const opt = options.find((o: any) => o.value === val);
        return (
          <span
            key={val}
            className="px-2.5 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-700 flex items-center gap-1 shadow-sm"
          >
            {opt?.label || val}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange(values.filter((v: any) => v !== val));
              }}
              className="text-sky-500 hover:text-red-500 ml-1 font-bold cursor-pointer"
            >
              ×
            </button>
          </span>
        );
      })}

      {/* Select Dropdown */}
      {unselectedOptions.length > 0 && (
        <select
          className={`bg-transparent text-slate-700 outline-none cursor-pointer text-sm ${values.length === 0 ? 'w-full px-0' : 'absolute right-2 top-[14px] w-6'}`}
          onChange={(e) => {
            if (!e.target.value) return;
            if (!values.includes(e.target.value)) {
              onChange([...values, e.target.value]);
            }
            e.target.value = ""; // reset after selection
          }}
          defaultValue=""
        >
          <option value="" disabled className="text-slate-400">
            {values.length === 0 ? (placeholder || "Chọn mục...") : ""}
          </option>
          {unselectedOptions.map((opt: any) => (
            <option
              key={opt.value}
              value={opt.value}
              className="text-slate-700"
            >
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

const AutocompleteField = ({ value, onChange, placeholder, fetchOptions, initialLabel }: any) => {
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<any[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState(initialLabel || "");

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query) {
        const res = await fetchOptions(query);
        setOptions(res || []);
      } else {
        setOptions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchOptions]);

  // Sync selectedLabel when initialLabel changes (edit mode)
  React.useEffect(() => {
    if (initialLabel) {
      setSelectedLabel(initialLabel);
    }
  }, [initialLabel]);

  // if value is reset
  React.useEffect(() => {
    if (!value) {
      setSelectedLabel("");
      setQuery("");
    }
  }, [value]);

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={isOpen ? query : selectedLabel || query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          if (!e.target.value) {
            onChange("");
            setSelectedLabel("");
          }
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
      />
      {isOpen && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-lg z-50 p-1 max-h-48 overflow-y-auto">
          {options.map((opt: any) => (
            <div
              key={opt.value}
              className="px-3 py-2 hover:bg-sky-50 cursor-pointer text-xs font-bold text-slate-600 rounded-lg transition-colors"
              onClick={() => {
                onChange(opt.value);
                setSelectedLabel(opt.label);
                setQuery("");
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "autocomplete"
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
  fetchOptions?: (query: string) => Promise<{ label: string; value: any }[]>;
  initialLabel?: string;
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
            value={values[field.name] ? formatDateTimeLocal(values[field.name]) : ""}
            disabled={field.disabled}
            onChange={(e) => onChange(field.name, e.target.value)}
            className="h-12 rounded-2xl border-slate-100 bg-white/50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-medium text-slate-700 shadow-sm"
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

      // MULTI-SELECT
      case "multi-select": {
        const normalizedOptions = (field.options || []).map((opt: any) =>
          typeof opt === "string" ? { label: opt, value: opt } : opt,
        );
        const currentValues: any[] = Array.isArray(values[field.name]) ? values[field.name] : [];

        return (
          <MultiSelectField
            options={normalizedOptions}
            values={currentValues}
            onChange={(newValues: any) => onChange(field.name, newValues)}
            placeholder={field.placeholder}
          />
        );
      }

      // AUTOCOMPLETE
      case "autocomplete":
        return (
          <AutocompleteField
            value={values[field.name]}
            onChange={(val: any) => onChange(field.name, val)}
            placeholder={field.placeholder}
            fetchOptions={field.fetchOptions}
            initialLabel={field.initialLabel}
          />
        );

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
              <div
                className="mt-2 relative w-fit"
                key={values[field.name]?.toString()}
              >
                <img
                  src={
                    values[field.name] instanceof File
                      ? URL.createObjectURL(values[field.name])
                      : values[field.name]
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
              className={`space-y-2 ${field.type === "textarea" ? "md:col-span-2" : ""
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