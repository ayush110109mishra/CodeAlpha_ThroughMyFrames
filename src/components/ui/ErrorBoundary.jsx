import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from './Button';

/**
 * ==============================================================================
 * Global React Error Boundary
 * ==============================================================================
 * Prevents white-screen crashes and renders an editorial recovery experience.
 */

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6 selection:bg-accent-soft">
          <div className="max-w-md w-full bg-surface border border-line rounded-3xl p-8 sm:p-10 shadow-warm-lg text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-2xs font-mono uppercase tracking-widest text-accent font-semibold">
                Moment Interrupted
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink">
                A Quiet Pause in the Frame
              </h1>
              <p className="text-xs text-muted leading-relaxed font-sans">
                An unexpected condition momentarily clouded this view. You can reload the canvas or return to the main gallery.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={RotateCcw}
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                Reload Canvas
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={Home}
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
