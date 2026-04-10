import { useState, useEffect } from "react";
import { useCountUp, useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import {
  Users,
  Heart,
  MessageCircle,
  Radio,
  TrendingUp,
  UserPlus,
  CheckCircle,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  fetchDashboardStats,
  fetchRecentUsers,
  fetchDailyRegistrations,
  fetchDeletionRequests,
  type DashboardStats,
} from "../../../lib/api";
import { formatTimeAgo } from "../../../lib/formatTime";
import type { UserWithProfile, DeletionRequest } from "../../../types/database";
import { Trash2 } from "lucide-react";

interface DashboardViewProps {
  isMobile: boolean;
  onNavigateToSubView?: (section: string, id: string) => void;
  onNavigateToSection?: (section: string, tab?: string) => void;
}

const chartLineColor = PreggaColors.accent500;

function getActivityIcon(type: string) {
  switch (type) {
    case "new_user":
      return <UserPlus size={16} />;
    case "new_doula":
      return <Heart size={16} />;
    case "verification":
      return <CheckCircle size={16} />;
    case "payment":
      return <CreditCard size={16} />;
    case "chat_started":
      return <MessageCircle size={16} />;
    default:
      return <MessageCircle size={16} />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "new_user":
      return PreggaColors.accent500;
    case "new_doula":
      return PreggaColors.rose500;
    case "verification":
      return PreggaColors.warning500;
    case "payment":
      return PreggaColors.accent500;
    case "chat_started":
      return PreggaColors.info500;
    default:
      return PreggaColors.neutral400;
  }
}

interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
}

function Shimmer({ width = "100%", height = 20, borderRadius = 6 }: ShimmerProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function ShimmerKPICard() {
  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Shimmer width={80} height={14} />
        <Shimmer width={36} height={36} borderRadius={10} />
      </div>
      <div>
        <Shimmer width={100} height={32} />
        <div style={{ marginTop: 8 }}>
          <Shimmer width={120} height={12} />
        </div>
      </div>
    </div>
  );
}

