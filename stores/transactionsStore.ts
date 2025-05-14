import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { storage } from '@/utils/storage';
import { useAccountsStore } from './accountsStore';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date: string;
  accountId: string;
  toAccountId?: string;
  notes?: string;
}

const STORAGE_KEY = 'transactions';

export function useTransactionsStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { updateBalance } = useAccountsStore();
  
  useEffect(() => {
    loadTransactions();
  }, []);
  
  const loadTransactions = async () => {
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (data) {
        setTransactions(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };
  
  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
      setTransactions(newTransactions);
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  };
  
  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      id: uuid.v4() as string,
      ...transactionData,
    };
    
    // Update account balances
    if (transactionData.type === 'income') {
      updateBalance(transactionData.accountId, transactionData.amount);
    } else if (transactionData.type === 'expense') {
      updateBalance(transactionData.accountId, -transactionData.amount);
    } else if (transactionData.type === 'transfer' && transactionData.toAccountId) {
      updateBalance(transactionData.accountId, -transactionData.amount);
      updateBalance(transactionData.toAccountId, transactionData.amount);
    }
    
    const updatedTransactions = [...transactions, newTransaction];
    saveTransactions(updatedTransactions);
  };
  
  const updateTransaction = (id: string, transactionData: Partial<Omit<Transaction, 'id'>>) => {
    const oldTransaction = transactions.find(transaction => transaction.id === id);
    if (!oldTransaction) return;
    
    const updatedTransactions = [...transactions];
    const index = updatedTransactions.findIndex(transaction => transaction.id === id);
    
    if (index !== -1) {
      // Calculate balance changes based on the difference
      const oldAmount = oldTransaction.amount;
      const newAmount = transactionData.amount ?? oldAmount;
      const oldType = oldTransaction.type;
      const newType = transactionData.type ?? oldType;
      const oldAccountId = oldTransaction.accountId;
      const newAccountId = transactionData.accountId ?? oldAccountId;
      const oldToAccountId = oldTransaction.toAccountId;
      const newToAccountId = transactionData.toAccountId ?? oldToAccountId;
      
      // Revert old transaction effect on balances
      if (oldType === 'income') {
        updateBalance(oldAccountId, -oldAmount);
      } else if (oldType === 'expense') {
        updateBalance(oldAccountId, oldAmount);
      } else if (oldType === 'transfer' && oldToAccountId) {
        updateBalance(oldAccountId, oldAmount);
        updateBalance(oldToAccountId, -oldAmount);
      }
      
      // Apply new transaction effect on balances
      if (newType === 'income') {
        updateBalance(newAccountId, newAmount);
      } else if (newType === 'expense') {
        updateBalance(newAccountId, -newAmount);
      } else if (newType === 'transfer' && newToAccountId) {
        updateBalance(newAccountId, -newAmount);
        updateBalance(newToAccountId, newAmount);
      }
      
      updatedTransactions[index] = {
        ...updatedTransactions[index],
        ...transactionData,
      };
      
      saveTransactions(updatedTransactions);
    }
  };
  
  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(transaction => transaction.id === id);
    if (!transaction) return;
    
    // Revert transaction effect on account balances
    if (transaction.type === 'income') {
      updateBalance(transaction.accountId, -transaction.amount);
    } else if (transaction.type === 'expense') {
      updateBalance(transaction.accountId, transaction.amount);
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      updateBalance(transaction.accountId, transaction.amount);
      updateBalance(transaction.toAccountId, -transaction.amount);
    }
    
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    saveTransactions(updatedTransactions);
  };
  
  const getTransactionsByAccount = (accountId: string): Transaction[] => {
    return transactions.filter(transaction => 
      transaction.accountId === accountId || 
      (transaction.type === 'transfer' && transaction.toAccountId === accountId)
    );
  };
  
  const getTransactionsByType = (type: 'income' | 'expense' | 'transfer'): Transaction[] => {
    return transactions.filter(transaction => transaction.type === type);
  };
  
  const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
    return transactions.filter(transaction => 
      transaction.date >= startDate && transaction.date <= endDate
    );
  };
  
  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByAccount,
    getTransactionsByType,
    getTransactionsByDateRange,
  };
}