"use client";

import { ConfirmActionButton } from "./ConfirmActionButton";
import { deleteBudget } from "@/app/db/actions";

export function DeleteBudgetAction({ budgetId }: { budgetId: string }) {
  const handleDelete = async () => {
    await deleteBudget(budgetId);
  };

  return (
    <ConfirmActionButton
      onConfirm={handleDelete}
      variant={"danger-button"}
      label="Delete"
      title="Delete this Budget?"
      description="This action is irreversible. All transactions will be lost."
    />
  );
}
