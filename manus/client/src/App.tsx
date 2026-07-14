import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Lobby from "./pages/Lobby";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import GameOver from "./pages/GameOver";

/**
 * Pacman Arcade Frontend - Brutalist UI
 * 
 * Design Philosophy:
 * - Heavy borders, thick drop shadows, saturated accent colors
 * - Monospaced typography for all UI labels and data
 * - Off-white background with black text for maximum contrast
 * - Yellow (#FFD700) as primary accent for actions and energy
 * - No rounded corners; all sharp right angles
 */

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/lobby"} component={Lobby} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/gameover"} component={GameOver} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
