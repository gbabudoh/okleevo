import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

export function VATCalculator() {
  const [amount, setAmount] = useState('');
  const vatRate = 20;
  const vatAmount = (parseFloat(amount) || 0) * (vatRate / 100);
  const total = (parseFloat(amount) || 0) + vatAmount;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">VAT Calculator</h1>
      <div className="max-w-2xl bg-white rounded-xl border p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-8 h-8 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">Calculate VAT</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Net Amount (£)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Enter amount"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Net Amount:</span>
              <span className="font-semibold">£{(parseFloat(amount) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT ({vatRate}%):</span>
              <span className="font-semibold">£{vatAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-gray-900 text-xl">£{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
