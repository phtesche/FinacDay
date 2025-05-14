import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { storage } from '@/utils/storage';

export interface Account {
  id: string;
  name: string;
  balance: number;
  isMain: boolean;
}

const STORAGE_KEY = 'accounts';

export function useAccountsStore() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  useEffect(() => {
    loadAccounts();
  }, []);
  
  const loadAccounts = async () => {
    try {
      const data = await storage.getItem(STORAGE_KEY);
      if (data) {
        setAccounts(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };
  
  const saveAccounts = async (newAccounts: Account[]) => {
    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(newAccounts));
      setAccounts(newAccounts);
    } catch (error) {
      console.error('Failed to save accounts:', error);
    }
  };
  
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      id: uuid.v4() as string,
      ...accountData,
    };
    
    const updatedAccounts = [...accounts];
    
    // If this is the first account or it's marked as main, update any existing main account
    if (accountData.isMain || accounts.length === 0) {
      updatedAccounts.forEach(account => {
        if (account.isMain) {
          account.isMain = false;
        }
      });
      newAccount.isMain = true;
    }
    
    updatedAccounts.push(newAccount);
    saveAccounts(updatedAccounts);
  };
  
  const updateAccount = (id: string, accountData: Partial<Omit<Account, 'id'>>) => {
    const updatedAccounts = [...accounts];
    const index = updatedAccounts.findIndex(account => account.id === id);
    
    if (index !== -1) {
      // If we're setting this account as main, update any existing main account
      if (accountData.isMain && !updatedAccounts[index].isMain) {
        updatedAccounts.forEach(account => {
          if (account.isMain) {
            account.isMain = false;
          }
        });
      }
      
      updatedAccounts[index] = {
        ...updatedAccounts[index],
        ...accountData,
      };
      
      saveAccounts(updatedAccounts);
    }
  };
  
  const deleteAccount = (id: string) => {
    const wasMain = accounts.find(account => account.id === id)?.isMain;
    const updatedAccounts = accounts.filter(account => account.id !== id);
    
    // If we removed the main account and there are other accounts, set the first one as main
    if (wasMain && updatedAccounts.length > 0) {
      updatedAccounts[0].isMain = true;
    }
    
    saveAccounts(updatedAccounts);
  };
  
  const updateBalance = (id: string, amount: number) => {
    const updatedAccounts = [...accounts];
    const index = updatedAccounts.findIndex(account => account.id === id);
    
    if (index !== -1) {
      updatedAccounts[index].balance += amount;
      saveAccounts(updatedAccounts);
    }
  };
  
  const getMainAccount = (): Account | undefined => {
    return accounts.find(account => account.isMain);
  };
  
  const getTotalBalance = (): number => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };
  
  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    updateBalance,
    getMainAccount,
    getTotalBalance,
  };
}