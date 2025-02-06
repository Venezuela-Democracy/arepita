import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--tg-theme-secondary-bg-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
`;

const NavItem = styled(motion.button)<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: ${props => 
    props.active ? 'var(--tg-theme-button-color)' : 'var(--tg-theme-hint-color)'};
  cursor: pointer;
  padding: 8px;
`;

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/packs', icon: '🎁', label: 'Packs' },
  { path: '/collection', icon: '🖼️', label: 'Collection' },
  { path: '/market', icon: '💹', label: 'Market' },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <NavContainer>
      {navItems.map(({ path, icon, label }) => (
        <NavItem
          key={path}
          active={location.pathname === path}
          onClick={() => navigate(path)}
          whileTap={{ scale: 0.95 }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </NavItem>
      ))}
    </NavContainer>
  );
};