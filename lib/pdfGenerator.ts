import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Expense, Revenue, InventoryItem, Business } from '@/types'
import { firestoreTimestampToDate } from './utils'

interface ReportData {
  business: Business
  revenues: Revenue[]
  expenses: Expense[]
  inventory: InventoryItem[]
  startDate: Date
  endDate: Date
}

export async function generateComprehensiveReport(data: ReportData) {
  const { business, revenues, expenses, inventory, startDate, endDate } = data
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

