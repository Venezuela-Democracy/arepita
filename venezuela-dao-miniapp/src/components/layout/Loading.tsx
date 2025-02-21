import { Box, CircularProgress, Typography } from '@mui/material';

export const Loading = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        color: 'white',
      }}
    >
      <CircularProgress 
        size={60} 
        thickness={4} 
        sx={{ 
          color: '#64b5f6',
          marginBottom: 3
        }} 
      />
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 'bold',
          letterSpacing: 1,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        Cargando Venezuela DAO
      </Typography>
    </Box>
  );
}; 