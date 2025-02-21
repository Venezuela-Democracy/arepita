import { Box, Typography, Container, Avatar } from '@mui/material';
import { useUser } from '../hooks/useUser';
import { Loading } from '../components/layout/Loading';
import { Card } from '../components/shared/Card';
import { styled } from '@mui/material/styles';
import WebApp from '@twa-dev/sdk';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginBottom: theme.spacing(2),
  border: '3px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const WelcomeText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const StatCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const Home = () => {
  const { user, balance, isLoading, isLoadingBalance } = useUser();
  const telegramUser = WebApp.initDataUnsafe?.user;

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Card sx={{ textAlign: 'center', mb: 3, py: 4 }}>
        <StyledAvatar src={telegramUser?.photo_url} alt={telegramUser?.username}>
          {telegramUser?.username?.charAt(0) || 'U'}
        </StyledAvatar>
        <WelcomeText variant="h4">
          ¡Bienvenido a VenezuelaDAO!
        </WelcomeText>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {telegramUser?.username || telegramUser?.first_name || 'Usuario'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isLoadingBalance ? '...' : `${balance.toFixed(2)} FLOW disponibles`}
        </Typography>
      </Card>

      <StatsContainer>
        <StatCard>
          <Typography variant="h6" color="primary">
            Packs
          </Typography>
          <Typography variant="h4" color="secondary">
            0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Por abrir
          </Typography>
        </StatCard>

        <StatCard>
          <Typography variant="h6" color="primary">
            NFTs
          </Typography>
          <Typography variant="h4" color="secondary">
            0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coleccionados
          </Typography>
        </StatCard>
      </StatsContainer>

      <Card sx={{ mt: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Últimas Actividades
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          Próximamente podrás ver tu historial de actividades aquí...
        </Typography>
      </Card>
    </Container>
  );
};