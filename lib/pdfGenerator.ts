import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { 
  Expense, 
  Revenue, 
  InventoryItem, 
  Business,
  TaxReport,
  TaxSettings,
  ExpenseTaxInfo,
  TaxCategory,
  Insight,
  SpendingPattern,
  CostOptimization,
  CashFlowForecast,
  RecurringTransaction
} from '@/types'
import { firestoreTimestampToDate } from './utils'

interface ReportData {
  business: Business
  revenues: Revenue[]
  expenses: Expense[]
  inventory: InventoryItem[]
  startDate: Date
  endDate: Date
  // New optional data for PRD v2 features
  taxReport?: TaxReport
  taxSettings?: TaxSettings
  expenseTaxInfo?: ExpenseTaxInfo[]
  taxCategories?: TaxCategory[]
  insights?: Insight[]
  spendingPatterns?: SpendingPattern[]
  costOptimizations?: CostOptimization[]
  cashFlowForecast?: CashFlowForecast
  recurringTransactions?: RecurringTransaction[]
}

export async function generateComprehensiveReport(data: ReportData) {
  const { 
    business, 
    revenues, 
    expenses, 
    inventory, 
    startDate, 
    endDate,
    taxReport,
    taxSettings,
    expenseTaxInfo,
    taxCategories,
    insights,
    spendingPatterns,
    costOptimizations,
    cashFlowForecast,
    recurringTransactions
  } = data
  const doc = new jsPDF()

  // Calculate all metrics
  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0)
  const avgRevenue = revenues.length > 0 ? totalRevenue / revenues.length : 0
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0
  const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity)

  let yPos = 20

  // ===== PAGE 1: EXECUTIVE SUMMARY =====
  
  // Header
  doc.setFillColor(240, 96, 32) // Primary orange
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('BizOps Lite', 14, 20)
  
  doc.setFontSize(18)
  doc.text('Comprehensive Business Report', 14, 30)
  
  // Business Info
  yPos = 50
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(business.name, 14, yPos)
  
  yPos += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Report Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 14, yPos)
  
  yPos += 5
  doc.text(`Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}`, 14, yPos)
  
  // Executive Summary Box
  yPos += 15
  doc.setFillColor(245, 245, 245)
  doc.roundedRect(14, yPos, 182, 60, 3, 3, 'F')
  
  yPos += 10
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Executive Summary', 20, yPos)
  
  // Key Metrics in Summary
  yPos += 10
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  // Revenue
  doc.setTextColor(34, 197, 94) // Success green
  doc.text('Total Revenue:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${totalRevenue.toFixed(2)}`, 80, yPos)
  doc.setTextColor(100, 100, 100)
  doc.text(`(${revenues.length} transactions)`, 120, yPos)
  
  yPos += 8
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(239, 68, 68) // Danger red
  doc.text('Total Expenses:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${totalExpenses.toFixed(2)}`, 80, yPos)
  doc.setTextColor(100, 100, 100)
  doc.text(`(${expenses.length} transactions)`, 120, yPos)
  
  yPos += 8
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(netProfit >= 0 ? 34 : 239, netProfit >= 0 ? 197 : 68, netProfit >= 0 ? 94 : 68)
  doc.text('Net Profit:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${netProfit.toFixed(2)}`, 80, yPos)
  doc.setTextColor(100, 100, 100)
  doc.text(`(${profitMargin.toFixed(1)}% margin)`, 120, yPos)
  
  yPos += 8
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(240, 96, 32) // Primary orange
  doc.text('Inventory Value:', 20, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(`$${inventoryValue.toFixed(2)}`, 80, yPos)
  doc.setTextColor(100, 100, 100)
  doc.text(`(${inventory.length} items)`, 120, yPos)
  
  // Additional Metrics
  yPos += 20
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Additional Metrics', 14, yPos)
  
  yPos += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Average Revenue per Transaction: $${avgRevenue.toFixed(2)}`, 14, yPos)
  
  yPos += 6
  doc.text(`Average Expense per Transaction: $${avgExpense.toFixed(2)}`, 14, yPos)
  
  yPos += 6
  doc.text(`Total Transactions: ${revenues.length + expenses.length}`, 14, yPos)
  
  yPos += 6
  doc.text(`Daily Average Revenue: $${(totalRevenue / 30).toFixed(2)} (30-day estimate)`, 14, yPos)
  
  if (lowStockItems.length > 0) {
    yPos += 6
    doc.setTextColor(249, 115, 22) // Orange
    doc.setFont('helvetica', 'bold')
    doc.text(`⚠ Low Stock Alert: ${lowStockItems.length} item(s) need restocking`, 14, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
  }
  
  // Revenue vs Expenses Visual Chart
  yPos += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Revenue vs Expenses vs Profit', 14, yPos)
  
  yPos += 8
  const comparisonChartHeight = 50
  const comparisonChartWidth = 170
  const maxComparison = Math.max(totalRevenue, totalExpenses, Math.abs(netProfit))
  
  doc.setFillColor(250, 250, 250)
  doc.roundedRect(14, yPos, comparisonChartWidth, comparisonChartHeight + 10, 2, 2, 'F')
  
  // Revenue bar
  const revenueBarWidth = (totalRevenue / maxComparison) * comparisonChartWidth * 0.8
  doc.setFillColor(34, 197, 94)
  doc.roundedRect(20, yPos + 5, revenueBarWidth, 12, 1, 1, 'F')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  if (revenueBarWidth > 40) {
    doc.text('Revenue', 22, yPos + 13)
    doc.text(`$${totalRevenue.toFixed(2)}`, revenueBarWidth + 10, yPos + 13)
  } else {
    doc.setTextColor(0, 0, 0)
    doc.text(`Revenue: $${totalRevenue.toFixed(2)}`, revenueBarWidth + 22, yPos + 13)
  }
  
  // Expenses bar
  const expenseBarWidth = (totalExpenses / maxComparison) * comparisonChartWidth * 0.8
  doc.setFillColor(239, 68, 68)
  doc.roundedRect(20, yPos + 22, expenseBarWidth, 12, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  if (expenseBarWidth > 40) {
    doc.text('Expenses', 22, yPos + 30)
    doc.text(`$${totalExpenses.toFixed(2)}`, expenseBarWidth + 10, yPos + 30)
  } else {
    doc.setTextColor(0, 0, 0)
    doc.text(`Expenses: $${totalExpenses.toFixed(2)}`, expenseBarWidth + 22, yPos + 30)
  }
  
  // Profit bar (Amber/Yellow for profit, keep purple for loss)
  const profitBarWidth = (Math.abs(netProfit) / maxComparison) * comparisonChartWidth * 0.8
  doc.setFillColor(netProfit >= 0 ? 245 : 156, netProfit >= 0 ? 158 : 163, netProfit >= 0 ? 11 : 175)
  doc.roundedRect(20, yPos + 39, profitBarWidth, 12, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  if (profitBarWidth > 40) {
    doc.text(netProfit >= 0 ? 'Profit' : 'Loss', 22, yPos + 47)
    doc.text(`$${Math.abs(netProfit).toFixed(2)}`, profitBarWidth + 10, yPos + 47)
  } else {
    doc.setTextColor(0, 0, 0)
    doc.text(`${netProfit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(netProfit).toFixed(2)}`, profitBarWidth + 22, yPos + 47)
  }

  // ===== PAGE 2: REVENUE DETAILS =====
  doc.addPage()
  yPos = 20
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(34, 197, 94)
  doc.text('Revenue Analysis', 14, yPos)
  
  yPos += 10
  
  if (revenues.length > 0) {
    // Revenue by Source
    const revenueBySource = revenues.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + r.amount
      return acc
    }, {} as Record<string, number>)
    
    const sourceData = Object.entries(revenueBySource)
      .map(([source, amount]) => [
        source,
        `$${amount.toFixed(2)}`,
        `${((amount / totalRevenue) * 100).toFixed(1)}%`
      ])
      .sort((a, b) => parseFloat(b[1].slice(1)) - parseFloat(a[1].slice(1)))
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Revenue by Source', 14, yPos)
    
    // Draw Bar Chart
    yPos += 8
    const chartHeight = 60
    const chartWidth = 150
    const maxAmount = Math.max(...Object.values(revenueBySource))
    const sources = Object.entries(revenueBySource).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const barHeight = chartHeight / sources.length - 4
    
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(14, yPos, chartWidth + 30, chartHeight + 10, 2, 2, 'F')
    
    sources.forEach(([source, amount], index) => {
      const barWidth = (amount / maxAmount) * chartWidth
      const barY = yPos + 5 + (index * (barHeight + 4))
      
      // Draw bar
      doc.setFillColor(34, 197, 94)
      doc.roundedRect(14, barY, barWidth, barHeight, 1, 1, 'F')
      
      // Add label
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text(source, barWidth + 16, barY + barHeight / 2 + 2)
      doc.setTextColor(255, 255, 255)
      if (barWidth > 30) {
        doc.text(`$${amount.toFixed(0)}`, barWidth - 25, barY + barHeight / 2 + 2)
      } else {
        doc.setTextColor(0, 0, 0)
        doc.text(`$${amount.toFixed(0)}`, barWidth + 2, barY + barHeight / 2 + 2)
      }
    })
    
    yPos += chartHeight + 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Revenue by Source - Detailed Table', 14, yPos)
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Source', 'Amount', '% of Total']],
      body: sourceData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 15
    
    // Top 10 Revenue Entries
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Top 10 Revenue Entries', 14, yPos)
    
    const topRevenues = [...revenues]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(r => [
        format(firestoreTimestampToDate(r.date), 'MMM dd, yyyy'),
        r.source,
        r.description || '-',
        `$${r.amount.toFixed(2)}`
      ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Source', 'Description', 'Amount']],
      body: topRevenues,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 15
    
    // All Revenue Entries (if space, otherwise new page)
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('All Revenue Entries', 14, yPos)
    
    const allRevenues = revenues.map(r => [
      format(firestoreTimestampToDate(r.date), 'MMM dd, yyyy'),
      r.source,
      r.description || '-',
      `$${r.amount.toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Source', 'Description', 'Amount']],
      body: allRevenues,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    })
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No revenue data for this period', 14, yPos)
  }

  // ===== PAGE 3: EXPENSE DETAILS =====
  doc.addPage()
  yPos = 20
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(239, 68, 68)
  doc.text('Expense Analysis', 14, yPos)
  
  yPos += 10
  
  if (expenses.length > 0) {
    // Expenses by Category
    const expensesByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
    
    const categoryData = Object.entries(expensesByCategory)
      .map(([category, amount]) => [
        category,
        `$${amount.toFixed(2)}`,
        `${((amount / totalExpenses) * 100).toFixed(1)}%`
      ])
      .sort((a, b) => parseFloat(b[1].slice(1)) - parseFloat(a[1].slice(1)))
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Expenses by Category', 14, yPos)
    
    // Draw Bar Chart for Expenses
    yPos += 8
    const chartHeight = 60
    const chartWidth = 150
    const maxAmount = Math.max(...Object.values(expensesByCategory))
    const categories = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const barHeight = chartHeight / categories.length - 4
    
    doc.setFillColor(254, 242, 242)
    doc.roundedRect(14, yPos, chartWidth + 30, chartHeight + 10, 2, 2, 'F')
    
    categories.forEach(([category, amount], index) => {
      const barWidth = (amount / maxAmount) * chartWidth
      const barY = yPos + 5 + (index * (barHeight + 4))
      
      // Draw bar
      doc.setFillColor(239, 68, 68)
      doc.roundedRect(14, barY, barWidth, barHeight, 1, 1, 'F')
      
      // Add label
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text(category, barWidth + 16, barY + barHeight / 2 + 2)
      doc.setTextColor(255, 255, 255)
      if (barWidth > 30) {
        doc.text(`$${amount.toFixed(0)}`, barWidth - 25, barY + barHeight / 2 + 2)
      } else {
        doc.setTextColor(0, 0, 0)
        doc.text(`$${amount.toFixed(0)}`, barWidth + 2, barY + barHeight / 2 + 2)
      }
    })
    
    yPos += chartHeight + 15
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Expenses by Category - Detailed Table', 14, yPos)
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Category', 'Amount', '% of Total']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 15
    
    // Top 10 Expense Entries
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Top 10 Expense Entries', 14, yPos)
    
    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map(e => [
        format(firestoreTimestampToDate(e.date), 'MMM dd, yyyy'),
        e.category,
        e.description || '-',
        `$${e.amount.toFixed(2)}`
      ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: topExpenses,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 15
    
    // All Expense Entries
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('All Expense Entries', 14, yPos)
    
    const allExpenses = expenses.map(e => [
      format(firestoreTimestampToDate(e.date), 'MMM dd, yyyy'),
      e.category,
      e.description || '-',
      `$${e.amount.toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: allExpenses,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    })
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No expense data for this period', 14, yPos)
  }

  // ===== PAGE 4: INVENTORY DETAILS =====
  doc.addPage()
  yPos = 20
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(240, 96, 32)
  doc.text('Inventory Analysis', 14, yPos)
  
  yPos += 10
  
  if (inventory.length > 0) {
    // Inventory Summary
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Inventory Summary', 14, yPos)
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Items: ${inventory.length}`, 14, yPos)
    
    yPos += 6
    doc.text(`Total Value: $${inventoryValue.toFixed(2)}`, 14, yPos)
    
    yPos += 6
    doc.text(`Low Stock Items: ${lowStockItems.length}`, 14, yPos)
    
    yPos += 6
    const avgItemValue = inventory.length > 0 ? inventoryValue / inventory.length : 0
    doc.text(`Average Item Value: $${avgItemValue.toFixed(2)}`, 14, yPos)
    
    yPos += 15
    
    // Low Stock Items (if any)
    if (lowStockItems.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(249, 115, 22)
      doc.text('⚠ Low Stock Items - Action Required', 14, yPos)
      
      const lowStockData = lowStockItems.map(item => [
        item.name,
        `${item.quantity} ${item.unit}`,
        `${item.minQuantity} ${item.unit}`,
        `$${item.cost.toFixed(2)}`,
        `$${(item.quantity * item.cost).toFixed(2)}`,
        'RESTOCK'
      ])
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Item', 'Current', 'Minimum', 'Unit Cost', 'Value', 'Status']],
        body: lowStockData,
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] },
        bodyStyles: { textColor: [0, 0, 0] },
        columnStyles: {
          5: { textColor: [249, 115, 22], fontStyle: 'bold' }
        }
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 15
    }
    
    // All Inventory Items
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Complete Inventory List', 14, yPos)
    
    const inventoryData = inventory.map(item => [
      item.name,
      `${item.quantity} ${item.unit}`,
      `${item.minQuantity} ${item.unit}`,
      `$${item.cost.toFixed(2)}`,
      `$${(item.quantity * item.cost).toFixed(2)}`,
      item.quantity <= item.minQuantity ? 'Low' : 'OK'
    ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Item Name', 'Quantity', 'Min. Qty', 'Unit Cost', 'Total Value', 'Status']],
      body: inventoryData,
      theme: 'striped',
      headStyles: { fillColor: [240, 96, 32] },
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 15
    
    // Top 10 Most Valuable Items
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Top 10 Most Valuable Items', 14, yPos)
    
    const valuableItems = [...inventory]
      .sort((a, b) => (b.quantity * b.cost) - (a.quantity * a.cost))
      .slice(0, 10)
      .map((item, index) => [
        `#${index + 1}`,
        item.name,
        `${item.quantity} ${item.unit}`,
        `$${item.cost.toFixed(2)}`,
        `$${(item.quantity * item.cost).toFixed(2)}`
      ])
    
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Rank', 'Item', 'Quantity', 'Unit Cost', 'Total Value']],
      body: valuableItems,
      theme: 'striped',
      headStyles: { fillColor: [240, 96, 32] },
    })
  } else {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('No inventory data available', 14, yPos)
  }

  // ===== PAGE 5: TAX ANALYSIS (if available) =====
  if (data.taxReport || data.expenseTaxInfo) {
    doc.addPage()
    yPos = 20
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(99, 102, 241) // Indigo
    doc.text('Tax Analysis', 14, yPos)
    
    yPos += 10
    
    if (data.taxReport) {
      const taxReport = data.taxReport
      
      // Tax Summary Box
      doc.setFillColor(238, 242, 255) // Light indigo
      doc.roundedRect(14, yPos, 182, 70, 3, 3, 'F')
      
      yPos += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Tax Summary', 20, yPos)
      
      yPos += 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      
      // Total Revenue
      doc.setTextColor(34, 197, 94)
      doc.text('Total Revenue:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${taxReport.totalRevenue.toFixed(2)}`, 80, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Total Expenses:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${taxReport.totalExpenses.toFixed(2)}`, 80, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(59, 130, 246) // Blue
      doc.text('Deductible Expenses:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${taxReport.deductibleExpenses.toFixed(2)}`, 80, yPos)
      doc.setTextColor(100, 100, 100)
      const deductiblePercentage = taxReport.totalExpenses > 0 
        ? (taxReport.deductibleExpenses / taxReport.totalExpenses * 100).toFixed(1)
        : '0'
      doc.text(`(${deductiblePercentage}% of expenses)`, 140, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(168, 85, 247) // Purple
      doc.text('Taxable Income:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${taxReport.taxableIncome.toFixed(2)}`, 80, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(239, 68, 68) // Red
      doc.text('Estimated Tax Owed:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${taxReport.estimatedTaxOwed.toFixed(2)}`, 80, yPos)
      
      if (taxReport.salesTaxCollected > 0 || taxReport.salesTaxOwed > 0) {
        yPos += 8
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(234, 179, 8) // Yellow
        doc.text('Sales Tax Collected:', 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(`$${taxReport.salesTaxCollected.toFixed(2)}`, 80, yPos)
        
        yPos += 8
        doc.setFont('helvetica', 'bold')
        doc.text('Sales Tax Owed:', 20, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(`$${taxReport.salesTaxOwed.toFixed(2)}`, 80, yPos)
      }
      
      yPos += 15
      
      // Tax Settings Info
      if (data.taxSettings) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Tax Configuration', 14, yPos)
        
        yPos += 8
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.text(`Business Type: ${data.taxSettings.businessType.toUpperCase().replace('-', ' ')}`, 14, yPos)
        
        yPos += 6
        doc.text(`Tax Year: ${data.taxSettings.taxYear}`, 14, yPos)
        
        yPos += 6
        doc.text(`Federal Tax Rate: ${(data.taxSettings.federalTaxRate * 100).toFixed(1)}%`, 14, yPos)
        
        yPos += 6
        doc.text(`State Tax Rate: ${(data.taxSettings.stateTaxRate * 100).toFixed(1)}%`, 14, yPos)
        
        yPos += 6
        doc.text(`Sales Tax Rate: ${(data.taxSettings.salesTaxRate * 100).toFixed(1)}%`, 14, yPos)
        
        yPos += 15
      }
    }
    
    // Tax Deductible Expenses by Category
    if (data.expenseTaxInfo && data.expenseTaxInfo.length > 0 && data.taxCategories) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Tax Deductible Expenses by Category', 14, yPos)
      
      // Group expenses by tax category
      const expensesByTaxCategory: Record<string, number> = {}
      data.expenseTaxInfo.forEach(taxInfo => {
        const category = data.taxCategories?.find(c => c.id === taxInfo.taxCategoryId)
        if (category && taxInfo.deductible) {
          expensesByTaxCategory[category.name] = 
            (expensesByTaxCategory[category.name] || 0) + taxInfo.deductionAmount
        }
      })
      
      const taxCategoryData = Object.entries(expensesByTaxCategory)
        .map(([category, amount]) => {
          const cat = data.taxCategories?.find(c => c.name === category)
          return [
            category,
            cat?.irsCategory || 'N/A',
            `$${amount.toFixed(2)}`,
            cat?.deductionType || 'full'
          ]
        })
        .sort((a, b) => parseFloat(b[2].slice(1)) - parseFloat(a[2].slice(1)))
      
      if (taxCategoryData.length > 0) {
        autoTable(doc, {
          startY: yPos + 5,
          head: [['Tax Category', 'IRS Schedule C', 'Deduction Amount', 'Type']],
          body: taxCategoryData,
          theme: 'striped',
          headStyles: { fillColor: [99, 102, 241] },
        })
        
        yPos = (doc as any).lastAutoTable.finalY + 15
      }
    }
    
    // Tax Disclaimer
    if (yPos > 220) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFillColor(254, 243, 199) // Light yellow
    doc.roundedRect(14, yPos, 182, 30, 3, 3, 'F')
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(120, 53, 15) // Dark yellow
    doc.text('⚠ Tax Disclaimer', 20, yPos)
    
    yPos += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    const disclaimerText = 'This report is for informational purposes only and should not be considered tax advice. '
    const disclaimerText2 = 'Please consult with a qualified tax professional or CPA for tax planning and filing.'
    doc.text(disclaimerText, 20, yPos, { maxWidth: 172 })
    yPos += 4
    doc.text(disclaimerText2, 20, yPos, { maxWidth: 172 })
  }

  // ===== PAGE 6: AI INSIGHTS & COST OPTIMIZATION (if available) =====
  if ((data.insights && data.insights.length > 0) || 
      (data.costOptimizations && data.costOptimizations.length > 0) ||
      (data.spendingPatterns && data.spendingPatterns.length > 0)) {
    doc.addPage()
    yPos = 20
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(168, 85, 247) // Purple
    doc.text('AI Insights & Cost Optimization', 14, yPos)
    
    yPos += 10
    
    // Cost Optimization Summary
    if (data.costOptimizations && data.costOptimizations.length > 0) {
      const totalPotentialSavings = data.costOptimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0)
      
      doc.setFillColor(250, 245, 255) // Light purple
      doc.roundedRect(14, yPos, 182, 30, 3, 3, 'F')
      
      yPos += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Cost Savings Opportunities', 20, yPos)
      
      yPos += 10
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(34, 197, 94)
      doc.text('Total Potential Savings:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${totalPotentialSavings.toFixed(2)}`, 90, yPos)
      doc.setTextColor(100, 100, 100)
      doc.text(`from ${data.costOptimizations.length} optimization(s)`, 140, yPos)
      
      yPos += 15
      
      // Cost Optimization Details
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Detailed Cost Optimization Recommendations', 14, yPos)
      
      const optimizationData = data.costOptimizations.map(opt => [
        opt.category,
        `$${opt.currentSpend.toFixed(2)}`,
        `$${opt.recommendedSpend.toFixed(2)}`,
        `$${opt.potentialSavings.toFixed(2)}`,
        opt.recommendation.length > 50 ? opt.recommendation.substring(0, 47) + '...' : opt.recommendation
      ])
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Category', 'Current', 'Recommended', 'Savings', 'Recommendation']],
        body: optimizationData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247] },
        columnStyles: {
          3: { textColor: [34, 197, 94], fontStyle: 'bold' }
        }
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 15
    }
    
    // Spending Patterns
    if (data.spendingPatterns && data.spendingPatterns.length > 0) {
      if (yPos > 200) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Spending Patterns Analysis', 14, yPos)
      
      const patternsData = data.spendingPatterns.map(pattern => {
        let trendIcon = '→'
        let trendColor = [100, 100, 100]
        if (pattern.trend === 'increasing') {
          trendIcon = '↑'
          trendColor = [239, 68, 68]
        } else if (pattern.trend === 'decreasing') {
          trendIcon = '↓'
          trendColor = [34, 197, 94]
        }
        
        return [
          pattern.category,
          `$${pattern.averageMonthly.toFixed(2)}`,
          `${trendIcon} ${pattern.trend}`,
          `${(pattern.variance * 100).toFixed(1)}%`
        ]
      })
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Category', 'Avg Monthly', 'Trend', 'Variance']],
        body: patternsData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247] },
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 15
    }
    
    // AI Insights
    if (data.insights && data.insights.length > 0) {
      if (yPos > 200) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('AI-Generated Insights', 14, yPos)
      
      yPos += 8
      
      // Group insights by impact
      const highImpactInsights = data.insights.filter(i => i.impact === 'high' && i.actionable)
      const mediumImpactInsights = data.insights.filter(i => i.impact === 'medium' && i.actionable)
      
      // High Impact Insights
      if (highImpactInsights.length > 0) {
        highImpactInsights.slice(0, 3).forEach((insight, index) => {
          if (yPos > 250) {
            doc.addPage()
            yPos = 20
          }
          
          // Insight card color based on type
          let cardColor = [254, 242, 242] // Light red for warnings
          if (insight.type === 'cost-savings') cardColor = [220, 252, 231] // Light green
          if (insight.type === 'opportunity') cardColor = [219, 234, 254] // Light blue
          
          doc.setFillColor(cardColor[0], cardColor[1], cardColor[2])
          doc.roundedRect(14, yPos, 182, 35, 2, 2, 'F')
          
          yPos += 8
          doc.setFontSize(11)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 0, 0)
          doc.text(`${insight.title}`, 20, yPos)
          
          // Impact badge
          doc.setFontSize(8)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          doc.setFillColor(239, 68, 68)
          doc.roundedRect(170, yPos - 5, 20, 5, 1, 1, 'F')
          doc.text('HIGH', 175, yPos - 1)
          
          yPos += 6
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(60, 60, 60)
          const descLines = doc.splitTextToSize(insight.description, 172)
          doc.text(descLines.slice(0, 2), 20, yPos)
          
          yPos += 12
          if (insight.estimatedSavings) {
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(34, 197, 94)
            doc.text(`Potential Savings: $${insight.estimatedSavings.toFixed(2)}`, 20, yPos)
          }
          
          yPos += 10
        })
      }
      
      // Summary of all insights
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }
      
      yPos += 5
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('All Insights Summary', 14, yPos)
      
      const insightsData = data.insights.slice(0, 10).map(insight => [
        insight.type.replace('-', ' ').toUpperCase(),
        insight.title.length > 40 ? insight.title.substring(0, 37) + '...' : insight.title,
        insight.impact.toUpperCase(),
        insight.estimatedSavings ? `$${insight.estimatedSavings.toFixed(2)}` : '-',
        `${insight.confidence}%`
      ])
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Type', 'Insight', 'Impact', 'Savings', 'Confidence']],
        body: insightsData,
        theme: 'striped',
        headStyles: { fillColor: [168, 85, 247] },
      })
      
      yPos = (doc as any).lastAutoTable.finalY + 10
    }
  }

  // ===== PAGE 7: CASH FLOW FORECAST (if available) =====
  if (data.cashFlowForecast || (data.recurringTransactions && data.recurringTransactions.length > 0)) {
    doc.addPage()
    yPos = 20
    
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(59, 130, 246) // Blue
    doc.text('Cash Flow Forecast', 14, yPos)
    
    yPos += 10
    
    if (data.cashFlowForecast) {
      const forecast = data.cashFlowForecast
      
      // Forecast Summary Box
      doc.setFillColor(239, 246, 255) // Light blue
      doc.roundedRect(14, yPos, 182, 50, 3, 3, 'F')
      
      yPos += 10
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Forecast Summary', 20, yPos)
      
      yPos += 10
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      
      doc.setTextColor(100, 100, 100)
      doc.text('Forecast Period:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`${forecast.forecastPeriod} days`, 80, yPos)
      doc.text(`(${format(forecast.startDate, 'MMM dd')} - ${format(forecast.endDate, 'MMM dd, yyyy')})`, 110, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(59, 130, 246)
      doc.text('Current Balance:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${forecast.currentBalance.toFixed(2)}`, 80, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      const projBalanceColor = forecast.projectedBalance >= forecast.currentBalance ? [34, 197, 94] : [239, 68, 68]
      doc.setTextColor(projBalanceColor[0], projBalanceColor[1], projBalanceColor[2])
      doc.text('Projected Balance:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`$${forecast.projectedBalance.toFixed(2)}`, 80, yPos)
      
      const changeAmount = forecast.projectedBalance - forecast.currentBalance
      const changePercent = forecast.currentBalance !== 0 
        ? (changeAmount / forecast.currentBalance * 100).toFixed(1)
        : '0'
      doc.setTextColor(100, 100, 100)
      doc.text(`(${changeAmount >= 0 ? '+' : ''}$${changeAmount.toFixed(2)} / ${changeAmount >= 0 ? '+' : ''}${changePercent}%)`, 140, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(168, 85, 247)
      doc.text('Confidence Level:', 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`${(forecast.confidence * 100).toFixed(0)}%`, 80, yPos)
      
      yPos += 15
      
      // Forecast Assumptions
      if (forecast.assumptions && forecast.assumptions.length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Forecast Assumptions', 14, yPos)
        
        yPos += 8
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        
        forecast.assumptions.slice(0, 5).forEach(assumption => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(`• ${assumption.type.toUpperCase()}: ${assumption.description}`, 20, yPos)
          yPos += 5
        })
        
        yPos += 10
      }
      
      // Sample of daily projections
      if (forecast.dailyProjections && forecast.dailyProjections.length > 0) {
        if (yPos > 180) {
          doc.addPage()
          yPos = 20
        }
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Weekly Forecast Breakdown', 14, yPos)
        
        // Group by weeks and show weekly totals
        const weeklyData: any[] = []
        let weekRevenue = 0
        let weekExpenses = 0
        let weekCount = 0
        let weekStart = 0
        
        forecast.dailyProjections.forEach((day, index) => {
          weekRevenue += day.projectedRevenue
          weekExpenses += day.projectedExpenses
          weekCount++
          
          if (weekCount === 7 || index === forecast.dailyProjections.length - 1) {
            const weekEnd = index
            const netChange = weekRevenue - weekExpenses
            weeklyData.push([
              `Week ${Math.floor(index / 7) + 1}`,
              `${format(forecast.dailyProjections[weekStart].date, 'MMM dd')} - ${format(day.date, 'MMM dd')}`,
              `$${weekRevenue.toFixed(2)}`,
              `$${weekExpenses.toFixed(2)}`,
              `$${netChange.toFixed(2)}`,
              `$${day.projectedBalance.toFixed(2)}`
            ])
            
            weekRevenue = 0
            weekExpenses = 0
            weekCount = 0
            weekStart = index + 1
          }
        })
        
        autoTable(doc, {
          startY: yPos + 5,
          head: [['Week', 'Period', 'Revenue', 'Expenses', 'Net Change', 'Balance']],
          body: weeklyData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        })
        
        yPos = (doc as any).lastAutoTable.finalY + 15
      }
    }
    
    // Recurring Transactions
    if (data.recurringTransactions && data.recurringTransactions.length > 0) {
      if (yPos > 200) {
        doc.addPage()
        yPos = 20
      }
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Recurring Transactions', 14, yPos)
      
      const recurringRevenue = data.recurringTransactions.filter(t => t.type === 'revenue' && t.active)
      const recurringExpenses = data.recurringTransactions.filter(t => t.type === 'expense' && t.active)
      
      if (recurringRevenue.length > 0) {
        yPos += 8
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(34, 197, 94)
        doc.text('Recurring Revenue', 14, yPos)
        
        const revenueData = recurringRevenue.map(t => [
          t.name,
          t.frequency,
          `$${t.amount.toFixed(2)}`,
          format(t.startDate, 'MMM dd, yyyy'),
          t.endDate ? format(t.endDate, 'MMM dd, yyyy') : 'Ongoing'
        ])
        
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Name', 'Frequency', 'Amount', 'Start Date', 'End Date']],
          body: revenueData,
          theme: 'striped',
          headStyles: { fillColor: [34, 197, 94] },
        })
        
        yPos = (doc as any).lastAutoTable.finalY + 10
      }
      
      if (recurringExpenses.length > 0) {
        if (yPos > 220) {
          doc.addPage()
          yPos = 20
        }
        
        yPos += 8
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(239, 68, 68)
        doc.text('Recurring Expenses', 14, yPos)
        
        const expenseData = recurringExpenses.map(t => [
          t.name,
          t.frequency,
          `$${t.amount.toFixed(2)}`,
          format(t.startDate, 'MMM dd, yyyy'),
          t.endDate ? format(t.endDate, 'MMM dd, yyyy') : 'Ongoing'
        ])
        
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Name', 'Frequency', 'Amount', 'Start Date', 'End Date']],
          body: expenseData,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68] },
        })
        
        yPos = (doc as any).lastAutoTable.finalY + 10
      }
      
      // Monthly totals
      if (yPos > 240) {
        doc.addPage()
        yPos = 20
      }
      
      yPos += 5
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Estimated Monthly Recurring Totals:', 14, yPos)
      
      // Calculate monthly equivalents
      const monthlyRevenueTotal = recurringRevenue.reduce((sum, t) => {
        const multiplier = {
          'daily': 30,
          'weekly': 4.33,
          'bi-weekly': 2.17,
          'monthly': 1,
          'quarterly': 0.33,
          'annually': 0.083
        }[t.frequency] || 1
        return sum + (t.amount * multiplier)
      }, 0)
      
      const monthlyExpenseTotal = recurringExpenses.reduce((sum, t) => {
        const multiplier = {
          'daily': 30,
          'weekly': 4.33,
          'bi-weekly': 2.17,
          'monthly': 1,
          'quarterly': 0.33,
          'annually': 0.083
        }[t.frequency] || 1
        return sum + (t.amount * multiplier)
      }, 0)
      
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(34, 197, 94)
      doc.text(`Recurring Revenue: $${monthlyRevenueTotal.toFixed(2)}/month`, 20, yPos)
      
      yPos += 6
      doc.setTextColor(239, 68, 68)
      doc.text(`Recurring Expenses: $${monthlyExpenseTotal.toFixed(2)}/month`, 20, yPos)
      
      yPos += 6
      doc.setTextColor(59, 130, 246)
      doc.text(`Net Recurring: $${(monthlyRevenueTotal - monthlyExpenseTotal).toFixed(2)}/month`, 20, yPos)
    }
  }

  // ===== FOOTER ON ALL PAGES =====
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount} | BizOps Lite © ${new Date().getFullYear()} | ${business.name}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  // Save the PDF
  const fileName = `${business.name.replace(/\s+/g, '_')}_Comprehensive_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`
  doc.save(fileName)
  
  return fileName
}

