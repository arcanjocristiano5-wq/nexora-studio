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
 * ErrorBoundary class component to catch rendering errors.
 */
// Fix: Extending React.Component explicitly to ensure inheritance of setState and props is recognized
class ErrorBoundary extends React.Component<Props, State> {
  // State initialization with property initializer
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Jabuti detectou anomalia crítica:", error, errorInfo);
  }
  
  // handleReset method correctly uses this.setState inherited from the Component class
  private handleReset = () => {
    // Fix: Using this.setState inherited from React.Component
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

    // Fix: Access children prop which is inherited from the base React.Component class
    return this.props.children;
  }
}

export default ErrorBoundary;