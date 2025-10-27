import { useState } from "react";
import { Users, UserCheck, Shield, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";

export function AdminDashboard() {
  const { toast } = useToast();

  const { data: pendingUsers = [], isLoading: loadingPendingUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-users"],
  });

  const { data: pendingPayouts = [], isLoading: loadingPayouts } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-payouts"],
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/approve-user/${userId}`);
      return await response.json();
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "User Approved",
        description: "User has been approved and can now access the platform.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve user",
        variant: "destructive",
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("POST", `/api/admin/reject-user/${userId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "User Rejected",
        description: "User application has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject user",
        variant: "destructive",
      });
    },
  });

  const processPayoutMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await apiRequest("POST", `/api/admin/process-payout/${paymentId}`);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-payouts"] });
      toast({
        title: "Payout Processed",
        description: `Payment has been processed successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process payout",
        variant: "destructive",
      });
    },
  });

  const activeAgents = pendingUsers.filter((u: any) => u.role === "agent" && u.isApproved).length;
  const activePartners = pendingUsers.filter((u: any) => u.role === "partner" && u.isApproved).length;

  if (loadingPendingUsers || loadingPayouts) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage users and monitor system health
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Approvals"
          value={pendingUsers.length.toString()}
          icon={Users}
          data-testid="stat-pending-approvals"
        />
        <StatCard
          title="Pending Payouts"
          value={pendingPayouts.length.toString()}
          icon={CheckCircle}
          data-testid="stat-pending-payouts"
        />
        <StatCard
          title="Active Agents"
          value={activeAgents.toString()}
          icon={UserCheck}
          data-testid="stat-active-agents"
        />
        <StatCard
          title="Active Partners"
          value={activePartners.toString()}
          icon={Shield}
          data-testid="stat-active-partners"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending User Approvals</h2>
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending user approvals</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user: any) => {
                    const initials = user.fullName?.split(" ").map((n: string) => n[0]).join("") || "U";
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium" data-testid={`text-user-name-${user.id}`}>
                              {user.fullName || user.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-user-email-${user.id}`}>
                          {user.username}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveUserMutation.mutate(user.id)}
                              disabled={approveUserMutation.isPending}
                              data-testid={`button-approve-${user.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectUserMutation.mutate(user.id)}
                              disabled={rejectUserMutation.isPending}
                              data-testid={`button-reject-${user.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Agent Payouts</h2>
          {pendingPayouts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending payouts</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Agent Payment (95%)</TableHead>
                    <TableHead>Admin Fee (5%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayouts.map((payout: any) => {
                    const agentAmount = payout.amount * 0.95;
                    const adminFee = payout.amount * 0.05;
                    
                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium" data-testid={`text-shipment-${payout.id}`}>
                          {payout.shipmentId}
                        </TableCell>
                        <TableCell className="font-medium" data-testid={`text-total-${payout.id}`}>
                          {formatCurrency(payout.amount, payout.currency)}
                        </TableCell>
                        <TableCell className="text-primary font-semibold" data-testid={`text-agent-amount-${payout.id}`}>
                          {formatCurrency(agentAmount, payout.currency)}
                        </TableCell>
                        <TableCell className="text-muted-foreground" data-testid={`text-admin-fee-${payout.id}`}>
                          {formatCurrency(adminFee, payout.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => processPayoutMutation.mutate(payout.id)}
                            disabled={processPayoutMutation.isPending}
                            data-testid={`button-process-payout-${payout.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Process Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
