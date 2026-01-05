
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorOverlay from './ErrorOverlay';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary componente para capturar anomalias no fluxo da NEXORA.
 */
// Fix: Explicitly extend Component from 'react' to ensure TypeScript recognizes the inheritance and provides access to 'props' and 'setState'.
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Jabuti detectou anomalia crítica:", error, errorInfo);
  }
  
  private handleReset = () => {
    // Fix: Using setState inherited from the base Component class.
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  public render() {
    // Fix: Accessing state inherited from the base Component class.
    const { hasError, error } = this.state;
    
    if (hasError && error) {
      return (
        <ErrorOverlay 
          error={error} 
          resetErrorBoundary={this.handleReset} 
        />
      );
    }

    // Fix: Accessing props inherited from the base Component class.
    return this.props.children;
  }
}

export default ErrorBoundary;
