"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createTransaction } from "@/app/db/actions";

// 1. Updated Interface to match your new flattened Enterprise data
export interface Category {
  id: number;
  name: string;
  limit_amount: number;
  icon: string;
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
  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      // 3. Fire the secure Server Action
      await createTransaction(formData);

      event.currentTarget.reset();
      if (onSuccess) onSuccess();
      toast.success("Transaction saved successfully");
    } catch (error: any) {
      toast.error("Error saving transaction", {
        description: error.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-card text-card-foreground shadow">
      <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <input type="hidden" name="budgetId" value={budgetId} />

          <Input
            type="number"
            name="amount"
            placeholder="Amount in cents"
            required
          />
          <Input
            type="text"
            name="purpose"
            placeholder="What was this for?"
            required
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
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button type="submit" className="w-full">
            Save Transaction
          </Button>
        </div>
      </form>
    </div>
  );
}
