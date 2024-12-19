import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">
                            Oops! Ceva nu a mers bine.
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Am întâmpinat o eroare neașteptată. Te rugăm să reîncarci pagina sau să încerci din nou mai târziu.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                        >
                            Reîncarcă pagina
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
                                <pre className="text-sm text-red-600">
                                    {this.state.error.toString()}
                                </pre>
                                <pre className="text-sm text-gray-600 mt-2">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
