import { Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  userName: string;
  userRole: "partner" | "agent" | "admin";
  onLogout: () => void;
}

export function AppHeader({ userName, userRole, onLogout }: AppHeaderProps) {
  const roleLabels = {
    partner: "Partner",
    agent: "Logistics Agent",
    admin: "Administrator",
  };

  const roleColors = {
    partner: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    agent: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    admin: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Corelynx Solution</h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className={roleColors[userRole]} data-testid="badge-user-role">
            {roleLabels[userRole]}
          </Badge>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium" data-testid="text-user-name">{userName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[userRole]}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
