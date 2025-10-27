import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, ArrowRight, Calendar, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobOfferCardProps {
  id: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: string;
  pickupDate: string;
  requestedCost: number;
  partnerName: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onRaiseCost?: () => void;
}

export function JobOfferCard({
  id,
  origin,
  destination,
  cargoType,
  weight,
  pickupDate,
  requestedCost,
  partnerName,
  onAccept,
  onDecline,
  onRaiseCost,
}: JobOfferCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-job-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm text-muted-foreground" data-testid={`text-job-id-${id}`}>
              #{id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-lg font-semibold text-primary">
            <DollarSign className="h-5 w-5" />
            <span data-testid="text-cost">{requestedCost.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">From</p>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium" data-testid="text-origin">{origin}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">To</p>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium" data-testid="text-destination">{destination}</p>
          </div>
        </div>
        <div className="pt-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cargo:</span>
            <span className="font-medium" data-testid="text-cargo">{cargoType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium" data-testid="text-weight">{weight}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid="text-pickup">{pickupDate}</span>
          </div>
          <div className="flex justify-between pt-1 border-t">
            <span className="text-muted-foreground">Partner:</span>
            <span className="font-medium" data-testid="text-partner">{partnerName}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onDecline}
          data-testid="button-decline"
        >
          Decline
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onRaiseCost}
          data-testid="button-raise-cost"
        >
          Raise Cost
        </Button>
        <Button
          variant="default"
          className="flex-1"
          onClick={onAccept}
          data-testid="button-accept"
        >
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
}
