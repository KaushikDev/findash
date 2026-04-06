"use client";

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
  const transactionType = item.category_id === 1 ? "Credit" : "Debit";
  return (
    <div>
      {transactionType} transaction for Amount {item.amount / 100} done on Date
      - {item.created_at}{" "}
    </div>
  );
}
