import { styled } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';

const GridContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
}));

const TypeSection = styled('section')(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const TypeTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  fontWeight: 'bold',
}));

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: theme.spacing(2),
}));

const NFTCard = styled('div')(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1',
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  padding: theme.spacing(0.5),
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
}));

const NFTImage = styled('div')<{ $url?: string }>(({ theme, $url }) => ({
  width: '100%',
  height: '100%',
  background: $url ? `url(${$url})` : theme.palette.grey[800],
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: theme.spacing(0.25),
}));

const NFTInfo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(4px)',
  color: theme.palette.common.white,
  borderRadius: theme.spacing(0.25),
}));

const RarityBadge = styled('span')<{ $rarity: string }>(({ theme, $rarity }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: '4px 12px',
  borderRadius: theme.spacing(1),
  fontSize: '0.75rem',
  background: `rgba(${getRarityColor($rarity)}, 0.7)`,
  color: theme.palette.primary.main,
  backdropFilter: 'blur(4px)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const TypeInfo = {
  locations: { icon: '📍', label: 'Lugares' },
  characters: { icon: '👤', label: 'Personajes' },
  culturalItems: { icon: '🎨', label: 'Cultura' }
};

interface CollectionGridProps {
  collection: any;
  onNFTClick: (type: string, index: number) => void;
}

function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'common':
      return '128, 128, 128'; // Gray
    case 'uncommon':
      return '0, 128, 0'; // Green
    case 'rare':
      return '0, 0, 255'; // Blue
    case 'epic':
      return '128, 0, 128'; // Purple
    case 'legendary':
      return '255, 215, 0'; // Gold
    default:
      return '128, 128, 128'; // Default to gray
  }
}

export const CollectionGrid = ({ collection, onNFTClick }: CollectionGridProps) => {
  return (
    <GridContainer>
      {Object.entries(TypeInfo).map(([type, info]) => (
        <TypeSection key={type}>
          <TypeTitle variant="h6">
            {info.icon} {info.label}
          </TypeTitle>
          <Grid>
            {(collection?.[type] || []).map((nft: any, index: number) => {
              const rarity = nft.instances[0]?.traits.traits.find(
                (t: any) => t.name === 'rarity'
              )?.value || 'Common';

              return (
                <NFTCard key={nft.metadataId} onClick={() => onNFTClick(type, index)}>
                  <NFTImage $url={nft.display.thumbnail?.url} />
                  <RarityBadge $rarity={rarity}>
                    {rarity}
                  </RarityBadge>
                  <NFTInfo>
                    <Typography variant="caption" component="div" noWrap>
                      {nft.display.name}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      {nft.count} {nft.count > 1 ? 'copias' : 'copia'}
                    </Typography>
                  </NFTInfo>
                </NFTCard>
              );
            })}
          </Grid>
        </TypeSection>
      ))}
    </GridContainer>
  );
};