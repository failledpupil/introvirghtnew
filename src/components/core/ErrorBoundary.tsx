import { Component, type ErrorInfo, type ReactNode } from 'react';
import { VAPICard, VAPIText, VAPIButton } from '../ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <VAPICard className="p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">😔</div>
            <VAPIText as="h2" type="accent" className="text-2xl font-bold mb-4">
              Something went wrong
            </VAPIText>
            <VAPIText type="secondary" className="mb-6">
              We're sorry, but something unexpected happened. Your data is safe.
            </VAPIText>
            
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm opacity-70 hover:opacity-100">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3">
              <VAPIButton
                variant="secondary"
                onClick={this.handleReset}
                className="flex-1"
              >
                Try Again
              </VAPIButton>
              <VAPIButton
                onClick={this.handleReload}
                className="flex-1"
              >
                Reload App
              </VAPIButton>
            </div>
          </VAPICard>
        </div>
      );
    }

    return this.props.children;
  }
}