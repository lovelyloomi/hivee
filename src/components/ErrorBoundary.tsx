import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">Qualcosa è andato storto</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {this.state.error?.message || 'Si è verificato un errore imprevisto.'}
            </p>
          </div>
          <Button variant="outline" onClick={this.handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Riprova
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
