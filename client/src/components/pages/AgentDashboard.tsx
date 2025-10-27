import { useState } from "react";
import { DollarSign, Package, CheckCircle, TrendingUp, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { JobOfferCard } from "@/components/JobOfferCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShipmentCard } from "@/components/ShipmentCard";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AgentDashboard() {
  const { toast } = useToast();
  const [negotiateDialogOpen, setNegotiateDialogOpen] = useState(false);
  const [deliveryConfirmDialogOpen, setDeliveryConfirmDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [proposedAmount, setProposedAmount] = useState("");
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [customerCodeInput, setCustomerCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const { data: shipments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/shipments"],
  });

  const { data: earnings = [] } = useQuery<any[]>({
    queryKey: ["/api/payments/earnings"],
  });

  const acceptShipmentMutation = useMutation({
    mutationFn: async (shipmentId: string) => {
      const response = await apiRequest("POST", `/api/shipments/${shipmentId}/accept`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Shipment Accepted",
        description: "You have successfully accepted this shipment.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept shipment",
        variant: "destructive",
      });
    },
  });

  const declineShipmentMutation = useMutation({
    mutationFn: async (shipmentId: string) => {
      const response = await apiRequest("POST", `/api/shipments/${shipmentId}/decline`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Shipment Declined",
        description: "You have declined this shipment.",
      });
    },
  });

  const createNegotiationMutation = useMutation({
    mutationFn: async (data: { shipmentId: string; proposedAmount: number; message?: string }) => {
      const response = await apiRequest("POST", "/api/negotiations", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setNegotiateDialogOpen(false);
      setProposedAmount("");
      setNegotiationMessage("");
      toast({
        title: "Negotiation Sent",
        description: "Your cost proposal has been sent to the partner.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send negotiation",
        variant: "destructive",
      });
    },
  });

  const confirmDeliveryMutation = useMutation({
    mutationFn: async (data: { shipmentId: string; customerCode: string; proofOfDelivery: string }) => {
      const response = await apiRequest("PATCH", `/api/shipments/${data.shipmentId}`, {
        status: "delivered",
        proofOfDelivery: data.proofOfDelivery,
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setDeliveryConfirmDialogOpen(false);
      setCustomerCodeInput("");
      setCodeError("");
      toast({
        title: "Delivery Confirmed",
        description: "Shipment has been marked as delivered. Payment will be processed shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm delivery",
        variant: "destructive",
      });
    },
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages", selectedShipment?.id],
    enabled: !!selectedShipment?.id && chatDialogOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { shipmentId: string; receiverId: string; message: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedShipment?.id] });
      setChatMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the partner.",
      });
    },
  });

  const handleNegotiate = (shipment: any) => {
    setSelectedShipment(shipment);
    setProposedAmount(shipment.offeredAmount?.toString() || "");
    setNegotiateDialogOpen(true);
  };

  const submitNegotiation = () => {
    if (!selectedShipment || !proposedAmount) return;

    createNegotiationMutation.mutate({
      shipmentId: selectedShipment.id,
      proposedAmount: parseFloat(proposedAmount),
      message: negotiationMessage || undefined,
    });
  };

  const handleConfirmDelivery = (shipment: any) => {
    setSelectedShipment(shipment);
    setCustomerCodeInput("");
    setCodeError("");
    setDeliveryConfirmDialogOpen(true);
  };

  const submitDeliveryConfirmation = () => {
    if (!selectedShipment) return;

    const inputCode = customerCodeInput.trim().toUpperCase();
    
    if (inputCode.length !== 8) {
      setCodeError("Customer code must be exactly 8 characters");
      return;
    }

    confirmDeliveryMutation.mutate({
      shipmentId: selectedShipment.id,
      customerCode: inputCode,
      proofOfDelivery: `Delivered and verified with code: ${inputCode}`,
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedShipment) return;

    sendMessageMutation.mutate({
      shipmentId: selectedShipment.id,
      receiverId: selectedShipment.partnerId,
      message: chatMessage,
    });
  };

  const availableShipments = shipments.filter((s: any) => 
    s.status === "pending" && !s.agentId
  );
  const activeShipments = shipments.filter((s: any) => 
    s.status === "agent_accepted" || s.status === "in_transit"
  );
  const completedShipments = shipments.filter((s: any) => s.status === "delivered");

  const totalEarnings = earnings.reduce((sum: number, e: any) => sum + e.agentAmount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Agent Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Discover job opportunities in your region
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Available Jobs"
          value={availableShipments.length.toString()}
          icon={Package}
          data-testid="stat-available-jobs"
        />
        <StatCard
          title="Active Deliveries"
          value={activeShipments.length.toString()}
          icon={Package}
          data-testid="stat-active-deliveries"
        />
        <StatCard
          title="Completed This Month"
          value={completedShipments.length.toString()}
          icon={CheckCircle}
          data-testid="stat-completed-jobs"
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings, "NGN")}
          icon={DollarSign}
          data-testid="stat-total-earnings"
        />
      </div>

      <Tabs defaultValue="offers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="offers" data-testid="tab-offers">Job Offers</TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active-jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-jobs">Completed</TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4 mt-6">
          {availableShipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No job offers available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableShipments.map((shipment: any) => (
                <JobOfferCard
                  key={shipment.id}
                  id={shipment.id}
                  origin={shipment.origin}
                  destination={shipment.destination}
                  cargoType={shipment.cargoType}
                  weight={`${shipment.weight} kg`}
                  pickupDate={new Date(shipment.pickupDate).toLocaleDateString()}
                  requestedCost={shipment.offeredAmount}
                  partnerName="Partner"
                  onAccept={() => acceptShipmentMutation.mutate(shipment.id)}
                  onDecline={() => declineShipmentMutation.mutate(shipment.id)}
                  onRaiseCost={() => handleNegotiate(shipment)}
                  data-testid={`job-offer-${shipment.id}`}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeShipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No active deliveries</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeShipments.map((shipment: any) => (
                <div key={shipment.id} className="space-y-2">
                  <ShipmentCard
                    {...shipment}
                    onView={() => {
                      setSelectedShipment(shipment);
                      setChatDialogOpen(true);
                    }}
                    data-testid={`shipment-card-${shipment.id}`}
                  />
                  {shipment.status === "in_transit" && (
                    <Button 
                      onClick={() => handleConfirmDelivery(shipment)}
                      className="w-full"
                      variant="default"
                      data-testid={`button-confirm-delivery-${shipment.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Delivery
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedShipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No completed deliveries to display</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedShipments.map((shipment: any) => (
                <ShipmentCard
                  key={shipment.id}
                  {...shipment}
                  onView={() => {
                    setSelectedShipment(shipment);
                    setChatDialogOpen(true);
                  }}
                  data-testid={`completed-shipment-${shipment.id}`}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4 mt-6">
          {earnings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No earnings records yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Delivered Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Your Earnings (95%)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium" data-testid={`earnings-shipment-${payment.id}`}>
                        {payment.shipmentId}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell className="text-primary font-semibold" data-testid={`earnings-amount-${payment.id}`}>
                        {formatCurrency(payment.agentAmount, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === "payout_completed" ? "default" : "outline"}
                          data-testid={`earnings-status-${payment.id}`}
                        >
                          {payment.status === "payout_completed" ? "Paid" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Negotiation Dialog */}
      <Dialog open={negotiateDialogOpen} onOpenChange={setNegotiateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose New Cost</DialogTitle>
            <DialogDescription>
              Enter your proposed cost for this shipment. The partner will need to approve the new cost.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="proposed-amount">
                Proposed Amount ({selectedShipment?.currency || "NGN"})
              </Label>
              <Input
                id="proposed-amount"
                type="number"
                step="0.01"
                placeholder="1500.00"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                data-testid="input-proposed-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="negotiation-message">Message (Optional)</Label>
              <Textarea
                id="negotiation-message"
                placeholder="Explain why you're proposing this amount..."
                value={negotiationMessage}
                onChange={(e) => setNegotiationMessage(e.target.value)}
                rows={3}
                data-testid="textarea-negotiation-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNegotiateDialogOpen(false)}
              data-testid="button-cancel-negotiation"
            >
              Cancel
            </Button>
            <Button
              onClick={submitNegotiation}
              disabled={createNegotiationMutation.isPending || !proposedAmount}
              data-testid="button-submit-negotiation"
            >
              {createNegotiationMutation.isPending ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={deliveryConfirmDialogOpen} onOpenChange={setDeliveryConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedShipment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  Confirm Delivery
                </DialogTitle>
                <DialogDescription>
                  Enter the 8-character customer code to confirm delivery and receive payment
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipment ID:</span>
                    <span className="font-medium">{selectedShipment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedShipment.negotiatedAmount || selectedShipment.offeredAmount,
                        selectedShipment.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Earnings (95%):</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(
                        (selectedShipment.negotiatedAmount || selectedShipment.offeredAmount) * 0.95,
                        selectedShipment.currency
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-code">Customer Code</Label>
                  <Input
                    id="customer-code"
                    type="text"
                    placeholder="Enter 8-character code"
                    value={customerCodeInput}
                    onChange={(e) => {
                      setCustomerCodeInput(e.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    maxLength={8}
                    className={codeError ? "border-destructive" : ""}
                    data-testid="input-customer-code"
                  />
                  {codeError && (
                    <Alert variant="destructive">
                      <AlertDescription>{codeError}</AlertDescription>
                    </Alert>
                  )}
                  <p className="text-sm text-muted-foreground">
                    The partner provided this code at payment. It must match exactly.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeliveryConfirmDialogOpen(false);
                    setCodeError("");
                    setCustomerCodeInput("");
                  }}
                  data-testid="button-cancel-delivery"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitDeliveryConfirmation}
                  disabled={confirmDeliveryMutation.isPending || customerCodeInput.length !== 8}
                  data-testid="button-submit-delivery"
                >
                  {confirmDeliveryMutation.isPending ? "Confirming..." : "Confirm Delivery"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Chat with Partner</DialogTitle>
            <DialogDescription>
              Discuss shipment details with the partner
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-md">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === selectedShipment?.agentId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === selectedShipment?.agentId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
