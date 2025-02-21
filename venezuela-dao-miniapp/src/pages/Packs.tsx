import { useNFTTransactions } from '../hooks/useNFTTransactions';
import { useUser } from '../hooks/useUser';
import { Container, Typography, Button, Box, Slider, ButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { Card } from '../components/shared/Card';
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import HelpIcon from '@mui/icons-material/Help';

const PackCounter = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 'bold',
  textAlign: 'center',
  margin: theme.spacing(2, 0),
  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 3),
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
}));

const AmountButton = styled(Button)<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: '8px',
  minWidth: '60px',
  backgroundColor: active ? theme.palette.primary.main : 'rgba(255,255,255,0.1)',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(255,255,255,0.2)',
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
        WebApp.showAlert(`✨ ¡Compra exitosa!\nTransacción: ${result.data?.transactionId}`);
      }
    } catch (error) {
      WebApp.showAlert('❌ Error al comprar los packs');
    }
  };

  const handleReveal = async () => {
    try {
      const result = await revealPacks.mutateAsync(revealAmount);
      if (result.success) {
        WebApp.showAlert(`🎉 ¡${revealAmount} packs revelados!\nTransacción: ${result.data?.transactionId}`);
      }
    } catch (error) {
      WebApp.showAlert('❌ Error al revelar los packs');
    }
  };

  const buyOptions = [1, 3, 5, 10];
  const revealOptions = [1, 3, 5];

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <Typography variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon /> Comprar Packs
        </Typography>
        
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
          <StyledButton
            variant="contained"
            color="success"
            onClick={handleBuy}
            disabled={!user?.hasWallet || buyPacks.isPending}
            startIcon={<ShoppingCartIcon />}
          >
            {buyPacks.isPending ? '⏳ Procesando...' : `Comprar ${buyAmount}`}
          </StyledButton>
          
          <StyledButton
            variant="contained"
            color="info"
            onClick={() => WebApp.showAlert("Cada pack contiene 3 NFTs aleatorios de diferentes rarezas")}
            startIcon={<InfoIcon />}
          >
            Info Packs
          </StyledButton>
        </Box>
      </Card>

      <Card>
        <Typography variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CardGiftcardIcon /> Packs por Revelar
        </Typography>

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
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <StyledButton
                variant="contained"
                color="secondary"
                onClick={handleReveal}
                disabled={revealPacks.isPending}
                startIcon={<CardGiftcardIcon />}
              >
                {revealPacks.isPending ? '⏳ Revelando...' : `Revelar ${revealAmount}`}
              </StyledButton>
              
              <StyledButton
                variant="contained"
                color="warning"
                onClick={() => WebApp.showAlert("Revelar packs mostrará los NFTs que has obtenido")}
                startIcon={<HelpIcon />}
              >
                ¿Cómo funciona?
              </StyledButton>
            </Box>
          </>
        )}
      </Card>
    </Container>
  );
};