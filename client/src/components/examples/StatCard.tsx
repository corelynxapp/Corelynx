import { StatCard } from '../StatCard';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Shipments"
        value={24}
        icon={Package}
        trend={{ value: "+12% from last month", positive: true }}
      />
      <StatCard
        title="In Transit"
        value={8}
        icon={Truck}
      />
      <StatCard
        title="Completed"
        value={156}
        icon={CheckCircle}
        trend={{ value: "+8% from last month", positive: true }}
      />
      <StatCard
        title="Pending"
        value={3}
        icon={Clock}
      />
    </div>
  );
}
