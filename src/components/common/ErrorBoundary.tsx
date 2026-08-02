import React from 'react';
import ErrorState from './ErrorState';

interface Props { children: React.ReactNode; label?: string }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Something went wrong rendering this section.' };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return <ErrorState message={`${this.props.label ?? 'This section'} failed to render: ${this.state.message}`} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
