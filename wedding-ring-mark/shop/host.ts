// The shadow root the designer lives in, and the node inside it where dialogs open.
let host: HTMLElement | null = null;
let root: ShadowRoot | null = null;
export const setHost = (h: HTMLElement, r: ShadowRoot) => { host = h; root = r; };
export const shadow = () => root;
export const hostElement = () => host;
export const portalHost = (): HTMLElement | undefined => (root?.querySelector<HTMLElement>("[data-wr-portal]") ?? undefined);
