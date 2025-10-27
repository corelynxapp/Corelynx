import { StatusBadge } from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="pending" />
      <StatusBadge status="accepted" />
      <StatusBadge status="in_transit" />
      <StatusBadge status="delivered" />
      <StatusBadge status="declined" />
      <StatusBadge status="awaiting_approval" />
    </div>
  );
}
