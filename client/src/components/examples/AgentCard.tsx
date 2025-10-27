import { AgentCard } from '../AgentCard';

export default function AgentCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
      <AgentCard
        id="AGT-001"
        name="John Smith"
        rating={4.8}
        completionRate={95}
        vehicleType="Box Truck"
        totalDeliveries={142}
        onSelect={() => console.log('Selected John Smith')}
      />
      <AgentCard
        id="AGT-002"
        name="Sarah Johnson"
        rating={4.9}
        completionRate={98}
        vehicleType="Cargo Van"
        totalDeliveries={187}
        onSelect={() => console.log('Selected Sarah Johnson')}
      />
      <AgentCard
        id="AGT-003"
        name="Mike Davis"
        rating={4.7}
        completionRate={92}
        vehicleType="Flatbed Truck"
        totalDeliveries={98}
        onSelect={() => console.log('Selected Mike Davis')}
      />
    </div>
  );
}
