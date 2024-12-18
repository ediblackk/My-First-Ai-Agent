import React from 'react';
import NextRounds from './NextRounds';
import NewsSidebar from './NewsSidebar';
import WishComponent from './WishComponent';
import ErrorBoundary from './ErrorBoundary';

const MainComponent = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* News Sidebar - last on mobile, first on desktop */}
        <div className="w-full md:w-1/4 order-3 md:order-1">
          <ErrorBoundary>
            <NewsSidebar />
          </ErrorBoundary>
        </div>
        
        {/* Wish Component - always in the middle */}
        <div className="w-full md:w-2/4 order-2">
          <ErrorBoundary>
            <WishComponent />
          </ErrorBoundary>
        </div>
        
        {/* Next Rounds - first on mobile, last on desktop */}
        <div className="w-full md:w-1/4 order-1 md:order-3">
          <ErrorBoundary>
            <NextRounds />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
