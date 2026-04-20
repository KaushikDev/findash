"use client";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createBudget } from "@/app/db/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";

export default function CreateBudgetModal() {
  const [open, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const router = useRouter();

  const handleCreateBudget = async (formData: FormData) => {
    try {
      await createBudget(formData);
      toast.success("Budget created successfully");
      router.refresh();
      setStartDate(undefined);
      setEndDate(undefined);
    } catch {
      toast.error("DB error while creating budget!");
    } finally {
      setIsOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add new Budget</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new budget</DialogTitle>
        </DialogHeader>
        <form action={handleCreateBudget}>
          <div className="space-y-4">
            <Input
              type="text"
              name="name"
              placeholder="Enter budget title"
              required
            />
            <Input
              type="number"
              name="totalLimit"
              placeholder="Please enter your budget amount"
              step="0.01"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </div>
            <input
              type="hidden"
              name="startDate"
              value={startDate ? startDate.toISOString() : ""}
            />
            <input
              type="hidden"
              name="endDate"
              value={endDate ? endDate.toISOString() : ""}
            />
            <Button type="submit" className="w-full">
              Save Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
