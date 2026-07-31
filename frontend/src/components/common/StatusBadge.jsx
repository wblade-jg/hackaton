import { Chip } from '@mui/material';
import PropTypes from 'prop-types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import DangerousIcon from '@mui/icons-material/Dangerous';

const statusConfig = {
  PROCESSED: {
    label: 'Procesada',
    color: 'success',
    icon: CheckCircleIcon,
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'error',
    icon: CancelIcon,
  },
  PENDING: {
    label: 'Pendiente',
    color: 'warning',
    icon: HourglassEmptyIcon,
  },
  EXITOSO: {
    label: 'Exitoso',
    color: 'success',
    icon: CheckCircleIcon,
  },
  ERRORES: {
    label: 'Errores',
    color: 'warning',
    icon: ReportProblemIcon,
  },
  CRITICO: {
    label: 'Crítico',
    color: 'error',
    icon: DangerousIcon,
  },
  FAILED: {
    label: 'Fallido',
    color: 'error',
    icon: CancelIcon,
  },
  PROCESSING: {
    label: 'Procesando',
    color: 'info',
    icon: HourglassEmptyIcon,
  },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || 'Desconocido',
    color: 'default',
    icon: HourglassEmptyIcon,
  };

  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon sx={{ fontSize: 15 }} />}
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        height: 28,
        borderRadius: '999px',
        '& .MuiChip-icon': { ml: 0.75 },
      }}
    />
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};
