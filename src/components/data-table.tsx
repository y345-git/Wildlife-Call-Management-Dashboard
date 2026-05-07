'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Search, Download, Database, X, FileText, FileSpreadsheet, File, Sun, Moon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { IncidentData } from '@/types'
import { formatDate, formatTime, parseIncidentDate } from '@/utils/date-parser'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface DataTableProps {
  data: IncidentData[]
  loading?: boolean
}

const ITEMS_PER_PAGE = 15

export function DataTable({ data, loading }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const tableTopRef = useRef<HTMLDivElement>(null)

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const filteredData = data.filter(row => {
    const searchLower = searchQuery.toLowerCase()
    return (
      row['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']?.toLowerCase().includes(searchLower) ||
      row['तालुका:']?.toLowerCase().includes(searchLower) ||
      row['गावाचे नाव:']?.toLowerCase().includes(searchLower) ||
      row['संपर्क करणाऱ्याचे नाव:']?.toLowerCase().includes(searchLower) ||
      row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:']?.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentData = filteredData.slice(startIndex, endIndex)

  // Scroll to top when page changes
  useEffect(() => {
    if (tableTopRef.current) {
      tableTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    // Try to set default font
    try {
      doc.setFont('helvetica')
    } catch (e) {
      console.warn('Font setting failed, using default')
    }

    // Add title
    doc.setFontSize(18)
    doc.setTextColor(16, 185, 129) // emerald color
    doc.text('Wildlife Incident Management System', 14, 15)
    
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text('Incident Report', 14, 22)
    
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    const exportDate = new Date().toLocaleString('en-IN')
    doc.text(`Generated on: ${exportDate}`, 14, 28)
    doc.text(`Total Records: ${filteredData.length}${searchQuery ? ` (Filtered from ${data.length})` : ''}`, 14, 33)

    // Note about Unicode support
    doc.setFontSize(8)
    doc.setTextColor(200, 100, 100)
    doc.text('Note: Marathi text rendering may vary. For best results, use Excel export.', 14, 36)

    // Prepare table data - use the actual Unicode text
    const tableData = filteredData.map(row => [
      formatDate(row.Timestamp),
      formatTime(row.Timestamp),
      row['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:'] || '',
      row['तालुका:'] || '',
      row['गावाचे नाव:'] || '',
      // Truncate long incident descriptions for PDF
      (row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:'] || '').substring(0, 100) + 
        ((row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:'] || '').length > 100 ? '...' : ''),
      row['संपर्क करणाऱ्याचे नाव:'] || ''
    ])

    // Generate table with settings optimized for Unicode
    autoTable(doc, {
      head: [['Date', 'Time', 'Wildlife Type', 'Taluka', 'Village', 'Incident Type', 'Caller Name']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: 'helvetica',
        halign: 'left',
        // Use Unicode-compatible encoding
        cellWidth: 'auto',
        minCellHeight: 6,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [16, 185, 129], // emerald
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        font: 'helvetica',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 22, halign: 'center' }, // Date
        1: { cellWidth: 16, halign: 'center' }, // Time
        2: { cellWidth: 40 }, // Wildlife - wider for Unicode
        3: { cellWidth: 30 }, // Taluka
        4: { cellWidth: 35 }, // Village
        5: { cellWidth: 70 }, // Incident Type
        6: { cellWidth: 25 }  // Caller
      },
      margin: { top: 40, left: 10, right: 10 },
      // Better handling for text wrapping
      didParseCell: function(data) {
        // Ensure proper cell rendering
        if (data.cell.section === 'body') {
          data.cell.styles.fontSize = 8
        }
      },
      // Add word wrap for better text display
      willDrawCell: function(data) {
        // Custom rendering could go here if needed
      }
    })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `Wildlife-Incident-Report_${timestamp}.pdf`

    // Save the PDF
    doc.save(filename)
  }

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = ['Date', 'Time', 'Wildlife Type', 'Taluka', 'Village', 'Incident Type', 'Caller Name']
    
    // Prepare CSV rows
    const rows = filteredData.map(row => [
      formatDate(row.Timestamp),
      formatTime(row.Timestamp),
      row['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:'] || '',
      row['तालुका:'] || '',
      row['गावाचे नाव:'] || '',
      row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:'] || '',
      row['संपर्क करणाऱ्याचे नाव:'] || ''
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create blob with UTF-8 BOM for proper encoding (supports Devanagari/Marathi text)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    link.setAttribute('href', url)
    link.setAttribute('download', `Wildlife-Incident-Report_${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = () => {
    // Prepare data for Excel
    const worksheetData = [
      ['Date', 'Time', 'Wildlife Type', 'Taluka', 'Village', 'Incident Type', 'Caller Name'],
      ...filteredData.map(row => [
        formatDate(row.Timestamp),
        formatTime(row.Timestamp),
        row['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:'] || '',
        row['तालुका:'] || '',
        row['गावाचे नाव:'] || '',
        row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:'] || '',
        row['संपर्क करणाऱ्याचे नाव:'] || ''
      ])
    ]

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Time
      { wch: 25 }, // Wildlife Type
      { wch: 20 }, // Taluka
      { wch: 25 }, // Village
      { wch: 50 }, // Incident Type
      { wch: 20 }  // Caller Name
    ]

    // Style the header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '10B981' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incident Report')

    // Add metadata
    workbook.Props = {
      Title: 'Wildlife Incident Report',
      Subject: 'Incident Management',
      Author: 'Wildlife Call Management System',
      CreatedDate: new Date()
    }

    // Generate filename and save
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    XLSX.writeFile(workbook, `Wildlife-Incident-Report_${timestamp}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading incident data...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center space-y-3">
          <Database className="h-16 w-16 text-gray-400 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">No incident data available</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Try refreshing the data or check your connection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search and Filter Bar */}
      <div ref={tableTopRef} className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-stretch sm:items-center justify-between bg-gray-50 dark:bg-slate-700/50 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-slate-600 scroll-mt-20">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Search wildlife, taluka, village..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 pr-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-600 rounded-lg shadow-sm dark:text-white text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setCurrentPage(1)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative flex items-center gap-2" ref={exportMenuRef}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={filteredData.length === 0}
            className="shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export ({filteredData.length})
          </Button>
          
          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-slate-400">Export {filteredData.length} records</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    exportToExcel()
                    setShowExportMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-3 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-medium">Export as Excel</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Best for Marathi text</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    exportToCSV()
                    setShowExportMenu(false)
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-3 transition-colors"
                >
                  <File className="h-4 w-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-medium">Export as CSV</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">UTF-8 encoded</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs sm:text-sm bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-3 md:p-4 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="font-medium text-gray-700 dark:text-slate-300">
            Showing <span className="text-emerald-600 dark:text-emerald-400 font-bold">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</span> of <span className="text-emerald-600 dark:text-emerald-400 font-bold">{filteredData.length.toLocaleString()}</span>
          </span>
          {searchQuery && (
            <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
              Filtered from {data.length.toLocaleString()} total
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-md bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-teal-700 hover:bg-emerald-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 border-b border-emerald-700 dark:border-emerald-800">
                <TableHead className="text-white font-bold w-[140px] sm:w-[180px] text-xs sm:text-sm">Timestamp</TableHead>
                <TableHead className="text-white font-bold min-w-[120px] text-xs sm:text-sm">Wildlife Type</TableHead>
                <TableHead className="text-white font-bold min-w-[100px] text-xs sm:text-sm">Taluka</TableHead>
                <TableHead className="text-white font-bold min-w-[100px] text-xs sm:text-sm">Village</TableHead>
                <TableHead className="text-white font-bold min-w-[180px] sm:min-w-[200px] text-xs sm:text-sm">Incident Type</TableHead>
                <TableHead className="text-white font-bold w-[100px] sm:w-[140px] text-xs sm:text-sm">Caller Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((row, index) => {
                const date = parseIncidentDate(row.Timestamp)
                const isValid = date !== null && !isNaN(date.getTime())
                const hour = isValid ? date!.getHours() : -1
                const isDaytime = hour >= 6 && hour < 18
                const showBadge = isValid && hour >= 0

                return (
                  <TableRow 
                    key={startIndex + index} 
                    className="border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <TableCell className="font-mono text-[10px] sm:text-xs bg-gray-50 dark:bg-slate-800/50 p-2 sm:p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-semibold text-gray-900 dark:text-slate-200">
                            {formatDate(row.Timestamp)}
                          </span>
                          {showBadge && (
                            <span className={`inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium whitespace-nowrap ${
                              isDaytime 
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {isDaytime ? <Sun className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> : <Moon className="h-2 w-2 sm:h-2.5 sm:w-2.5" />}
                              {isDaytime ? 'Day' : 'Night'}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 dark:text-slate-400 font-semibold">
                          {formatTime(row.Timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {row['कोणत्या वन्यप्राण्याची नोंद करू इच्छिता:']}
                      </span>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <span className="font-medium text-gray-900 dark:text-slate-200 text-xs sm:text-sm">
                        {row['तालुका:']}
                      </span>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <span className="text-gray-700 dark:text-slate-300 text-xs sm:text-sm">
                        {row['गावाचे नाव:']}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] sm:max-w-md p-2 sm:p-4">
                      <div className="line-clamp-2 text-[11px] sm:text-sm text-gray-700 dark:text-slate-300" title={row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:']}>
                        {row['वन्यजीवांच्या बाबत आपण काय कळवू इच्छिता याची नोंद करा:']}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 sm:p-4">
                      <span className="font-medium text-gray-900 dark:text-slate-200 text-xs sm:text-sm">
                        {row['संपर्क करणाऱ्याचे नाव:']}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls at Bottom */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-3 md:p-4 rounded-xl border border-gray-200 dark:border-slate-700">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 dark:border-slate-600 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto text-xs sm:text-sm"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-600 dark:to-teal-700 text-white rounded-lg shadow-md font-semibold">
          <span className="text-xs sm:text-sm">Page {currentPage} of {totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="shadow-sm hover:shadow-md transition-all duration-300 border-gray-300 dark:border-slate-600 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 w-full sm:w-auto text-xs sm:text-sm"
        >
          Next
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
