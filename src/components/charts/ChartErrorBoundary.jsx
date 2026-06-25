"use client";

import { Component } from "react";
import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";

export default class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Replace with your logger (e.g. Sentry) when available
    console.error("[ChartErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
          <AlertCircleIcon className="size-8 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            Something went wrong loading the chart.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset?.();
            }}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <RefreshCwIcon className="size-3" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
