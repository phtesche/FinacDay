import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Trash2, CreditCard as Edit, Plus, Check, Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaxesStore } from '@/stores/taxesStore';
import { formatCurrency, formatDate, getDaysUntil } from '@/utils/formatters';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';

export default function TaxesScreen() {
  const { taxes, addTax, updateTax, deleteTax, togglePaid } = useTaxesStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTax, setCurrentTax] = useState<any>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pendingTaxes = taxes.filter(tax => !tax.paid);
  const paidTaxes = taxes.filter(tax => tax.paid);

  const openAddModal = () => {
    setCurrentTax(null);
    setName('');
    setAmount('');
    setDueDate(formatDate(new Date(), 'yyyy-MM-dd'));
    setNotes('');
    setErrors({});
    setIsModalVisible(true);
  };

  const openEditModal = (tax: any) => {
    setCurrentTax(tax);
    setName(tax.name);
    setAmount(tax.amount.toString());
    setDueDate(tax.dueDate);
    setNotes(tax.notes || '');
    setErrors({});
    setIsModalVisible(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Tax name is required';
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
    
    const taxData = {
      name,
      amount: parseFloat(amount),
      dueDate,
      notes,
      paid: currentTax ? currentTax.paid : false,
    };
    
    if (currentTax) {
      updateTax(currentTax.id, taxData);
    } else {
      addTax(taxData);
    }
    
    setIsModalVisible(false);
  };

  const handleDeleteTax = (id: string) => {
    deleteTax(id);
  };

  const handleTogglePaid = (id: string, currentPaid: boolean) => {
    togglePaid(id, !currentPaid);
  };

  const renderDueDateStatus = (dueDate: string) => {
    const daysUntil = getDaysUntil(dueDate);
    
    if (daysUntil < 0) {
      return (
        <Text style={[styles.dueDateText, styles.overdue]}>
          Overdue by {Math.abs(daysUntil)} days
        </Text>
      );
    }
    
    if (daysUntil <= 7) {
      return (
        <Text style={[styles.dueDateText, styles.dueSoon]}>
          Due in {daysUntil} days
        </Text>
      );
    }
    
    return (
      <Text style={styles.dueDateText}>
        Due in {daysUntil} days
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryTitle}>Pending Taxes</Text>
              <Text style={styles.summaryValue}>{pendingTaxes.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryColumn}>
              <Text style={styles.summaryTitle}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(pendingTaxes.reduce((sum, tax) => sum + tax.amount, 0))}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.taxesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Taxes</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {taxes.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No taxes yet. Add your first tax to get started.</Text>
            </Card>
          ) : (
            <>
              {pendingTaxes.length > 0 && (
                <View style={styles.taxGroup}>
                  <Text style={styles.groupTitle}>Pending</Text>
                  {pendingTaxes.map((tax) => (
                    <Card key={tax.id} style={styles.taxCard}>
                      <View style={styles.taxHeader}>
                        <View>
                          <Text style={styles.taxName}>{tax.name}</Text>
                          {renderDueDateStatus(tax.dueDate)}
                        </View>
                        <Text style={styles.taxAmount}>{formatCurrency(tax.amount)}</Text>
                      </View>
                      <View style={styles.taxDetails}>
                        <View style={styles.dueDateContainer}>
                          <Calendar size={16} color={colors.textSecondary} />
                          <Text style={styles.dueDateLabel}>Due Date: {tax.dueDate}</Text>
                        </View>
                        {tax.notes && (
                          <Text style={styles.taxNotes}>{tax.notes}</Text>
                        )}
                      </View>
                      <View style={styles.taxActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.paidButton]}
                          onPress={() => handleTogglePaid(tax.id, tax.paid)}
                        >
                          <Check size={18} color={colors.accent} />
                          <Text style={styles.paidButtonText}>Mark as Paid</Text>
                        </TouchableOpacity>
                        <View style={styles.secondaryActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => openEditModal(tax)}
                          >
                            <Edit size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteTax(tax.id)}
                          >
                            <Trash2 size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}

              {paidTaxes.length > 0 && (
                <View style={styles.taxGroup}>
                  <Text style={styles.groupTitle}>Paid</Text>
                  {paidTaxes.map((tax) => (
                    <Card key={tax.id} style={[styles.taxCard, styles.paidTaxCard]}>
                      <View style={styles.taxHeader}>
                        <View>
                          <Text style={styles.taxName}>{tax.name}</Text>
                          <Text style={styles.dueDateText}>
                            Paid on: {tax.paidDate || tax.dueDate}
                          </Text>
                        </View>
                        <Text style={styles.taxAmount}>{formatCurrency(tax.amount)}</Text>
                      </View>
                      <View style={styles.taxDetails}>
                        <View style={styles.dueDateContainer}>
                          <Calendar size={16} color={colors.textSecondary} />
                          <Text style={styles.dueDateLabel}>Due Date: {tax.dueDate}</Text>
                        </View>
                        {tax.notes && (
                          <Text style={styles.taxNotes}>{tax.notes}</Text>
                        )}
                      </View>
                      <View style={styles.taxActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.unpaidButton]}
                          onPress={() => handleTogglePaid(tax.id, tax.paid)}
                        >
                          <Text style={styles.unpaidButtonText}>Mark as Unpaid</Text>
                        </TouchableOpacity>
                        <View style={styles.secondaryActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => openEditModal(tax)}
                          >
                            <Edit size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteTax(tax.id)}
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
                {currentTax ? 'Edit Tax' : 'Add New Tax'}
              </Text>
              
              <FormField
                label="Tax Name"
                error={errors.name}
              >
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter tax name"
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
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryColumn: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    height: 40,
    width: 1,
    backgroundColor: colors.border,
  },
  summaryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: colors.textPrimary,
  },
  taxesSection: {
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
  taxGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  taxCard: {
    padding: 16,
    marginBottom: 12,
  },
  paidTaxCard: {
    opacity: 0.8,
  },
  taxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taxName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  dueDateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  overdue: {
    color: colors.error,
  },
  dueSoon: {
    color: colors.warning,
  },
  taxAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.primary,
  },
  taxDetails: {
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  taxNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  taxActions: {
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
});