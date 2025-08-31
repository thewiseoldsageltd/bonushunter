import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AdminNew from "@/pages/AdminNew";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/us" component={Home}/>
      <Route path="/uk" component={Home}/>
      <Route path="/ca" component={Home}/>
      <Route path="/eu" component={Home}/>
      <Route path="/nj" component={Home}/>
      <Route path="/pa" component={Home}/>
      <Route path="/nv" component={Home}/>
      <Route path="/ny" component={Home}/>
      <Route path="/mi" component={Home}/>
      <Route path="/admin" component={AdminNew}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
