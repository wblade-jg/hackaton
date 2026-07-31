import { useState, useEffect } from 'react';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useFiles } from '../../hooks/useFiles';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';

export default function AvailableFiles() {
  const { availableFiles, loading, error, fetchAvailable, processFile } = useFiles();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [confirmFile, setConfirmFile] = useState(null);
  const [processingFile, setProcessingFile] = useState(null);
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const isProcessing = processingFile !== null;

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

  const renderTable = (
    <TableContainer>
      <Table aria-label="Tabla de archivos disponibles">
        <TableHead>
          <TableRow>
            <TableCell>Nombre del Archivo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {availableFiles.map((file, index) => (
            <TableRow
              key={file.filename || index}
              hover
              sx={{ '&:last-child td': { borderBottom: 0 } }}
            >
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  <DescriptionIcon
                    sx={{ color: 'primary.light', fontSize: 20, verticalAlign: 'middle', mr: 0.5 }}
                  />
                  {file.filename}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {file.date || '-'}
                </Typography>
              </TableCell>
              <TableCell align="right">{processButton(file)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCards = (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {availableFiles.map((file, index) => (
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
              {file.date || '-'}
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
      <Box display="flex" alignItems="flex-start" mb={3} sx={{ pl: { xs: 2, sm: 3 } }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Archivos Disponibles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona un archivo para procesar las transacciones entrantes
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAvailable}
          disabled={loading}
          sx={{ ml: 'auto', mr: 0 }}
          aria-label="Actualizar lista de archivos"
        >
          Actualizar
        </Button>
      </Box>

      <Paper sx={{ mx: { xs: 2, sm: 3 } }}>
        {loading && availableFiles.length === 0 ? (
          <LoadingState message="Buscando archivos disponibles..." />
        ) : error && availableFiles.length === 0 ? (
          <ErrorState message={error} onRetry={fetchAvailable} />
        ) : availableFiles.length === 0 ? (
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
        ) : (
          <>
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
            {isMobile ? renderCards : renderTable}
          </>
        )}
      </Paper>

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
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Archivo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                  {confirmFile.filename}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Fecha
                </Typography>
                <Typography variant="body1">{confirmFile.date || '-'}</Typography>
              </Box>
              {confirmFile.size && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Tamaño
                  </Typography>
                  <Typography variant="body1">{confirmFile.size}</Typography>
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
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
        >
          {result && result.rejected > 0 ? (
            <ReportProblemIcon color="warning" />
          ) : (
            <CheckCircleIcon color="success" />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {result && result.rejected > 0 ? 'Archivo procesado con observaciones' : 'Archivo procesado'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {result && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {result.filename}
              </Typography>
              <Divider />
              <Box display="flex" gap={2} flexWrap="wrap">
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'success.main',
                    color: 'success.contrastText',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {result.processed}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Procesadas</Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 120,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'error.main',
                    color: 'error.contrastText',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {result.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Rechazadas</Typography>
                </Box>
              </Box>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
