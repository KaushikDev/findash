"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createTransaction } from "@/app/db/actions";
import { useState } from "react";

// 1. Updated Interface to match your new flattened Enterprise data
export interface Category {
  id: number;
  name: string;
  group: string;
  type: string;
}

// 2. Added budgetId to the props so TypeScript stops yelling
interface TransactionFormProps {
  categories: Category[];
  budgetId: string;
  onSuccess?: () => void;
}

export default function TransactionForm({
  categories,
  budgetId,
  onSuccess,
}: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState("expense");

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);

    try {
      // 3. Fire the secure Server Action
      await createTransaction(formData);

      form.reset();
      if (onSuccess) onSuccess();
      toast.success("Transaction saved successfully");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Something went wrong while saving transaction.";
      toast.error("Error saving transaction", {
        description: errorMsg,
      });
    }
  };

  const filteredCategories = categories.filter(
    (item) => item.type === transactionType,
  );

  const groupedCategories = filteredCategories.reduce(
    (acc, category) => {
      if (!acc[category.group]) {
        acc[category.group] = [];
      }

      acc[category.group].push(category);
      return acc;
    },
    {} as Record<string, Category[]>,
  );

  return (
    <div className="p-4 border rounded-xl bg-card text-card-foreground shadow">
      <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input type="hidden" name="budgetId" value={budgetId} />
          <div className="flex gap-2 w-full mb-4">
            <Button
              variant={transactionType === "expense" ? "default" : "outline"}
              type="button"
              onClick={() => setTransactionType("expense")}
            >
              Expense
            </Button>
            <Button
              variant={transactionType === "income" ? "default" : "outline"}
              type="button"
              onClick={() => setTransactionType("income")}
            >
              Income
            </Button>
          </div>

          <Input
            type="number"
            name="amount"
            placeholder="Amount in cents"
            required
          />
          <Input
            type="text"
            name="purpose"
            placeholder="Description (optional)"
          />
          <Select name="categoryId" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent position="popper" className="max-h-[350px]">
              {Object.entries(groupedCategories).map(
                ([groupName, groupItems]) => (
                  <SelectGroup key={groupName} className="mb-2">
                    <SelectLabel className="text-xs uppercase tracking-wider text-muted-foreground font-bold pl-2">
                      {groupName}
                    </SelectLabel>
                    {groupItems.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                        className="pl-6 cursor-pointer"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ),
              )}
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full">
            Save Transaction
          </Button>
        </div>
      </form>
    </div>
  );
}