export function DashboardView({ isMobile, onNavigateToSubView, onNavigateToSection }: DashboardViewProps) {
  const [chartVisible, setChartVisible] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");

  const { data: stats, isLoading: statsLoading, error: statsError } = useSupabaseQuery<DashboardStats>(
    ['dashboard', 'stats'],
    fetchDashboardStats
  );

  const { data: recentUsers, isLoading: usersLoading } = useSupabaseQuery<UserWithProfile[]>(
    ['dashboard', 'recentUsers'],
    () => fetchRecentUsers(5)
  );

  const { data: weeklyData, isLoading: weeklyLoading } = useSupabaseQuery<{ date: string; count: number }[]>(
    ['dashboard', 'dailyRegistrations', 'week'],
    () => fetchDailyRegistrations(7)
  );

  const { data: monthlyData, isLoading: monthlyLoading } = useSupabaseQuery<{ date: string; count: number }[]>(
    ['dashboard', 'dailyRegistrations', 'month'],
    () => fetchDailyRegistrations(30)
  );

  const { data: deletionRequests, isLoading: deletionLoading } = useSupabaseQuery<(DeletionRequest & { user?: UserWithProfile })[]>(
    ['dashboard', 'deletion-requests'],
    fetchDeletionRequests
  );

  const chartLoading = chartPeriod === "week" ? weeklyLoading : monthlyLoading;

  useEffect(() => {
    setChartVisible(false);
    setChartKey(prev => prev + 1);
    const timer = setTimeout(() => setChartVisible(true), 400);
    return () => clearTimeout(timer);
  }, [chartPeriod]);

  const weekChartData = weeklyData?.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: item.count,
    fullDate: new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
  })) || [];

  const monthChartData = monthlyData?.map(item => ({
    day: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count,
    fullDate: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  })) || [];

  const chartData = chartPeriod === "week" ? weekChartData : monthChartData;
  const totalRegistrations = chartData.reduce((sum, d) => sum + d.value, 0);

  const recentActivities = recentUsers?.map(user => ({
    id: user.id,
    type: "new_user",
    title: user.display_name || "New User",
    description: user.email || user.phone || "User registered",
    time: formatTimeAgo(user.created_at),
  })) || [];

  if (statsError) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load dashboard</h3>
        <p style={{ color: PreggaColors.neutral500 }}>Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {statsLoading ? (
            <>
              <ShimmerKPICard />
              <ShimmerKPICard />
              <ShimmerKPICard />
              <ShimmerKPICard />
            </>
          ) : (
            <>
              <AnimatedStatCard
                title="Total Users"
                numericValue={stats?.totalUsers || 0}
                subtitle={`${stats?.activeSubscriptions || 0} subscribed`}
                subtitleColor={PreggaColors.accent600}
                icon={<Users size={20} />}
                iconBg={PreggaColors.accent100}
                iconColor={PreggaColors.accent600}
                delay={0}
                onClick={() => onNavigateToSection?.("Users")}
              />
              <AnimatedStatCard
                title="Active Doulas"
                numericValue={stats?.activeDoulas || 0}
                subtitle={`${stats?.totalDoulas || 0} total`}
                icon={<Heart size={20} />}
                iconBg={PreggaColors.rose100}
                iconColor={PreggaColors.rose600}
                delay={100}
                onClick={() => onNavigateToSection?.("Doulas")}
              />
              <AnimatedStatCard
                title="Conversations"
                numericValue={stats?.totalConversations || 0}
                subtitle={`${stats?.activeConversations || 0} active`}
                icon={<MessageCircle size={20} />}
                iconBg={PreggaColors.primary100}
                iconColor={PreggaColors.primary600}
                delay={200}
                onClick={() => onNavigateToSection?.("Conversations")}
              />
              <AnimatedStatCard
                title="Broadcasts"
                numericValue={stats?.pendingBroadcasts || 0}
                subtitle={`${stats?.expiredBroadcasts || 0} expired`}
                subtitleColor={stats?.expiredBroadcasts ? PreggaColors.warning600 : undefined}
                icon={<Radio size={20} />}
                iconBg={PreggaColors.terracotta100}
                iconColor={PreggaColors.terracotta600}
                delay={300}
                onClick={() => onNavigateToSection?.("Broadcasts")}
              />
            </>
          )}
        </div>

        {/* Chart + Doulas Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr",
            gap: 20,
          }}
        >
          <ChartCard
            title="User Registrations"
            totalValue={totalRegistrations}
            chartData={chartData}
            chartLoading={chartLoading}
            chartVisible={chartVisible}
            chartKey={chartKey}
            period={chartPeriod}
            onPeriodChange={setChartPeriod}
            delay={400}
          />

          <Card title="Doula Status" subtitle="Availability overview" delay={450}>
            {statsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
                    <Shimmer width={32} height={32} borderRadius={16} />
                    <div style={{ flex: 1 }}>
                      <Shimmer width={100} height={14} />
                      <div style={{ marginTop: 4 }}><Shimmer width={60} height={10} /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { label: "Available Doulas", value: stats?.activeDoulas || 0 },
                  { label: "Total Doulas", value: stats?.totalDoulas || 0 },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 4px",
                      borderBottom: i < arr.length - 1 ? `1px solid ${PreggaColors.neutral100}` : "none",
                    }}
                  >
                    <span style={{ fontSize: 13, color: PreggaColors.neutral600 }}>{item.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Bottom Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 20,
          }}
        >
          {/* Deletion Requests */}
          <Card 
            title="Deletion Requests" 
            subtitle={`${deletionRequests?.length || 0} pending`}
            action={deletionRequests && deletionRequests.length > 0 ? (
              <span 
                onClick={() => onNavigateToSection?.("Users", "requests")}
                style={{ fontSize: 13, color: PreggaColors.accent600, cursor: "pointer", fontWeight: 500 }}
              >
                View All
              </span>
            ) : undefined}
            delay={600}
          >
            {deletionLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
                    <Shimmer width={36} height={36} borderRadius={18} />
                    <div style={{ flex: 1 }}>
                      <Shimmer width={120} height={14} />
                      <div style={{ marginTop: 4 }}><Shimmer width={180} height={12} /></div>
                    </div>
                    <Shimmer width={50} height={10} />
                  </div>
                ))}
              </div>
            ) : deletionRequests && deletionRequests.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {deletionRequests.slice(0, 5).map((request, index) => (
                  <div
                    key={request.id}
                    onClick={() => request.user && onNavigateToSubView?.("Users", request.user.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom:
                        index < Math.min(deletionRequests.length, 5) - 1
                          ? `1px solid ${PreggaColors.neutral100}`
                          : "none",
                      cursor: "pointer",
                      borderRadius: 6,
                      margin: "0 -4px",
                      paddingLeft: 4,
                      paddingRight: 4,
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.neutral50)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: PreggaColors.error100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: PreggaColors.error500,
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {request.user?.avatar_url ? (
                        <img src={request.user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: PreggaColors.neutral900 }}>
                        {request.user?.display_name || "Unknown User"}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: PreggaColors.neutral500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {request.reason || "User requested account deletion"}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: PreggaColors.warning600, whiteSpace: "nowrap" }}>
                      {formatTimeAgo(request.requested_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: 24, 
                textAlign: "center", 
                color: PreggaColors.neutral400,
                fontSize: 14,
              }}>
                No pending deletion requests
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity" subtitle="Latest platform events" delay={700}>
            {usersLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
                    <Shimmer width={32} height={32} borderRadius={8} />
                    <div style={{ flex: 1 }}>
                      <Shimmer width={140} height={14} />
                      <div style={{ marginTop: 4 }}><Shimmer width={200} height={12} /></div>
                    </div>
                    <Shimmer width={40} height={10} />
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    onClick={() => onNavigateToSubView?.("Users", activity.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom:
                        index < recentActivities.length - 1
                          ? `1px solid ${PreggaColors.neutral100}`
                          : "none",
                      cursor: "pointer",
                      borderRadius: 6,
                      margin: "0 -4px",
                      paddingLeft: 4,
                      paddingRight: 4,
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.neutral50)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${getActivityColor(activity.type)}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: getActivityColor(activity.type),
                        flexShrink: 0,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: PreggaColors.neutral900 }}>
                        {activity.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: PreggaColors.neutral500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {activity.description}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: PreggaColors.neutral400, whiteSpace: "nowrap" }}>
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: 24, 
                textAlign: "center", 
                color: PreggaColors.neutral400,
                fontSize: 14,
              }}>
                No recent activity
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

