import { useNFTCollection } from '../hooks/useNFTColecction';
import { useState, useRef, useEffect } from 'react';
import { CollectionGrid } from '../components/collection/CollectionGrid';
import { IconButton, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled as muiStyled } from '@mui/material/styles';
import { styled as scStyled, keyframes } from 'styled-components';

const shine = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const rarityGlow = {
  Common: 'rgba(255, 255, 255, 0.5)',
  Uncommon: '#4CAF50',
  Rare: '#2196F3',
  Epic: '#9C27B0',
  Legendary: '#FFD700'
};

const typeColors = {
  locations: '#FF5722',
  characters: '#2196F3',
  culturalItems: '#9C27B0'
};

const BackButton = muiStyled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.5)',
  color: theme.palette.common.white,
  backdropFilter: 'blur(4px)',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.7)',
  },
}));

const MainContainer = scStyled.div`
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  background: var(--tg-theme-bg-color);
`;

const CardsContainer = scStyled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0;
  gap: 1rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  height: 100vh;
  scroll-snap-align: start;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CardWrapper = scStyled.div`
  flex: 0 0 100%;
  scroll-snap-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

interface RarityProps {
  $rarity: string;
}

const CardFrame = scStyled.div<RarityProps>`
  position: relative;
  flex: 1;
  background: var(--tg-theme-bg-color);
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => {
      const glow = rarityGlow[props.$rarity as keyof typeof rarityGlow] || rarityGlow.Common;
      return `linear-gradient(
        90deg,
        transparent,
        ${glow},
        transparent
      ) no-repeat`;
    }};
    background-size: 200% 100%;
    opacity: ${props => 
      props.$rarity === 'Legendary' ? 0.4 :
      props.$rarity === 'Epic' ? 0.3 :
      props.$rarity === 'Rare' ? 0.2 :
      props.$rarity === 'Uncommon' ? 0.1 :
      0.05
    };
    animation: ${shine} 3s infinite linear;
    pointer-events: none;
    z-index: 1;
  }
`;

const CardInner = scStyled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
`;

const NFTImage = scStyled.div<{ $url?: string }>`
  height: 45vh;
  background: ${props => props.$url ? `url(${props.$url})` : 'var(--tg-theme-hint-color)'};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  }
`;

const Badge = scStyled.div`
  position: absolute;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2;
`;

const RarityBadge = scStyled(Badge)<{ $rarity: string }>`
  top: 1rem;
  right: 1rem;
  color: ${props => rarityGlow[props.$rarity as keyof typeof rarityGlow] || '#fff'};
`;

const TypeBadge = scStyled(Badge)<{ $type: string }>`
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: ${props => typeColors[props.$type as keyof typeof typeColors]};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CountBadge = scStyled(Badge)`
  top: 1rem;
  left: 1rem;
  color: white;
`;

const IPBadge = scStyled(Badge)`
  bottom: 1rem;
  right: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = scStyled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  background: var(--tg-theme-bg-color);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--tg-theme-hint-color);
    border-radius: 4px;
  }
`;

const TitleContainer = scStyled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Title = scStyled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--tg-theme-text-color);
`;

const Description = scStyled.p`
  color: var(--tg-theme-hint-color);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CategoryIndicator = scStyled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: white;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TypeInfo = {
  locations: { icon: '📍', label: 'Lugar' },
  characters: { icon: '👤', label: 'Personaje' },
  culturalItems: { icon: '🎨', label: 'Cultura' }
};

export const CollectionPage = () => {
  const {
    currentType,
    setCurrentType,
    collection,
    currentIndex,
    setCurrentIndex
  } = useNFTCollection();

  const [isDetailView, setIsDetailView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleNFTClick = (type: string, index: number) => {
    setCurrentType(type as typeof currentType);
    setCurrentIndex(index);
    setIsDetailView(true);
  };

  const handleBack = () => {
    setIsDetailView(false);
  };

  useEffect(() => {
    if (!isDetailView) return;

    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth;
      const newIndex = Math.round(scrollPosition / cardWidth);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, setCurrentIndex, isDetailView]);

  useEffect(() => {
    if (!isDetailView) return;

    const container = mainContainerRef.current;
    if (!container) return;

    const handleVerticalScroll = () => {
      const scrollPosition = container.scrollTop;
      const containerHeight = container.offsetHeight;
      const currentTypeIndex = ['locations', 'characters', 'culturalItems'].indexOf(currentType);
      const newTypeIndex = Math.round(scrollPosition / containerHeight);
      
      if (newTypeIndex !== currentTypeIndex && newTypeIndex >= 0 && newTypeIndex < 3) {
        const newType = ['locations', 'characters', 'culturalItems'][newTypeIndex];
        setCurrentType(newType as typeof currentType);
        setCurrentIndex(0);
      }
    };

    container.addEventListener('scroll', handleVerticalScroll);
    return () => container.removeEventListener('scroll', handleVerticalScroll);
  }, [currentType, setCurrentType, setCurrentIndex, isDetailView]);

  if (!collection) {
    return <div>Cargando colección...</div>;
  }

  if (!isDetailView) {
    return <CollectionGrid collection={collection} onNFTClick={handleNFTClick} />;
  }

  const currentNFTs = collection?.[currentType] || [];

  return (
    <Box sx={{ position: 'relative' }}>
      <BackButton onClick={handleBack}>
        <ArrowBackIcon />
      </BackButton>

      <MainContainer ref={mainContainerRef}>
        {['locations', 'characters', 'culturalItems'].map((type) => (
          <CardsContainer key={type} ref={type === currentType ? containerRef : undefined}>
            {(collection?.[type as keyof typeof collection] || []).map((nft) => {
              const rarity = nft.instances[0]?.traits.traits.find(
                t => t.name === 'rarity'
              )?.value || 'Common';

              const influencePoints = nft.instances[0]?.traits.traits.find(
                t => t.name === 'influence_generation'
              )?.value || '1';

              return (
                <CardWrapper key={nft.metadataId}>
                  <CardFrame $rarity={rarity}>
                    <CardInner>
                      <NFTImage $url={nft.display.thumbnail?.url}>
                        <RarityBadge $rarity={rarity}>
                          {rarity}
                        </RarityBadge>
                        <TypeBadge $type={type}>
                          {TypeInfo[type as keyof typeof TypeInfo].icon} 
                          {TypeInfo[type as keyof typeof TypeInfo].label}
                        </TypeBadge>
                        <CountBadge>
                          {nft.count} {nft.count > 1 ? 'copias' : 'copia'}
                        </CountBadge>
                        <IPBadge>
                          <span>⚡</span> IP: {influencePoints}
                        </IPBadge>
                      </NFTImage>
                      
                      <CardContent>
                        <TitleContainer>
                          <Title>{nft.display.name}</Title>
                        </TitleContainer>
                        <Description>
                          {nft.display.description}
                        </Description>
                      </CardContent>
                    </CardInner>
                  </CardFrame>
                </CardWrapper>
              );
            })}
          </CardsContainer>
        ))}

        <CategoryIndicator>
          {TypeInfo[currentType].icon}
          <span>
            {currentIndex + 1} / {currentNFTs.length}
          </span>
        </CategoryIndicator>
      </MainContainer>
    </Box>
  );
};

export default CollectionPage;