import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentCardProps {
  id: string;
  name: string;
  rating: number;
  completionRate: number;
  vehicleType: string;
  totalDeliveries: number;
  onSelect?: () => void;
}

export function AgentCard({
  id,
  name,
  rating,
  completionRate,
  vehicleType,
  totalDeliveries,
  onSelect,
}: AgentCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="hover-elevate" data-testid={`card-agent-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" data-testid="text-agent-name">{name}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium" data-testid="text-rating">{rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({totalDeliveries} deliveries)
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Completion Rate</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            <span className="font-semibold" data-testid="text-completion-rate">{completionRate}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Vehicle Type</span>
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" data-testid="text-vehicle-type">{vehicleType}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="default"
          className="w-full"
          onClick={onSelect}
          data-testid="button-select-agent"
        >
          Select Agent
        </Button>
      </CardFooter>
    </Card>
  );
}