interface AnimatedStatCardProps {
  title: string;
  numericValue: number;
  prefix?: string;
  subtitle: string;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  delay?: number;
  onClick?: () => void;
}

function AnimatedStatCard({
  title,
  numericValue,
  prefix = "",
  subtitle,
  subtitleColor,
  icon,
  iconBg,
  iconColor,
  delay = 0,
  onClick,
}: AnimatedStatCardProps) {
  const animatedValue = useCountUp(numericValue, 1500, delay);
  const [isVisible, setIsVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: PreggaColors.white,
        borderRadius: 16,
        padding: 20,
        boxShadow: hovered && onClick ? "0 4px 12px rgba(107, 127, 95, 0.12)" : "0 1px 3px rgba(0, 0, 0, 0.08)",
        border: `1px solid ${hovered && onClick ? PreggaColors.accent400 : "transparent"}`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500, fontWeight: 500 }}>{title}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 32, fontWeight: 600, color: PreggaColors.neutral900, lineHeight: 1 }}>
          {prefix}
          {animatedValue.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: 12,
            color: subtitleColor || PreggaColors.neutral500,
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {subtitleColor && <TrendingUp size={12} />}
          {subtitle}
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  totalValue: number;
  chartData: { day: string; value: number; fullDate: string }[];
  chartLoading: boolean;
  chartVisible: boolean;
  chartKey: number;
  period: "week" | "month";
  onPeriodChange: (period: "week" | "month") => void;
  delay?: number;
}

function ChartCard({
  title,
  totalValue,
  chartData,
  chartLoading,
  chartVisible,
  chartKey,
  period,
  onPeriodChange,
  delay = 0,
}: ChartCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const animatedTotal = useCountUp(totalValue, 1500, delay);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const subtitle = period === "week" ? "7-Day Registrations" : "30-Day Registrations";
  const bottomLabel = period === "week" ? "New users this week" : "New users this month";

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, marginBottom: 16 }}>
        {title}
      </div>

      {/* Subtitle Row - subtitle left, number+icon right */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{subtitle}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: PreggaColors.neutral900 }}>
            {animatedTotal}
          </span>
          <TrendingUp size={16} color={PreggaColors.accent500} />
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          height: 200,
          opacity: chartVisible && !chartLoading ? 1 : 0,
          transform: chartVisible && !chartLoading ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {chartLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Shimmer width="90%" height={160} borderRadius={8} />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              key={chartKey}
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartLineColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={chartLineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={PreggaColors.neutral200}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: PreggaColors.neutral500 }}
                interval={period === "month" ? "preserveStartEnd" : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: PreggaColors.neutral500 }}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 5)]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        style={{
                          background: PreggaColors.white,
                          borderRadius: 8,
                          border: `1px solid ${PreggaColors.neutral200}`,
                          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                          padding: "10px 14px",
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 600, color: PreggaColors.neutral900, marginBottom: 4 }}>
                          {payload[0]?.payload?.fullDate || label}
                        </div>
                        <div style={{ fontSize: 13, color: PreggaColors.neutral700 }}>
                          <span style={{ fontWeight: 600, color: PreggaColors.accent600 }}>
                            {payload[0].value}
                          </span>
                          {" "}registrations
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartLineColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartGradient)"
                animationBegin={400}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: PreggaColors.neutral400,
              fontSize: 14,
            }}
          >
            No registration data available
          </div>
        )}
      </div>

      {/* Bottom Row - Toggle and Summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 14,
          padding: "12px 14px",
          background: PreggaColors.accent50,
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: PreggaColors.accent100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.accent600,
            }}
          >
            <TrendingUp size={16} />
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 700, color: PreggaColors.neutral900, marginRight: 6 }}>
              {animatedTotal}
            </span>
            <span style={{ fontSize: 13, color: PreggaColors.neutral600 }}>{bottomLabel}</span>
          </div>
        </div>

        {/* Period Toggle */}
        <div
          style={{
            display: "flex",
            background: PreggaColors.white,
            borderRadius: 8,
            padding: 3,
            border: `1px solid ${PreggaColors.neutral200}`,
          }}
        >
          <button
            onClick={() => onPeriodChange("week")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: period === "week" ? PreggaColors.accent500 : "transparent",
              color: period === "week" ? PreggaColors.white : PreggaColors.neutral600,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Week
          </button>
          <button
            onClick={() => onPeriodChange("month")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: period === "month" ? PreggaColors.accent500 : "transparent",
              color: period === "month" ? PreggaColors.white : PreggaColors.neutral600,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
}
