import { useState, useEffect } from "react";
import { PreggaColors, PreggaShadows } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import {
  Users,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Star,
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

// Chart line color - dark navy/slate blue for better visibility
const chartLineColor = "#1F2937";

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
        return <MessageCircle size={16} />;
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
      {/* KPI Cards - 4 equal columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          subtitle={`+${dashboardStats.usersThisMonth} this month`}
          subtitleColor={PreggaColors.success600}
          icon={<Users size={20} />}
          iconBg={PreggaColors.sage100}
          iconColor={PreggaColors.sage600}
        />
        <StatCard
          title="Active Doulas"
          value={dashboardStats.activeDoulas.toString()}
          subtitle={`${dashboardStats.pendingVerifications} pending`}
          subtitleColor={PreggaColors.warning600}
          icon={<Heart size={20} />}
          iconBg={PreggaColors.rose100}
          iconColor={PreggaColors.rose600}
        />
        <StatCard
          title="Total Chats"
          value={dashboardStats.totalChats.toLocaleString()}
          subtitle={`Avg ${dashboardStats.avgResponseTime}`}
          icon={<MessageCircle size={20} />}
          iconBg={PreggaColors.primary100}
          iconColor={PreggaColors.primary600}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${dashboardStats.monthlyRevenue.toLocaleString()}`}
          subtitle={`${dashboardStats.userSatisfaction}% satisfaction`}
          subtitleColor={PreggaColors.success600}
          icon={<DollarSign size={20} />}
          iconBg={PreggaColors.terracotta100}
          iconColor={PreggaColors.terracotta600}
        />
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "3fr 2fr",
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
                    <stop offset="5%" stopColor={chartLineColor} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={chartLineColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: PreggaColors.neutral400 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: PreggaColors.neutral400 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${PreggaColors.neutral200}`,
                    boxShadow: PreggaShadows.card,
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartLineColor}
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
                  border: `1px solid ${PreggaColors.neutral100}`,
                  transition: "border-color 0.12s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = PreggaColors.neutral300)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = PreggaColors.neutral100)}
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
                      ? `1px solid ${PreggaColors.neutral100}`
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

// Stat Card component with even alignment styling
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, subtitle, subtitleColor, icon, iconBg, iconColor }: StatCardProps) {
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
          {value}
        </div>
        <div style={{ 
          fontSize: 12, 
          color: subtitleColor || PreggaColors.neutral500, 
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}>
          {subtitleColor && <TrendingUp size={12} />}
          {subtitle}
        </div>
      </div>
    </div>
  );
}
