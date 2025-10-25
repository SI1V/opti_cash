import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useMediaQuery,
  useTheme,
  Button,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import {
  Home as HomeIcon,
  CreditCard as CreditCardIcon,
  PhotoCamera as PhotoCameraIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import Home from './components/Home';
import Banks from './components/Banks';
import Recommendations from './components/Recommendations';
import ScreenshotUpload from './components/ScreenshotUpload';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

// Создаем красивую тему с градиентами
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Индиго
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Розовый
      light: '#f472b6',
      dark: '#db2777',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Светло-серый
      paper: '#ffffff',
    },
    success: {
      main: '#10b981', // Зеленый
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // Оранжевый
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Красный
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 4px 20px 0 rgba(99, 102, 241, 0.15)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 -4px 20px 0 rgba(0, 0, 0, 0.1)',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function Navigation() {
  const [value, setValue] = useState(0);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/banks') setValue(1);
    else if (path === '/recommendations') setValue(2);
    else if (path === '/screenshot') setValue(3);
  }, [location]);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  if (isMobile) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Cashback Optimizer
            </Typography>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {user.username}
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  size="small"
                >
                  Выход
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          showLabels
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        >
          <BottomNavigationAction
            label="Главная"
            icon={<HomeIcon />}
            component={Link}
            to="/"
          />
          <BottomNavigationAction
            label="Банки"
            icon={<BankIcon />}
            component={Link}
            to="/banks"
          />
          <BottomNavigationAction
            label="Рекомендации"
            icon={<TrendingUpIcon />}
            component={Link}
            to="/recommendations"
          />
          <BottomNavigationAction
            label="Скриншот"
            icon={<PhotoCameraIcon />}
            component={Link}
            to="/screenshot"
          />
        </BottomNavigation>
      </>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Cashback Optimizer
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography
            component={Link}
            to="/"
            color="inherit"
            underline="none"
            sx={{ px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Главная
          </Typography>
          <Typography
            component={Link}
            to="/banks"
            color="inherit"
            underline="none"
            sx={{ px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Банки
          </Typography>
          <Typography
            component={Link}
            to="/recommendations"
            color="inherit"
            underline="none"
            sx={{ px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Рекомендации
          </Typography>
          <Typography
            component={Link}
            to="/screenshot"
            color="inherit"
            underline="none"
            sx={{ px: 2, py: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
          >
            Скриншот
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Typography variant="body2">
                {user.username}
              </Typography>
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                size="small"
              >
                Выход
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function AppContent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  // Скрываем навигацию на страницах логина и регистрации
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAuthPage && <Navigation />}
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          py: isMobile ? 3 : 4,
          pb: isMobile ? (isAuthPage ? 4 : 10) : 4,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/banks" element={
            <ProtectedRoute>
              <Banks />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          } />
          <Route path="/screenshot" element={
            <ProtectedRoute>
              <ScreenshotUpload />
            </ProtectedRoute>
          } />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
