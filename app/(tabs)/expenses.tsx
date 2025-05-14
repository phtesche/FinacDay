import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Trash2, CreditCard as Edit, Plus, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useExpensesStore } from '@/stores/expensesStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import { Picker } from '@/components/Picker';

const EXPENSE_CATEGORIES = [
  { label: 'Housing', value: 'housing' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Food', value: 'food' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Personal', value: 'personal' },
  { label: 'Education', value: 'education' },
  { label: 'Other', value: 'other' },
];

export default function ExpensesScreen() {
  const { expenses, addExpense, updateExpense, deleteExpense, togglePaid, getTotalExpenses } = useExpensesStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalExpenses = getTotalExpenses();
  const pendingExpenses = expenses.filter(expense => !expense.paid);
  const paidExpenses = expenses.filter(expense => expense.paid);

  const openAddModal = () => {
    setCurrentExpense(null);
    setDescription('');
    setAmount('');
    setDueDate(formatDate(new Date(), 'yyyy-MM-dd'));
    setCategory(EXPENSE_CATEGORIES[0].value);
    setErrors({});
    setIsModalVisible(true);
  };

  const openEditModal = (expense: any) => {
    setCurrentExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setDueDate(expense.dueDate);
    setCategory(expense.category);
    setErrors({});
    setIsModalVisible(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!dueDate.trim()) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate)) {
        newErrors.dueDate = 'Due date must be in YYYY-MM-DD format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const expenseData = {
      description,
      amount: parseFloat(amount),
      dueDate,
      category,
      paid: currentExpense ? currentExpense.paid : false,
    };
    
    if (currentExpense) {
      updateExpense(currentExpense.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    setIsModalVisible(false);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  const handleTogglePaid = (id: string, currentPaid: boolean) => {
    togglePaid(id, !currentPaid);
  };

  const getCategoryLabel = (value: string) => {
    const category = EXPENSE_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : 'Other';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Expenses</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalExpenses)}</Text>
          <View style={styles.statusSummary}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Pending</Text>
              <Text style={[styles.statusValue, styles.pendingValue]}>
                {formatCurrency(pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Paid</Text>
              <Text style={[styles.statusValue, styles.paidValue]}>
                {formatCurrency(paidExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.expensesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Expenses</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {expenses.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No expenses yet. Add your first expense to get started.</Text>
            </Card>
          ) : (
            <>
              {pendingExpenses.length > 0 && (
                <View style={styles.expenseGroup}>
                  <Text style={styles.groupTitle}>Pending</Text>
                  {pendingExpenses.map((expense) => (
                    <Card key={expense.id} style={styles.expenseCard}>
                      <View style={styles.expenseHeader}>
                        <View>
                          <Text style={styles.expenseDescription}>{expense.description}</Text>
                          <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
                          <Text style={styles.expenseDueDate}>Due: {expense.dueDate}</Text>
                        </View>
                        <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                      </View>
                      <View style={styles.expenseActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.paidButton]}
                          onPress={() => handleTogglePaid(expense.id, expense.paid)}
                        >
                          <Check size={18} color={colors.accent} />
                          <Text style={styles.paidButtonText}>Mark as Paid</Text>
                        </TouchableOpacity>
                        <View style={styles.secondaryActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => openEditModal(expense)}
                          >
                            <Edit size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}

              {paidExpenses.length > 0 && (
                <View style={styles.expenseGroup}>
                  <Text style={styles.groupTitle}>Paid</Text>
                  {paidExpenses.map((expense) => (
                    <Card key={expense.id} style={[styles.expenseCard, styles.paidExpenseCard]}>
                      <View style={styles.expenseHeader}>
                        <View>
                          <Text style={styles.expenseDescription}>{expense.description}</Text>
                          <Text style={styles.expenseCategory}>{getCategoryLabel(expense.category)}</Text>
                          <Text style={styles.expenseDueDate}>Paid on: {expense.paidDate || expense.dueDate}</Text>
                        </View>
                        <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                      </View>
                      <View style={styles.expenseActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.unpaidButton]}
                          onPress={() => handleTogglePaid(expense.id, expense.paid)}
                        >
                          <Text style={styles.unpaidButtonText}>Mark as Unpaid</Text>
                        </TouchableOpacity>
                        <View style={styles.secondaryActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => openEditModal(expense)}
                          >
                            <Edit size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KeyboardAwareScrollView>
              <Text style={styles.modalTitle}>
                {currentExpense ? 'Edit Expense' : 'Add New Expense'}
              </Text>
              
              <FormField
                label="Description"
                error={errors.description}
              >
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter expense description"
                />
              </FormField>
              
              <FormField
                label="Amount"
                error={errors.amount}
              >
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </FormField>
              
              <FormField
                label="Due Date (YYYY-MM-DD)"
                error={errors.dueDate}
              >
                <TextInput
                  style={styles.input}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
              
              <FormField label="Category">
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  items={EXPENSE_CATEGORIES}
                />
              </FormField>
              
              <View style={styles.modalActions}>
                <Button 
                  title="Cancel" 
                  onPress={() => setIsModalVisible(false)} 
                  type="secondary"
                  style={styles.modalButton}
                />
                <Button 
                  title="Save" 
                  onPress={handleSave} 
                  type="primary"
                  style={styles.modalButton}
                />
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statusSummary: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  pendingValue: {
    color: colors.warning,
  },
  paidValue: {
    color: colors.accent,
  },
  statusDivider: {
    height: 40,
    width: 1,
    backgroundColor: colors.border,
  },
  expensesSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.primary,
    marginLeft: 4,
  },
  expenseGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  expenseCard: {
    padding: 16,
    marginBottom: 12,
  },
  paidExpenseCard: {
    opacity: 0.8,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  expenseCategory: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  expenseDueDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.primary,
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidButton: {
    backgroundColor: `${colors.accent}20`,
  },
  paidButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.accent,
    marginLeft: 4,
  },
  unpaidButton: {
    backgroundColor: `${colors.textSecondary}20`,
  },
  unpaidButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  input: {
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: 12,
  },
});