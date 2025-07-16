import React from 'react';

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3>{children}</h3>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
); 