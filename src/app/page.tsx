import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionRow from "@/components/TransactionRow";
import SignOutButton from "@/components/SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateBudgetModal from "@/components/CreateBudgetModal";
import BudgetSwitcher from "@/components/BudgetSwitcher";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ budgetId?: string }>;
}) {
  const cookieStore = await cookies();

  const resolvedSearchParams = await searchParams; // <-- We AWAIT the URL parameters
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

  const { data: budgets, error: budgetsError } = await supabase
    .from("budgets")
    .select("id, name")
    .order("start_date");

  const safeBudgets = budgets || [];
  const budgetId =
    resolvedSearchParams?.budgetId ||
    (safeBudgets.length > 0 ? safeBudgets[0].id.toString() : "");

  if (!budgetId) {
    return (
      <main className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to the App
        </h1>
        <p className="text-muted-foreground">
          Get started by creating your first budget.
        </p>
        <CreateBudgetModal />
      </main>
    );
  }

  const { data: allGlobalCategories, error: globalCategoryError } =
    await supabase.from("categories").select("*");

  const { data: transactions, error: transactionError } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", budgetId);

  const categoryTypeMap = new Map(
    allGlobalCategories?.map((cat) => [cat.id, cat.type]) || [],
  );

  const totalIncomeInDollars =
    (transactions
      ?.filter((item) => categoryTypeMap.get(item.category_id) === "income")
      ?.reduce((result, item) => result + Number(item.amount), 0) || 0) / 100;

  const totalExpenseInDollars =
    (transactions
      ?.filter((item) => categoryTypeMap.get(item.category_id) === "expense")
      ?.reduce((result, item) => result + Number(item.amount), 0) || 0) / 100;

  if (transactionError || globalCategoryError) {
    console.error("Database Error:", transactionError || globalCategoryError);
    return (
      <main className="p-8 max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 p-8 border border-red-200 bg-red-50/50 rounded-xl max-w-md">
          <h2 className="text-xl font-bold text-red-600">
            Failed to load data
          </h2>
          <p className="text-red-500 text-sm">
            We couldn&apos;t connect to the database. Please try refreshing the
            page.
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
          <BudgetSwitcher budgets={safeBudgets} />
          {/* 5. Pass the Global List down to the Modal! */}
          <AddTransactionModal
            categories={allGlobalCategories || []}
            budgetId={budgetId}
          />
          <CreateBudgetModal />
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
              <TransactionRow
                key={item.id}
                item={item}
                categories={allGlobalCategories || []}
              />
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
