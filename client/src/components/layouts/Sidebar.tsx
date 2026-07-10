import type { ComponentType } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Role } from "core/constants/role.ts";
import { signOut, useSession } from "@/lib/auth-client";
import { useTheme } from "@/lib/theme";
import {
  LayoutDashboard,
  Ticket,
  Users,
  LogOut,
  Moon,
  Sun,
  BotMessageSquare,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SidebarLinkProps {
  to: string;
  end?: boolean;
  icon: ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
}

function SidebarLink({ to, end, icon: Icon, label, collapsed }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      className={({ isActive }) =>
        `group relative flex items-center ${
          collapsed ? "justify-center px-2" : "gap-3 px-3"
        } py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-primary to-chart-2 text-primary-foreground shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:translate-x-0.5 hover:bg-accent/60 hover:text-foreground"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isActive
                ? "bg-white/15"
                : "bg-foreground/5 group-hover:bg-foreground/10"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>

          {!collapsed && <span className="truncate">{label}</span>}

          {isActive && !collapsed && (
            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
          )}

          {collapsed && (
            <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const initials =
    session?.user.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <aside
      className={`relative h-screen border-r border-border/60 bg-card/70 backdrop-blur-2xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Floating collapse handle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-9 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-background shadow-md transition hover:border-primary/40 hover:text-primary"
      >
        <ChevronLeft
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>

      <div className="flex h-full flex-col">
        {/* Top */}
        <div className="border-b border-border/60 p-5">
          <Link
            to="/"
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 shadow-lg shadow-primary/20">
              <BotMessageSquare className="h-5 w-5 text-primary-foreground" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-card bg-emerald-400" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold tracking-tight">
                  Helpdesk AI
                </h2>
                <p className="truncate text-xs text-muted-foreground">
                  Smart Support Platform
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6">
          <div className="space-y-2">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                General
              </p>
            )}
            <SidebarLink to="/" end icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
            <SidebarLink to="/tickets" icon={Ticket} label="Tickets" collapsed={collapsed} />
          </div>

          {session?.user.role === Role.admin && (
            <div className="mt-7 space-y-2">
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                  Management
                </p>
              )}
              <SidebarLink to="/users" icon={Users} label="Users" collapsed={collapsed} />
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="border-t border-border/60 p-3">
          {/* Profile */}
          <div
            className={`mb-3 flex items-center rounded-2xl border border-border/60 bg-background/60 p-2.5 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-xs font-semibold text-primary-foreground">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {session?.user.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {session?.user.email}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className={`flex ${
              collapsed ? "flex-col gap-2" : "items-center gap-2"
            }`}
          >
            {/* Theme */}
            <button
              onClick={toggleTheme}
              className={`flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 text-muted-foreground transition hover:border-primary/40 hover:bg-accent hover:text-foreground ${
                collapsed ? "w-10" : "w-10 shrink-0"
              }`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className={`flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-background/60 text-sm font-medium text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive ${
                collapsed ? "h-10 w-10" : "h-10 flex-1 px-4"
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}