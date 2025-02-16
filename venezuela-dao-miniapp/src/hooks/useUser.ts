import { useQuery } from '@tanstack/react-query';
import { apiService } from '../api';

export const useUser = () => {
  const { data: userInfo, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiService.getUserInfo(),
  });

  const { data: balanceInfo, isLoading: isLoadingBalance } = useQuery({
    queryKey: ['balance', userInfo?.data?.address],
    queryFn: () => apiService.getBalance(userInfo?.data?.address || ''),
    enabled: !!userInfo?.data?.address,
  });

  return {
    user: userInfo?.data,
    balance: balanceInfo?.data?.balance || 0,
    hasWallet: userInfo?.data?.hasWallet || false,
    isLoading: isLoadingUser || isLoadingBalance,
  };
};