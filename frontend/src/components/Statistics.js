import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Chip,
  Grid,
  Alert,
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { banksApi } from '../services/api';

const months = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

function Statistics() {
  const [banks, setBanks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadBanks = useCallback(async () => {
    try {
      const response = await banksApi.getAll();
      
      // Фильтруем категории по выбранному месяцу и году
      const filteredBanks = response.data.map(bank => ({
        ...bank,
        cards: bank.cards?.map(card => ({
          ...card,
          cashback_categories: card.cashback_categories?.filter(
            cat => cat.month === selectedMonth && cat.year === selectedYear
          ) || []
        })) || []
      }));
      
      setBanks(filteredBanks);
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  // Получаем список всех месяцев, в которых есть данные
  const getAllDataMonths = () => {
    const allData = {};
    banks.forEach(bank => {
      bank.cards?.forEach(card => {
        card.cashback_categories?.forEach(cat => {
          if (!allData[`${cat.year}-${cat.month}`]) {
            allData[`${cat.year}-${cat.month}`] = true;
          }
        });
      });
    });
    return Object.keys(allData)
      .map(key => {
        const [year, month] = key.split('-').map(Number);
        return { year, month, monthName: months[month - 1] };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);
  };

  const dataMonths = getAllDataMonths();
  const hasData = banks.some(bank => 
    bank.cards?.some(card => 
      card.cashback_categories && card.cashback_categories.length > 0
    )
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5">Статистика кешбека</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Месяц"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            sx={{ minWidth: 150 }}
          >
            {months.map((name, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            label="Год"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            inputProps={{ min: 2020, max: 2100 }}
            sx={{ minWidth: 120 }}
          />
        </Box>
      </Box>

      {dataMonths.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Доступные периоды с данными:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {dataMonths.map(({ year, month, monthName }) => (
                <Chip
                  key={`${year}-${month}`}
                  label={`${monthName} ${year}`}
                  onClick={() => {
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }}
                  color={selectedMonth === month && selectedYear === year ? 'primary' : 'default'}
                  variant={selectedMonth === month && selectedYear === year ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {!hasData && (
        <Alert severity="info">
          Нет данных по категориям кешбека для {months[selectedMonth - 1]} {selectedYear}.
          Перейдите в раздел "Скриншот" для добавления категорий.
        </Alert>
      )}

      {banks.filter(bank => 
        bank.cards?.some(card => card.cashback_categories && card.cashback_categories.length > 0)
      ).map((bank) => (
        <Card key={bank.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {bank.name}
            </Typography>
            <Grid container spacing={2}>
              {bank.cards
                ?.filter(card => card.cashback_categories && card.cashback_categories.length > 0)
                .map((card) => (
                  <Grid item xs={12} key={card.id}>
                    <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {card.name}
                        {card.card_type && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({card.card_type})
                          </Typography>
                        )}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {card.cashback_categories.map((category) => {
                          let IconComponent =
                            require('@mui/icons-material')[category.icon || 'ShoppingCart'] ||
                            require('@mui/icons-material').ShoppingCart;

                          return (
                            <Chip
                              key={category.id}
                              icon={<IconComponent />}
                              label={`${category.category_name}: ${category.cashback_percent}%`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default Statistics;

