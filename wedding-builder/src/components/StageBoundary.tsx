// If the 3D model fails to load (a CDN hiccup, an old browser without WebGL), the designer keeps working and the
// stage says so, instead of the whole page going blank.
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; photo?: string; resetKey: string; onError?: () => void };
type State = { failed: boolean; key: string };

export class StageBoundary extends Component<Props, State> {
  state: State = { failed: false, key: this.props.resetKey };
  static getDerivedStateFromProps(props: Props, state: State): State | null {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null;
  }
  static getDerivedStateFromError(): Partial<State> { return { failed: true }; }
  componentDidCatch(e: unknown) { this.props.onError?.(); if (typeof console !== "undefined") console.warn("3D preview unavailable:", e); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <figure className="wr__photo wr__photo--fallback" id="stageFallback">
        {this.props.photo && <img src={this.props.photo} alt="" width={599} height={599} />}
        <figcaption>The 3D preview could not load. Your choices are listed in Review and the price is unaffected.</figcaption>
      </figure>
    );
  }
}
