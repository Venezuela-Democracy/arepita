import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { Loading } from '../components/shared/Loading';

const HomeContainer = styled.div`
  padding: 16px;
`;

const Card = styled.div`
  background: var(--tg-theme-secondary-bg-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

export const Home = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <HomeContainer>
      <Card>
        <h2>Welcome to VenezuelaDAO</h2>
        <p>Hello, {user?.username}!</p>
      </Card>
      
      <Card>
        <h3>Your Packs</h3>
        <p>Coming soon...</p>
      </Card>
      
      <Card>
        <h3>Your Collection</h3>
        <p>Coming soon...</p>
      </Card>
    </HomeContainer>
  );
};