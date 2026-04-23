"use client";

import { Trash2 } from "lucide-react";
import { ConfirmActionButton } from "./ConfirmActionButton";
import { deleteBudget } from "@/app/db/actions";

export function DeleteBudgetAction({ budgetId }: { budgetId: string }) {
  const handleDelete = async () => {
    await deleteBudget(budgetId);
  };

  return (
    <ConfirmActionButton
      onConfirm={handleDelete}
      triggerElement={
        <button className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      }
      title="Delete this Budget?"
      description="This action is irreversible. All transactions will be lost."
    />
  );
}
