import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AddTransactionModal from "@/components/AddTransactionModal";
import TransactionRow from "@/components/TransactionRow";
import SignOutButton from "@/components/SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateBudgetModal from "@/components/CreateBudgetModal";
import BudgetSwitcher from "@/components/BudgetSwitcher";
import { DeleteBudgetAction } from "@/components/DeleteBudgetAction";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ budgetId?: string }>;
}) {
  let budgetForecast = 0;
  const cookieStore = await cookies();

  const resolvedSearchParams = await searchParams;
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

  const totalBudgetAmount = activeBudget
    ? Number(activeBudget.total_limit) / 100
    : 0;
  const budgetUsedPercentage =
    totalBudgetAmount > 0
      ? (totalExpenseInDollars / totalBudgetAmount) * 100
      : 0;

  const budgetStartDate = new Date(activeBudget?.start_date);
  const budgetEndDate = new Date(activeBudget?.end_date);
  const today = new Date();

  const totalBudgetDays = Math.max(
    1,
    Math.ceil(
      (budgetEndDate.getTime() - budgetStartDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const totalPassedDays = Math.max(
    1,
    Math.min(
      totalBudgetDays,
      Math.ceil(
        (today.getTime() - budgetStartDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    ),
  );

  const dailyAvgSpending = totalExpenseInDollars / totalPassedDays;
  budgetForecast = dailyAvgSpending * totalBudgetDays;

  const remainingBudgetAmount = Math.max(
    0,
    totalBudgetAmount - totalExpenseInDollars,
  );
  const timeToRunOutOfBudget =
    dailyAvgSpending > 0
      ? `${Math.floor(remainingBudgetAmount / dailyAvgSpending)} Days`
      : "Not Applicable";

  const timePassedPercentage = (totalPassedDays / totalBudgetDays) * 100;

  let healthStatus = "Healthy";
  let healthColor = "text-emerald-500 bg-emerald-500/10 border-emerald-200";
  let progressBarColor = "bg-emerald-500";

  if (totalBudgetAmount > 0 && timePassedPercentage > 0) {
    const budgetBurnRate = budgetUsedPercentage / timePassedPercentage;

    if (budgetBurnRate > 1.1) {
      healthStatus = "Poor";
      healthColor = "text-rose-500 bg-rose-500/10 border-rose-200";
      progressBarColor = "bg-rose-500";
    } else if (budgetBurnRate > 0.9) {
      healthStatus = "Average";
      healthColor = "text-amber-500 bg-amber-500/10 border-amber-200";
      progressBarColor = "bg-amber-500";
    }
  }

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
    <main className="p-4 sm:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center pb-6 mb-6 border-b">
        <div className="text-xl font-bold tracking-tight text-primary">
          FinDash
        </div>
        <SignOutButton />
      </header>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <BudgetSwitcher budgets={safeBudgets} />
          <AddTransactionModal
            categories={allGlobalCategories || []}
            budgetId={budgetId}
          />
          <CreateBudgetModal />
        </div>
      </div>

      <div className="mb-8">
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              {/* Left Side: Budget Name, Badge, & Amount */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="text-2xl font-bold">
                    {activeBudget?.name}
                  </CardTitle>
                  <DeleteBudgetAction budgetId={budgetId} />
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${healthColor}`}
                  >
                    {healthStatus}
                  </span>
                </div>
                <div className="text-xl font-semibold text-muted-foreground">
                  <span className="text-foreground">
                    ${totalBudgetAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground font-medium bg-background px-3 py-1 rounded-full border w-fit">
                {budgetStartDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {" - "}
                {budgetEndDate.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Budget Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Expenditure
                </span>
                <span className="text-2xl font-bold text-rose-500">
                  ${totalExpenseInDollars.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Total Earnings
                </span>
                <span className="text-2xl font-bold">
                  ${totalIncomeInDollars.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Projected End Spending
                </span>
                <span className="text-2xl font-bold">
                  ${budgetForecast.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground font-medium">
                  Days to Exhaustion
                </span>
                <span className="text-2xl font-bold">
                  {timeToRunOutOfBudget}
                </span>
              </div>
            </div>

            {/* The Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Current Budget Status</span>
                <span
                  className={
                    budgetUsedPercentage > 100 ? "text-rose-500 font-bold" : ""
                  }
                >
                  {budgetUsedPercentage.toFixed(1)}% Used
                </span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${progressBarColor}`}
                  style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex flex-col border-dashed shadow-none p-2 sm:p-4">
        {transactions && !transactions.length ? (
          <div className="flex items-center justify-center min-h-48">
            <p className="text-muted-foreground">No transactions yet.</p>
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-1">
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
