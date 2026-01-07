import React, { ErrorInfo, ReactNode } from 'react';
import ErrorOverlay from './ErrorOverlay';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// FIX: To function as a React Error Boundary, this class must extend React.Component. This provides access to lifecycle methods, state (`this.setState`), and props (`this.props`).
class ErrorBoundary extends React.Component<Props, State> {
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
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  public render() {
    const { hasError, error } = this.state;
    
    if (hasError && error) {
      return (
        <ErrorOverlay 
          error={error} 
          resetErrorBoundary={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;