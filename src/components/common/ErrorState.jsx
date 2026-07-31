import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';

export default function ErrorState({ message = 'Algo salió mal', onRetry }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 220px)"
      px={3}
      textAlign="center"
      role="alert"
    >
      <ErrorOutlineIcon
        sx={{ fontSize: 56, color: 'error.main', mb: 2 }}
      />
      <Typography variant="h6" color="error.main" gutterBottom>
        Error
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry}>
          Intentar de nuevo
        </Button>
      )}
    </Box>
  );
}
