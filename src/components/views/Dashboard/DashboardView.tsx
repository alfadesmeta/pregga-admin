import { useState, useEffect } from "react";
import { useCountUp } from "../../../hooks";
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
  UserPlus,
  CheckCircle,
  CreditCard,
  Circle,
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
} from "../../../data/mockData";

interface DashboardViewProps {
  isMobile: boolean;
  onNavigateToSubView?: (section: string, id: string) => void;
}

// Chart line color - dark navy/slate blue for better visibility
const chartLineColor = "#1F2937";

// Mock data for doula availability - using theme colors
const doulaAvailability = [
  { id: 1, name: "Amanda Chen", status: "online", activeChats: 3, color: "#8B7355" },   // Warm brown
  { id: 2, name: "Sarah Mitchell", status: "online", activeChats: 2, color: "#6B8E6B" }, // Sage green
  { id: 3, name: "Jennifer Lee", status: "busy", activeChats: 5, color: "#C97B8E" },     // Dusty rose
  { id: 4, name: "Rachel Kim", status: "offline", activeChats: 0, color: "#C4896B" },    // Terracotta
];

// Helper function for status colors
function getStatusColor(status: string) {
  switch (status) {
    case "online":
      return "#10B981";
    case "busy":
      return "#F59E0B";
    case "offline":
      return "#9CA3AF";
    default:
      return "#9CA3AF";
  }
}

export function DashboardView({ isMobile, onNavigateToSubView }: DashboardViewProps) {
  const [chartVisible, setChartVisible] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    // Reset chart animation on mount/reload
    setChartVisible(false);
    setChartKey(prev => prev + 1);
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
        <AnimatedStatCard
          title="Total Users"
          numericValue={dashboardStats.totalUsers}
          subtitle={`+${dashboardStats.usersThisMonth} this month`}
          subtitleColor={PreggaColors.success600}
          icon={<Users size={20} />}
          iconBg={PreggaColors.sage100}
          iconColor={PreggaColors.sage600}
          delay={0}
        />
        <AnimatedStatCard
          title="Active Doulas"
          numericValue={dashboardStats.activeDoulas}
          subtitle={`${dashboardStats.pendingVerifications} pending`}
          subtitleColor={PreggaColors.warning600}
          icon={<Heart size={20} />}
          iconBg={PreggaColors.rose100}
          iconColor={PreggaColors.rose600}
          delay={100}
        />
        <AnimatedStatCard
          title="Total Conversations"
          numericValue={dashboardStats.totalChats}
          subtitle={`Avg ${dashboardStats.avgResponseTime}`}
          icon={<MessageCircle size={20} />}
          iconBg={PreggaColors.primary100}
          iconColor={PreggaColors.primary600}
          delay={200}
        />
        <AnimatedStatCard
          title="Monthly Revenue"
          numericValue={dashboardStats.monthlyRevenue}
          prefix="$"
          subtitle={`${dashboardStats.userSatisfaction}% satisfaction`}
          subtitleColor={PreggaColors.success600}
          icon={<DollarSign size={20} />}
          iconBg={PreggaColors.terracotta100}
          iconColor={PreggaColors.terracotta600}
          delay={300}
        />
      </div>

      {/* Chart + Quick Actions Row */}
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
        >
          <div
            style={{
              height: 280,
              opacity: chartVisible ? 1 : 0,
              transform: chartVisible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                key={chartKey}
                data={userGrowthData} 
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
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
                  animationBegin={200}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Doula Availability */}
        <Card title="Doula Availability" subtitle="Current status" delay={450}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {doulaAvailability.map((doula) => (
                <div
                  key={doula.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: PreggaColors.neutral50,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: doula.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: PreggaColors.white,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {doula.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: PreggaColors.neutral900 }}>
                      {doula.name}
                    </div>
                    <div style={{ fontSize: 11, color: PreggaColors.neutral500 }}>
                      {doula.activeChats} active chats
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Circle
                      size={8}
                      fill={getStatusColor(doula.status)}
                      color={getStatusColor(doula.status)}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: getStatusColor(doula.status),
                        textTransform: "capitalize",
                      }}
                    >
                      {doula.status}
                    </span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToSubView?.("Doula Management", item.id)}
                >
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

// Animated Stat Card component with count-up animation
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
  delay = 0 
}: AnimatedStatCardProps) {
  const animatedValue = useCountUp(numericValue, 1500, delay);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

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
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
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
          {prefix}{animatedValue.toLocaleString()}
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

