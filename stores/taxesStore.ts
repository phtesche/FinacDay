import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { storage } from '@/utils/storage';
import { formatDate, getDaysUntil } from '@/utils/formatters';

export interface Tax {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  notes?: string;
  paid: boolean;
  paidDate?: string;
}

const STORAGE_KEY = 'taxes';

export function useTaxesStore() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  
  useEffect(() => {
    loadTaxes();
  }, []);
  
  const loadTaxes = async () => {
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (data) {
        setTaxes(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load taxes:', error);
    }
  };
  
  const saveTaxes = async (newTaxes: Tax[]) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newTaxes));
      setTaxes(newTaxes);
    } catch (error) {
      console.error('Failed to save taxes:', error);
    }
  };
  
  const addTax = (taxData: Omit<Tax, 'id' | 'paid' | 'paidDate'> & { paid?: boolean }) => {
    const newTax: Tax = {
      id: uuid.v4() as string,
      paid: false,
      ...taxData,
    };
    
    if (newTax.paid) {
      newTax.paidDate = formatDate(new Date());
    }
    
    const updatedTaxes = [...taxes, newTax];
    saveTaxes(updatedTaxes);
  };
  
  const updateTax = (id: string, taxData: Partial<Omit<Tax, 'id'>>) => {
    const updatedTaxes = [...taxes];
    const index = updatedTaxes.findIndex(tax => tax.id === id);
    
    if (index !== -1) {
      // If we're changing the paid status, update the paidDate accordingly
      if (taxData.paid !== undefined && taxData.paid !== updatedTaxes[index].paid) {
        if (taxData.paid) {
          taxData.paidDate = formatDate(new Date());
        } else {
          taxData.paidDate = undefined;
        }
      }
      
      updatedTaxes[index] = {
        ...updatedTaxes[index],
        ...taxData,
      };
      
      saveTaxes(updatedTaxes);
    }
  };
  
  const deleteTax = (id: string) => {
    const updatedTaxes = taxes.filter(tax => tax.id !== id);
    saveTaxes(updatedTaxes);
  };
  
  const togglePaid = (id: string, paid: boolean) => {
    const updatedTaxes = [...taxes];
    const index = updatedTaxes.findIndex(tax => tax.id === id);
    
    if (index !== -1) {
      updatedTaxes[index].paid = paid;
      updatedTaxes[index].paidDate = paid ? formatDate(new Date()) : undefined;
      saveTaxes(updatedTaxes);
    }
  };
  
  const getUpcomingTaxes = (daysThreshold: number = 30): Tax[] => {
    return taxes.filter(tax => {
      if (tax.paid) return false;
      
      const daysUntil = getDaysUntil(tax.dueDate);
      return daysUntil >= 0 && daysUntil <= daysThreshold;
    });
  };
  
  const getOverdueTaxes = (): Tax[] => {
    return taxes.filter(tax => {
      if (tax.paid) return false;
      
      const daysUntil = getDaysUntil(tax.dueDate);
      return daysUntil < 0;
    });
  };
  
  const getTotalTaxes = (): number => {
    return taxes.reduce((sum, tax) => sum + tax.amount, 0);
  };
  
  const getTotalPendingTaxes = (): number => {
    return taxes.filter(tax => !tax.paid).reduce((sum, tax) => sum + tax.amount, 0);
  };
  
  return {
    taxes,
    addTax,
    updateTax,
    deleteTax,
    togglePaid,
    getUpcomingTaxes,
    getOverdueTaxes,
    getTotalTaxes,
    getTotalPendingTaxes,
  };
}