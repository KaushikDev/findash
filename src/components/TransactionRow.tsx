"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Transaction {
  id: number;
  amount: number;
  created_at: string;
  category_id: number;
}

interface TransactionRowProps {
  item: Transaction;
}

export default function TransactionRow({ item }: TransactionRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const transactionType = item.category_id === 2 ? "Credit" : "Debit";

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

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      toast.error("Error saving transaction", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex justify-between items-center w-full p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
      <div>
        <p className="font-medium">{transactionType} transaction</p>
        <p className="text-sm text-muted-foreground">
          Date: {new Date(item.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={`font-bold ${item.category_id === 2 ? "text-emerald-500" : "text-red-500"}`}
        >
          ${(item.amount / 100).toFixed(2)}
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
