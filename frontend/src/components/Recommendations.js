import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Autocomplete,
  Chip,
  Alert,
} from '@mui/material';
import { Search as SearchIcon, CreditCard as CreditCardIcon } from '@mui/icons-material';
import { cashbackApi } from '../services/api';

function Recommendations() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Получаем только категории текущего месяца
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const response = await cashbackApi.getCategories({
        month: currentMonth,
        year: currentYear
      });
      // Получаем уникальные категории текущего месяца
      const categories = [...new Set(response.data.map(c => c.category_name))];
      setAllCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!selectedCategory.trim()) {
      setError('Пожалуйста, выберите категорию');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Получаем текущий месяц и год для фильтрации
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const response = await cashbackApi.getRecommendations(selectedCategory, {
        month: currentMonth,
        year: currentYear
      });
      setRecommendations(response.data.recommendations || []);
      
      if (response.data.recommendations.length === 0) {
        setError('Нет рекомендаций для выбранной категории на текущий месяц. Добавьте категории кешбека для ваших карт.');
      }
    } catch (err) {
      setError('Ошибка при получении рекомендаций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Рекомендации по выбору карты
      </Typography>

      <Card sx={{ mt: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <Autocomplete
              freeSolo
              options={allCategories}
              value={selectedCategory}
              onChange={(event, newValue) => {
                setSelectedCategory(newValue || '');
                setError(null);
              }}
              onInputChange={(event, newInputValue) => {
                setSelectedCategory(newInputValue);
                setError(null);
              }}
              sx={{ flex: 1, minWidth: 200 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Выберите категорию покупки"
                  placeholder="Например: АЗС, Кафе, Супермаркет"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Поиск...' : 'Найти'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {recommendations.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Рекомендуемые карты для категории "{selectedCategory}"
          </Typography>

          {recommendations.map((rec, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CreditCardIcon color="primary" />
                    <Box>
                      <Typography variant="h6">{rec.card_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rec.bank_name}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${rec.cashback_percent}%`}
                    color={index === 0 ? 'primary' : 'default'}
                    sx={{ fontSize: '1.2rem', fontWeight: 'bold', height: 40 }}
                  />
                </Box>
                {index === 0 && (
                  <Chip
                    label="Рекомендуется"
                    color="success"
                    size="small"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!error && recommendations.length === 0 && !loading && (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              Выберите категорию покупки, чтобы получить рекомендации
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Recommendations;
