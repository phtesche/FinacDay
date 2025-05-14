import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { storage } from '@/utils/storage';
import { formatDate } from '@/utils/formatters';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  paid: boolean;
  paidDate?: string;
}

const STORAGE_KEY = 'expenses';

export function useExpensesStore() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  useEffect(() => {
    loadExpenses();
  }, []);
  
  const loadExpenses = async () => {
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (data) {
        setExpenses(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    }
  };
  
  const saveExpenses = async (newExpenses: Expense[]) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
      setExpenses(newExpenses);
    } catch (error) {
      console.error('Failed to save expenses:', error);
    }
  };
  
  const addExpense = (expenseData: Omit<Expense, 'id' | 'paid' | 'paidDate'> & { paid?: boolean }) => {
    const newExpense: Expense = {
      id: uuid.v4() as string,
      paid: false,
      ...expenseData,
    };
    
    if (newExpense.paid) {
      newExpense.paidDate = formatDate(new Date());
    }
    
    const updatedExpenses = [...expenses, newExpense];
    saveExpenses(updatedExpenses);
  };
  
  const updateExpense = (id: string, expenseData: Partial<Omit<Expense, 'id'>>) => {
    const updatedExpenses = [...expenses];
    const index = updatedExpenses.findIndex(expense => expense.id === id);
    
    if (index !== -1) {
      // If we're changing the paid status, update the paidDate accordingly
      if (expenseData.paid !== undefined && expenseData.paid !== updatedExpenses[index].paid) {
        if (expenseData.paid) {
          expenseData.paidDate = formatDate(new Date());
        } else {
          expenseData.paidDate = undefined;
        }
      }
      
      updatedExpenses[index] = {
        ...updatedExpenses[index],
        ...expenseData,
      };
      
      saveExpenses(updatedExpenses);
    }
  };
  
  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    saveExpenses(updatedExpenses);
  };
  
  const togglePaid = (id: string, paid: boolean) => {
    const updatedExpenses = [...expenses];
    const index = updatedExpenses.findIndex(expense => expense.id === id);
    
    if (index !== -1) {
      updatedExpenses[index].paid = paid;
      updatedExpenses[index].paidDate = paid ? formatDate(new Date()) : undefined;
      saveExpenses(updatedExpenses);
    }
  };
  
  const getPendingExpenses = (): Expense[] => {
    return expenses.filter(expense => !expense.paid);
  };
  
  const getPaidExpenses = (): Expense[] => {
    return expenses.filter(expense => expense.paid);
  };
  
  const getTotalExpenses = (): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };
  
  const getTotalPendingExpenses = (): number => {
    return getPendingExpenses().reduce((sum, expense) => sum + expense.amount, 0);
  };
  
  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    togglePaid,
    getPendingExpenses,
    getPaidExpenses,
    getTotalExpenses,
    getTotalPendingExpenses,
  };
}