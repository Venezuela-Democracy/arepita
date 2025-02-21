import styled from 'styled-components';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../hooks/useUser';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--tg-theme-secondary-bg-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  justify-content: space-between;
  z-index: 100;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

interface BalanceProps {
  loading?: boolean;
}

const Balance = styled.span<BalanceProps>`
  font-size: 16px;
  font-weight: 600;
  color: var(--tg-theme-text-color);
  opacity: ${props => props.loading ? 0.5 : 1};
  transition: opacity 0.2s ease;
`;

const Address = styled.div`
  font-size: 12px;
  color: var(--tg-theme-hint-color);
  cursor: pointer;
`;

const CreateWalletButton = styled.button`
  background: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Header = () => {
  const { 
    user, 
    balance, 
    hasWallet, 
    isLoadingBalance,
    register,
    isRegistering 
  } = useUser();
  const [showCopied, setShowCopied] = useState(false);

  const copyAddress = async () => {
    if (user?.address) {
      await navigator.clipboard.writeText(user.address);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleRegister = () => {
    register({ region: 'CARACAS', language: 'es' });
  };

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <HeaderContainer>
      <UserInfo>
        <Avatar src={user?.avatarUrl || 'default-avatar-url'} alt="User avatar" />
        {hasWallet ? (
          <WalletInfo>
            <Balance loading={isLoadingBalance}>
              {balance.toFixed(2)} FLOW
            </Balance>
            <Address onClick={copyAddress}>
              {user?.address ? formatAddress(user.address) : 'No wallet'}
              <AnimatePresence>
                {showCopied && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ marginLeft: '8px' }}
                  >
                    ✓ Copied
                  </motion.span>
                )}
              </AnimatePresence>
            </Address>
          </WalletInfo>
        ) : (
          <WalletInfo>
            <Balance>No Wallet</Balance>
            <CreateWalletButton 
              onClick={handleRegister}
              disabled={isRegistering}
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </CreateWalletButton>
          </WalletInfo>
        )}
      </UserInfo>
    </HeaderContainer>
  );
};