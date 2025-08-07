import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface PageContextType {
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const useCurrentPage = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('useCurrentPage must be used within a PageProvider');
  }
  return context;
};

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <PageContext.Provider value={{ currentPage, setCurrentPage }}>
      {children}
    </PageContext.Provider>
  );
};
