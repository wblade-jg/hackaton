import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import { useTransactions } from "../../hooks/useTransactions";
import { formatCurrency, formatDate } from "../../utils/format";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";
import TableSkeleton from "../common/TableSkeleton";
import ErrorState from "../common/ErrorState";
import CardList from "../common/CardList";
import RejectReasonModal from "../transactions/RejectReasonModal";
import EditAmountModal from "../transactions/EditAmountModal";

function SummaryCard({ value, label, rule }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 140,
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        borderTop: "3px solid",
        borderTopColor: rule,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="label" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
    </Box>
  );
}

SummaryCard.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  rule: PropTypes.string.isRequired,
};

export default function TransactionList() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    transactions,
    fileInfo,
    loading,
    loadingMore,
    error,
    nextCursor,
    hasNextPage,
    fetchTransactions,
    updateAmount,
  } = useTransactions();
  const [rejectionModal, setRejectionModal] = useState({
    open: false,
    transaction: null,
  });
  const [editModal, setEditModal] = useState({
    open: false,
    transaction: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (fileId) fetchTransactions(fileId);
  }, [fileId, fetchTransactions]);

  const handleAmountUpdated = useCallback(
    async (transactionId, newAmount) => {
      await updateAmount(transactionId, newAmount);
      setEditModal({ open: false, transaction: null });
      if (fileId) fetchTransactions(fileId);
    },
    [updateAmount, fileId, fetchTransactions],
  );

  const counts = useMemo(
    () => ({
      total: fileInfo?.totalTransactions ?? transactions.length,
      processed:
        fileInfo?.processedCount ??
        transactions.filter((t) => t.status === "PROCESSED").length,
      rejected:
        fileInfo?.rejectedCount ??
        transactions.filter((t) => t.status === "REJECTED").length,
    }),
    [fileInfo, transactions],
  );

  const visibleTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;
      const matchesAccount = !query || tx.account.toLowerCase().includes(query);
      return matchesStatus && matchesAccount;
    });
  }, [transactions, searchQuery, statusFilter]);

  const renderCards = (
    <CardList
      items={visibleTransactions}
      renderItem={(tx) => (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, wordBreak: "break-all" }}
            >
              {tx.account}
            </Typography>
            <StatusBadge status={tx.status} />
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {tx.date}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600 }}
              color={tx.status === "REJECTED" ? "error.main" : "text.primary"}
            >
              {formatCurrency(tx.amount)}
            </Typography>
          </Box>
          {tx.status === "REJECTED" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() =>
                  setRejectionModal({ open: true, transaction: tx })
                }
                sx={{ minHeight: 44 }}
              >
                Ver motivo de rechazo
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditModal({ open: true, transaction: tx })}
                sx={{ minHeight: 44 }}
              >
                Editar monto
              </Button>
            </Box>
          )}
        </>
      )}
    />
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
        }}
      >
        <IconButton
          onClick={() => navigate("/processed")}
          aria-label="Volver a archivos procesados"
          size="small"
          sx={{ border: "1px solid", borderColor: "divider" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" noWrap>
            {fileInfo?.filename || "Transacciones"}
          </Typography>
          {fileInfo && (
            <Typography variant="body2" color="text.secondary">
              Procesado el {formatDate(fileInfo.processedDate)} &middot;{" "}
              {counts.total} transacciones
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2.5 }}
        aria-label="Resumen de transacciones"
      >
        <SummaryCard value={counts.total} label="Total" rule="primary.main" />
        <SummaryCard
          value={counts.processed}
          label="Procesadas"
          rule="success.main"
        />
        <SummaryCard
          value={counts.rejected}
          label="Rechazadas"
          rule="error.main"
        />
      </Box>

      <Paper>
        {loading && transactions.length === 0 ? (
          <TableSkeleton rows={6} columns={6} />
        ) : error && transactions.length === 0 ? (
          <ErrorState
            message={error}
            onRetry={() => fetchTransactions(fileId)}
          />
        ) : transactions.length === 0 && !loading ? (
          <EmptyState
            icon={ReceiptLongIcon}
            title="No hay transacciones"
            description="Este archivo no contiene transacciones para mostrar."
          />
        ) : (
          <>
            {error && transactions.length > 0 && (
              <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
                <Alert
                  severity="error"
                  variant="outlined"
                  action={
                    <Button
                      color="error"
                      size="small"
                      onClick={() => fetchTransactions(fileId)}
                    >
                      Reintentar
                    </Button>
                  }
                >
                  No se pudo actualizar la lista: {error}
                </Alert>
              </Box>
            )}

            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                pt: 2,
                pb: 1,
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por número de cuenta..."
                size="small"
                sx={{ flex: 1, minWidth: 220, maxWidth: 380 }}
                slotProps={{
                  htmlInput: {
                    "aria-label": "Buscar transacciones por cuenta",
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
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="status-filter-label">Estado</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  <MenuItem value="PROCESSED">Procesadas</MenuItem>
                  <MenuItem value="REJECTED">Rechazadas</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {isMobile ? (
              visibleTransactions.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron transacciones con los filtros
                    seleccionados
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {renderCards}
                  {hasNextPage && (
                    <Box
                      sx={{ p: 2, display: "flex", justifyContent: "center" }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() =>
                          fetchTransactions(fileId, nextCursor, true)
                        }
                        disabled={loadingMore}
                      >
                        {loadingMore ? "Cargando..." : "Cargar más"}
                      </Button>
                    </Box>
                  )}
                </Box>
              )
            ) : (
              <>
                <TableContainer>
                  <Table aria-label="Tabla de transacciones">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Cuenta</TableCell>
                        <TableCell>Fecha</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                            <Typography variant="body2" color="text.secondary">
                              No se encontraron transacciones con los filtros
                              seleccionados
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        visibleTransactions.map((tx, index) => (
                          <TableRow
                            key={tx.id || index}
                            hover
                            sx={{
                              "&:last-child td": { borderBottom: 0 },
                              backgroundColor:
                                tx.status === "REJECTED"
                                  ? "rgba(194, 52, 43, 0.045)"
                                  : undefined,
                            }}
                            aria-label={`Transacción ${index + 1}`}
                          >
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {index + 1}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {tx.account}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {tx.date}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600 }}
                                color={
                                  tx.status === "REJECTED"
                                    ? "error.main"
                                    : "text.primary"
                                }
                              >
                                {formatCurrency(tx.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={tx.status} />
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 0.5,
                                }}
                              >
                                {tx.status === "REJECTED" &&
                                  tx.rejectionReason && (
                                    <Tooltip
                                      title="Ver motivo de rechazo"
                                      arrow
                                    >
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          setRejectionModal({
                                            open: true,
                                            transaction: tx,
                                          })
                                        }
                                        aria-label={`Ver motivo de rechazo de transacción ${index + 1}`}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                {tx.status === "REJECTED" && (
                                  <Tooltip
                                    title="Editar monto y reprocesar"
                                    arrow
                                  >
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() =>
                                        setEditModal({
                                          open: true,
                                          transaction: tx,
                                        })
                                      }
                                      aria-label={`Editar monto de transacción ${index + 1}`}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {hasNextPage && (
                  <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        fetchTransactions(fileId, nextCursor, true)
                      }
                      disabled={loadingMore}
                    >
                      {loadingMore ? "Cargando..." : "Cargar más"}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </Paper>

      <RejectReasonModal
        open={rejectionModal.open}
        transaction={rejectionModal.transaction}
        onClose={() => setRejectionModal({ open: false, transaction: null })}
      />

      <EditAmountModal
        open={editModal.open}
        transaction={editModal.transaction}
        onClose={() => setEditModal({ open: false, transaction: null })}
        onSave={handleAmountUpdated}
      />
    </Box>
  );
}
