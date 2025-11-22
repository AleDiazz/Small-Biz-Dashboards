'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useBusiness } from '@/hooks/useBusiness'
import { useAuth } from '@/hooks/useAuth'
import { InventoryItem } from '@/types'
import toast from 'react-hot-toast'
import { Package, Plus, Trash2, Edit2, X, AlertCircle, Minus, PlusCircle, MinusCircle } from 'lucide-react'
import SkeletonLoader from '@/components/SkeletonLoader'

export default function InventoryPage() {
  const { selectedBusiness } = useBusiness()
  const { user } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState('')
  
  // Form fields
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [cost, setCost] = useState('')
  const [costType, setCostType] = useState<'unit' | 'total'>('unit')

  useEffect(() => {
    if (!selectedBusiness) return
    fetchInventory()
  }, [selectedBusiness])

  const fetchInventory = async () => {
    if (!selectedBusiness) return
    
    setLoading(true)
    try {
      const q = query(
        collection(db, 'inventory'),
        where('businessId', '==', selectedBusiness.id)
      )
      const snapshot = await getDocs(q)
      const inventoryList: InventoryItem[] = []
      snapshot.forEach((doc) => {
        inventoryList.push({ id: doc.id, ...doc.data() } as InventoryItem)
      })
      setInventory(inventoryList)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBusiness || !user) return

    try {
      // Calculate unit cost based on cost type
      const qty = parseInt(quantity)
      const costValue = parseFloat(cost)
      const unitCost = costType === 'total' ? (costValue / qty) : costValue

      const itemData = {
        businessId: selectedBusiness.id,
        userId: user.uid,
        name,
        quantity: qty,
        minQuantity: parseInt(minQuantity),
        unit,
        cost: unitCost, // Always store as unit cost
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), itemData)
        toast.success('Item updated successfully')
      } else {
        await addDoc(collection(db, 'inventory'), itemData)
        toast.success('Item added successfully')
      }

      resetForm()
      fetchInventory()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save item')
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setName(item.name)
    setQuantity(item.quantity.toString())
    setMinQuantity(item.minQuantity.toString())
    setUnit(item.unit)
    setCost(item.cost.toString())
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await deleteDoc(doc(db, 'inventory', id))
      toast.success('Item deleted successfully')
      fetchInventory()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    }
  }

  const resetForm = () => {
    setName('')
    setQuantity('')
    setMinQuantity('')
    setUnit('')
    setCost('')
    setCostType('unit')
    setEditingItem(null)
    setShowModal(false)
  }

  const handleQuickAdjust = async (item: InventoryItem, adjustment: number) => {
    const newQuantity = item.quantity + adjustment
    
    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative')
      return
    }

    try {
      await updateDoc(doc(db, 'inventory', item.id), {
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      
      if (adjustment > 0) {
        toast.success(`Added ${adjustment} ${item.unit} to ${item.name}`)
      } else {
        toast.success(`Removed ${Math.abs(adjustment)} ${item.unit} from ${item.name}`)
      }
      
      fetchInventory()
    } catch (error) {
      console.error('Error updating quantity:', error)
      toast.error('Failed to update quantity')
    }
  }

  const handleRestockClick = (item: InventoryItem) => {
    setRestockingItem(item)
    setRestockAmount('')
    setShowRestockModal(true)
  }

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!restockingItem) return

    const amountToAdd = parseInt(restockAmount)
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      const newQuantity = restockingItem.quantity + amountToAdd
      
      await updateDoc(doc(db, 'inventory', restockingItem.id), {
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      
      toast.success(`Added ${amountToAdd} ${restockingItem.unit} to ${restockingItem.name}`)
      
      setShowRestockModal(false)
      setRestockingItem(null)
      setRestockAmount('')
      fetchInventory()
    } catch (error) {
      console.error('Error restocking item:', error)
      toast.error('Failed to restock item')
    }
  }

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minQuantity)
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Track your stock and supplies</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Total Items</p>
            <Package className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
            <Package className="w-5 h-5 text-success-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
            <AlertCircle className={`w-5 h-5 ${lowStockItems.length > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <p className={`text-3xl font-bold ${lowStockItems.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
            {lowStockItems.length}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">Low Stock Alert</h3>
              <p className="text-sm text-orange-800 mb-3">
                The following items are running low on stock:
              </p>
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Current: {item.quantity} {item.unit} | Minimum: {item.minQuantity} {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestockClick(item)}
                      className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Items</h2>
        </div>
        
        {loading ? (
          <SkeletonLoader type="table" count={5} />
        ) : inventory.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your stock by adding your first item</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inventory.map((item) => {
                  const isLowStock = item.quantity <= item.minQuantity
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isLowStock ? 'bg-orange-100' : 'bg-primary-100'
                          }`}>
                            <Package className={`w-5 h-5 ${isLowStock ? 'text-orange-600' : 'text-primary-600'}`} />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-bold text-lg">{item.quantity}</span>
                              <span className="text-gray-500 text-sm">{item.unit}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* Quick subtract buttons */}
                              <button
                                onClick={() => handleQuickAdjust(item, -10)}
                                className="px-2 py-0.5 text-xs bg-danger-100 text-danger-700 rounded hover:bg-danger-200 transition-colors font-medium"
                                title="Remove 10"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, -5)}
                                className="px-2 py-0.5 text-xs bg-danger-100 text-danger-700 rounded hover:bg-danger-200 transition-colors font-medium"
                                title="Remove 5"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, -1)}
                                className="p-1 bg-danger-100 text-danger-700 rounded hover:bg-danger-200 transition-colors"
                                title="Remove 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              
                              {/* Quick add buttons */}
                              <button
                                onClick={() => handleQuickAdjust(item, 1)}
                                className="p-1 bg-success-100 text-success-700 rounded hover:bg-success-200 transition-colors"
                                title="Add 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, 5)}
                                className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded hover:bg-success-200 transition-colors font-medium"
                                title="Add 5"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickAdjust(item, 10)}
                                className="px-2 py-0.5 text-xs bg-success-100 text-success-700 rounded hover:bg-success-200 transition-colors font-medium"
                                title="Add 10"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">{item.minQuantity} {item.unit}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900">${item.cost.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 font-medium">${(item.quantity * item.cost).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLowStock ? (
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-700 rounded-full">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Coffee Beans"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="100"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min. Quantity *</label>
                  <input
                    type="number"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    placeholder="20"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., kg, lbs, units"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {costType === 'unit' ? 'Unit Cost *' : 'Total Cost *'}
                  </label>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setCostType('unit')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                        costType === 'unit'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Per Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostType('total')}
                      className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                        costType === 'total'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Total
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {costType === 'total' && quantity && cost && (
                  <p className="mt-2 text-sm text-gray-600">
                    Unit cost: ${(parseFloat(cost) / parseInt(quantity)).toFixed(2)} per {unit || 'unit'}
                  </p>
                )}
                {costType === 'unit' && quantity && cost && (
                  <p className="mt-2 text-sm text-gray-600">
                    Total cost: ${(parseFloat(cost) * parseInt(quantity)).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && restockingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Restock Item</h2>
                  <p className="text-orange-100 text-sm">{restockingItem.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowRestockModal(false)
                  setRestockingItem(null)
                  setRestockAmount('')
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-5">
              {/* Current Stock Info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-orange-700 font-medium">Current Stock</span>
                  <span className="text-2xl font-bold text-orange-900">
                    {restockingItem.quantity} {restockingItem.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600">Minimum Required</span>
                  <span className="text-orange-700 font-medium">
                    {restockingItem.minQuantity} {restockingItem.unit}
                  </span>
                </div>
              </div>

              {/* Add Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    placeholder="Enter quantity to add"
                    required
                    autoFocus
                    className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {restockingItem.unit}
                  </span>
                </div>
              </div>

              {/* New Total Preview */}
              {restockAmount && parseInt(restockAmount) > 0 && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-success-700 font-medium">New Total</span>
                    <span className="text-2xl font-bold text-success-900">
                      {restockingItem.quantity + parseInt(restockAmount)} {restockingItem.unit}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-success-600">
                    Adding {restockAmount} {restockingItem.unit}
                  </div>
                </div>
              )}

              {/* Quick Add Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Add
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockAmount('5')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestockAmount('10')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestockAmount('25')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    +25
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestockAmount('50')}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    +50
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false)
                    setRestockingItem(null)
                    setRestockAmount('')
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!restockAmount || parseInt(restockAmount) <= 0}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

