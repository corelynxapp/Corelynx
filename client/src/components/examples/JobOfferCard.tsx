import { JobOfferCard } from '../JobOfferCard';

export default function JobOfferCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl">
      <JobOfferCard
        id="JOB-101"
        origin="123 Main St, New York, NY 10001"
        destination="456 Oak Ave, Philadelphia, PA 19019"
        cargoType="Electronics"
        weight="115 kg"
        pickupDate="Dec 28, 2024"
        requestedCost={850}
        partnerName="Tech Corp"
        onAccept={() => console.log('Accepted JOB-101')}
        onDecline={() => console.log('Declined JOB-101')}
        onRaiseCost={() => console.log('Raise cost for JOB-101')}
      />
      <JobOfferCard
        id="JOB-102"
        origin="789 Pine Rd, Boston, MA 02101"
        destination="321 Elm St, Providence, RI 02901"
        cargoType="Furniture"
        weight="230 kg"
        pickupDate="Dec 30, 2024"
        requestedCost={1200}
        partnerName="Home Goods Inc"
        onAccept={() => console.log('Accepted JOB-102')}
        onDecline={() => console.log('Declined JOB-102')}
        onRaiseCost={() => console.log('Raise cost for JOB-102')}
      />
    </div>
  );
}
