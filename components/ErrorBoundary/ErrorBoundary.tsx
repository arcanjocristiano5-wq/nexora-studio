
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
 * ErrorBoundary component for catching errors in child components.
 * Strictly follows React.Component class definition to ensure property inheritance.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state so the next render will show the fallback UI.
   */
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  /**
   * Log the error to an error reporting service.
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  
  /**
   * Resets the error boundary state and reloads the application.
   */
  private handleReset = () => {
    // setState is inherited from React.Component
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  /**
   * Standard React render method.
   */
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

    // props is inherited from React.Component
    return this.props.children;
  }
}

export default ErrorBoundary;
