import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import { useFiles } from '../../hooks/useFiles';
import { formatBytes } from '../../utils/format';
import EmptyState from '../common/EmptyState';
import TableSkeleton from '../common/TableSkeleton';
import ErrorState from '../common/ErrorState';
import PageHeader from '../common/PageHeader';

function ResultStations({ processed, rejected }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'stretch',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 140,
          p: 2,
          borderTop: '3px solid',
          borderColor: 'success.main',
          backgroundColor: '#F2FAF5',
          textAlign: 'center',
        }}
        aria-label={`${processed} transacciones procesadas`}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.dark' }}>
          {processed}
        </Typography>
        <Typography variant="label" sx={{ color: 'success.dark' }}>
          Procesadas
        </Typography>
      </Box>
      <Box
        sx={{
          width: { xs: 0, sm: 28 },
          borderBottom: '3px solid',
          borderColor: 'divider',
          display: { xs: 'none', sm: 'block' },
          my: 2,
        }}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 140,
          p: 2,
          borderTop: '3px solid',
          borderColor: 'error.main',
          backgroundColor: '#FDF3F3',
          textAlign: 'center',
        }}
        aria-label={`${rejected} transacciones rechazadas`}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.dark' }}>
          {rejected}
        </Typography>
        <Typography variant="label" sx={{ color: 'error.dark' }}>
          Rechazadas
        </Typography>
      </Box>
    </Box>
  );
}

ResultStations.propTypes = {
  processed: PropTypes.number.isRequired,
  rejected: PropTypes.number.isRequired,
};

