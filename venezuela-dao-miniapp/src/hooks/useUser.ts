import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../api';
import WebApp from '@twa-dev/sdk';

export const useUser = () => {
  const queryClient = useQueryClient();

  const { data: userInfo, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiService.getUserInfo(),
  });

  const { data: balanceInfo, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance', userInfo?.data?.address],
    queryFn: () => apiService.getBalance(userInfo?.data?.address || ''),
    enabled: !!userInfo?.data?.address,
    retry: 1,
    staleTime: 30000,
    gcTime: 60000,
  });

  const createWalletMutation = useMutation({
    mutationFn: () => apiService.createWallet(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ region, language }: { region: string, language: string }) => {
      const telegramId = WebApp.initDataUnsafe?.user?.id;
      if (!telegramId) {
        throw new Error('No se pudo obtener el ID de Telegram');
      }
      return apiService.registerUser({
        telegramId: telegramId.toString(),
        region,
        language
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  return {
    user: userInfo?.data,
    balance: balanceInfo?.data?.balance || 0,
    hasWallet: userInfo?.data?.hasWallet || false,
    isLoading: isLoadingUser,
    isLoadingBalance,
    createWallet: createWalletMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error
  };
};