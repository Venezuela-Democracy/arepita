import { useNFTCollection } from '../hooks/useNFTColecction';
import styled, { keyframes } from 'styled-components';
import { useRef, useEffect, useState } from 'react';

const shine = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const rarityGlow = {
  Common: 'rgba(255, 255, 255, 0.5)',
  Uncommon: 'rgba(0, 255, 0, 0.5)',
  Rare: 'rgba(0, 123, 255, 0.5)',
  Epic: 'rgba(163, 53, 238, 0.5)',
  Legendary: 'rgba(255, 215, 0, 0.5)'
};

const MainContainer = styled.div`
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
`;

const CardsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 1rem;
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
  padding: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardFrame = styled.div<{ $rarity?: string }>`
  position: relative;
  border-radius: 24px;
  padding: 1px;
  flex: 1;
  background: ${props => {
    const glow = rarityGlow[props.$rarity as keyof typeof rarityGlow] || rarityGlow.Common;
    return `linear-gradient(135deg, ${glow}, transparent 50%, ${glow})`;
  }};
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.1)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
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
  }
`;

const CardInner = styled.div`
  background: linear-gradient(
    145deg,
    var(--tg-theme-secondary-bg-color),
    var(--tg-theme-bg-color)
  );
  border-radius: 24px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NFTImage = styled.div<{ $url?: string }>`
  height: 40%;
  min-height: 200px;
  background: ${props => props.$url ? `url(${props.$url})` : 'var(--tg-theme-hint-color)'};
  background-size: cover;
  background-position: center;
  position: relative;
`;

const RarityBadge = styled.div<{ $rarity: string }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    const glow = rarityGlow[props.$rarity as keyof typeof rarityGlow];
    return `linear-gradient(135deg, ${glow}, rgba(0, 0, 0, 0.5))`;
  }};
  color: white;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CountBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(4px);
`;

const CardContent = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: var(--tg-theme-hint-color);
  font-size: 1rem;
  line-height: 1.6;
  white-space: pre-line;
`;

const TraitsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
`;

const TraitItem = styled.div`
  background: rgba(var(--tg-theme-secondary-bg-color-rgb), 0.5);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(4px);
`;

const CategoryIndicator = styled.div`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(var(--tg-theme-bg-color-rgb), 0.8);
  backdrop-filter: blur(8px);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--tg-theme-hint-color);
  z-index: 10;
  display: flex;
  gap: 0.5rem;
`;

const TypeIcon = {
  locations: '📍',
  characters: '👤',
  culturalItems: '🎨'
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
  const [showFullDescription, setShowFullDescription] = useState(false);

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
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.offsetWidth;
    container.scrollTo({
      left: currentIndex * cardWidth,
      behavior: 'smooth'
    });
  }, [currentIndex]);

  // Manejo del scroll vertical para cambiar de tipo
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

            return (
              <CardWrapper key={nft.metadataId}>
                <CardFrame $rarity={rarity}>
                  <CardInner>
                    <NFTImage $url={nft.display.thumbnail?.url}>
                      <RarityBadge $rarity={rarity}>
                        <span>{rarity}</span>
                      </RarityBadge>
                      <CountBadge>
                        {nft.count} {nft.count > 1 ? 'copias' : 'copia'}
                      </CountBadge>
                    </NFTImage>
                    
                    <CardContent>
                      <div>
                        <Title>{nft.display.name}</Title>
                        <Description>
                          {showFullDescription 
                            ? nft.display.description 
                            : `${nft.display.description?.slice(0, 150)}...`}
                          <button 
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-tg-link-color ml-2"
                          >
                            {showFullDescription ? 'Ver menos' : 'Ver más'}
                          </button>
                        </Description>
                      </div>

                      <TraitsList>
                        {nft.instances[0]?.traits.traits
                          .filter(trait => !['nftUUID', 'cardMetadataID', 'setId'].includes(trait.name))
                          .map(trait => (
                            <TraitItem key={trait.name}>
                              <div className="text-xs text-tg-hint-color uppercase">
                                {trait.name.replace(/_/g, ' ')}
                              </div>
                              <div className="font-medium text-tg-text-color">
                                {trait.value}
                              </div>
                            </TraitItem>
                          ))}
                      </TraitsList>
                    </CardContent>
                  </CardInner>
                </CardFrame>
              </CardWrapper>
            );
          })}
        </CardsContainer>
      ))}

      <CategoryIndicator>
        {TypeIcon[currentType as keyof typeof TypeIcon]}
        <span>
          {currentIndex + 1} / {currentNFTs.length}
        </span>
      </CategoryIndicator>
    </MainContainer>
  );
};

export default CollectionPage;