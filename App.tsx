import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RadioChat from "@/pages/radio-chat";
import PrivateMessages from "@/pages/private-messages";
import ServerSettings from "@/pages/server-settings";
import BluetoothSettings from "@/pages/bluetooth-settings";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

// Add error boundary for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [callSign, setCallSign] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callSign.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        callSign: callSign.toUpperCase(),
        name: name.trim() || undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const user = await response.json();
      if (!user || !user.callSign) {
        throw new Error("Invalid user data received");
      }
      
      onLogin(user);
      toast({
        title: "Connected",
        description: `Welcome to RadioChat, ${user.callSign}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to connect to radio network",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-beach-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-beach-ocean/20 via-beach-turquoise/10 to-beach-sand/20"></div>
      <Card className="w-full max-w-md mx-4 bg-beach-surface/90 border-beach-border backdrop-blur-md relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <i className="fas fa-umbrella-beach text-beach-turquoise text-3xl animate-wave"></i>
            <CardTitle className="text-2xl font-bold text-white">Alcapten Chat</CardTitle>
          </div>
          <p className="text-gray-400">Enter your call sign to join the tropical chat network</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="callSign" className="text-gray-200">
                Call Sign *
              </Label>
              <Input
                id="callSign"
                type="text"
                placeholder="e.g., KJ4ABC"
                value={callSign}
                onChange={(e) => setCallSign(e.target.value.toUpperCase())}
                className="bg-beach-dark border-beach-border text-gray-200 focus:border-beach-turquoise"
                required
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-gray-200">
                Name (Optional)
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-beach-dark border-beach-border text-gray-200 focus:border-beach-turquoise"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-beach-turquoise hover:bg-beach-ocean text-white font-semibold"
              disabled={isLoading || !callSign.trim()}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Connecting...
                </>
              ) : (
                <>
                  <i className="fas fa-umbrella-beach mr-2"></i>
                  Connect to Beach Chat
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AppRouter() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <RadioChat user={user} />} />
      <Route path="/private-messages" component={() => <PrivateMessages user={user} onBack={() => window.location.href = '/'} />} />
      <Route path="/server-settings" component={() => <ServerSettings user={user} onBack={() => window.location.href = '/'} />} />
      <Route path="/bluetooth-settings" component={() => <BluetoothSettings user={user} onBack={() => window.location.href = '/'} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
