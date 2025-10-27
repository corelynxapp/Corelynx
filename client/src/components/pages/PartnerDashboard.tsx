import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, Plus, BarChart3, FileText, MapPin, Calendar, MessageSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { ShipmentCard } from "@/components/ShipmentCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ShipmentFormData {
  origin: string;
  destination: string;
  shipmentType: string;
  cargoType: string;
  weight: string;
  distance: string;
  pickupDate: string;
  notes: string;
  currency: string;
  offeredAmount: string;
}

export function PartnerDashboard() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [customerCodeInput, setCustomerCodeInput] = useState("");
  const [selectedShipmentType, setSelectedShipmentType] = useState<string>("delivery");

  const { data: shipments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/shipments"],
  });

  const { data: paymentsData = [] } = useQuery<any[]>({
    queryKey: ["/api/payments/spending"],
  });

  const createShipmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/shipments", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setCreateDialogOpen(false);
      toast({
        title: "Shipment Created",
        description: "Your shipment has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create shipment",
        variant: "destructive",
      });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: { shipmentId: string; amount: number; currency: string; customerCode: string }) => {
      const response = await apiRequest("POST", "/api/payments", data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/spending"] });
      setPaymentDialogOpen(false);
      setCustomerCodeInput("");
      toast({
        title: "Payment Successful",
        description: `Your customer code is: ${data.customerCode}`,
        duration: 10000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages", selectedShipment?.id],
    enabled: !!selectedShipment?.id,
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
        description: "Your message has been sent to the agent.",
      });
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: ShipmentFormData = {
      origin: (form.elements.namedItem('origin') as HTMLInputElement).value,
      destination: (form.elements.namedItem('destination') as HTMLInputElement)?.value || '',
      shipmentType: (form.elements.namedItem('shipmentType') as HTMLSelectElement).value,
      cargoType: (form.elements.namedItem('cargoType') as HTMLInputElement).value,
      weight: (form.elements.namedItem('weight') as HTMLInputElement).value,
      distance: (form.elements.namedItem('distance') as HTMLInputElement).value,
      pickupDate: (form.elements.namedItem('pickupDate') as HTMLInputElement).value,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
      currency: (form.elements.namedItem('currency') as HTMLSelectElement).value,
      offeredAmount: (form.elements.namedItem('offeredAmount') as HTMLInputElement).value,
    };

    createShipmentMutation.mutate({
      origin: formData.origin,
      destination: formData.destination || null,
      shipmentType: formData.shipmentType,
      cargoType: formData.cargoType,
      weight: parseFloat(formData.weight),
      distance: parseFloat(formData.distance),
      pickupDate: new Date(formData.pickupDate).toISOString(),
      notes: formData.notes,
      currency: formData.currency,
      offeredAmount: parseFloat(formData.offeredAmount),
    });
  };

  const handlePayment = () => {
    if (!selectedShipment) return;
    
    if (customerCodeInput.length !== 8) {
      toast({
        title: "Invalid Code",
        description: "Customer code must be exactly 8 characters",
        variant: "destructive",
      });
      return;
    }

    createPaymentMutation.mutate({
      shipmentId: selectedShipment.id,
      amount: selectedShipment.negotiatedAmount || selectedShipment.offeredAmount,
      currency: selectedShipment.currency,
      customerCode: customerCodeInput.toUpperCase(),
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedShipment) return;

    sendMessageMutation.mutate({
      shipmentId: selectedShipment.id,
      receiverId: selectedShipment.agentId,
      message: chatMessage,
    });
  };

  const pendingShipments = shipments.filter((s: any) => s.status === "pending");
  const activeShipments = shipments.filter((s: any) => 
    s.status === "agent_accepted" || s.status === "in_transit"
  );
  const completedShipments = shipments.filter((s: any) => s.status === "delivered");

  const totalSpent = paymentsData.reduce((sum: number, p: any) => sum + p.amount, 0);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Partner Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your shipments and track performance
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-create-shipment">
              <Plus className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Shipment</DialogTitle>
              <DialogDescription>
                Enter shipment details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shipmentType">Shipment Type</Label>
                <Select 
                  name="shipmentType" 
                  defaultValue="delivery" 
                  onValueChange={setSelectedShipmentType}
                  required
                >
                  <SelectTrigger data-testid="select-shipment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup_only">Pickup Only</SelectItem>
                    <SelectItem value="delivery">Door to Door Delivery</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {selectedShipmentType === "pickup_only" 
                    ? "Agent picks up cargo from origin only" 
                    : "Agent picks up cargo and delivers to destination address"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin Address</Label>
                  <Input
                    id="origin"
                    name="origin"
                    placeholder="123 Main St, City, State ZIP"
                    required
                    data-testid="input-origin"
                  />
                </div>
                {selectedShipmentType === "delivery" && (
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination Address</Label>
                    <Input
                      id="destination"
                      name="destination"
                      placeholder="456 Oak Ave, City, State ZIP"
                      required
                      data-testid="input-destination"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargoType">Cargo Type</Label>
                  <Input
                    id="cargoType"
                    name="cargoType"
                    placeholder="Electronics, Furniture, etc."
                    required
                    data-testid="input-cargo-type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    required
                    data-testid="input-weight"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    name="distance"
                    type="number"
                    step="0.01"
                    placeholder="150"
                    required
                    data-testid="input-distance"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue="NGN" required>
                    <SelectTrigger data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (Nigerian Naira)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      <SelectItem value="ZAR">ZAR (South African Rand)</SelectItem>
                      <SelectItem value="KES">KES (Kenyan Shilling)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup Date</Label>
                <Input
                  id="pickupDate"
                  name="pickupDate"
                  type="date"
                  required
                  data-testid="input-pickup-date"
                />
                <p className="text-xs text-muted-foreground">
                  Expected completion date will be set when agent accepts the pickup
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offeredAmount">Offered Amount</Label>
                <Input
                  id="offeredAmount"
                  name="offeredAmount"
                  type="number"
                  step="0.01"
                  placeholder="1500.00"
                  required
                  data-testid="input-offered-amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special instructions or requirements..."
                  rows={3}
                  data-testid="textarea-notes"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createShipmentMutation.isPending}
                  data-testid="button-submit-shipment"
                >
                  {createShipmentMutation.isPending ? "Creating..." : "Create Shipment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Shipments"
          value={shipments.length.toString()}
          icon={Package}
          data-testid="stat-total-shipments"
        />
        <StatCard
          title="Active Shipments"
          value={activeShipments.length.toString()}
          icon={Truck}
          data-testid="stat-active-shipments"
        />
        <StatCard
          title="Completed"
          value={completedShipments.length.toString()}
          icon={CheckCircle}
          data-testid="stat-completed-shipments"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent, "NGN")}
          icon={BarChart3}
          data-testid="stat-total-spent"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all">All Shipments</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Completed</TabsTrigger>
          <TabsTrigger value="spending" data-testid="tab-spending">Spending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {shipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No shipments yet. Create your first shipment to get started.</p>
              </CardContent>
            </Card>
          ) : (
            shipments.map((shipment: any) => (
              <ShipmentCard
                key={shipment.id}
                {...shipment}
                onView={() => {
                  setSelectedShipment(shipment);
                  setDetailsDialogOpen(true);
                }}
                data-testid={`shipment-card-${shipment.id}`}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingShipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending shipments</p>
              </CardContent>
            </Card>
          ) : (
            pendingShipments.map((shipment: any) => (
              <ShipmentCard
                key={shipment.id}
                {...shipment}
                onView={() => {
                  setSelectedShipment(shipment);
                  setDetailsDialogOpen(true);
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeShipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No active shipments</p>
              </CardContent>
            </Card>
          ) : (
            activeShipments.map((shipment: any) => (
              <ShipmentCard
                key={shipment.id}
                {...shipment}
                onView={() => {
                  setSelectedShipment(shipment);
                  setDetailsDialogOpen(true);
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedShipments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No completed shipments</p>
              </CardContent>
            </Card>
          ) : (
            completedShipments.map((shipment: any) => (
              <ShipmentCard
                key={shipment.id}
                {...shipment}
                onView={() => {
                  setSelectedShipment(shipment);
                  setDetailsDialogOpen(true);
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="spending" className="space-y-4 mt-6">
          {paymentsData.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No spending records yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Customer Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsData.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium" data-testid={`spending-shipment-${payment.id}`}>
                        {payment.shipmentId}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold" data-testid={`spending-amount-${payment.id}`}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`spending-code-${payment.id}`}>
                        {payment.customerCode}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === "paid" ? "default" : "outline"}
                          data-testid={`spending-status-${payment.id}`}
                        >
                          {payment.status}
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

      {/* Shipment Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              View and manage shipment information
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Shipment ID</Label>
                  <p className="font-medium">{selectedShipment.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Origin</Label>
                  <p className="font-medium">{selectedShipment.origin}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destination</Label>
                  <p className="font-medium">{selectedShipment.destination}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Cargo Type</Label>
                  <p className="font-medium">{selectedShipment.cargoType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Weight</Label>
                  <p className="font-medium">{selectedShipment.weight} kg</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Distance</Label>
                  <p className="font-medium">{selectedShipment.distance} km</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Offered Amount</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedShipment.offeredAmount, selectedShipment.currency)}
                  </p>
                </div>
              </div>

              {selectedShipment.negotiatedAmount && (
                <div>
                  <Label className="text-muted-foreground">Negotiated Amount</Label>
                  <p className="font-medium text-lg">
                    {formatCurrency(selectedShipment.negotiatedAmount, selectedShipment.currency)}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {selectedShipment.status === "agent_accepted" && (
                  <Button
                    onClick={() => {
                      setPaymentDialogOpen(true);
                      setDetailsDialogOpen(false);
                    }}
                    data-testid="button-make-payment"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Make Payment
                  </Button>
                )}
                {selectedShipment.agentId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setChatDialogOpen(true);
                      setDetailsDialogOpen(false);
                    }}
                    data-testid="button-open-chat"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with Agent
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Complete payment to activate shipment. Enter a unique 8-character customer code.
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-4">
              <div>
                <Label>Amount to Pay</Label>
                <p className="text-2xl font-semibold">
                  {formatCurrency(
                    selectedShipment.negotiatedAmount || selectedShipment.offeredAmount,
                    selectedShipment.currency
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerCode">Customer Code (8 characters)</Label>
                <Input
                  id="customerCode"
                  value={customerCodeInput}
                  onChange={(e) => setCustomerCodeInput(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="ABCD1234"
                  data-testid="input-customer-code"
                />
                <p className="text-sm text-muted-foreground">
                  This code will be used to verify delivery completion
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPaymentDialogOpen(false)}
                  data-testid="button-cancel-payment"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={createPaymentMutation.isPending || customerCodeInput.length !== 8}
                  data-testid="button-confirm-payment"
                >
                  {createPaymentMutation.isPending ? "Processing..." : "Confirm Payment"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Chat with Agent</DialogTitle>
            <DialogDescription>
              Discuss shipment details with your assigned agent
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
                    className={`flex ${msg.senderId === selectedShipment?.partnerId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === selectedShipment?.partnerId
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
