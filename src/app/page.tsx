import TransactionForm from "@/components/TransactionForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*");
  console.log("Categories", categories);
  console.log("Errors", error);
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 ">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button>+Add Transaction</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">$0.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">$0.00</div>
          </CardContent>
        </Card>
      </div>
      <Card className="flex flex-col items-center justify-center h-64 border-dashed shadow-none">
        <p className="text-muted-foreground mb-4">No transactions yet.</p>
        <Button variant="outline">Add your first expense</Button>
      </Card>
      <div className="mt-8">
        <TransactionForm categories={categories || []} />
      </div>
    </main>
  );
}
