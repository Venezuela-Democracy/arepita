import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../api';
import { useUser } from './useUser';

export const useNFTCollection = () => {
  const { user } = useUser();
  const [currentType, setCurrentType] = useState<'locations' | 'characters' | 'culturalItems'>('locations');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Añadir debug de la respuesta API
  const { data: collectionResponse, isLoading: isLoadingCollection } = useQuery({
    queryKey: ['collection', user?.address],
    queryFn: async () => {
      if (!user?.address) return null;
      
      console.log('[API] Fetching collection...');
      try {
        const response = await apiService.getNFTCollection(user.address);
        console.log('[API] Response structure:', {
          success: response.success,
          dataKeys: response.data ? Object.keys(response.data) : 'no data'
        });
        return response;
      } catch (error) {
        console.error('[API] Error fetching collection:', error);
        return null;
      }
    },
    enabled: !!user?.address
  });

  // 2. Función de debug para los totales
  const getTotalByType = (type: typeof currentType) => {
    if (!collectionResponse?.data) {
      console.log('[DEBUG] No collection data');
      return 0;
    }
    
    const categoryData = collectionResponse.data[type];
    const total = categoryData?.reduce((total: number, group: any) => total + (group.count || 0), 0) || 0;
    
    console.log(`[DEBUG] Total for ${type}:`, total, 'Data:', categoryData);
    return total;
  };

  // 3. Debug detallado del NFT actual
  const getCurrentNFT = () => {
    if (!collectionResponse?.data) {
      console.log('[DEBUG] No collection data available');
      return null;
    }

    const categoryData = collectionResponse.data[currentType];
    if (!categoryData) {
      console.log(`[DEBUG] No data for type: ${currentType}`);
      return null;
    }

    let accumulated = 0;
    console.log(`[DEBUG] Searching NFT at index ${currentIndex} in ${currentType}`);
    
    for (const [groupIndex, group] of categoryData.entries()) {
      const groupCount = group.count || 0;
      console.log(`[DEBUG] Group ${groupIndex} (${group.metadataId}):`, {
        count: groupCount,
        instances: group.instances?.length
      });

      if (currentIndex < accumulated + groupCount) {
        const indexInGroup = currentIndex - accumulated;
        const instance = group.instances?.[indexInGroup];
        
        console.log('[DEBUG] Found NFT:', {
          group: group.metadataId,
          indexInGroup,
          instanceId: instance?.id
        });
        
        return {
          display: group.display,
          instance,
          metadataId: group.metadataId
        };
      }
      accumulated += groupCount;
    }
    
    console.log('[DEBUG] NFT not found at index', currentIndex);
    return null;
  };

  const total = getTotalByType(currentType);
  const hasNext = currentIndex < total - 1;
  const hasPrevious = currentIndex > 0;

  // 4. Devolver datos de debug
  return {
    collection: collectionResponse?.data,
    currentNFT: getCurrentNFT(),
    isLoading: isLoadingCollection,
    currentType,
    currentIndex,
    setCurrentType: (type: typeof currentType) => {
      console.log('[UI] Changing type to:', type);
      setCurrentType(type);
      setCurrentIndex(0);
    },
    setCurrentIndex: (index: number) => {
      console.log('[UI] Changing index to:', index);
      setCurrentIndex(index);
    },
    getTotalByType,
    hasNext,
    hasPrevious,
    
    // Datos de debug para inspección
    _debug: {
      rawResponse: collectionResponse,
      calculatedTotal: total,
      currentGroups: collectionResponse?.data?.[currentType]
    }
  };
};