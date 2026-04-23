"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

type ConfirmActionProps = {
  onConfirm: () => void | Promise<void>;
  variant?: "trash-icon" | "danger-button" | "outline-button";
  label?: string;
  title: string;
  description?: string;
};

export const ConfirmActionButton = ({
  onConfirm,
  variant = "danger-button",
  label = "Delete",
  title,
  description,
}: ConfirmActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();

    setIsPending(true);

    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const renderTrigger = () => {
    switch (variant) {
      case "trash-icon":
        return (
          <button className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        );
      case "outline-button":
        return <Button variant="outline">{label}</Button>;
      case "danger-button":
      default:
        return <Button variant="destructive">{label}</Button>;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{renderTrigger()}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* Disable the Cancel button so they can't interrupt the network request */}
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          {/* 4. Wire up the Loading State to the Action Button */}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wait...
              </>
            ) : (
              "Continue"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
