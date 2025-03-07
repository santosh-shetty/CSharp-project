import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, FileText, Pencil, Trash2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';
import api from '../lib/api';
import { PurchaseOrder, Supplier } from '../types';
import { useSelector } from 'react-redux';

const PurchaseOrders: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'view'>('create');
  const user = useSelector((state: any) => state.auth.user);

  const [formData, setFormData] = useState({
    supplierId: '',
    items: [{ itemName: '', quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get('/purchaseorders');
      setPurchaseOrders(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch purchase orders');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch suppliers');
    }
  };

  const handleViewPO = async (id: number) => {
    try {
      const response = await api.get(`/purchaseorders/${id}`);
      setSelectedPO(response.data);
      setModalMode('view');
      setIsModalOpen(true);
    } catch (err: any) {
      console.error('Error fetching PO details:', err);
      setError(err.response?.data?.message || 'Failed to fetch purchase order details');
    }
  };

  const handleCreateNew = () => {
    setSelectedPO(null);
    setModalMode('create');
    setIsModalOpen(true);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.supplierId) {
        setError('Please select a supplier');
        setIsLoading(false);
        return;
      }

      if (formData.items.some(item => !item.itemName || item.quantity < 1 || item.unitPrice <= 0)) {
        setError('Please fill in all item details correctly');
        setIsLoading(false);
        return;
      }

      // Create purchase order
      const response = await api.post('/purchaseorders', {
        supplierId: parseInt(formData.supplierId),
        items: formData.items
      });

      await fetchPurchaseOrders(); // Refresh the list
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error creating purchase order:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([key, msgs]: [string, any]) => `${key}: ${msgs.join(', ')}`)
          .join('\n');
        setError(`Validation errors:\n${errorMessages}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create purchase order');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this purchase order?')) return;

    try {
      await api.delete(`/purchaseorders/${id}`);
      await fetchPurchaseOrders(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete purchase order');
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.put(`/purchaseorders/${id}/status`, JSON.stringify(newStatus), {
        headers: { 'Content-Type': 'application/json' }
      });
      await fetchPurchaseOrders(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update purchase order status');
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemName: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      items: [{ itemName: '', quantity: 1, unitPrice: 0 }],
    });
    setError('');
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Update total price if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * unitPrice;
    }

    setFormData({ ...formData, items: newItems });
  };

  return (
    <div>
    <div className="sm:flex sm:items-center">
      <div className="sm:flex-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Purchase Orders</h1>
        <p className="mt-2 text-sm text-gray-700">
          A list of all purchase orders including their status, total amount, and supplier information.
        </p>
      </div>
      <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create PO
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
                    Order Number
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Supplier
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Total Amount
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Created At
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {purchaseOrders.map((po) => (
                  <tr key={po.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        {po.poNumber}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {po.supplier.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <select
                        value={po.status}
                        onChange={(e) => handleStatusUpdate(po.id, e.target.value)}
                        className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          po.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                          po.status === 'approved' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          po.status === 'completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          'bg-red-50 text-red-700 ring-red-600/20'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      ${po.totalAmount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(po.orderDate).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button 
                        onClick={() => handleViewPO(po.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        View
                      </button>
                      {po.status === 'pending' && (
                        <button 
                          onClick={() => handleDelete(po.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
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
      onClose={() => {
        setIsModalOpen(false);
        setSelectedPO(null);
        setModalMode('create');
        resetForm();
      }}
      title={modalMode === 'create' ? 'Create Purchase Order' : 'View Purchase Order'}
    >
      <form onSubmit={modalMode === 'create' ? handleSubmit : (e) => e.preventDefault()} className="space-y-4">
        {modalMode === 'view' && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Order Number</p>
                <p className="mt-1 text-sm text-gray-900">{selectedPO?.poNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-sm text-gray-900">{selectedPO?.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created By</p>
                <p className="mt-1 text-sm text-gray-900">{selectedPO?.createdBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="mt-1 text-sm text-gray-900">${selectedPO?.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
            Supplier
          </label>
          <select
            id="supplierId"
            value={modalMode === 'create' ? formData.supplierId : selectedPO?.supplier?.id?.toString()}
            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">Items</h4>
            {modalMode === 'create' && (
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            )}
          </div>

          {(modalMode === 'create' ? formData.items : selectedPO?.items || []).map((item, index) => (
            <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <input
                  type="text"
                  value={modalMode === 'create' ? item.itemName : item.itemName || ''}
                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                  disabled={modalMode === 'view'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={modalMode === 'create' ? item.quantity : item.quantity || 0}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={modalMode === 'create' ? item.unitPrice : item.unitPrice || 0}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Total: ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>
              {modalMode === 'create' && formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-sm text-red-600 hover:text-red-900"
                >
                  Remove Item
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          {modalMode === 'create' ? (
            <>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedPO(null);
                setModalMode('create');
                resetForm();
              }}
              className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              Close
            </button>
          )}
        </div>
      </form>
    </Modal>
  </div>
  );
};

export default PurchaseOrders;
