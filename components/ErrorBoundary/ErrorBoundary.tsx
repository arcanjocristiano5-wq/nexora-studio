import React, { ErrorInfo, ReactNode } from 'react';
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
// FIX: The ErrorBoundary class must extend React.Component to be a valid React component. This provides access to lifecycle methods and properties like `state`, `props`, and `setState`, resolving the reported errors.
// FIX: Extended React.Component to make this a valid class component, giving it access to `this.props` and `this.setState`.
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