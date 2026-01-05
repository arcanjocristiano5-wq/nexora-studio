
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
 * Fix: Correctly extending React.Component with proper type parameters to resolve state and props errors.
 */
class ErrorBoundary extends Component<Props, State> {
  // Use constructor for initial state
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service.
    console.error("Uncaught error:", error, errorInfo);
  }
  
  // Resets the error boundary state to allow re-rendering the application after an error.
  private handleReset = () => {
    // Reset state via this.setState
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  public override render() {
    // If an error was caught, render the custom ErrorOverlay component.
    const { hasError, error } = this.state;
    if (hasError && error) {
      return (
        <ErrorOverlay 
          error={error} 
          resetErrorBoundary={this.handleReset} 
        />
      );
    }

    // Otherwise, render the children components as normal.
    return this.props.children;
  }
}

export default ErrorBoundary;
