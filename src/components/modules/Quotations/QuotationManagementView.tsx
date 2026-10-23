import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Printer,
  Copy,
  GitBranch,
  Wrench,
  Edit2,
  Trash2,
  X,
  FileDown,
  Sun,
  CheckCircle2,
  AlertCircle,
  Building2,
  Download,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Quotation, QuotationLineItem, QuotationStatus } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, exportToExcel } from '../../../utils/formatters';

export const QuotationManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    quotations,
    customers,
    settings,
    createQuotation,
    updateQuotation,
    reviseQuotation,
    duplicateQuotation,
    convertQuotationToInstallation,
    showConfirmDialog,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activePrintQuotation, setActivePrintQuotation] = useState<Quotation | null>(null);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionQuote, setRevisionQuote] = useState<Quotation | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Default line items for solar quotation builder
  const defaultSolarItems: QuotationLineItem[] = [
    {
      id: 'L1',
      description: 'Waaree 540Wp Mono PERC Bifacial Solar PV Modules (ALMM Approved, 25 Yrs Warranty)',
      quantity: 10,
      unit: 'Nos',
      unitPrice: 13500,
      total: 135000,
    },
    {
      id: 'L2',
      description: 'Growatt 5kW Grid-Tie Inverter with Wi-Fi Telemetry (5 Yrs Warranty)',
      quantity: 1,
      unit: 'Set',
      unitPrice: 52000,
      total: 52000,
    },
    {
      id: 'L3',
      description: 'Hot-Dip Galvanized Iron (HDGI) Elevated Solar Structure (80 microns coating)',
      quantity: 1,
      unit: 'Set',
      unitPrice: 28000,
      total: 28000,
    },
    {
      id: 'L4',
      description: 'Balance of System (BOS) - ACDB/DCDB with Type II SPDs, Polycab 4 sq.mm DC Cable, Copper Earthing',
      quantity: 1,
      unit: 'Lot',
      unitPrice: 32000,
      total: 32000,
    },
    {
      id: 'L5',
      description: 'Turnkey Installation, Testing, TSSPDCL Net Meter Inspection & Liaisoning',
      quantity: 1,
      unit: 'Job',
      unitPrice: 28000,
      total: 28000,
    },
  ];

  // Builder Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [capacityKW, setCapacityKW] = useState(5);
  const [panelBrand, setPanelBrand] = useState('Waaree Solar');
  const [panelModel, setPanelModel] = useState('540W Mono PERC Bifacial');
  const [panelWattage, setPanelWattage] = useState(540);
  const [panelQuantity, setPanelQuantity] = useState(10);
  const [inverterBrand, setInverterBrand] = useState('Growatt');
  const [inverterCapacityKW, setInverterCapacityKW] = useState(5);
  const [inverterPhase, setInverterPhase] = useState('Single Phase Grid-Tie');
  const [mountingStructure, setMountingStructure] = useState('HDGI Hot Dip Galvanized Elevated Structure');
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(defaultSolarItems);
  const [discount, setDiscount] = useState(10000);
  const [taxRate, setTaxRate] = useState(settings.taxConfig.defaultSolarGSTRate || 13.8);
  const [paymentTerms, setPaymentTerms] = useState(settings.quotationDefaults.defaultPaymentTerms);
  const [validityDays, setValidityDays] = useState(30);
  const [notesExclusions, setNotesExclusions] = useState(settings.quotationDefaults.standardExclusions);
  const [quoteStatus, setQuoteStatus] = useState<QuotationStatus>('Draft');

  // Recalculate totals
  const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const grandTotal = taxableAmount + taxAmount;

  // Open modal for new quotation
  const handleOpenBuilder = () => {
    setEditingQuotationId(null);
    setSelectedCustomerId(customers[0]?.id || '');
    setLineItems(defaultSolarItems);
    setDiscount(5000);
    setQuoteStatus('Draft');
    setShowBuilderModal(true);
  };

  // Open builder to edit
  const handleOpenEdit = (q: Quotation) => {
    setEditingQuotationId(q.id);
    setSelectedCustomerId(q.customerId);
    setCapacityKW(q.solarSystemCapacityKW);
    setPanelBrand(q.panelBrand);
    setPanelModel(q.panelModel);
    setPanelWattage(q.panelWattage);
    setPanelQuantity(q.panelQuantity);
    setInverterBrand(q.inverterBrand);
    setInverterCapacityKW(q.inverterCapacityKW);
    setInverterPhase(q.inverterPhase);
    setMountingStructure(q.mountingStructure);
    setLineItems(q.lineItems);
    setDiscount(q.discount);
    setTaxRate(q.taxRate);
    setPaymentTerms(q.paymentTerms);
    setValidityDays(q.validityDays);
    setNotesExclusions(q.notesAndExclusions);
    setQuoteStatus(q.status);
    setShowBuilderModal(true);
  };

  // Line item helpers
  const handleUpdateItem = (index: number, field: keyof QuotationLineItem, value: unknown) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    updated[index] = item;
    setLineItems(updated);
  };

  const handleAddItem = () => {
    const newItem: QuotationLineItem = {
      id: `ITEM-${Date.now()}`,
      description: 'Additional Solar Component / BOS',
      quantity: 1,
      unit: 'Nos',
      unitPrice: 5000,
      total: 5000,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Submit Builder
  const handleSaveQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustomerId);
    if (!cust) return;

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validityDays);

    const quotationData = {
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerEmail: cust.email,
      projectLocation: `${cust.address}, ${cust.city}`,
      solarSystemCapacityKW: capacityKW,
      panelBrand,
      panelModel,
      panelWattage,
      panelQuantity,
      inverterBrand,
      inverterCapacityKW,
      inverterPhase,
      mountingStructure,
      lineItems,
      subtotal,
      discount,
      taxRate,
      taxAmount,
      grandTotal,
      paymentTerms,
      validityDays,
      validUntil: validUntilDate.toISOString(),
      notesAndExclusions: notesExclusions,
      status: quoteStatus,
      date: new Date().toISOString(),
    };

    if (editingQuotationId) {
      updateQuotation(editingQuotationId, quotationData);
    } else {
      createQuotation(quotationData);
    }

    setShowBuilderModal(false);
  };

  // Submit Revision
  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionQuote || !revisionNotes.trim()) return;

    reviseQuotation(revisionQuote.id, revisionNotes.trim());
    setShowRevisionModal(false);
    setRevisionQuote(null);
    setRevisionNotes('');
  };

  const filteredQuotations = quotations.filter(q => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const match =
        q.quotationNumber.toLowerCase().includes(query) ||
        q.customerName.toLowerCase().includes(query) ||
        q.customerMobile.includes(query);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    return true;
  });

  const handleExportList = () => {
    const data = filteredQuotations.map(q => ({
      'Quotation Number': q.quotationNumber,
      'Version': `V${q.version}`,
      'Date': formatDate(q.date),
      'Customer': q.customerName,
      'Mobile': q.customerMobile,
      'Capacity (kW)': q.solarSystemCapacityKW,
      'Subtotal': q.subtotal,
      'Discount': q.discount,
      'Tax Rate': `${q.taxRate}%`,
      'Tax Amount': q.taxAmount,
      'Grand Total (INR)': q.grandTotal,
      'Status': q.status,
    }));
    exportToExcel(data, `Kypas_Solar_Quotations_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" /> Quotation Management
          </h1>
          <p className="text-xs text-slate-500">
            Design itemized solar quotations, configure statutory GST rates, maintain version revisions, and generate print-ready A4 PDF proposals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('Quotations', 'export') && (
            <button
              onClick={handleExportList}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          )}

          {hasPermission('Quotations', 'create') && (
            <button
              onClick={handleOpenBuilder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Solar Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quotation number, customer name, mobile..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Quotation Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Under Discussion">Under Discussion</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Quotation No & Version</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Capacity & Components</th>
                <th className="py-3 px-4">Total Amount (₹)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {quote.quotationNumber}
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          V{quote.version}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Date: {formatDate(quote.date)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{quote.customerName}</div>
                      <div className="text-[10px] text-slate-400">{quote.customerMobile}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {quote.solarSystemCapacityKW} kW
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {quote.panelBrand} • {quote.inverterBrand}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatINR(quote.grandTotal)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Incl. {quote.taxRate}% GST ({formatINR(quote.taxAmount)})
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={quote.status} />
                      {quote.convertedToInstallationId && (
                        <span className="block text-[9px] text-emerald-600 font-bold mt-0.5">
                          Project: {quote.convertedToInstallationId}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 dark:text-slate-300">
                        {formatDate(quote.validUntil)}
                      </div>
                      <div className="text-[10px] text-slate-400">{quote.validityDays} days term</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Print / View PDF */}
                        <button
                          onClick={() => setActivePrintQuotation(quote)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          title="Generate & Print A4 PDF Quotation"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Revise */}
                        <button
                          onClick={() => {
                            setRevisionQuote(quote);
                            setRevisionNotes('');
                            setShowRevisionModal(true);
                          }}
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                          title="Create New Revision (V2, V3...)"
                        >
                          <GitBranch className="w-4 h-4" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => duplicateQuotation(quote.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Duplicate Quotation"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Convert to Installation (if approved & not converted yet) */}
                        {quote.status === 'Approved' && !quote.convertedToInstallationId && (
                          <button
                            onClick={() => {
                              showConfirmDialog({
                                title: 'Convert to Project Installation',
                                message: `Convert approved quotation ${quote.quotationNumber} into an active installation schedule for ${quote.customerName}?`,
                                confirmText: 'Schedule Installation',
                                onConfirm: () => convertQuotationToInstallation(quote.id),
                              });
                            }}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Schedule Installation"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(quote)}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Quotation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && revisionQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowRevisionModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-purple-600" />
              Revise Quotation {revisionQuote.quotationNumber} to V{revisionQuote.version + 1}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              A permanent snapshot of Version {revisionQuote.version} will be preserved in the revision history.
            </p>

            <form onSubmit={handleConfirmRevision} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Reason / Revision Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={revisionNotes}
                  onChange={e => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Applied 5% festive discount; upgraded from 540W to 550W bifacial modules per client request..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
                >
                  Confirm Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Solar Quotation Builder Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowBuilderModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                {editingQuotationId ? 'Edit Solar Quotation' : 'Interactive Solar Quotation Builder'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure module specifications, inverter capacity, itemized BOS costs, and dynamic solar GST calculations.
              </p>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-5 text-xs">
              {/* Row 1: Customer & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Select Customer *</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id} • {c.mobile} • {c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">System Capacity (kW) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={capacityKW}
                    onChange={e => setCapacityKW(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Row 2: Equipment Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Solar Panel Brand</label>
                  <select
                    value={panelBrand}
                    onChange={e => setPanelBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Waaree Solar">Waaree Solar</option>
                    <option value="Adani Solar">Adani Solar</option>
                    <option value="Tata Power Solar">Tata Power Solar</option>
                    <option value="Vikram Solar">Vikram Solar</option>
                    <option value="Goldi Solar">Goldi Solar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Inverter Brand</label>
                  <select
                    value={inverterBrand}
                    onChange={e => setInverterBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Growatt">Growatt Grid-Tie</option>
                    <option value="Solis">Solis 3-Phase</option>
                    <option value="Sungrow">Sungrow Commercial</option>
                    <option value="Fronius">Fronius Eco</option>
                    <option value="Havells">Havells Solar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Mounting Structure</label>
                  <input
                    type="text"
                    value={mountingStructure}
                    onChange={e => setMountingStructure(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Itemized Pricing Schedule
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 text-blue-600 bg-blue-50 dark:bg-blue-950 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Component
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 text-[11px] uppercase font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 w-20">Qty</th>
                        <th className="py-2.5 px-3 w-20">Unit</th>
                        <th className="py-2.5 px-3 w-28">Price (₹)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                        <th className="py-2.5 px-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lineItems.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => handleUpdateItem(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1 bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.unit}
                              onChange={e => handleUpdateItem(idx, 'unit', e.target.value)}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={e => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-slate-800 dark:text-slate-200">
                            {formatINR(item.quantity * item.unitPrice)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Calculations Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">Payment Milestones & Terms</label>
                    <textarea
                      rows={2}
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Quotation Status</label>
                      <select
                        value={quoteStatus}
                        onChange={e => setQuoteStatus(e.target.value as QuotationStatus)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Under Discussion">Under Discussion</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Validity (Days)</label>
                      <input
                        type="number"
                        value={validityDays}
                        onChange={e => setValidityDays(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold">{formatINR(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Special Discount (₹):</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={e => setDiscount(Number(e.target.value))}
                      className="w-32 px-2 py-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      Composite Solar GST ({taxRate}%):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={taxRate}
                        onChange={e => setTaxRate(Number(e.target.value))}
                        className="w-16 px-1.5 py-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatINR(taxAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Grand Total:</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">
                      {formatINR(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                >
                  {editingQuotationId ? 'Save Changes' : 'Generate Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official A4 Print & PDF Preview Modal */}
      {activePrintQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 max-h-[95vh] overflow-y-auto print:p-0 print:m-0 print:shadow-none print:w-full">
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Proposal Print Preview
                </span>
                <span className="text-xs text-slate-500">
                  {activePrintQuotation.quotationNumber} (Version {activePrintQuotation.version})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setActivePrintQuotation(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Document Body */}
            <div className="space-y-6 text-xs text-slate-800">
              {/* Header with Kypas Solar Letterhead */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                    <Sun className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-950">
                      {settings.companyName}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-semibold">{settings.tagline}</p>
                    <p className="text-[10px] text-slate-500">
                      CIN: {settings.cin} • GSTIN: {settings.gstin}
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-600 max-w-xs space-y-0.5">
                  <p className="font-semibold text-slate-900">Corporate & Registered Office:</p>
                  <p>{settings.registeredOffice}</p>
                  <p>Tel: {settings.phone} • {settings.email}</p>
                  <p>{settings.website}</p>
                </div>
              </div>

              {/* Title & Reference */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    TECHNO-COMMERCIAL SOLAR PROPOSAL
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Grid-Connected Solar Photovoltaic Power Plant
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p><span className="font-bold">Quotation Ref:</span> {activePrintQuotation.quotationNumber} (V{activePrintQuotation.version})</p>
                  <p><span className="font-bold">Date:</span> {formatDate(activePrintQuotation.date)}</p>
                  <p><span className="font-bold">Validity:</span> {formatDate(activePrintQuotation.validUntil)} ({activePrintQuotation.validityDays} Days)</p>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="font-bold text-[11px] uppercase text-slate-500 mb-1">Customer Details:</h4>
                  <p className="font-bold text-sm text-slate-900">{activePrintQuotation.customerName}</p>
                  <p>Mobile: {activePrintQuotation.customerMobile}</p>
                  <p>Email: {activePrintQuotation.customerEmail}</p>
                  <p>Project Location: {activePrintQuotation.projectLocation}</p>
                </div>

                <div>
                  <h4 className="font-bold text-[11px] uppercase text-slate-500 mb-1">Proposed System Specifications:</h4>
                  <p><span className="font-semibold">Plant Capacity:</span> {activePrintQuotation.solarSystemCapacityKW} kWp</p>
                  <p><span className="font-semibold">PV Modules:</span> {activePrintQuotation.panelBrand} ({activePrintQuotation.panelQuantity} Modules)</p>
                  <p><span className="font-semibold">Inverter:</span> {activePrintQuotation.inverterBrand} {activePrintQuotation.inverterCapacityKW} kW ({activePrintQuotation.inverterPhase})</p>
                  <p><span className="font-semibold">Mounting Rack:</span> {activePrintQuotation.mountingStructure}</p>
                </div>
              </div>

              {/* Schedule of Items */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
                  Bill of Materials & Cost Breakdown
                </h4>
                <table className="w-full text-left border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="py-2 px-3 border-b border-slate-200 w-10">#</th>
                      <th className="py-2 px-3 border-b border-slate-200">Item Description</th>
                      <th className="py-2 px-3 border-b border-slate-200 w-16 text-center">Qty</th>
                      <th className="py-2 px-3 border-b border-slate-200 w-16 text-center">Unit</th>
                      <th className="py-2 px-3 border-b border-slate-200 w-28 text-right">Rate (₹)</th>
                      <th className="py-2 px-3 border-b border-slate-200 w-28 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activePrintQuotation.lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium">{item.description}</td>
                        <td className="py-2 px-3 text-center">{item.quantity}</td>
                        <td className="py-2 px-3 text-center text-slate-500">{item.unit}</td>
                        <td className="py-2 px-3 text-right">{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-right font-semibold">{item.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totaling Box */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span>{formatINR(activePrintQuotation.subtotal)}</span>
                  </div>
                  {activePrintQuotation.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>- {formatINR(activePrintQuotation.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Solar Composite GST ({activePrintQuotation.taxRate}%):</span>
                    <span>{formatINR(activePrintQuotation.taxAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between font-black text-sm text-slate-950">
                    <span>Grand Total:</span>
                    <span className="text-blue-700">{formatINR(activePrintQuotation.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and Bank Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-[11px]">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Commercial Terms & Payment Milestones:</h4>
                  <p className="text-slate-600">{activePrintQuotation.paymentTerms}</p>
                  <p className="text-slate-500 mt-2">{activePrintQuotation.notesAndExclusions}</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Company Bank Details for Payment:</h4>
                  <p><span className="font-semibold">Bank:</span> {settings.bankDetails.bankName}</p>
                  <p><span className="font-semibold">Account No:</span> {settings.bankDetails.accountNumber}</p>
                  <p><span className="font-semibold">IFSC Code:</span> {settings.bankDetails.ifscCode}</p>
                  <p><span className="font-semibold">Branch:</span> {settings.bankDetails.branch}</p>
                </div>
              </div>

              {/* Signature Area */}
              <div className="pt-10 flex items-end justify-between border-t border-slate-200">
                <div className="space-y-8">
                  <p className="font-semibold text-slate-700">Client Acceptance & Signature:</p>
                  <div className="w-48 border-b border-slate-400" />
                  <p className="text-[10px] text-slate-500">Date: _______________</p>
                </div>

                <div className="text-right space-y-8">
                  <p className="font-semibold text-slate-900">For {settings.companyName}</p>
                  <div className="w-48 ml-auto border-b border-slate-400" />
                  <p className="text-[10px] text-slate-500">Authorized Signatory / Technical Head</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
