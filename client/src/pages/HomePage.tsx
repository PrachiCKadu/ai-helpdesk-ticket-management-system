import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/ErrorAlert";
import {
  TicketIcon,
  CircleDot,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

interface Stats {
  totalTickets: number;
  openTickets: number;
  resolvedByAI: number;
  aiResolutionRate: number;
  avgResolutionTime: number;
}

interface DailyVolume {
  data: { date: string; tickets: number }[];
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "N/A";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const chartConfig = {
  tickets: {
    label: "Tickets",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function HomePage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<Stats>({
    queryKey: ["ticket-stats"],
    queryFn: async () => {
      const res = await axios.get("/api/tickets/stats");
      return res.data;
    },
  });

  const {
    data: volume,
    isLoading: volumeLoading,
    error: volumeError,
  } = useQuery<DailyVolume>({
    queryKey: ["ticket-daily-volume"],
    queryFn: async () => {
      const res = await axios.get("/api/tickets/stats/daily-volume");
      return res.data;
    },
  });

  if (statsError) {
    return (
      <div className="animate-in-page">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <ErrorAlert
          error={statsError}
          fallback="Failed to load dashboard stats"
        />
      </div>
    );
  }

  const cards = [
    {
      title: "Total Tickets",
      value: stats?.totalTickets,
      icon: TicketIcon,
    },
    {
      title: "Open Tickets",
      value: stats?.openTickets,
      icon: CircleDot,
    },
    {
      title: "Resolved by AI",
      value: stats?.resolvedByAI,
      icon: Sparkles,
      highlight: true,
    },
    {
      title: "AI Resolution Rate",
      value: stats ? `${stats.aiResolutionRate}%` : undefined,
      icon: TrendingUp,
      highlight: true,
    },
    {
      title: "Avg Resolution Time",
      value: stats ? formatDuration(stats.avgResolutionTime) : undefined,
      icon: Clock,
    },
  ];

  const hasVolumeData = (volume?.data?.length ?? 0) > 0;

  return (
    <div className="animate-in-page">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Helpdesk
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Monitor ticket activity, AI automation and customer support
            performance in real time.
          </p>
        </div>

        <div className="flex h-10 items-center gap-2 self-start rounded-full border border-border/60 bg-card/60 px-4 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-medium">Online</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="group relative overflow-hidden rounded-2xl border-border/60 bg-card/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
          >
            {card.highlight && (
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            )}

            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div
                  className={
                    card.highlight
                      ? "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-md shadow-primary/20"
                      : "flex h-9 w-9 items-center justify-center rounded-xl bg-muted"
                  }
                >
                  <card.icon
                    className={
                      card.highlight
                        ? "h-4 w-4 text-primary-foreground"
                        : "h-4 w-4 text-muted-foreground"
                    }
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div>
                  <p className="text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated just now
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="mt-8 rounded-2xl border-border/60 bg-card/60 shadow-sm backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">
              Ticket Volume
            </CardTitle>
            <CardDescription>
              Daily ticket creation over the last 30 days
            </CardDescription>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-md shadow-primary/20">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
        </CardHeader>

        <CardContent>
          {volumeError ? (
            <ErrorAlert
              error={volumeError}
              fallback="Failed to load chart data"
            />
          ) : volumeLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : !hasVolumeData ? (
            <div className="flex h-[300px] w-full flex-col items-center justify-center gap-2 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No ticket activity yet</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Once tickets start coming in, daily volume will show up here.
              </p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[360px] w-full">
              <BarChart accessibilityLayer data={volume?.data}>
                <defs>
                  <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-tickets)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--color-tickets)" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 6" className="stroke-border/60" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => {
                    const d = new Date(value + "T00:00:00");
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <ChartTooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value: string) => {
                        const d = new Date(value + "T00:00:00");
                        return d.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="tickets"
                  fill="url(#ticketsGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}