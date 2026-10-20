import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RingDesigner } from "../components/RingDesigner";

vi.mock("@tanstack/react-router", () => ({
  ClientOnly: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("../components/Ring3D", () => ({
  default: () => <div data-testid="interactive-ring">Interactive ring</div>,
}));
vi.mock("../lib/pricing/use-ring-price", () => ({
  useRingPrice: () => ({ status: "ok", price: 1890 }),
}));
vi.mock("../lib/shopify-cart", () => ({
  DEPOSIT_AUD: 200,
  createDepositCart: vi.fn(),
}));

describe("IN1915 preview", () => {
  it("keeps the reference photo labelled and the 50-stone specification when options change", () => {
    render(<RingDesigner initialRingId="in1915" shared={{ stone: "Ruby" }} />);

    const reference = screen.getByRole("img", {
      name: /IN1915 reference photo/,
    });
    expect(reference).toHaveAttribute("src", "/images/875244c7-in1915-zirconium.jpg");
    expect(screen.getByText(/This photo does not change with your selections/)).toBeInTheDocument();
    expect(
      screen.getByText(/The ring specification remains 50 brilliant-cut stones/),
    ).toBeInTheDocument();
    expect(screen.getByText(/50 × 1.3mm brilliant-cut Ruby/)).toBeInTheDocument();
    expect(screen.queryByTestId("interactive-ring")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sapphire" }));
    expect(screen.getByText(/50 × 1.3mm brilliant-cut Sapphire/)).toBeInTheDocument();
    expect(reference).toHaveAttribute(
      "alt",
      "IN1915 reference photo in black zirconium with black diamonds",
    );
    expect(screen.queryByTestId("interactive-ring")).not.toBeInTheDocument();
  });

  it("retains interactive previews for other ring styles", async () => {
    render(<RingDesigner initialRingId="in6004" />);
    expect(await screen.findByTestId("interactive-ring")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /IN1915 reference photo/ })).not.toBeInTheDocument();
  });
});
