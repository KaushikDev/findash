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
  let budgetForecast = 0;
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
    .select("id, name, start_date, end_date, total_limit")
    .order("start_date");

  const safeBudgets = budgets || [];
  const budgetId =
    resolvedSearchParams?.budgetId ||
    (safeBudgets.length > 0 ? safeBudgets[0].id.toString() : "");

  const activeBudget = safeBudgets.find((b) => b.id.toString() === budgetId);

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

  const limitInDollars = activeBudget
    ? Number(activeBudget.total_limit) / 100
    : 0;
  const percentageUsed =
    limitInDollars > 0 ? (totalExpenseInDollars / limitInDollars) * 100 : 0;

  const startDate = new Date(activeBudget?.start_date);
  const endDate = new Date(activeBudget?.end_date);
  const today = new Date();

  const totalBudgetDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const totalPassedDays = Math.max(
    1,
    Math.min(
      totalBudgetDays,
      Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    ),
  );

  const dailyAvgSpending = totalExpenseInDollars / totalPassedDays;
  budgetForecast = dailyAvgSpending * totalBudgetDays;

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

      <div className="mb-8">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">
                {activeBudget?.name}
              </CardTitle>
              <div className="text-sm text-muted-foreground font-medium bg-background px-3 py-1 rounded-full border">
                {activeBudget?.start_date} to {activeBudget?.end_date}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* The 4-Stat Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Amount Set For
                </span>
                <span className="text-2xl font-bold">
                  ${limitInDollars.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Spent
                </span>
                <span className="text-2xl font-bold text-rose-500">
                  ${totalExpenseInDollars.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Forecast
                </span>
                <span className="text-2xl font-bold">
                  ${budgetForecast.toFixed(2)}
                </span>
              </div>
            </div>

            {/* The Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Current Status</span>
                <span
                  className={
                    percentageUsed > 100 ? "text-rose-500 font-bold" : ""
                  }
                >
                  {percentageUsed.toFixed(1)}% Used
                </span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${percentageUsed > 100 ? "bg-rose-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                />
              </div>
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
