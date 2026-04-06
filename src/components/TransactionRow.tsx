"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";

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
      await supabase.from("transactions").delete().eq("id", item.id);
      router.refresh();
    } catch {
      throw new Error("An error occurred while deleting!!");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div>
      {transactionType} transaction for Amount {item.amount / 100} done on Date
      - {new Date(item.created_at).toLocaleDateString()}
      <Button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting...." : "Delete"}
      </Button>
    </div>
  );
}
