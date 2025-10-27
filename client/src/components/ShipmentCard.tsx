import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { MapPin, ArrowRight, Calendar, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShipmentCardProps {
  id: string;
  origin: string;
  destination: string;
  cargoType: string;
  status: "pending" | "accepted" | "in_transit" | "delivered" | "declined" | "awaiting_approval";
  pickupDate: string;
  agentName?: string;
  onView?: () => void;
}

export function ShipmentCard({
  id,
  origin,
  destination,
  cargoType,
  status,
  pickupDate,
  agentName,
  onView,
}: ShipmentCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-shipment-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm text-muted-foreground" data-testid={`text-shipment-id-${id}`}>
            #{id}
          </span>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-origin">{origin}</p>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-destination">{destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span data-testid="text-pickup-date">{pickupDate}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Cargo: </span>
          <span className="font-medium" data-testid="text-cargo-type">{cargoType}</span>
        </div>
        {agentName && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Agent: </span>
            <span className="font-medium" data-testid="text-agent-name">{agentName}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={onView}
          data-testid="button-view-details"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
