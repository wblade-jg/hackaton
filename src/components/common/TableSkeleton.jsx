import { Box, Paper, Skeleton } from '@mui/material';
import PropTypes from 'prop-types';

export default function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <Paper
      sx={{ mx: { xs: 2, sm: 3 }, overflow: 'hidden' }}
      role="progressbar"
      aria-label="Cargando datos"
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="text" width={180} height={18} />
      </Box>
      {Array.from({ length: rows }, (_, index) => (
        <Box
          key={index}
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 3,
            px: { xs: 2, sm: 3 },
            py: 2,
            borderBottom: index < rows - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {Array.from({ length: columns }, (_, cell) => (
            <Skeleton
              key={cell}
              variant="text"
              width={cell === 0 ? '75%' : '55%'}
              height={18}
            />
          ))}
        </Box>
      ))}
    </Paper>
  );
}

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
};
