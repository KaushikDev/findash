"use client";

import { toast } from "sonner";
import { format } from "date-fns";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { deleteTransaction } from "@/app/db/actions"; // Adjust this path if needed to point to your actions.ts

export interface Transaction {
  id: number;
  amount: number;
  created_at: string;
  category_id: number;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  type: string;
}

interface TransactionRowProps {
  item: Transaction;
  categories: Category[];
}

export default function TransactionRow({
  item,
  categories,
}: TransactionRowProps) {
  const category = categories.find((c) => c.id === item.category_id);
  const transactionName = category ? category.name : "Unknown Category";
  const isIncome = category?.type === "income";

  const handleDelete = async () => {
    try {
      await deleteTransaction(item.id);
      toast.success("Transaction deleted successfully");
    } catch (error) {
      console.error("Database error:", error);
      toast.error("Error deleting transaction");
    }
  };

  return (
    <div className="flex justify-between items-center w-full p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
      <div>
        <p className="font-semibold text-foreground capitalize">
          {item.description || "No description"}
        </p>
        <div className="flex gap-2 items-center mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
            {transactionName}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(item.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`font-bold ${isIncome ? "text-emerald-500" : "text-red-500"}`}
        >
          {isIncome ? "+" : "-"}${(item.amount / 100).toFixed(2)}
        </span>

        {/* Look how clean this is now! */}
        <ConfirmActionButton
          variant="danger-button"
          label="Delete"
          onConfirm={handleDelete}
          title="Delete this transaction?"
          description="This action is irreversible and cannot be undone!! Please confirm."
        />
      </div>
    </div>
  );
}
