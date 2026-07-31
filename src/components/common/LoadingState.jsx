import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingState({ message = 'Cargando...' }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 220px)"
      role="progressbar"
      aria-label={message}
    >
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
