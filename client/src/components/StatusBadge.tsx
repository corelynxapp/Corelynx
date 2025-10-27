import { Badge } from "@/components/ui/badge";
import { Package, PackageCheck, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";

type ShipmentStatus = "pending" | "accepted" | "in_transit" | "delivered" | "declined" | "awaiting_approval";

interface StatusBadgeProps {
  status: ShipmentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    },
    accepted: {
      label: "Accepted",
      icon: PackageCheck,
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    in_transit: {
      label: "In Transit",
      icon: Truck,
      className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    },
    delivered: {
      label: "Delivered",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    declined: {
      label: "Declined",
      icon: XCircle,
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
    awaiting_approval: {
      label: "Awaiting Approval",
      icon: Clock,
      className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 ${config.className}`} data-testid={`badge-status-${status}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
