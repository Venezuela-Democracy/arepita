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
    // Agregamos estas opciones para mejorar la experiencia de carga
    retry: 1,
    staleTime: 30000, // 30 segundos
    gcTime: 60000,    // 1 minuto (antes era cacheTime)
  });

  // Solo consideramos loading cuando estamos cargando el usuario
  // No bloqueamos la UI mientras se carga el balance
  console.log('balanceInfo', balanceInfo);
  return {
    user: userInfo?.data,
    // Corregimos el acceso a la estructura de datos
    balance: balanceInfo?.data?.balance || 0, 
    hasWallet: userInfo?.data?.hasWallet || false,
    isLoading: isLoadingUser,
    isLoadingBalance,
  };
};