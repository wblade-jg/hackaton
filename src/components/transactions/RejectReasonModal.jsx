import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import PropTypes from 'prop-types';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency } from '../../utils/format';

export default function RejectReasonModal({ open, transaction, onClose }) {
  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="rejection-reason-title"
    >
      <DialogTitle id="rejection-reason-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#FDF3F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ErrorOutlineIcon color="error" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Detalles del Rechazo
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="label" color="text.secondary">
              Estado
            </Typography>
            <StatusBadge status={transaction.status} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="label" color="text.secondary" gutterBottom>
              Número de Cuenta
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {transaction.account || '-'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="label" color="text.secondary" gutterBottom>
              Fecha de Transacción
            </Typography>
            <Typography variant="body1">{transaction.date || '-'}</Typography>
          </Box>

          <Box>
            <Typography variant="label" color="text.secondary" gutterBottom>
              Monto Original
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatCurrency(transaction.amount)}
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              p: 2,
              backgroundColor: '#FDF3F3',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
              borderTop: '3px solid',
              borderTopColor: 'error.main',
            }}
          >
            <Typography variant="label" color="error.main" gutterBottom>
              Motivo de Rechazo
            </Typography>
            <Typography variant="body2" color="text.primary">
              {transaction.rejectionReason || 'No se proporcionó un motivo específico.'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" autoFocus>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RejectReasonModal.propTypes = {
  open: PropTypes.bool.isRequired,
  transaction: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};
