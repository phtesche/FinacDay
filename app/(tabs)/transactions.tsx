import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Trash2, CreditCard as Edit, Plus, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { useAccountsStore } from '@/stores/accountsStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import { Picker } from '@/components/Picker';

const TRANSACTION_TYPES = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

const FILTER_OPTIONS = [
  { label: 'All Transactions', value: 'all' },
  { label: 'Income Only', value: 'income' },
  { label: 'Expenses Only', value: 'expense' },
  { label: 'Transfers Only', value: 'transfer' },
];

export default function TransactionsScreen() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionsStore();
  const { accounts } = useAccountsStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [date, setDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Filtering
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply filters
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (filter !== 'all' && transaction.type !== filter) {
      return false;
    }
    
    // Filter by date range
    if (startDate && transaction.date < startDate) {
      return false;
    }
    
    if (endDate && transaction.date > endDate) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openAddModal = () => {
    setCurrentTransaction(null);
    setDescription('');
    setAmount('');
    setType('income');
    setDate(formatDate(new Date(), 'yyyy-MM-dd'));
    setAccountId(accounts.length > 0 ? accounts[0].id : '');
    setToAccountId('');
    setNotes('');
    setErrors({});
    setIsModalVisible(true);
  };

  const openEditModal = (transaction: any) => {
    setCurrentTransaction(transaction);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setDate(transaction.date);
    setAccountId(transaction.accountId);
    setToAccountId(transaction.toAccountId || '');
    setNotes(transaction.notes || '');
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
    
    if (!date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Date must be in YYYY-MM-DD format';
      }
    }
    
    if (!accountId) {
      newErrors.accountId = 'Account is required';
    }
    
    if (type === 'transfer' && (!toAccountId || toAccountId === accountId)) {
      newErrors.toAccountId = 'Please select a different destination account';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const transactionData = {
      description,
      amount: parseFloat(amount),
      type,
      date,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      notes,
    };
    
    if (currentTransaction) {
      updateTransaction(currentTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    setIsModalVisible(false);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  const openFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const applyFilters = () => {
    setIsFilterModalVisible(false);
  };

  const resetFilters = () => {
    setFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setIsFilterModalVisible(false);
  };

  const getAccountName = (id: string) => {
    const account = accounts.find(acc => acc.id === id);
    return account ? account.name : 'Unknown';
  };

  const renderTransactionIcon = (type: string) => {
    if (type === 'income') {
      return <ArrowDownLeft size={20} color={colors.accent} />;
    } else if (type === 'expense') {
      return <ArrowUpRight size={20} color={colors.error} />;
    } else {
      return <ArrowUpRight size={20} color={colors.primary} style={{ transform: [{ rotate: '90deg' }] }} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {filteredTransactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                {transactions.length === 0
                  ? 'No transactions yet. Add your first transaction to get started.'
                  : 'No transactions match your filters.'}
              </Text>
            </Card>
          ) : (
            // Group transactions by date
            filteredTransactions.reduce((groups, transaction) => {
              const date = transaction.date;
              if (!groups[date]) {
                groups[date] = [];
              }
              groups[date].push(transaction);
              return groups;
            }, {} as Record<string, any[]>)
            // Convert to array of [date, transactions] pairs and sort by date
            && Object.entries(
              filteredTransactions.reduce((groups, transaction) => {
                const date = transaction.date;
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(transaction);
                return groups;
              }, {} as Record<string, any[]>)
            )
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dateTransactions]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{date}</Text>
                {dateTransactions.map(transaction => (
                  <Card key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                      <View style={styles.transactionIconContainer}>
                        {renderTransactionIcon(transaction.type)}
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionDescription}>{transaction.description}</Text>
                        <Text style={styles.accountInfo}>
                          {transaction.type === 'transfer'
                            ? `${getAccountName(transaction.accountId)} → ${getAccountName(transaction.toAccountId || '')}`
                            : getAccountName(transaction.accountId)}
                        </Text>
                      </View>
                      <Text style={[
                        styles.transactionAmount,
                        transaction.type === 'income' ? styles.incomeAmount : 
                        transaction.type === 'expense' ? styles.expenseAmount :
                        styles.transferAmount
                      ]}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </Text>
                    </View>
                    {transaction.notes && (
                      <Text style={styles.transactionNotes}>{transaction.notes}</Text>
                    )}
                    <View style={styles.transactionActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditModal(transaction)}
                      >
                        <Edit size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Transaction Modal */}
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
                {currentTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </Text>
              
              <FormField
                label="Description"
                error={errors.description}
              >
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter transaction description"
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
              
              <FormField label="Type">
                <Picker
                  selectedValue={type}
                  onValueChange={(value) => setType(value)}
                  items={TRANSACTION_TYPES}
                />
              </FormField>
              
              <FormField
                label="Date (YYYY-MM-DD)"
                error={errors.date}
              >
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
              
              <FormField
                label={type === 'transfer' ? 'From Account' : 'Account'}
                error={errors.accountId}
              >
                <Picker
                  selectedValue={accountId}
                  onValueChange={(value) => setAccountId(value)}
                  items={accounts.map(account => ({
                    label: account.name,
                    value: account.id,
                  }))}
                  placeholder="Select account"
                />
              </FormField>
              
              {type === 'transfer' && (
                <FormField
                  label="To Account"
                  error={errors.toAccountId}
                >
                  <Picker
                    selectedValue={toAccountId}
                    onValueChange={(value) => setToAccountId(value)}
                    items={accounts
                      .filter(account => account.id !== accountId)
                      .map(account => ({
                        label: account.name,
                        value: account.id,
                      }))}
                    placeholder="Select destination account"
                  />
                </FormField>
              )}
              
              <FormField label="Notes (Optional)">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter any additional notes"
                  multiline
                  numberOfLines={4}
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

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Transactions</Text>
            
            <FormField label="Transaction Type">
              <Picker
                selectedValue={filter}
                onValueChange={(value) => setFilter(value)}
                items={FILTER_OPTIONS}
              />
            </FormField>
            
            <FormField label="Start Date (Optional)">
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </FormField>
            
            <FormField label="End Date (Optional)">
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
              />
            </FormField>
            
            <View style={styles.filterActions}>
              <Button 
                title="Reset" 
                onPress={resetFilters} 
                type="secondary"
                style={styles.filterButton}
              />
              <Button 
                title="Apply" 
                onPress={applyFilters} 
                type="primary"
                style={styles.filterButton}
              />
            </View>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButton: {
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  transactionsSection: {
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
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  transactionCard: {
    padding: 16,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  accountInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  incomeAmount: {
    color: colors.accent,
  },
  expenseAmount: {
    color: colors.error,
  },
  transferAmount: {
    color: colors.primary,
  },
  transactionNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 52,
    fontStyle: 'italic',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
});