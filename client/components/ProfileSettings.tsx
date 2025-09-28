import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function useTheme() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    if (stored) {
      const dark = stored === "dark";
      root.classList.toggle("dark", dark);
      setIsDark(dark);
    } else {
      setIsDark(root.classList.contains("dark"));
    }
  }, []);

  const toggleWithAnimation = (next: boolean) => {
    // Ensure root has the transition class once (idempotent)
    const root = document.documentElement;
    root.classList.add('theme-transition');

    // Spawn overlay immediately for perceptual smoothness
    const overlay = document.createElement('div');
    overlay.className = 'theme-wipe-overlay';
    document.body.appendChild(overlay);

    // Immediately toggle theme so internal components transition colors
    root.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setIsDark(next);

    // Remove overlay after animation
    const timeout = window.setTimeout(() => overlay.remove(), 680);
    return () => { clearTimeout(timeout); overlay.remove(); };
  };

  return { isDark, animateToggle: toggleWithAnimation };
}

export default function ProfileSettings() {
  const { isDark, animateToggle } = useTheme();
  return (
    <HoverCard openDelay={80}>
      <HoverCardTrigger asChild>
        <button aria-label="Open settings" className="fixed bottom-5 right-5 z-40 rounded-full shadow-lg p-1 border bg-background">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">DP</AvatarFallback>
          </Avatar>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-80 mr-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">DP</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold leading-none">Danny Perojevic</p>
            <p className="text-sm text-muted-foreground">Admin</p>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Dark mode</Label>
            <Switch id="theme" checked={isDark} onCheckedChange={(v) => animateToggle(Boolean(v))} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif">Notifications</Label>
            <Switch id="notif" />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
