// @radix-ui/react-dialog with its portal kept inside the designer's shadow root, so the size guide dialog gets
// Mark's styles (a portal on document.body would be outside them).
import * as React from "react";
import * as Real from "radix-dialog-real";
import { portalHost } from "./host";

export * from "radix-dialog-real";
export const Portal = (props: React.ComponentProps<typeof Real.Portal>) => <Real.Portal container={props.container ?? portalHost()} {...props} />;
