import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNotification } from '@refinedev/core';
import { RefineListView } from '../../components/index.js';
import {
  FaqApi,
  type TFaqCategory,
  type TFaqQuestion,
} from '../../api/legals.js';

type TCategoryForm = {
  name: string;
  order: string;
};

type TQuestionForm = {
  question: string;
  answer: string;
  order: string;
};

const EMPTY_CATEGORY_FORM: TCategoryForm = {
  name: '',
  order: '0',
};

const EMPTY_QUESTION_FORM: TQuestionForm = {
  question: '',
  answer: '',
  order: '0',
};

const sortFaqCategories = (categories: TFaqCategory[]) =>
  [...categories]
    .map((category) => ({
      ...category,
      questions: [...(category.questions || [])].sort(
        (left, right) => left.order - right.order,
      ),
    }))
    .sort((left, right) => left.order - right.order);

const getNextOrder = (orders: number[]) => {
  const highestOrder = orders.length ? Math.max(...orders) : 0;
  return String(highestOrder + 1);
};

export const FaqList = () => {
  const { open } = useNotification();
  const [faqCategories, setFaqCategories] = useState<TFaqCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqSaving, setFaqSaving] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState<{
    mode: 'create' | 'edit';
    category: TFaqCategory | null;
  } | null>(null);
  const [questionDialog, setQuestionDialog] = useState<{
    mode: 'create' | 'edit';
    question: TFaqQuestion | null;
  } | null>(null);
  const [categoryForm, setCategoryForm] =
    useState<TCategoryForm>(EMPTY_CATEGORY_FORM);
  const [questionForm, setQuestionForm] =
    useState<TQuestionForm>(EMPTY_QUESTION_FORM);

  const selectedCategory = useMemo(
    () =>
      faqCategories.find((category) => category.id === selectedCategoryId) ||
      null,
    [faqCategories, selectedCategoryId],
  );

  const nextCategoryOrder = useMemo(
    () => getNextOrder(faqCategories.map((category) => category.order)),
    [faqCategories],
  );

  const nextQuestionOrder = useMemo(
    () =>
      getNextOrder(
        (selectedCategory?.questions || []).map((question) => question.order),
      ),
    [selectedCategory],
  );

  const loadFaq = async (preferredCategoryId?: string) => {
    setFaqLoading(true);
    try {
      const res = await FaqApi.getAll();
      const fetched = sortFaqCategories(res.data.data || []);
      setFaqCategories(fetched);
      setSelectedCategoryId((current) => {
        if (
          preferredCategoryId &&
          fetched.some((category) => category.id === preferredCategoryId)
        ) {
          return preferredCategoryId;
        }

        if (current && fetched.some((category) => category.id === current)) {
          return current;
        }

        return fetched[0]?.id || null;
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to load FAQs',
      });
    } finally {
      setFaqLoading(false);
    }
  };

  useEffect(() => {
    void loadFaq();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCategoryDialog = (category?: TFaqCategory) => {
    setCategoryForm(
      category
        ? { name: category.name, order: String(category.order) }
        : { name: '', order: nextCategoryOrder },
    );
    setCategoryDialog({
      mode: category ? 'edit' : 'create',
      category: category || null,
    });
  };

  const openQuestionDialog = (question?: TFaqQuestion) => {
    setQuestionForm(
      question
        ? {
            question: question.question,
            answer: question.answer,
            order: String(question.order),
          }
        : { question: '', answer: '', order: nextQuestionOrder },
    );
    setQuestionDialog({
      mode: question ? 'edit' : 'create',
      question: question || null,
    });
  };

  const handleSaveCategory = async () => {
    const name = categoryForm.name.trim();
    if (!name) return;

    setFaqSaving(true);
    try {
      const resolvedOrder =
        categoryForm.order.trim() === ''
          ? Number(nextCategoryOrder)
          : Number(categoryForm.order);
      const payload = {
        name,
        order: Number.isNaN(resolvedOrder)
          ? Number(nextCategoryOrder)
          : resolvedOrder,
      };

      const res =
        categoryDialog?.mode === 'edit' && categoryDialog.category
          ? await FaqApi.updateCategory(categoryDialog.category.id, payload)
          : await FaqApi.createCategory(payload);

      setCategoryDialog(null);
      await loadFaq(res.data.data?.id);
      open?.({
        type: 'success',
        message:
          categoryDialog?.mode === 'edit'
            ? 'FAQ category updated'
            : 'FAQ category created',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to save FAQ category',
      });
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteCategory = async (category: TFaqCategory) => {
    if (!window.confirm(`Delete "${category.name}" and its questions?`)) return;

    setFaqSaving(true);
    try {
      await FaqApi.deleteCategory(category.id);
      await loadFaq();
      open?.({
        type: 'success',
        message: 'FAQ category deleted',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to delete FAQ category',
      });
    } finally {
      setFaqSaving(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!selectedCategoryId) return;

    const question = questionForm.question.trim();
    const answer = questionForm.answer.trim();
    if (!question || !answer) return;

    setFaqSaving(true);
    try {
      const resolvedOrder =
        questionForm.order.trim() === ''
          ? Number(nextQuestionOrder)
          : Number(questionForm.order);
      const payload = {
        question,
        answer,
        order: Number.isNaN(resolvedOrder)
          ? Number(nextQuestionOrder)
          : resolvedOrder,
        categoryId: selectedCategoryId,
      };

      if (questionDialog?.mode === 'edit' && questionDialog.question) {
        await FaqApi.updateQuestion(questionDialog.question.id, payload);
      } else {
        await FaqApi.createQuestion(payload);
      }

      setQuestionDialog(null);
      await loadFaq(selectedCategoryId);
      open?.({
        type: 'success',
        message:
          questionDialog?.mode === 'edit'
            ? 'FAQ question updated'
            : 'FAQ question created',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to save FAQ question',
      });
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteQuestion = async (question: TFaqQuestion) => {
    if (!window.confirm(`Delete "${question.question}"?`)) return;

    setFaqSaving(true);
    try {
      await FaqApi.deleteQuestion(question.id);
      await loadFaq(selectedCategoryId || undefined);
      open?.({
        type: 'success',
        message: 'FAQ question deleted',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to delete FAQ question',
      });
    } finally {
      setFaqSaving(false);
    }
  };

  return (
    <RefineListView
      title="FAQs"
      wrapperProps={{ sx: { flexDirection: 'column' } }}
      headerButtons={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openCategoryDialog()}
          disabled={faqSaving}
        >
          Add Category
        </Button>
      }
    >
      <Paper sx={{ p: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HelpOutlineIcon color="primary" />
          <Typography variant="body2" color="text.secondary">
            Manage the FAQ categories and questions shown in the storefront.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography variant="h6">Categories</Typography>
                  <IconButton
                    color="primary"
                    onClick={() => openCategoryDialog()}
                    disabled={faqSaving}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>

                {faqLoading ? (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 5 }}
                  >
                    <CircularProgress />
                  </Box>
                ) : faqCategories.length === 0 ? (
                  <Alert severity="info">No FAQ categories yet.</Alert>
                ) : (
                  <List disablePadding>
                    {faqCategories.map((category) => (
                      <ListItemButton
                        key={category.id}
                        selected={category.id === selectedCategoryId}
                        onClick={() => setSelectedCategoryId(category.id)}
                        sx={{ borderRadius: 1, mb: 0.75 }}
                      >
                        <ListItemText
                          primary={category.name}
                          secondary={`${
                            category.questions?.length || 0
                          } questions • Order ${category.order}`}
                        />
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            openCategoryDialog(category);
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteCategory(category);
                          }}
                          disabled={faqSaving}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  spacing={1.5}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="h6">
                      {selectedCategory?.name || 'Questions'}
                    </Typography>
                    {selectedCategory && (
                      <Typography variant="body2" color="text.secondary">
                        Manage questions displayed under this category.
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openQuestionDialog()}
                    disabled={!selectedCategory || faqSaving}
                  >
                    Add Question
                  </Button>
                </Stack>

                {!selectedCategory ? (
                  <Alert severity="info">
                    Select or create a category to manage FAQ questions.
                  </Alert>
                ) : selectedCategory.questions.length === 0 ? (
                  <Alert severity="info">
                    This category does not have questions yet.
                  </Alert>
                ) : (
                  <Stack spacing={1.5}>
                    {selectedCategory.questions.map((question) => (
                      <Card key={question.id} variant="outlined">
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1.5}
                          >
                            <Box>
                              <Typography variant="subtitle1">
                                {question.question}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}
                              >
                                {question.answer}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block', mt: 1 }}
                              >
                                Order {question.order}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => openQuestionDialog(question)}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  void handleDeleteQuestion(question)
                                }
                                disabled={faqSaving}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={Boolean(categoryDialog)}
        onClose={() => setCategoryDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {categoryDialog?.mode === 'edit'
            ? 'Edit FAQ Category'
            : 'Add FAQ Category'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Category Name"
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Order"
              type="number"
              value={categoryForm.order}
              onChange={(event) =>
                setCategoryForm((prev) => ({
                  ...prev,
                  order: event.target.value,
                }))
              }
              inputProps={{ step: 1 }}
              helperText="Leave blank to auto-assign the next order number."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(null)} disabled={faqSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveCategory()}
            disabled={faqSaving || !categoryForm.name.trim()}
          >
            {faqSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(questionDialog)}
        onClose={() => setQuestionDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {questionDialog?.mode === 'edit'
            ? 'Edit FAQ Question'
            : 'Add FAQ Question'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              label="Question"
              value={questionForm.question}
              onChange={(event) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  question: event.target.value,
                }))
              }
              fullWidth
            />
            <TextField
              label="Answer"
              value={questionForm.answer}
              onChange={(event) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  answer: event.target.value,
                }))
              }
              multiline
              minRows={5}
              fullWidth
            />
            <Divider />
            <TextField
              label="Order"
              type="number"
              value={questionForm.order}
              onChange={(event) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  order: event.target.value,
                }))
              }
              inputProps={{ step: 1 }}
              helperText="Leave blank to auto-assign the next order number."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuestionDialog(null)} disabled={faqSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveQuestion()}
            disabled={
              faqSaving ||
              !questionForm.question.trim() ||
              !questionForm.answer.trim()
            }
          >
            {faqSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </RefineListView>
  );
};
