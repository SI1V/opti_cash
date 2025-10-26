import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { banksApi, cardsApi, cashbackApi } from '../services/api';

function Banks() {
  const [banks, setBanks] = useState([]);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editBankDialogOpen, setEditBankDialogOpen] = useState(false);
  const [editCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [editingBank, setEditingBank] = useState(null);
  const [newCard, setNewCard] = useState({ name: '', card_type: '' });
  const [editingCard, setEditingCard] = useState(null);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);

  const getCurrentMonth = () => new Date().getMonth() + 1;
  const getCurrentYear = () => new Date().getFullYear();

  const loadBanks = useCallback(async () => {
    try {
      const response = await banksApi.getAll();
      // Фильтруем категории только текущего месяца
      const currentMonth = getCurrentMonth();
      const currentYear = getCurrentYear();
      
      const filteredBanks = response.data.map(bank => ({
        ...bank,
        cards: bank.cards?.map(card => ({
          ...card,
          cashback_categories: card.cashback_categories?.filter(
            cat => cat.month === currentMonth && cat.year === currentYear
          ) || []
        })) || []
      }));
      
      setBanks(filteredBanks);
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  }, []);

  useEffect(() => {
    loadBanks();
  }, [loadBanks]);

  const handleAddBank = async () => {
    try {
      await banksApi.create({ name: newBankName });
      setNewBankName('');
      setBankDialogOpen(false);
      loadBanks();
    } catch (error) {
      console.error('Error adding bank:', error);
    }
  };

  const handleEditBank = async () => {
    try {
      await banksApi.update(editingBank.id, { name: newBankName });
      setNewBankName('');
      setEditingBank(null);
      setEditBankDialogOpen(false);
      loadBanks();
    } catch (error) {
      console.error('Error updating bank:', error);
    }
  };

  const openEditBankDialog = (bank) => {
    setEditingBank(bank);
    setNewBankName(bank.name);
    setEditBankDialogOpen(true);
  };

  const handleDeleteBank = async (bankId) => {
    try {
      await banksApi.delete(bankId);
      loadBanks();
    } catch (error) {
      console.error('Error deleting bank:', error);
    }
  };

  const handleAddCard = async () => {
    try {
      await cardsApi.create(selectedBankId, newCard);
      setNewCard({ name: '', card_type: '' });
      setCardDialogOpen(false);
      loadBanks();
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const handleEditCard = async () => {
    try {
      await cardsApi.update(editingCard.id, {
        name: editingCard.name,
        card_type: editingCard.card_type
      });
      setEditingCard(null);
      setNewCard({ name: '', card_type: '' });
      setEditCardDialogOpen(false);
      loadBanks();
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const openEditCardDialog = (card) => {
    setEditingCard({ ...card });
    setEditCardDialogOpen(true);
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await cardsApi.delete(cardId);
      loadBanks();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await cashbackApi.deleteCategory(categoryId);
      loadBanks();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSaveCategoryEdit = async () => {
    try {
      await cashbackApi.updateCategory(editingCategory.id, {
        category_name: editingCategory.category_name,
        cashback_percent: editingCategory.cashback_percent,
        icon: editingCategory.icon
      });
      setEditCategoryDialogOpen(false);
      setEditingCategory(null);
      loadBanks();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Банки и карты</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setBankDialogOpen(true)}
        >
          Добавить банк
        </Button>
      </Box>

      {banks.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              Нет добавленных банков. Добавьте первый банк, чтобы начать.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        banks.map((bank) => (
          <Accordion key={bank.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{bank.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedBankId(bank.id);
                    setCardDialogOpen(true);
                  }}
                >
                  Добавить карту
                </Button>
                <IconButton
                  color="primary"
                  onClick={() => openEditBankDialog(bank)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteBank(bank.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              {bank.cards && bank.cards.length > 0 ? (
                <List>
                  {bank.cards.map((card) => (
                    <Box key={card.id} sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CreditCardIcon sx={{ mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {card.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {card.card_type || 'Тип не указан'}
                          </Typography>
                        </Box>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => openEditCardDialog(card)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      
                      {card.cashback_categories && card.cashback_categories.length > 0 ? (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                            Категории кешбека (текущий месяц):
                          </Typography>
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
                                sx={{ mr: 0.5, mb: 0.5 }}
                                color="primary"
                                variant="outlined"
                                onDelete={() => handleDeleteCategory(category.id)}
                                onClick={() => handleEditCategory(category)}
                                clickable
                              />
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Нет категорий кешбека
                        </Typography>
                      )}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Нет карт. Добавьте первую карту.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}

      {/* Dialog for adding bank */}
      <Dialog open={bankDialogOpen} onClose={() => setBankDialogOpen(false)}>
        <DialogTitle>Добавить банк</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название банка"
            fullWidth
            variant="outlined"
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddBank} variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing bank */}
      <Dialog open={editBankDialogOpen} onClose={() => setEditBankDialogOpen(false)}>
        <DialogTitle>Редактировать банк</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название банка"
            fullWidth
            variant="outlined"
            value={newBankName}
            onChange={(e) => setNewBankName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditBankDialogOpen(false);
            setEditingBank(null);
            setNewBankName('');
          }}>Отмена</Button>
          <Button onClick={handleEditBank} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding card */}
      <Dialog open={cardDialogOpen} onClose={() => {
        setCardDialogOpen(false);
        setNewCard({ name: '', card_type: '' });
      }}>
        <DialogTitle>Добавить карту</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название карты"
            fullWidth
            variant="outlined"
            value={newCard.name}
            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Тип карты (необязательно)"
            fullWidth
            variant="outlined"
            value={newCard.card_type}
            onChange={(e) => setNewCard({ ...newCard, card_type: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCardDialogOpen(false);
            setNewCard({ name: '', card_type: '' });
          }}>Отмена</Button>
          <Button onClick={handleAddCard} variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing card */}
      <Dialog open={editCardDialogOpen} onClose={() => {
        setEditCardDialogOpen(false);
        setEditingCard(null);
      }}>
        <DialogTitle>Редактировать карту</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название карты"
            fullWidth
            variant="outlined"
            value={editingCard?.name || ''}
            onChange={(e) => setEditingCard({ ...editingCard, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Тип карты (необязательно)"
            fullWidth
            variant="outlined"
            value={editingCard?.card_type || ''}
            onChange={(e) => setEditingCard({ ...editingCard, card_type: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditCardDialogOpen(false);
            setEditingCard(null);
          }}>Отмена</Button>
          <Button onClick={handleEditCard} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for editing category */}
      <Dialog open={editCategoryDialogOpen} onClose={() => setEditCategoryDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Редактировать категорию</DialogTitle>
        <DialogContent>
          {editingCategory && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Название категории"
                fullWidth
                variant="outlined"
                value={editingCategory.category_name}
                onChange={(e) => setEditingCategory({ ...editingCategory, category_name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Процент кешбека"
                fullWidth
                type="number"
                variant="outlined"
                value={editingCategory.cashback_percent}
                onChange={(e) => setEditingCategory({ ...editingCategory, cashback_percent: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                margin="dense"
                label="Иконка"
                fullWidth
                variant="outlined"
                value={editingCategory.icon || 'shopping_cart'}
                onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
              >
                {[
                  'ShoppingCart', 'LocalGasStation', 'Restaurant', 'LocalPharmacy',
                  'MedicalServices', 'DirectionsBus', 'Train', 'LocalTaxi',
                  'ConfirmationNumber', 'Movie', 'SportsEsports', 'ShoppingBag',
                  'School', 'MenuBook', 'Hotel', 'Flight', 'FitnessCenter',
                  'Face', 'ContentCut', 'Build', 'Construction'
                ].map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    {icon}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCategoryDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveCategoryEdit} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Banks;
