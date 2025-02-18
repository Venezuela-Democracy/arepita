import { useNFTCollection } from '../hooks/useNFTColecction';
import styled, { keyframes } from 'styled-components';
import { useRef, useEffect } from 'react';

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

const MainContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  background: var(--tg-theme-bg-color);
`;

const CardsContainer = styled.div`
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

const CardWrapper = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardFrame = styled.div<{ $rarity?: string }>`
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

const CardInner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
`;

const NFTImage = styled.div<{ $url?: string }>`
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

const Badge = styled.div`
  position: absolute;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 2;
`;

const RarityBadge = styled(Badge)<{ $rarity: string }>`
  top: 1rem;
  right: 1rem;
  color: ${props => rarityGlow[props.$rarity as keyof typeof rarityGlow] || '#fff'};
`;

const TypeBadge = styled(Badge)<{ $type: string }>`
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: ${props => typeColors[props.$type as keyof typeof typeColors]};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CountBadge = styled(Badge)`
  top: 1rem;
  left: 1rem;
  color: white;
`;

const IPBadge = styled(Badge)`
  bottom: 1rem;
  right: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardContent = styled.div`
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

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--tg-theme-text-color);
`;

const Description = styled.p`
  color: var(--tg-theme-hint-color);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CategoryIndicator = styled.div`
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

  const containerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [currentIndex, setCurrentIndex]);

  useEffect(() => {
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
  }, [currentType, setCurrentType, setCurrentIndex]);

  const currentNFTs = collection?.[currentType] || [];

  return (
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
  );
};

export default CollectionPage;