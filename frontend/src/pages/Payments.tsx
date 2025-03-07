import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, DollarSign, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../lib/api';
import { Payment, PurchaseOrder } from '../types';

const Payments: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    poId: '',
    amount: '',
    paymentMethod: 'bank_transfer'
  });

  useEffect(() => {
    fetchPayments();
    fetchPurchaseOrders();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get('/purchaseorders');
      setPurchaseOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders');
    }
  };

  const handlePOChange = async (poId: string) => {
    setFormData({ ...formData, poId });
    if (poId) {
      const po = purchaseOrders.find(p => p.id.toString() === poId);
      setSelectedPO(po || null);
    } else {
      setSelectedPO(null);
    }
  };

  const calculateRemainingBalance = (poId: number): number => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return 0;

    const paidAmount = payments
      .filter(p => p.purchaseOrder.id === poId && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    return po.totalAmount - paidAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.poId) {
        setError('Please select a purchase order');
        setIsLoading(false);
        return;
      }

      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setIsLoading(false);
        return;
      }

      const remainingBalance = calculateRemainingBalance(parseInt(formData.poId));
      if (amount > remainingBalance) {
        setError(`Payment amount exceeds remaining balance of $${remainingBalance.toFixed(2)}`);
        setIsLoading(false);
        return;
      }

      await api.post('/payments', {
        poId: parseInt(formData.poId),
        amount: amount,
        paymentMethod: formData.paymentMethod
      });

      await fetchPayments();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating payment:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to create payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/payments/${id}/status`, JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' }
      });
      await fetchPayments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const resetForm = () => {
    setFormData({
      poId: '',
      amount: '',
      paymentMethod: 'bank_transfer'
    });
    setSelectedPO(null);
    setError('');
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all payments including their status, amount, and related purchase order.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Payment ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      PO Number
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Payment Date
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          {payment.id}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {payment.purchaseOrder.poNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={payment.status}
                          onChange={(e) => handleUpdateStatus(payment.id, e.target.value)}
                          className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                            payment.status === 'paid' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                            'bg-red-50 text-red-700 ring-red-600/20'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button 
                          onClick={() => {
                            setSelectedPayment(payment);
                            setViewModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Payment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div>
            <label htmlFor="poId" className="block text-sm font-medium text-gray-700">
              Purchase Order
            </label>
            <select
              id="poId"
              value={formData.poId}
              onChange={(e) => handlePOChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a purchase order</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNumber} - {po.supplier.name} (${po.totalAmount.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          {selectedPO && (
            <div className="mt-4 rounded-md bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">Purchase Order Details</h4>
              <dl className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Supplier</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPO.supplier.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900">${selectedPO.totalAmount.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedPO.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Remaining Balance</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${(selectedPO.totalAmount - (payments
                      .filter(p => p.purchaseOrder.id === selectedPO.id && p.status === 'paid')
                      .reduce((sum, p) => sum + p.amount, 0))).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedPayment(null);
        }}
        title="Payment Details"
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Payment ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{selectedPayment.id}</dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg border border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Purchase Order</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <p className="font-semibold">{selectedPayment.purchaseOrder.poNumber}</p>
                <p className="text-gray-500">{selectedPayment.purchaseOrder.supplier.name}</p>
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                ${selectedPayment.amount.toFixed(2)}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg border border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {selectedPayment.paymentMethod.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 sm:col-span-2 sm:mt-0">
                <select
                  value={selectedPayment.status}
                  onChange={(e) => handleUpdateStatus(selectedPayment.id, e.target.value)}
                  className={`rounded-md px-2 py-1 text-sm font-medium ring-1 ring-inset ${
                    selectedPayment.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                    selectedPayment.status === 'paid' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                    'bg-red-50 text-red-700 ring-red-600/20'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg border border-gray-200">
              <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(selectedPayment.paymentDate).toLocaleString()}
              </dd>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedPayment(null);
                }}
                className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;