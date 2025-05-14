import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Trash2, CreditCard as Edit, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAccountsStore } from '@/stores/accountsStore';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';

export default function AccountsScreen() {
  const { accounts, addAccount, updateAccount, deleteAccount, getTotalBalance } = useAccountsStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalBalance = getTotalBalance();

  const openAddModal = () => {
    setCurrentAccount(null);
    setName('');
    setBalance('');
    setIsMain(false);
    setErrors({});
    setIsModalVisible(true);
  };

  const openEditModal = (account: any) => {
    setCurrentAccount(account);
    setName(account.name);
    setBalance(account.balance.toString());
    setIsMain(account.isMain);
    setErrors({});
    setIsModalVisible(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!balance.trim()) {
      newErrors.balance = 'Initial balance is required';
    } else if (isNaN(Number(balance))) {
      newErrors.balance = 'Balance must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const accountData = {
      name,
      balance: parseFloat(balance),
      isMain,
    };
    
    if (currentAccount) {
      updateAccount(currentAccount.id, accountData);
    } else {
      addAccount(accountData);
    }
    
    setIsModalVisible(false);
  };

  const handleDeleteAccount = (id: string) => {
    deleteAccount(id);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Balance</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.summarySubtitle}>{accounts.length} Account{accounts.length !== 1 ? 's' : ''}</Text>
        </Card>

        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Accounts</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {accounts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No accounts yet. Add your first account to get started.</Text>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id} style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <View>
                    <Text style={styles.accountName}>{account.name}</Text>
                    {account.isMain && <Text style={styles.mainTag}>Main Account</Text>}
                  </View>
                  <View style={styles.accountActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openEditModal(account)}
                    >
                      <Edit size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteAccount(account.id)}
                    >
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.accountBalance}>{formatCurrency(account.balance)}</Text>
              </Card>
            ))
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
                {currentAccount ? 'Edit Account' : 'Add New Account'}
              </Text>
              
              <FormField
                label="Account Name"
                error={errors.name}
              >
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter account name"
                />
              </FormField>
              
              <FormField
                label="Initial Balance"
                error={errors.balance}
              >
                <TextInput
                  style={styles.input}
                  value={balance}
                  onChangeText={setBalance}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </FormField>
              
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setIsMain(!isMain)}
              >
                <View style={[styles.checkbox, isMain && styles.checkboxChecked]}>
                  {isMain && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.checkboxLabel}>Set as main account</Text>
              </TouchableOpacity>
              
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
    marginBottom: 8,
  },
  summarySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  accountsSection: {
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
  accountCard: {
    padding: 16,
    marginBottom: 12,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accountName: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  accountBalance: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.primary,
  },
  mainTag: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.accent,
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  accountActions: {
    flexDirection: 'row',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  checkboxLabel: {
    fontFamily: 'Inter-Regular',
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