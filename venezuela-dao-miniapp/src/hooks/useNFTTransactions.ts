import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../api';
import { useUser } from './useUser';

export const useNFTTransactions = () => {
  const { user } = useUser();

  // Query para packs sin revelar
  const unrevealedPacksQuery = useQuery({
    queryKey: ['unrevealed-packs', user?.id],
    queryFn: () => apiService.getUnrevealedPacksCount(),
    enabled: !!user?.hasWallet
  });

  // Mutación para comprar packs
  const buyPacks = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.hasWallet) throw new Error('No wallet');
      return apiService.buyPack({ amount });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      unrevealedPacksQuery.refetch();
    }
  });

  // Mutación para revelar packs
  const revealPacks = useMutation({
    mutationFn: async (amount: number) => {
      if (!user?.hasWallet) throw new Error('No wallet');
      return apiService.revealPacks({ amount });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      unrevealedPacksQuery.refetch();
    }
  });

  return {
    unrevealedPacks: unrevealedPacksQuery.data?.data?.unrevealedPacks || 0,
    isLoadingUnrevealed: unrevealedPacksQuery.isLoading,
    buyPacks,
    revealPacks
  };
}; 