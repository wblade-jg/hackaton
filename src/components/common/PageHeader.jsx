import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      display="flex"
      alignItems="flex-start"
      justifyContent="space-between"
      gap={2}
      mb={3}
      flexWrap="wrap"
      sx={{ pl: { xs: 2, sm: 3 }, pr: { xs: 2, sm: 3 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
    </Box>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  action: PropTypes.node,
};
