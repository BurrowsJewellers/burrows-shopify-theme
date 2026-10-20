import { FINGER_SIZES } from "../lib/ring-options";
import { innerDiameterMm } from "../lib/ring-3d-options";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger className="mb-2 text-xs text-primary underline underline-offset-4">Size guide</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finding your ring size</DialogTitle>
          <DialogDescription>Australian sizes. For the most accurate fit, visit us in store for a free sizing.</DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-foreground">
          <li>Wrap a thin strip of paper or string around the base of your finger.</li>
          <li>Mark where it overlaps and measure the length in millimetres.</li>
          <li>Match that measurement to the circumference column below.</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Measure at the end of the day when fingers are warmest. Wide bands (6mm+) fit snugger — consider half a size up.
          Or measure the inside of a ring that fits well and use the diameter column.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
              <th className="py-2">Size</th><th>Diameter</th><th>Circumference</th>
            </tr>
          </thead>
          <tbody>
            {FINGER_SIZES.map((s) => {
              const d = innerDiameterMm(s, FINGER_SIZES);
              return (
                <tr key={s} className="border-b border-border/50">
                  <td className="py-1.5 font-medium">{s}</td>
                  <td>{d.toFixed(1)}mm</td>
                  <td>{(Math.PI * d).toFixed(1)}mm</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  );
}
