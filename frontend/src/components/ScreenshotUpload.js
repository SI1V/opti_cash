import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, CameraAlt as CameraAltIcon } from '@mui/icons-material';
import { ocrApi, banksApi, cashbackApi } from '../services/api';

function ScreenshotUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [banks, setBanks] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const response = await banksApi.getAll();
      setBanks(response.data);
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const handleSaveCategories = async () => {
    if (!selectedCard || !results.categories || results.categories.length === 0) {
      setError('Выберите карту и убедитесь, что есть категории для сохранения');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Сохраняем каждую категорию
      for (const category of results.categories) {
        await cashbackApi.createCategory(selectedCard, {
          category_name: category.category_name,
          cashback_percent: category.cashback_percent,
          month: month,
          year: year,
          icon: category.icon || "shopping_cart"
        });
      }

      // Очистка всех данных для возможности добавления новых скриншотов
      setResults(null);
      setSelectedCard(null);
      setSelectedFile(null);
      setPreview(null);
      alert('Категории успешно сохранены!');
    } catch (error) {
      setError('Ошибка при сохранении категорий');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResults(null);

      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ocrApi.processScreenshot(selectedFile);
      setResults(response.data);
    } catch (err) {
      setError('Ошибка при распознавании изображения. Убедитесь, что файл - это скриншот с текстом.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Распознавание скриншота
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Загрузите скриншот с категориями кешбека из приложения банка.
        Система автоматически распознает категории и проценты кешбека.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Месяц"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {[
                  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ].map((monthName, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {monthName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                fullWidth
                label="Год"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                inputProps={{ min: 2020, max: 2100 }}
              />
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', py: 4 }}>
            {!preview ? (
              <>
                <CameraAltIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Загрузите скриншот
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="screenshot-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="screenshot-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 2 }}
                  >
                    Выбрать файл
                  </Button>
                </label>
              </>
            ) : (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 8 }}
                />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setResults(null);
                    }}
                    sx={{ mr: 2 }}
                  >
                    Выбрать другой
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CameraAltIcon />}
                  >
                    {loading ? 'Распознавание...' : 'Распознать'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && results.categories && results.categories.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Распознанные категории для {['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'][month - 1]} {year}:
            </Typography>
            {results.categories.map((category, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                  {category.category_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Кешбек: {category.cashback_percent}%
                </Typography>
              </Box>
            ))}
            
            <Box sx={{ mt: 3 }}>
              <TextField
                select
                fullWidth
                label="Выберите карту для сохранения категорий"
                value={selectedCard || ''}
                onChange={(e) => setSelectedCard(parseInt(e.target.value))}
                sx={{ mb: 2 }}
              >
                {banks.flatMap(bank => 
                  bank.cards && bank.cards.length > 0 
                    ? bank.cards.map(card => (
                        <MenuItem key={card.id} value={card.id}>
                          {bank.name} - {card.name}
                        </MenuItem>
                      ))
                    : []
                )}
              </TextField>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleSaveCategories}
                disabled={!selectedCard || saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить категории к карте'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {results && results.categories && results.categories.length === 0 && (
        <Alert severity="warning">
          Не удалось распознать категории. Убедитесь, что скриншот содержит текст с категориями и процентами кешбека.
        </Alert>
      )}
    </Box>
  );
}

export default ScreenshotUpload;