export default function AvailableFiles() {
  const { availableFiles, availableLoading: loading, availableError: error, fetchAvailable, processFile } = useFiles();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [confirmFile, setConfirmFile] = useState(null);
  const [processingFile, setProcessingFile] = useState(null);
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const isProcessing = processingFile !== null;

  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return availableFiles;
    return availableFiles.filter((f) => f.filename.toLowerCase().includes(query));
  }, [availableFiles, searchQuery]);

  const runProcess = async (filename) => {
    setProcessingFile(filename);
    try {
      const res = await processFile(filename);
      setResult({
        filename,
        fileId: res.fileId,
        processed: res.processed,
        rejected: res.rejected,
      });
      fetchAvailable();
    } catch {
      setSnackbar({ open: true, message: `Error al procesar "${filename}"`, severity: 'error' });
    } finally {
      setProcessingFile(null);
    }
  };

  const handleConfirm = () => {
    const file = confirmFile;
    setConfirmFile(null);
    if (file) runProcess(file.filename);
  };

  const processButton = (file) => (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      startIcon={<PlayArrowIcon />}
      onClick={() => setConfirmFile(file)}
      disabled={isProcessing}
      loading={processingFile === file.filename}
      loadingPosition="start"
      aria-label={`Procesar ${file.filename}`}
    >
      {processingFile === file.filename ? 'Procesando...' : 'Procesar'}
    </Button>
  );

  const renderCards = (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {visibleFiles.map((file, index) => (
        <Box
          key={file.filename || index}
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
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
              <DescriptionIcon
                sx={{ color: 'primary.light', fontSize: 20, verticalAlign: 'middle', mr: 0.5 }}
              />
              {file.filename}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {file.date || '-'} &middot; {formatBytes(file.size)}
              {file.totalRows != null && (
                <>
                  {' '}&middot;{' '}
                  <strong>{file.totalRows.toLocaleString()}</strong> transacciones
                </>
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={() => setConfirmFile(file)}
            disabled={isProcessing}
            loading={processingFile === file.filename}
            loadingPosition="start"
            aria-label={`Procesar ${file.filename}`}
            sx={{ minHeight: 44 }}
          >
            {processingFile === file.filename ? 'Procesando...' : 'Procesar'}
          </Button>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title="Archivos Disponibles"
        subtitle="Selecciona un archivo para procesar las transacciones entrantes"
        action={
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAvailable}
            disabled={loading}
            loading={loading}
            loadingPosition="start"
            aria-label="Actualizar lista de archivos"
          >
            Actualizar
          </Button>
        }
      />

      {loading && availableFiles.length === 0 ? (
        <TableSkeleton rows={5} columns={4} />
      ) : error && availableFiles.length === 0 ? (
        <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
          <ErrorState message={error} onRetry={fetchAvailable} />
        </Paper>
      ) : availableFiles.length === 0 ? (
        <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
          <EmptyState
            icon={DescriptionIcon}
            title="No hay archivos disponibles"
            description="No se encontraron archivos de transacciones sin procesar en el directorio de entrada. Los archivos deben llamarse transactions_DDMMYYYY.csv."
            action={
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchAvailable}>
                Verificar de nuevo
              </Button>
            }
          />
        </Paper>
      ) : (
        <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
          {error && availableFiles.length > 0 && (
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
              <Alert
                severity="error"
                variant="outlined"
                action={
                  <Button color="error" size="small" onClick={fetchAvailable}>
                    Reintentar
                  </Button>
                }
              >
                No se pudo actualizar la lista: {error}
              </Alert>
            </Box>
          )}
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre de archivo..."
              size="small"
              fullWidth
              sx={{ maxWidth: 340 }}
              slotProps={{
                htmlInput: {
                  'aria-label': 'Buscar archivos disponibles',
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
          {isMobile ? (
            visibleFiles.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No se encontraron archivos con el término &quot;{searchQuery}&quot;
                </Typography>
              </Box>
            ) : (
              renderCards
            )
          ) : (
            <TableContainer>
              <Table aria-label="Tabla de archivos disponibles">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 240 }}>Archivo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Transacciones</TableCell>
                    <TableCell align="right">Tamaño</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          No se encontraron archivos con el término &quot;{searchQuery}&quot;
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleFiles.map((file, index) => (
                      <TableRow
                        key={file.filename || index}
                        hover
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        {/* Injected column for transaction count */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            <DescriptionIcon
                              sx={{ color: 'primary.light', fontSize: 20, verticalAlign: 'middle', mr: 1 }}
                            />
                            {file.filename}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {file.date || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {file.totalRows != null ? file.totalRows.toLocaleString() : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatBytes(file.size)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{processButton(file)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <Dialog
        open={!!confirmFile}
        onClose={() => setConfirmFile(null)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="confirm-process-title"
      >
        <DialogTitle id="confirm-process-title" sx={{ fontWeight: 600 }}>
          Confirmar procesamiento
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            Se procesarán las transacciones del archivo y se moverá al historial de archivos
            procesados.
          </Alert>
          {confirmFile && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="label" color="text.secondary" gutterBottom>
                  Archivo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                  {confirmFile.filename}
                </Typography>
              </Box>
              <Box>
                <Typography variant="label" color="text.secondary" gutterBottom>
                  Fecha
                </Typography>
                <Typography variant="body1">{confirmFile.date || '-'}</Typography>
              </Box>
              {confirmFile.size && (
                <Box>
                  <Typography variant="label" color="text.secondary" gutterBottom>
                    Tamaño
                  </Typography>
                  <Typography variant="body1">{formatBytes(confirmFile.size)}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setConfirmFile(null)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant="contained" startIcon={<PlayArrowIcon />}>
            Procesar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!result}
        onClose={() => setResult(null)}
        maxWidth="sm"
        fullWidth
        aria-labelledby="result-title"
      >
        <DialogTitle
          id="result-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 600,
            fontSize: '1.125rem',
          }}
        >
          {result && result.rejected > 0 ? (
            <ReportProblemIcon sx={{ color: 'warning.dark' }} />
          ) : (
            <CheckCircleIcon color="success" />
          )}
          {result && result.rejected > 0 ? 'Archivo procesado con observaciones' : 'Archivo procesado'}
        </DialogTitle>
        <DialogContent dividers>
          {result && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {result.filename}
              </Typography>
              <Divider />
              <ResultStations processed={result.processed} rejected={result.rejected} />
              {result.rejected > 0 && (
                <Alert severity="warning" variant="outlined">
                  Hay transacciones rechazadas que requieren revisión. Puedes editar su monto para
                  reprocesarlas.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setResult(null)} variant="outlined">
            Cerrar
          </Button>
          <Button
            onClick={() => {
              const fileId = result?.fileId;
              setResult(null);
              navigate(`/transactions/${fileId}`);
            }}
            variant="contained"
          >
            Ver transacciones
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
          role="status"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
