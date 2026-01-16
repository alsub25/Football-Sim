import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="card-header" style={{ background: 'var(--danger)', color: 'white' }}>
              ⚠️ Something went wrong
            </div>
            <div style={{ padding: '2rem' }}>
              <p style={{ marginBottom: '1rem' }}>
                An error occurred while simulating the game. This might happen due to data corruption or unexpected game state.
              </p>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Error: {this.state.error?.message || 'Unknown error'}
              </p>
              <button 
                className="btn-primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
