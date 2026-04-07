import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionRow from "@/components/TransactionRow";
import SignOutButton from "@/components/SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("*");
  const { data: transactions, error: transactionError } = await supabase
    .from("transactions")
    .select("*");

  const totalIncomeInDollars =
    (transactions
      ?.filter((item) => item.category_id === 2)
      ?.reduce((result, item) => result + Number(item.amount), 0) || 0) / 100;

  const totalExpenseInDollars =
    (transactions
      ?.filter((item) => item.category_id === 1)
      ?.reduce((result, item) => result + Number(item.amount), 0) || 0) / 100;

  if (categoryError || transactionError) {
    console.error("Database Error:", categoryError || transactionError);
    return (
      <main className="p-8 max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 p-8 border border-red-200 bg-red-50/50 rounded-xl max-w-md">
          <h2 className="text-xl font-bold text-red-600">
            Failed to load data
          </h2>
          <p className="text-red-500 text-sm">
            {categoryError?.message ||
              transactionError?.message ||
              "We couldn't connect to the database. Please try refreshing the page."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 ">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <AddTransactionModal categories={categories || []} />
        </div>

        <SignOutButton />
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

      <Card className="flex flex-col items-center justify-center min-h-64 border-dashed shadow-none p-6">
        {transactions && !transactions.length ? (
          <p className="text-muted-foreground mb-4">No transactions yet.</p>
        ) : (
          <div className="w-full flex flex-col space-y-2">
            {transactions?.map((item) => (
              <TransactionRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
