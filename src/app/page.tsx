import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionRow from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*");

  const { data: transactions, error: transactionError } = await supabase
    .from("transactions")
    .select("*");

  const totalIncomeInDollars =
    transactions
      ?.filter((item) => item.category_id === 2)
      ?.reduce((result, item) => {
        return result + Number(item.amount);
      }, 0) / 100;

  const totalExpenseInDollars =
    transactions
      ?.filter((item) => item.category_id === 1)
      ?.reduce((result, item) => {
        return result + Number(item.amount);
      }, 0) / 100;

  console.log("total", totalExpenseInDollars);
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 ">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <AddTransactionModal categories={categories || []} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalIncomeInDollars - totalExpenseInDollars).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ${totalIncomeInDollars.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${totalExpenseInDollars.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="flex flex-col items-center justify-center h-64 border-dashed shadow-none">
        {transactions && !transactions.length ? (
          <p className="text-muted-foreground mb-4">No transactions yet.</p>
        ) : (
          <div className="flex flex-col items-center justify-center ">
            {transactions?.map((item) => (
              <TransactionRow key={item.id} item={item} />
            ))}
          </div>
        )}
       <AddTransactionModal categories={categories || []} />
      </Card>
    </main>
  );
}
