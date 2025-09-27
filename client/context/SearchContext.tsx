import { createContext, useContext, useMemo, useState, ReactNode } from "react";

interface SearchCtx {
  query: string;
  setQuery: (v: string) => void;
}

const Ctx = createContext<SearchCtx | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSearch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
