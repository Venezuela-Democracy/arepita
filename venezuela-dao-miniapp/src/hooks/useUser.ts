import { useQuery } from '@tanstack/react-query';
import { apiService } from '../api';

export const useUser = () => {
  const { data: userInfo } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiService.getUserInfo(),
  });

  const { data: walletInfo } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiService.getWalletInfo(),
  });

  return {
    user: userInfo?.data,
    balance: walletInfo?.data?.balance || 0,
    address: walletInfo?.data?.address || '',
    isLoading: !userInfo || !walletInfo,
  };
};