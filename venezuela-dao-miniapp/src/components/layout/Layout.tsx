import styled from 'styled-components';
import { Header } from './Header';
import { Navigation } from './Navigation';

const LayoutContainer = styled.div`
  min-height: 100vh;
  padding: 60px 0;
  background: var(--tg-theme-bg-color);
`;

const Content = styled.main`
  padding: 16px;
  margin-bottom: 60px;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <LayoutContainer>
      <Header />
      <Content>{children}</Content>
      <Navigation />
    </LayoutContainer>
  );
};