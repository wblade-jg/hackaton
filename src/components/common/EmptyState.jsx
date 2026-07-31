import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import InboxIcon from '@mui/icons-material/InboxOutlined';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 220px)"
      px={3}
      textAlign="center"
      role="status"
      aria-label={title}
    >
      <Box
        component={icon || InboxIcon}
        sx={{
          fontSize: 64,
          color: 'text.secondary',
          mb: 2,
          opacity: 0.5,
        }}
      />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 2 }}>
          {description}
        </Typography>
      )}
      {action && <Box mt={1}>{action}</Box>}
    </Box>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};
