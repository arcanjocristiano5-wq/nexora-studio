
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
 * Fix: Explicitly extending Component from React to resolve TypeScript issues with state, setState, and props visibility.
 */
class ErrorBoundary extends Component<Props, State> {
  // Initialize state with property initializer.
  public state: State = {
    hasError: false,
    error: null,
  };

  // Update state so the next render will show the fallback UI.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Log the error to an error reporting service.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  
  // Resets the error boundary state. Arrow function ensures proper 'this' context.
  private handleReset = () => {
    // Fix: setState is correctly inherited from the Component base class.
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  // Standard React render method.
  public render() {
    // Access state and props from current instance.
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
    // Fix: props.children is inherited from the Component base class.
    return this.props.children;
  }
}

export default ErrorBoundary;
