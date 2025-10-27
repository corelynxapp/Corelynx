import { ShipmentCard } from '../ShipmentCard';

export default function ShipmentCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
      <ShipmentCard
        id="SHP-001"
        origin="123 Main St, New York, NY 10001"
        destination="456 Oak Ave, Los Angeles, CA 90001"
        cargoType="Electronics"
        status="in_transit"
        pickupDate="Dec 28, 2024"
        agentName="John Smith"
        onView={() => console.log('View shipment SHP-001')}
      />
      <ShipmentCard
        id="SHP-002"
        origin="789 Pine Rd, Chicago, IL 60601"
        destination="321 Elm St, Houston, TX 77001"
        cargoType="Furniture"
        status="pending"
        pickupDate="Dec 30, 2024"
        onView={() => console.log('View shipment SHP-002')}
      />
      <ShipmentCard
        id="SHP-003"
        origin="555 Market St, San Francisco, CA 94102"
        destination="888 Broadway, Seattle, WA 98101"
        cargoType="Documents"
        status="delivered"
        pickupDate="Dec 25, 2024"
        agentName="Sarah Johnson"
        onView={() => console.log('View shipment SHP-003')}
      />
    </div>
  );
}
