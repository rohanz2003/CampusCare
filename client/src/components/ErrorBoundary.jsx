import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Without this, a single render error anywhere unmounts the whole tree and the
// user is left staring at a blank white page with only a console message.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center dark:bg-slate-950">
        <AlertTriangle size={34} className="text-amber-500" />
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Something broke on this page</h1>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            The page failed to render. Reloading usually clears it — you will stay signed in.
          </p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-primary inline-flex items-center gap-2">
          <RotateCcw size={15} /> Reload page
        </button>
      </div>
    );
  }
}
