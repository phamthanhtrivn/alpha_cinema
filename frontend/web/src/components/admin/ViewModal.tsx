/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ViewField = {
  label: string;
  key: string;
  render?: (value: any, data: any) => React.ReactNode;
};

type ViewModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  data: any;
  fields: ViewField[];
};

const ViewModal: React.FC<ViewModalProps> = ({
  open,
  onClose,
  title = "Chi tiết",
  data,
  fields,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-225! w-full h-[80%] rounded-2xl p-6 bg-white/95 backdrop-blur-xs overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {fields.map((field) => {
            const value = data?.[field.key];

            return (
              <div key={field.key} className="flex flex-col gap-1">
                <span className="text-sm text-gray-500">
                  {field.label}
                </span>

                <div className="text-sm font-medium bg-gray-100 px-3 py-2 rounded-md">
                  {field.render
                    ? field.render(value, data)
                    : value ?? "-"}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewModal;