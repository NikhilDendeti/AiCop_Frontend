import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Hook for Sentry.captureException(_error) once configured; never log user data.
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center" role="alert">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-gray-600">Please reload the page. If this keeps happening, contact support.</p>
        <Button onClick={() => window.location.assign("/")}>Back to home</Button>
      </div>
    );
  }
}
