'use client'

import { useState, useEffect } from 'react'
import { TaxSettings } from '@/types'
import { Building2, Save, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

interface TaxSettingsFormProps {
  businessId: string
  userId: string
  onSave?: () => void
}

export default function TaxSettingsForm({ businessId, userId, onSave }: TaxSettingsFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Partial<TaxSettings>>({
    businessType: 'sole-proprietor',
    taxYear: new Date().getFullYear(),
    federalTaxRate: 0.15,
    stateTaxRate: 0.05,
    salesTaxRate: 0.0,
    estimatedQuarterlyPayments: [0, 0, 0, 0],
  })

  useEffect(() => {
    fetchSettings()
  }, [businessId, userId])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/tax/settings?businessId=${businessId}&userId=${userId}`
      )
      const data = await response.json()

      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load tax settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/tax/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          businessId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Tax settings saved successfully!')
      if (onSave) onSave()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save tax settings')
    } finally {
      setSaving(false)
    }
  }

  const updateQuarterlyPayment = (index: number, value: number) => {
    const newPayments = [...(settings.estimatedQuarterlyPayments || [0, 0, 0, 0])]
    newPayments[index] = value
    setSettings({ ...settings, estimatedQuarterlyPayments: newPayments })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Building2 className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tax Settings</h2>
          <p className="text-sm text-gray-600">Configure your business tax information</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type
          </label>
          <select
            value={settings.businessType}
            onChange={(e) =>
              setSettings({
                ...settings,
                businessType: e.target.value as TaxSettings['businessType'],
              })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="sole-proprietor">Sole Proprietor</option>
            <option value="llc">LLC</option>
            <option value="s-corp">S-Corporation</option>
            <option value="c-corp">C-Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>

        {/* Tax Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Year
          </label>
          <input
            type="number"
            value={settings.taxYear}
            onChange={(e) =>
              setSettings({ ...settings, taxYear: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Tax Rates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Federal Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={(settings.federalTaxRate || 0) * 100}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  federalTaxRate: parseFloat(e.target.value) / 100,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={(settings.stateTaxRate || 0) * 100}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  stateTaxRate: parseFloat(e.target.value) / 100,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sales Tax Rate (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={(settings.salesTaxRate || 0) * 100}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  salesTaxRate: parseFloat(e.target.value) / 100,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Estimated Quarterly Payments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Estimated Quarterly Payments
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="relative">
                <label className="block text-xs text-gray-600 mb-1">
                  Q{index + 1}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={settings.estimatedQuarterlyPayments?.[index] || 0}
                    onChange={(e) =>
                      updateQuarterlyPayment(index, parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-amber-900">
            <strong>Disclaimer:</strong> This tool provides estimates only. Consult with a tax
            professional for accurate tax advice and filing requirements.
          </p>
        </div>
      </div>
    </div>
  )
}

