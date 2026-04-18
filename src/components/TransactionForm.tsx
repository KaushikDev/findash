"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
          <button onClick={() => setTransactionType("expense")}>Expense</button>
          <button onClick={() => setTransactionType("income")}>Income</button>
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
          <select
            name="categoryId"
            defaultValue=""
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Select a category...
            </option>
            {Object.entries(groupedCategories).map(
              ([groupName, groupItems]) => (
                <optgroup key={groupName} label={groupName}>
                  {groupItems.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              ),
            )}
          </select>
          <Button type="submit" className="w-full">
            Save Transaction
          </Button>
        </div>
      </form>
    </div>
  );
}
