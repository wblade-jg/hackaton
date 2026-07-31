import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import InboxIcon from '@mui/icons-material/InboxOutlined';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 220px)',
        px: 3,
        textAlign: 'center',
      }}
      role="status"
      aria-label={title}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          backgroundColor: 'background.default',
        }}
      >
        <Box
          component={icon || InboxIcon}
          sx={{ fontSize: 38, color: 'text.secondary' }}
        />
      </Box>
      <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 420, mb: 2 }}
        >
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};
