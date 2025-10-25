import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CameraAlt,
  Search,
} from '@mui/icons-material';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Управление банками и картами',
      description: 'Добавляйте и редактируйте банки, карты и категории кешбека',
      icon: <CreditCard fontSize="large" />,
      path: '/banks',
    },
    {
      title: 'Рекомендации по выбору карты',
      description: 'Получите рекомендации по выбору карты для любой категории покупки с максимальным кешбеком',
      icon: <Search fontSize="large" />,
      path: '/recommendations',
    },
    {
      title: 'Распознавание скриншотов',
      description: 'Загрузите скриншот из приложения банка для автоматического распознавания категорий',
      icon: <CameraAlt fontSize="large" />,
      path: '/screenshot',
    },
  ];

  return (
    <Box>
      {/* Hero Section с градиентом */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          💳 Cashback Optimizer
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            fontWeight: 400,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Оптимизируйте свои расходы и получайте максимальный кешбек с каждой покупки
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${
                    index === 0 ? '#6366f1, #8b5cf6' :
                    index === 1 ? '#10b981, #34d399' :
                    '#ec4899, #f472b6'
                  })`,
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box 
                  sx={{ 
                    color: index === 0 ? 'primary.main' : 
                          index === 1 ? 'success.main' : 'secondary.main',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${
                      index === 0 ? 'rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)' :
                      index === 1 ? 'rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1)' :
                      'rgba(236, 72, 153, 0.1), rgba(244, 114, 182, 0.1)'
                    })`,
                    mb: 3,
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: 1.6,
                    mb: 3,
                  }}
                >
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ 
                    mt: 'auto',
                    background: `linear-gradient(135deg, ${
                      index === 0 ? '#6366f1, #8b5cf6' :
                      index === 1 ? '#10b981, #34d399' :
                      '#ec4899, #f472b6'
                    })`,
                    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.path);
                  }}
                >
                  Начать →
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;
