"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Category {
  id: number;
  name: string;
  budget_limit: number;
  icon: string;
}

interface TransactionFormProps {
  categories: Category[];
  onSuccess?: () => void;
}

export default function TransactionForm({
  categories,
  onSuccess,
}: TransactionFormProps) {
  const router = useRouter();

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const amount = formData.get("amount");
    const purpose = formData.get("purpose");
    const categoryId = formData.get("categoryId");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Session Expired", {
        description: "You must be logged in to do this.",
      });
      return;
    }

    const { error } = await supabase.from("transactions").insert([
      {
        amount: Number(amount),
        description: purpose,
        category_id: Number(categoryId),
        user_id: user.id,
      },
    ]);

    if (!error) {
      form.reset();
      if (onSuccess) onSuccess();
      router.refresh();
      toast.success("Transaction saved successfully");
    } else {
      console.error("Insert error:", error);

      const errorMessage =
        error?.message || "An unknown database error occurred";

      toast.error("Error saving transaction", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-card text-card-foreground shadow">
      <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
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
