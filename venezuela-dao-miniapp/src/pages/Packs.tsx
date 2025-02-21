import { useNFTTransactions } from '../hooks/useNFTTransactions';
import { useUser } from '../hooks/useUser';
import styled, { keyframes } from 'styled-components';
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

const glow = keyframes`
  0% { filter: drop-shadow(0 0 5px #FFD700); }
  50% { filter: drop-shadow(0 0 20px #FFD700); }
  100% { filter: drop-shadow(0 0 5px #FFD700); }
`;

const Container = styled.div`
  padding: 1rem;
  height: 100vh;
  background: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--tg-theme-button-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PackCounter = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin: 1rem 0;
  color: var(--tg-theme-button-text-color);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  animation: ${glow} 2s infinite;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ $color?: string }>`
  padding: 1rem;
  border: none;
  border-radius: 1rem;
  background: ${props => props.$color || "var(--tg-theme-button-color)"};
  color: var(--tg-theme-button-text-color);
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RangeInput = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--tg-theme-secondary-bg-color);
  margin: 1.5rem 0;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--tg-theme-button-color);
    cursor: pointer;
  }
`;

const AmountSelector = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const AmountButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${props => 
    props.$active ? "var(--tg-theme-button-color)" : "var(--tg-theme-secondary-bg-color)"};
  color: ${props => 
    props.$active ? "var(--tg-theme-button-text-color)" : "var(--tg-theme-hint-color)"};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
`;

export const Packs = () => {
  const { user } = useUser();
  const { 
    unrevealedPacks,
    isLoadingUnrevealed,
    buyPacks,
    revealPacks
  } = useNFTTransactions();
  
  const [buyAmount, setBuyAmount] = useState(1);
  const [revealAmount, setRevealAmount] = useState(1);
  const [selectedRevealType, setSelectedRevealType] = useState<'some' | 'all'>('some');

  useEffect(() => {
    if (unrevealedPacks > 0 && selectedRevealType === 'all') {
      setRevealAmount(unrevealedPacks);
    }
  }, [unrevealedPacks, selectedRevealType]);

  const handleBuy = async () => {
    try {
      const result = await buyPacks.mutateAsync(buyAmount);
      if (result.success) {
        WebApp.showAlert(`✅ Compra exitosa!\nTX: ${result.data?.transactionId}`);
      }
    } catch (error) {
      WebApp.showAlert('❌ Error al comprar los packs');
    }
  };

  const handleReveal = async () => {
    try {
      const result = await revealPacks.mutateAsync(revealAmount);
      if (result.success) {
        WebApp.showAlert(`🎉 ${revealAmount} packs revelados!\nTX: ${result.data?.transactionId}`);
      }
    } catch (error) {
      WebApp.showAlert('❌ Error al revelar los packs');
    }
  };

  const buyOptions = [1, 3, 5, 10];
  const revealOptions = [1, 3, 5];

  return (
    <Container>
      {/* Sección de Compra */}
      <Section>
        <Title>🛒 Comprar Packs</Title>
        <AmountSelector>
          {buyOptions.map(amount => (
            <AmountButton
              key={amount}
              $active={buyAmount === amount}
              onClick={() => setBuyAmount(amount)}
            >
              {amount}x
            </AmountButton>
          ))}
        </AmountSelector>
        <ButtonGrid>
          <ActionButton
            onClick={handleBuy}
            disabled={!user?.hasWallet || buyPacks.isPending}
            $color="#4CAF50"
          >
            {buyPacks.isPending ? '⏳ Procesando...' : `Comprar ${buyAmount} Pack${buyAmount > 1 ? 's' : ''}`}
          </ActionButton>
          <ActionButton
            onClick={() => WebApp.showAlert("Cada pack contiene 3 NFTs aleatorios de diferentes rarezas")}
            $color="#2196F3"
          >
            ℹ️ Info Packs
          </ActionButton>
        </ButtonGrid>
      </Section>

      {/* Sección de Revelado */}
      <Section>
        <Title>🎁 Packs por Revelar</Title>
        <PackCounter>
          {isLoadingUnrevealed ? 'Cargando...' : unrevealedPacks}
        </PackCounter>
        
        {unrevealedPacks > 0 && (
          <>
            <AmountSelector>
              {revealOptions.map(amount => (
                <AmountButton
                  key={amount}
                  $active={revealAmount === amount}
                  onClick={() => {
                    setSelectedRevealType('some');
                    setRevealAmount(amount);
                  }}
                  disabled={amount > unrevealedPacks}
                >
                  {amount}x
                </AmountButton>
              ))}
              <AmountButton
                $active={selectedRevealType === 'all'}
                onClick={() => {
                  setSelectedRevealType('all');
                  setRevealAmount(unrevealedPacks);
                }}
              >
                Todos
              </AmountButton>
            </AmountSelector>

            <RangeInput
              type="range"
              min="1"
              max={unrevealedPacks}
              value={revealAmount}
              onChange={(e) => {
                setSelectedRevealType('some');
                setRevealAmount(Number(e.target.value));
              }}
            />

            <ButtonGrid>
              <ActionButton
                onClick={handleReveal}
                disabled={revealPacks.isPending}
                $color="#9C27B0"
              >
                {revealPacks.isPending ? '⏳ Revelando...' : `Revelar ${revealAmount}`}
              </ActionButton>
              <ActionButton
                onClick={() => WebApp.showAlert("Revelar packs mostrará los NFTs que has obtenido")}
                $color="#FF9800"
              >
                ❓ ¿Cómo funciona?
              </ActionButton>
            </ButtonGrid>
          </>
        )}
      </Section>

      {/* Sección de Tutorial */}
      <Section>
        <Title>📚 Guía Rápida</Title>
        <p>1. Compra packs con tus tokens</p>
        <p>2. Revela para ver tus NFTs</p>
        <p>3. Usa NFTs en el juego</p>
        <p>4. ¡Colecciona todas las rarezas!</p>
      </Section>
    </Container>
  );
};