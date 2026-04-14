"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Budget = {
  id: string;
  name: string;
};

interface BudgetSwitcherProps {
  budgets: Budget[];
}

export default function BudgetSwitcher({ budgets }: BudgetSwitcherProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentBudgetId =
    searchParams.get("budgetId") ||
    (budgets.length > 0 ? budgets[0].id.toString() : "");

  const selectedBudget = budgets.find(
    (budget) => budget.id.toString() === currentBudgetId,
  );

const handleSelect = (budgetId: string) => {
    setOpen(false);
    
    // 1. Build the new URL cleanly
    const params = new URLSearchParams(searchParams.toString());
    params.set("budgetId", budgetId);
    
    // 2. Use the Next.js soft router
    router.push(`/?${params.toString()}`);
    
    // 3. Tell Next.js to quietly re-run the server component in the background
    router.refresh(); 
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between font-semibold shadow-sm"
        >
          {selectedBudget ? selectedBudget.name : "Select a Budget..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 shadow-lg border-muted">
        <Command>
          <CommandInput placeholder="Search budgets..." className="h-9" />
          <CommandList>
            <CommandEmpty>No budget found.</CommandEmpty>
            <CommandGroup heading="Your Budgets">
              {budgets.map((budget) => (
                <CommandItem
                  key={budget.id}
                  value={budget.name}
                  onSelect={() => handleSelect(budget.id.toString())}
                  className="cursor-pointer"
                >
                  {budget.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentBudgetId === budget.id.toString()
                        ? "opacity-100 text-primary"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
