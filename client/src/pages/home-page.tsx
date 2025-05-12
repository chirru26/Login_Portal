import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { StarField } from "@/components/star-field";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <StarField />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md border border-primary/20 backdrop-blur-sm bg-background/80 shadow-lg shadow-primary/10">
        <CardHeader className="text-center border-b border-primary/10 pb-6">
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Welcome, {user?.username}!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-6">
          <p className="text-muted-foreground mb-6 text-center">You have successfully logged in to your account.</p>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="mt-4 border-primary/20 hover:bg-primary/5 hover:text-primary"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
