import { Dashboard } from "@/components/Dashboard";
import { Toaster } from "@/components/ui/toaster";
import { GoalProvider } from "@/lib/context/GoalContext";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="gts-ui-theme">
      <GoalProvider>
        <div className="min-h-svh bg-background text-foreground">
          <Dashboard />
          <Toaster />
        </div>
      </GoalProvider>
    </ThemeProvider>
  );
}

export default App;
