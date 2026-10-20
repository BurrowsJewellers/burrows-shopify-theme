// Stand-in for @tanstack/react-router. Mark's pages are route files (createFileRoute) and use <Link>, <ClientOnly>
// and notFound; on Shopify there is no router: the page chooses which of his pages to show (main.tsx) and links
// become ordinary links to the website's pages.
import type { ReactNode } from "react";
import { CONFIG } from "./config";

type RouteState = { loaderData?: unknown; search?: unknown };
let current: RouteState = {};
export const setRouteState = (s: RouteState) => { current = s; };

export function createFileRoute(_path: string) {
  return (options: Record<string, any>) => ({
    options,
    component: options.component,
    useLoaderData: () => current.loaderData as any,
    useSearch: () => current.search as any,
  });
}

export function notFound(): Error { return new Error("Not found"); }

export function ClientOnly({ children }: { children: ReactNode; fallback?: ReactNode }) {
  return <>{children}</>;
}

function hrefFor(to: string, params?: Record<string, string>): string {
  if (to === "/catalogue") return CONFIG.catalogueUrl;
  if (to === "/rings/$ringId" && params?.ringId) return `${CONFIG.pageUrl}?ring=${encodeURIComponent(params.ringId)}`;
  return CONFIG.pageUrl;
}

export function Link({ to, params, children, ...rest }: { to: string; params?: Record<string, string>; children?: ReactNode; [k: string]: any }) {
  const { search: _s, hash: _h, preload: _p, activeProps: _a, inactiveProps: _i, ...anchor } = rest;
  return <a href={hrefFor(to, params)} {...anchor}>{children}</a>;
}
