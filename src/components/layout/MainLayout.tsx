import { ReactNode } from 'react';
import { Header } from './Header';
import { Container } from './Container';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
