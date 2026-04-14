"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";

export interface Transaction {
  id: number;
  amount: number;
  created_at: string;
  category_id: number;
  description: string; // Added description!
}

export interface Category {
  id: number;
  name: string;
  type: string;
}

interface TransactionRowProps {
  item: Transaction;
  categories: Category[]; // We will pass the global list down!
}

export default function TransactionRow({
  item,
  categories,
}: TransactionRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Dynamically find the category details from the global list
  const category = categories.find((c) => c.id === item.category_id);
  const transactionName = category ? category.name : "Unknown Category";
  const isIncome = category?.type === "income";

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      toast.success("Transaction deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Database error:", error);
      toast.error("Error deleting transaction");
    } finally {
      setIsDeleting(false);
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
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
