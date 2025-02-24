import { useNFTTransactions } from '../hooks/useNFTTransactions';
import { useUser } from '../hooks/useUser';
import { Container, Typography, Button, Box, Slider, ButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HelpIcon from '@mui/icons-material/Help';

const Card = styled('div')(({ theme }) => ({
  background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
  borderRadius: '20px',
  padding: theme.spacing(3),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(3),
}));

const PackCounter = styled(Typography)(({ theme }) => ({
  fontSize: '4.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: theme.spacing(3, 0),
  background: 'linear-gradient(45deg, #4A90E2, #357ABD)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  animation: 'float 3s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
}));

const AmountButton = styled(Button)<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: '12px',
  minWidth: '60px',
  padding: theme.spacing(1.5),
  background: active 
    ? 'linear-gradient(145deg, #4A90E2, #357ABD)'
    : 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
  color: active ? '#ffffff' : theme.palette.text.secondary,
  border: '1px solid rgba(255,255,255,0.1)',
  '&:hover': {
    background: active 
      ? 'linear-gradient(145deg, #357ABD, #4A90E2)'
      : 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.1))',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease',
  '&:disabled': {
    opacity: 0.5,
    transform: 'none',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(2),
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  background: 'linear-gradient(145deg, #4A90E2, #357ABD)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': {
    background: 'linear-gradient(145deg, #357ABD, #4A90E2)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'linear-gradient(145deg, #666, #444)',
    opacity: 0.5,
    transform: 'none',
  },
  transition: 'all 0.3s ease',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: '#4A90E2',
  '& svg': {
    fontSize: '2rem',
  },
}));

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
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Card>
        <SectionTitle>
          <ShoppingCartIcon /> Comprar Packs
        </SectionTitle>
        
        <Box sx={{ mb: 3 }}>
          <ButtonGroup variant="contained" fullWidth>
            {buyOptions.map(amount => (
              <AmountButton
                key={amount}
                active={buyAmount === amount}
                onClick={() => setBuyAmount(amount)}
              >
                {amount}x
              </AmountButton>
            ))}
          </ButtonGroup>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <ActionButton
            variant="contained"
            onClick={handleBuy}
            disabled={!user?.hasWallet || buyPacks.isPending}
            startIcon={<ShoppingCartIcon />}
          >
            {buyPacks.isPending ? '⏳ Procesando...' : `Comprar ${buyAmount}`}
          </ActionButton>
          
          <ActionButton
            variant="contained"
            onClick={() => WebApp.showAlert("Cada pack contiene 3 NFTs aleatorios de diferentes rarezas")}
            startIcon={<InfoIcon />}
          >
            Info Packs
          </ActionButton>
        </Box>
      </Card>

      <Card>
        <SectionTitle>
          <CardGiftcardIcon /> Packs por Revelar
        </SectionTitle>

        <PackCounter>
          {isLoadingUnrevealed ? '...' : unrevealedPacks}
        </PackCounter>
        
        {unrevealedPacks > 0 && (
          <>
            <Box sx={{ mb: 3 }}>
              <ButtonGroup variant="contained" fullWidth>
                {revealOptions.map(amount => (
                  <AmountButton
                    key={amount}
                    active={revealAmount === amount && selectedRevealType === 'some'}
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
                  active={selectedRevealType === 'all'}
                  onClick={() => {
                    setSelectedRevealType('all');
                    setRevealAmount(unrevealedPacks);
                  }}
                >
                  Todos
                </AmountButton>
              </ButtonGroup>
            </Box>

            <Box sx={{ px: 2, mb: 3 }}>
              <Slider
                value={revealAmount}
                min={1}
                max={unrevealedPacks}
                onChange={(_, value) => {
                  setSelectedRevealType('some');
                  setRevealAmount(value as number);
                }}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#4A90E2',
                    '&:hover': {
                      boxShadow: '0 0 10px rgba(74,144,226,0.5)',
                    },
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: '#4A90E2',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(74,144,226,0.3)',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <ActionButton
                variant="contained"
                onClick={handleReveal}
                disabled={revealPacks.isPending}
                startIcon={<CardGiftcardIcon />}
              >
                {revealPacks.isPending ? '⏳ Revelando...' : `Revelar ${revealAmount}`}
              </ActionButton>
              
              <ActionButton
                variant="contained"
                onClick={() => WebApp.showAlert("Revelar packs mostrará los NFTs que has obtenido")}
                startIcon={<HelpIcon />}
              >
                ¿Cómo funciona?
              </ActionButton>
            </Box>
          </>
        )}
      </Card>
    </Container>
  );
};