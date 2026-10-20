// Mark's price hook, asking the wedding ring API on the droplet (same Infinity lookup as his /api/wedding-ring-price
// route, same request and reply) instead of his Lovable server.
import { useEffect, useRef, useState } from "react";
import type { PriceConfig } from "../mark/src/lib/pricing/ring-price";
import { CONFIG } from "./config";

export type PriceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; price: number; checkedAt: string }
  | { status: "unavailable" };

/** Debounced (350ms), abortable, request-ID guarded price lookup. Old prices are cleared on every change. */
export function useRingPrice(config: PriceConfig | null): PriceState {
  const [state, setState] = useState<PriceState>({ status: "idle" });
  const reqId = useRef(0);
  const key = config ? JSON.stringify(config) : "";
  useEffect(() => {
    const id = ++reqId.current;
    if (!config) { setState({ status: "idle" }); return; }
    setState({ status: "loading" });
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${CONFIG.apiBase}/price`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: key,
          signal: ctrl.signal,
        });
        const body = (await res.json()) as { price?: unknown; checkedAt?: unknown };
        if (id !== reqId.current) return;
        if (!res.ok || typeof body.price !== "number" || !(body.price > 0) || typeof body.checkedAt !== "string") throw new Error();
        setState({ status: "ok", price: body.price, checkedAt: body.checkedAt });
      } catch {
        if (id === reqId.current && !ctrl.signal.aborted) setState({ status: "unavailable" });
      }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}
