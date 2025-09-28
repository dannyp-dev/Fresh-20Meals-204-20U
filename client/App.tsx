import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SiteHeader from "@/components/layout/SiteHeader";
import CalendarSidebar from "@/components/CalendarSidebar";
import ProfileSettings from "@/components/ProfileSettings";
import { SearchProvider } from "@/context/SearchContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { useEffect } from 'react';
import { useSearch } from '@/context/SearchContext';
import { toast } from '@/components/ui/use-toast';

function VisionEventsBridge() {
  const { addManyToBag } = useSearch();
  useEffect(() => {
    function onDetected(e: Event) {
      const detail = (e as CustomEvent).detail as { ingredients?: string[]; model?: string };
      if (detail?.ingredients?.length) {
        const cleaned = detail.ingredients.map(i => i.replace(/_/g,' ').trim());
        addManyToBag(cleaned);
        toast({
          title: 'Ingredients added',
          description: cleaned.slice(0,8).join(', ') + (cleaned.length > 8 ? ` +${cleaned.length - 8} more` : ''),
        });
        // auto-open grocery bag for visibility
        window.dispatchEvent(new CustomEvent('open-grocery-bag'));
      } else {
        toast({ title: 'No ingredients found', description: 'Try a clearer photo or different angle.' });
      }
    }
    function onEmpty() {
      toast({ title: 'No ingredients detected', description: 'Image processed but nothing recognizable.' });
    }
    function onError(e: Event) {
      const detail = (e as CustomEvent).detail as { error?: string };
      toast({ title: 'Image scan failed', description: detail?.error || 'Unexpected error.' });
    }
    window.addEventListener('vision-ingredients-detected', onDetected as EventListener);
    window.addEventListener('vision-ingredients-empty', onEmpty as EventListener);
    window.addEventListener('vision-ingredients-error', onError as EventListener);
    return () => {
      window.removeEventListener('vision-ingredients-detected', onDetected as EventListener);
      window.removeEventListener('vision-ingredients-empty', onEmpty as EventListener);
      window.removeEventListener('vision-ingredients-error', onError as EventListener);
    };
  }, [addManyToBag]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SearchProvider>
        <ScheduleProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SiteHeader />
            <VisionEventsBridge />
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <CalendarSidebar />
          <ProfileSettings />
        </ScheduleProvider>
      </SearchProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
