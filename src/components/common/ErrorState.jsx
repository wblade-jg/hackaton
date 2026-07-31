import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
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
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          backgroundColor: '#FDF3F3',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 38, color: 'error.main' }} />
      </Box>
      <Typography variant="h6" color="error.main" gutterBottom sx={{ fontWeight: 600 }}>
        Error
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mb: 3 }}>
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

ErrorState.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
};
