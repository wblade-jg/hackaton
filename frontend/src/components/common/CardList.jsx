import { Box } from '@mui/material';
import PropTypes from 'prop-types';

export default function CardList({ items, renderItem, sx }) {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      {items.map((item, index) => (
        <Box
          key={item.id ?? item.filename ?? index}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {renderItem(item, index)}
        </Box>
      ))}
    </Box>
  );
}

CardList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  sx: PropTypes.object,
};
