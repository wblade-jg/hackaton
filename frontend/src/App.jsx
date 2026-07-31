import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import AppLayout from './components/layout/AppLayout';
import AvailableFiles from './components/files/AvailableFiles';
import ProcessedFiles from './components/files/ProcessedFiles';
import TransactionList from './components/transactions/TransactionList';
import NotFound from './components/common/NotFound';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<AvailableFiles />} />
            <Route path="/processed" element={<ProcessedFiles />} />
            <Route path="/transactions/:fileId" element={<TransactionList />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
