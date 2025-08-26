import React, { useEffect, useState } from 'react';
import { Coins, Search, Send } from 'lucide-react';
import { getAllManga } from '../../services/cloudinaryService';
import { getUserCoinBalance, addCoinsToUser } from '../../services/cloudinaryService';

const CoinManagement = () => {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const b = await getUserCoinBalance(userId);
      setBalance(b);
    } catch {
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    try {
      if (!userId || !amount) return;
      setLoading(true);
      await addCoinsToUser(userId, Number(amount));
      await fetchBalance();
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" /> Coin Management
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">User ID</label>
              <input value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="Firebase Auth UID" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">Amount to add</label>
                <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white" placeholder="e.g. 10" />
              </div>
              <button onClick={handleTransfer} disabled={!userId || !amount || loading} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> {loading ? 'Processing...' : 'Transfer'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchBalance} disabled={!userId || loading} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700 text-sm">Check balance</button>
              {balance !== null && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm font-medium">
                  <Coins className="w-4 h-4" /> {balance}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinManagement;


