import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches runtime errors and displays them gracefully
 * Prevents entire app from crashing on component errors
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Increment error counter
    const newCount = this.state.errorCount + 1;
    
    this.setState({
      error,
      errorInfo,
      errorCount: newCount
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
      console.log('Error logged:', error.toString());
    }

    // If too many errors, suggest page refresh
    if (newCount > 3) {
      console.warn('Multiple errors detected - suggest page refresh');
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-red-200 dark:border-red-800">
            
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                <AlertTriangle size={40} className="text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Header */}
            <h1 className="text-2xl font-black uppercase text-red-600 dark:text-red-400 text-center mb-2 tracking-tight">
              Dəhşətli Xəta!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 uppercase tracking-widest font-bold">
              Proqramda Problemə Rast Yetirik
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl mb-6">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words mb-2">
                  <span className="font-black text-red-600 dark:text-red-400">Xəta:</span> {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-y-auto max-h-24">
                    <span className="font-black">Stack:</span>
                    <br />
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            {/* Error Count Warning */}
            {this.state.errorCount > 1 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-xl mb-6">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
                  ⚠️ {this.state.errorCount} Xəta Təkrar Olundu
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
              >
                Yenidən Cəhd Et
              </button>
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Bərpa Et
              </button>
            </div>

            {/* Support Link */}
            <p className="text-[10px] text-gray-400 text-center mt-6">
              Problemi davam ederse, branışdırma (F12) açıb məlumatları bizə göndərəsiniz
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
