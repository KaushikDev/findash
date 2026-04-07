"use client";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import TransactionForm, { Category } from "./TransactionForm";

interface AddTransactionModalProps {
  categories: Category[];
}

export default function AddTransactionModal({
  categories,
}: AddTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);


  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add a Transaction</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm
          categories={categories || []}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
