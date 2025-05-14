import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { storage } from '@/utils/storage';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

const STORAGE_KEY = 'investments';

export function useInvestmentsStore() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  
  useEffect(() => {
    loadInvestments();
  }, []);
  
  const loadInvestments = async () => {
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (data) {
        setInvestments(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
    }
  };
  
  const saveInvestments = async (newInvestments: Investment[]) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newInvestments));
      setInvestments(newInvestments);
    } catch (error) {
      console.error('Failed to save investments:', error);
    }
  };
  
  const addInvestment = (investmentData: Omit<Investment, 'id'>) => {
    const newInvestment: Investment = {
      id: uuid.v4() as string,
      ...investmentData,
    };
    
    const updatedInvestments = [...investments, newInvestment];
    saveInvestments(updatedInvestments);
  };
  
  const updateInvestment = (id: string, investmentData: Partial<Omit<Investment, 'id'>>) => {
    const updatedInvestments = [...investments];
    const index = updatedInvestments.findIndex(investment => investment.id === id);
    
    if (index !== -1) {
      updatedInvestments[index] = {
        ...updatedInvestments[index],
        ...investmentData,
      };
      
      saveInvestments(updatedInvestments);
    }
  };
  
  const deleteInvestment = (id: string) => {
    const updatedInvestments = investments.filter(investment => investment.id !== id);
    saveInvestments(updatedInvestments);
  };
  
  const getInvestmentsByCategory = (): Record<string, number> => {
    return investments.reduce((categories, investment) => {
      const category = investment.category;
      categories[category] = (categories[category] || 0) + investment.amount;
      return categories;
    }, {} as Record<string, number>);
  };
  
  const getTotalInvestments = (): number => {
    return investments.reduce((sum, investment) => sum + investment.amount, 0);
  };
  
  return {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    getInvestmentsByCategory,
    getTotalInvestments,
  };
}