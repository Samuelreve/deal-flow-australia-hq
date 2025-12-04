
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Activity, Clock, Heart, Inbox } from "lucide-react";

interface DashboardQuickStatsProps {
  metrics: {
    active: number;
    averageHealthScore: number;
  };
  recentActivityCount: number;
  unreadCount: number;
}

const DashboardQuickStats = ({ metrics, recentActivityCount, unreadCount }: DashboardQuickStatsProps) => {
  const stats = [
    {
      label: "Active Deals",
      value: metrics.active,
      icon: Activity,
      gradient: 'primary' as const,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Recent Activity",
      value: recentActivityCount,
      icon: Clock,
      gradient: 'none' as const,
      iconBg: "bg-info/10",
      iconColor: "text-info",
    },
    {
      label: "Average Health",
      value: metrics.averageHealthScore ? `${metrics.averageHealthScore}%` : 'N/A',
      icon: Heart,
      gradient: 'success' as const,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      label: "Unread Messages",
      value: unreadCount,
      icon: Inbox,
      gradient: 'warning' as const,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <GlassCard 
          key={stat.label} 
          hover 
          gradient={stat.gradient}
          className="p-6"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{stat.value}</h3>
            </div>
            <div className={`h-12 w-12 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default DashboardQuickStats;
