import { useState, useEffect } from "react";
import { PreggaColors, PreggaShadows } from "../../../theme/colors";
import { KPICard, Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import {
  Users,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  ArrowRight,
  UserPlus,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  dashboardStats,
  userGrowthData,
  recentActivities,
  pendingVerifications,
  topDoulas,
} from "../../../data/mockData";

interface DashboardViewProps {
  isMobile: boolean;
  onNavigate?: (section: string) => void;
}

export function DashboardView({ isMobile, onNavigate }: DashboardViewProps) {
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setChartVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const getActivityIcon = (type: string) => {
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
        return <AlertCircle size={16} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "new_user":
        return PreggaColors.sage500;
      case "new_doula":
        return PreggaColors.rose500;
      case "verification":
        return PreggaColors.warning500;
      case "payment":
        return PreggaColors.success500;
      case "chat_started":
        return PreggaColors.info500;
      default:
        return PreggaColors.neutral400;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <KPICard
          title="Total Users"
          value={dashboardStats.totalUsers}
          icon={<Users size={20} />}
          iconColor={PreggaColors.sage600}
          iconBg={PreggaColors.sage100}
          trend="up"
          trendValue="+12%"
          subtitle={`${dashboardStats.usersThisMonth} this month`}
          subtitleIcon={<TrendingUp size={12} />}
          subtitleColor={PreggaColors.success600}
          delay={0}
        />
        <KPICard
          title="Active Doulas"
          value={dashboardStats.activeDoulas}
          icon={<Heart size={20} />}
          iconColor={PreggaColors.rose600}
          iconBg={PreggaColors.rose100}
          trend="up"
          trendValue="+8%"
          subtitle={`${dashboardStats.pendingVerifications} pending`}
          subtitleIcon={<Clock size={12} />}
          subtitleColor={PreggaColors.warning600}
          delay={100}
        />
        <KPICard
          title="Total Chats"
          value={dashboardStats.totalChats}
          icon={<MessageCircle size={20} />}
          iconColor={PreggaColors.primary600}
          iconBg={PreggaColors.primary100}
          subtitle={`Avg ${dashboardStats.avgResponseTime}`}
          subtitleIcon={<Clock size={12} />}
          delay={200}
        />
        <KPICard
          title="Monthly Revenue"
          value={dashboardStats.monthlyRevenue}
          prefix="$"
          icon={<DollarSign size={20} />}
          iconColor={PreggaColors.terracotta600}
          iconBg={PreggaColors.terracotta100}
          trend="up"
          trendValue="+18%"
          subtitle={`${dashboardStats.userSatisfaction}% satisfaction`}
          subtitleIcon={<Star size={12} />}
          subtitleColor={PreggaColors.warning600}
          delay={300}
        />
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
          gap: 20,
        }}
      >
        {/* User Growth Chart */}
        <Card
          title="User Registrations"
          subtitle="Last 7 days"
          delay={400}
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.("Analytics")}>
              View Details
            </Button>
          }
        >
          <div
            style={{
              height: 280,
              opacity: chartVisible ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PreggaColors.sage500} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PreggaColors.sage500} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={PreggaColors.primary100} vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: PreggaColors.neutral500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: PreggaColors.neutral500 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${PreggaColors.primary100}`,
                    boxShadow: PreggaShadows.card,
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={PreggaColors.sage500}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Doulas */}
        <Card
          title="Top Performing Doulas"
          subtitle="By client satisfaction"
          delay={500}
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate?.("Doulas")}>
              View All
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topDoulas.map((doula) => (
              <div
                key={doula.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: PreggaColors.cream50,
                  transition: "background 0.12s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.cream100)}
                onMouseLeave={(e) => (e.currentTarget.style.background = PreggaColors.cream50)}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: doula.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PreggaColors.white,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {doula.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: PreggaColors.neutral900 }}>
                    {doula.name}
                  </div>
                  <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                    {doula.clients} active clients
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 14,
                      fontWeight: 600,
                      color: PreggaColors.warning600,
                    }}
                  >
                    <Star size={14} fill={PreggaColors.warning500} />
                    {doula.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        {/* Pending Verifications */}
        <Card
          title="Pending Verifications"
          subtitle={`${pendingVerifications.length} doulas awaiting review`}
          delay={600}
          action={
            <Badge variant="warning" size="sm">
              {pendingVerifications.length} Pending
            </Badge>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingVerifications.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: `1px solid ${PreggaColors.primary100}`,
                  transition: "border-color 0.12s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = PreggaColors.primary300)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = PreggaColors.primary100)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: PreggaColors.rose100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: PreggaColors.rose600,
                    }}
                  >
                    <Heart size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: PreggaColors.neutral900 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                      Applied {item.appliedAt}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Latest platform events"
          delay={700}
          action={
            <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} iconPosition="right">
              View All
            </Button>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentActivities.map((activity, index) => (
              <div
                key={activity.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom:
                    index < recentActivities.length - 1
                      ? `1px solid ${PreggaColors.primary100}`
                      : "none",
                }}
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
        </Card>
      </div>
    </div>
  );
}
