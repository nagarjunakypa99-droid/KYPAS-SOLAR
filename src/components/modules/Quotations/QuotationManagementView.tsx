import React, { useState, useMemo } from 'react';
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
  Upload,
  Image,
  Eye,
  Percent,
  Banknote,
  Landmark,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Calculator,
  HelpCircle,
  Check,
  Layers,
  Zap,
  ChevronRight,
  Sliders,
  RotateCcw,
  FileText,
  CreditCard,
  ArrowUpRight,
  PieChart,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Send,
  Share2,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Quotation, QuotationLineItem, QuotationStatus, SolarRequirement } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { formatINR, formatDate, exportToExcel } from '../../../utils/formatters';
import { downloadElementAsPDF } from '../../../utils/pdfGenerator';
import { DataImportModal, ExpectedColumn } from '../../common/DataImportModal';

// Solar package presets for rapid quotation creation
const SOLAR_PACKAGE_PRESETS = [
  {
    id: 'preset-3kw',
    name: '3 kW Residential (PM Surya Ghar Subsidy)',
    capacityKW: 3,
    panelBrand: 'Waaree Solar',
    panelModel: '540W Mono PERC Bifacial',
    panelWattage: 540,
    panelQuantity: 6,
    inverterBrand: 'Growatt',
    inverterCapacityKW: 3,
    inverterPhase: 'Single Phase On-Grid',
    mountingStructure: 'HDGI Hot Dip Galvanized Elevated (80 microns)',
    subsidyAmount: 78000,
    lineItems: [
      { id: 'I1', description: 'Waaree 540Wp Mono PERC Bifacial Solar PV Modules (ALMM Approved, 25 Yrs Warranty)', quantity: 6, unit: 'Nos', unitPrice: 13500, total: 81000 },
      { id: 'I2', description: 'Growatt 3kW Grid-Tie Inverter with Wi-Fi Monitoring (5 Yrs Warranty)', quantity: 1, unit: 'Set', unitPrice: 38000, total: 38000 },
      { id: 'I3', description: 'Hot-Dip Galvanized Iron (HDGI) Elevated Solar Mounting Structure', quantity: 1, unit: 'Set', unitPrice: 18000, total: 18000 },
      { id: 'I4', description: 'Balance of System (BOS) - ACDB/DCDB, Polycab 4 sq.mm DC Cable, Copper Earthing kit', quantity: 1, unit: 'Lot', unitPrice: 22000, total: 22000 },
      { id: 'I5', description: 'Turnkey Installation, Testing, TSSPDCL Net Meter Inspection & Liaisoning', quantity: 1, unit: 'Job', unitPrice: 18000, total: 18000 },
    ],
  },
  {
    id: 'preset-5kw',
    name: '5 kW Premium Residential Bifacial',
    capacityKW: 5,
    panelBrand: 'Waaree Solar',
    panelModel: '540W Mono PERC Bifacial',
    panelWattage: 540,
    panelQuantity: 10,
    inverterBrand: 'Growatt',
    inverterCapacityKW: 5,
    inverterPhase: 'Single Phase On-Grid',
    mountingStructure: 'HDGI Hot Dip Galvanized Elevated Structure (80 microns)',
    subsidyAmount: 78000,
    lineItems: [
      { id: 'I1', description: 'Waaree 540Wp Mono PERC Bifacial Solar PV Modules (ALMM Approved, 25 Yrs Warranty)', quantity: 10, unit: 'Nos', unitPrice: 13500, total: 135000 },
      { id: 'I2', description: 'Growatt 5kW Grid-Tie Inverter with Wi-Fi Monitoring (5 Yrs Warranty)', quantity: 1, unit: 'Set', unitPrice: 52000, total: 52000 },
      { id: 'I3', description: 'HDGI Elevated Structure (wind endurance up to 150 km/h)', quantity: 1, unit: 'Set', unitPrice: 28000, total: 28000 },
      { id: 'I4', description: 'Balance of System (BOS) - ACDB, DCDB with Type II SPDs, Polycab Solar Cable, Earthing', quantity: 1, unit: 'Lot', unitPrice: 32000, total: 32000 },
      { id: 'I5', description: 'Turnkey Installation, Testing, TSSPDCL Net Meter Inspection & Liaisoning', quantity: 1, unit: 'Job', unitPrice: 28000, total: 28000 },
    ],
  },
  {
    id: 'preset-10kw',
    name: '10 kW Commercial & Industrial 3-Phase',
    capacityKW: 10,
    panelBrand: 'Adani Solar',
    panelModel: '545W Mono PERC TopCon',
    panelWattage: 545,
    panelQuantity: 20,
    inverterBrand: 'Sungrow',
    inverterCapacityKW: 10,
    inverterPhase: 'Three Phase On-Grid',
    mountingStructure: 'Aluminum Alloy Anodized Rail Structure for Tin Shed',
    subsidyAmount: 78000,
    lineItems: [
      { id: 'I1', description: 'Adani 545Wp Mono PERC TopCon High-Efficiency Solar PV Modules (ALMM)', quantity: 20, unit: 'Nos', unitPrice: 13200, total: 264000 },
      { id: 'I2', description: 'Sungrow 10kW Three-Phase Grid-Tie Solar Inverter with Web Telemetry', quantity: 1, unit: 'Set', unitPrice: 78000, total: 78000 },
      { id: 'I3', description: 'Aluminum Anodized Industrial Roof Mounting Structure', quantity: 1, unit: 'Set', unitPrice: 42000, total: 42000 },
      { id: 'I4', description: 'Industrial BOS - LT Panel Integration, Heavy Duty Surge Arresters, Dual Earthing', quantity: 1, unit: 'Lot', unitPrice: 55000, total: 55000 },
      { id: 'I5', description: 'Turnkey Engineering, CEIG Statutory Inspection & Discom Synchronization', quantity: 1, unit: 'Job', unitPrice: 45000, total: 45000 },
    ],
  },
  {
    id: 'preset-25kw',
    name: '25 kW High-Demand Industrial Net-Metering',
    capacityKW: 25,
    panelBrand: 'Tata Power Solar',
    panelModel: '550W Mono PERC Dual Glass',
    panelWattage: 550,
    panelQuantity: 46,
    inverterBrand: 'Sungrow',
    inverterCapacityKW: 25,
    inverterPhase: 'Three Phase On-Grid',
    mountingStructure: 'Custom Engineered Elevated Heavy Structural Steel',
    subsidyAmount: 0,
    lineItems: [
      { id: 'I1', description: 'Tata Power Solar 550Wp Bifacial Solar PV Modules (25 Years Warranty)', quantity: 46, unit: 'Nos', unitPrice: 13000, total: 598000 },
      { id: 'I2', description: 'Sungrow 25kW 3-Phase Multi-MPPT Industrial Inverter with Remote Cloud Telemetry', quantity: 1, unit: 'Set', unitPrice: 145000, total: 145000 },
      { id: 'I3', description: 'Heavy Duty Structural Steel Elevated Framing & Walkways', quantity: 1, unit: 'Set', unitPrice: 95000, total: 95000 },
      { id: 'I4', description: 'HT/LT Synchronization Panel, Heavy Duty Earthing Grid with 4 Chemical Pits & LA', quantity: 1, unit: 'Lot', unitPrice: 110000, total: 110000 },
      { id: 'I5', description: 'Turnkey Project Execution, CEIG Drawing Approval, Meter Testing & Commissioning', quantity: 1, unit: 'Job', unitPrice: 85000, total: 85000 },
    ],
  },
];

export const QuotationManagementView: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const {
    quotations,
    customers,
    leads,
    settings,
    createQuotation,
    importQuotationsBatch,
    updateQuotation,
    deleteQuotation,
    reviseQuotation,
    duplicateQuotation,
    convertQuotationToInstallation,
    addInteraction,
    showConfirmDialog,
    addToast,
  } = useCRM();

  // Navigation Tabs: Directory | Edit PDF Studio | Payment Plans
  const [activeMainTab, setActiveMainTab] = useState<'directory' | 'edit-pdf' | 'financing-plans'>('directory');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Quotation for Studio & Dispatch
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotations[0]?.id || '');
  const activeQuotation = useMemo(() => {
    return quotations.find(q => q.id === selectedQuoteId) || quotations[0];
  }, [quotations, selectedQuoteId]);

  // Modal States
  const [activePrintQuotation, setActivePrintQuotation] = useState<Quotation | null>(null);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingQuote, setSendingQuote] = useState<Quotation | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionQuote, setRevisionQuote] = useState<Quotation | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // PDF Generation & Bulk Import States
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showQuoteImportModal, setShowQuoteImportModal] = useState(false);
  const [showBomImportModal, setShowBomImportModal] = useState(false);

  // --------------------------------------------------------------------------
  // SEND QUOTATION DISPATCH HUB STATE
  // --------------------------------------------------------------------------
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'email' | 'link' | 'sms'>('whatsapp');
  const [sendTemplate, setSendTemplate] = useState<'subsidy' | 'commercial' | 'loan'>('subsidy');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // --------------------------------------------------------------------------
  // EDIT PDF STUDIO STATE (Synchronized with activeQuotation)
  // --------------------------------------------------------------------------
  const [activeEditorSection, setActiveEditorSection] = useState<'branding' | 'client' | 'bom' | 'financials' | 'financing' | 'terms'>('branding');

  // Logo & Letterhead Branding
  const [pdfLogoUrl, setPdfLogoUrl] = useState<string>(activeQuotation?.logoUrl || settings.logoUrl || '/assets/aistudio/image_3720f2fa.png');
  const [pdfShowLogo, setPdfShowLogo] = useState<boolean>(activeQuotation?.showLogo !== false);
  const [pdfLogoSize, setPdfLogoSize] = useState<'small' | 'medium' | 'large'>(activeQuotation?.logoSize || 'medium');
  const [pdfCompanyName, setPdfCompanyName] = useState(activeQuotation?.customCompanyDetails?.companyName || settings.companyName);
  const [pdfTagline, setPdfTagline] = useState(activeQuotation?.customCompanyDetails?.tagline || settings.tagline);
  const [pdfCin, setPdfCin] = useState(activeQuotation?.customCompanyDetails?.cin || settings.cin);
  const [pdfGstin, setPdfGstin] = useState(activeQuotation?.customCompanyDetails?.gstin || settings.gstin);
  const [pdfOffice, setPdfOffice] = useState(activeQuotation?.customCompanyDetails?.address || settings.registeredOffice);
  const [pdfPhone, setPdfPhone] = useState(activeQuotation?.customCompanyDetails?.phone || settings.phone);
  const [pdfEmail, setPdfEmail] = useState(activeQuotation?.customCompanyDetails?.email || settings.email);
  const [pdfWebsite, setPdfWebsite] = useState(activeQuotation?.customCompanyDetails?.website || settings.website);

  // Customer & Site Info
  const [pdfCustomerName, setPdfCustomerName] = useState(activeQuotation?.customerName || '');
  const [pdfCustomerMobile, setPdfCustomerMobile] = useState(activeQuotation?.customerMobile || '');
  const [pdfCustomerEmail, setPdfCustomerEmail] = useState(activeQuotation?.customerEmail || '');
  const [pdfProjectLocation, setPdfProjectLocation] = useState(activeQuotation?.projectLocation || '');
  const [pdfConsumerNumber, setPdfConsumerNumber] = useState(activeQuotation?.consumerNumber || 'TS-DISCOM-89234120');
  const [pdfSanctionedLoad, setPdfSanctionedLoad] = useState<number>(activeQuotation?.sanctionedLoadKW || 5);
  const [pdfQuotationNumber, setPdfQuotationNumber] = useState(activeQuotation?.quotationNumber || '');
  const [pdfDate, setPdfDate] = useState(activeQuotation?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [pdfValidityDays, setPdfValidityDays] = useState(activeQuotation?.validityDays || 30);

  // Technical Specs & Line Items (BOM)
  const [pdfCapacityKW, setPdfCapacityKW] = useState(activeQuotation?.solarSystemCapacityKW || 5);
  const [pdfPanelBrand, setPdfPanelBrand] = useState(activeQuotation?.panelBrand || 'Waaree Solar');
  const [pdfPanelModel, setPdfPanelModel] = useState(activeQuotation?.panelModel || '540W Mono PERC Bifacial');
  const [pdfPanelWattage, setPdfPanelWattage] = useState(activeQuotation?.panelWattage || 540);
  const [pdfPanelQuantity, setPdfPanelQuantity] = useState(activeQuotation?.panelQuantity || 10);
  const [pdfInverterBrand, setPdfInverterBrand] = useState(activeQuotation?.inverterBrand || 'Growatt');
  const [pdfInverterCapacityKW, setPdfInverterCapacityKW] = useState(activeQuotation?.inverterCapacityKW || 5);
  const [pdfInverterPhase, setPdfInverterPhase] = useState(activeQuotation?.inverterPhase || 'Single Phase On-Grid');
  const [pdfMountingStructure, setPdfMountingStructure] = useState(activeQuotation?.mountingStructure || 'HDGI Hot Dip Galvanized Elevated Structure');
  const [pdfLineItems, setPdfLineItems] = useState<QuotationLineItem[]>(activeQuotation?.lineItems || []);

  // Financials & Subsidy
  const [pdfDiscount, setPdfDiscount] = useState(activeQuotation?.discount || 0);
  const [pdfTaxRate, setPdfTaxRate] = useState(activeQuotation?.taxRate || 13.8);
  const [pdfIncludeSubsidy, setPdfIncludeSubsidy] = useState(true);
  const [pdfSubsidyAmount, setPdfSubsidyAmount] = useState(activeQuotation?.subsidyAmount ?? (pdfCapacityKW >= 3 ? 78000 : pdfCapacityKW === 2 ? 60000 : 30000));

  // Payment Milestones (Given Time)
  const [pdfSelectedPaymentMode, setPdfSelectedPaymentMode] = useState<'All' | 'Loan' | 'Bank' | 'Cash'>(activeQuotation?.selectedPaymentMode || 'All');
  const [bankMilestoneAdvancePct, setBankMilestoneAdvancePct] = useState(20);
  const [bankMilestoneDispatchPct, setBankMilestoneDispatchPct] = useState(60);
  const [bankMilestoneCommissionPct, setBankMilestoneCommissionPct] = useState(20);
  const [bankMilestoneAdvanceTime, setBankMilestoneAdvanceTime] = useState('Immediate upon Work Order Signing');
  const [bankMilestoneDispatchTime, setBankMilestoneDispatchTime] = useState('Within 7-10 Days (Warehouse Dispatch)');
  const [bankMilestoneCommissionTime, setBankMilestoneCommissionTime] = useState('Within 21-25 Days (Net Meter Sync)');

  // Loan Financing Details
  const [loanBankPartner, setLoanBankPartner] = useState(activeQuotation?.loanDetails?.bankPartner || 'SBI PM Surya Ghar Solar Loan');
  const [loanDownPaymentPct, setLoanDownPaymentPct] = useState(activeQuotation?.loanDetails?.downPaymentPercent || 15);
  const [loanInterestRate, setLoanInterestRate] = useState(activeQuotation?.loanDetails?.interestRate || 7.0);
  const [loanTenureYears, setLoanTenureYears] = useState(activeQuotation?.loanDetails?.tenureYears || 7);
  const [loanTranche1Time, setLoanTranche1Time] = useState('Day 7-10 upon Site Material Verification (50%)');
  const [loanTranche2Time, setLoanTranche2Time] = useState('Day 21-30 upon Discom Net Meter Inspection (50%)');

  // Cash Details
  const [cashMilestoneAdvanceTime, setCashMilestoneAdvanceTime] = useState('Day 0 - On-Site Token Receipt');
  const [cashMilestoneDispatchTime, setCashMilestoneDispatchTime] = useState('Day 7 - Warehouse Unloading Receipt');
  const [cashMilestoneCommissionTime, setCashMilestoneCommissionTime] = useState('Day 25 - Final Commissioning Receipt');

  // Warranties & Terms
  const [pdfPaymentTerms, setPdfPaymentTerms] = useState(activeQuotation?.paymentTerms || '20% Advance with Order, 60% upon Material Dispatch, 20% on Testing and Net-meter Commissioning.');
  const [pdfNotesExclusions, setPdfNotesExclusions] = useState(activeQuotation?.notesAndExclusions || 'Includes 5 years comprehensive free AMC. Solar panels carry 25 years linear power performance warranty. Inverter carries 5 years manufacturer replacement warranty. Civil foundation extra if rooftop height exceeds 10 feet. Net meter charges billed by utility at actuals.');
  const [pdfSignatoryName, setPdfSignatoryName] = useState(activeQuotation?.signatoryName || 'Nagarjuna Kypa');
  const [pdfSignatoryDesignation, setPdfSignatoryDesignation] = useState(activeQuotation?.signatoryDesignation || 'Managing Director & Technical Head');
  const [pdfShowDigitalSeal, setPdfShowDigitalSeal] = useState(activeQuotation?.showDigitalSeal !== false);

  // Sync state whenever activeQuotation changes
  const handleSelectQuotationForEdit = (quote: Quotation) => {
    setSelectedQuoteId(quote.id);
    setPdfLogoUrl(quote.logoUrl || settings.logoUrl || '/assets/aistudio/image_3720f2fa.png');
    setPdfShowLogo(quote.showLogo !== false);
    setPdfLogoSize(quote.logoSize || 'medium');
    setPdfCompanyName(quote.customCompanyDetails?.companyName || settings.companyName);
    setPdfTagline(quote.customCompanyDetails?.tagline || settings.tagline);
    setPdfCin(quote.customCompanyDetails?.cin || settings.cin);
    setPdfGstin(quote.customCompanyDetails?.gstin || settings.gstin);
    setPdfOffice(quote.customCompanyDetails?.address || settings.registeredOffice);
    setPdfPhone(quote.customCompanyDetails?.phone || settings.phone);
    setPdfEmail(quote.customCompanyDetails?.email || settings.email);
    setPdfWebsite(quote.customCompanyDetails?.website || settings.website);

    setPdfCustomerName(quote.customerName);
    setPdfCustomerMobile(quote.customerMobile);
    setPdfCustomerEmail(quote.customerEmail);
    setPdfProjectLocation(quote.projectLocation);
    setPdfConsumerNumber(quote.consumerNumber || 'TS-DISCOM-89234120');
    setPdfSanctionedLoad(quote.sanctionedLoadKW || quote.solarSystemCapacityKW || 5);
    setPdfQuotationNumber(quote.quotationNumber);
    setPdfDate(quote.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setPdfValidityDays(quote.validityDays || 30);

    setPdfCapacityKW(quote.solarSystemCapacityKW);
    setPdfPanelBrand(quote.panelBrand);
    setPdfPanelModel(quote.panelModel);
    setPdfPanelWattage(quote.panelWattage);
    setPdfPanelQuantity(quote.panelQuantity);
    setPdfInverterBrand(quote.inverterBrand);
    setPdfInverterCapacityKW(quote.inverterCapacityKW);
    setPdfInverterPhase(quote.inverterPhase);
    setPdfMountingStructure(quote.mountingStructure);
    setPdfLineItems(quote.lineItems || []);

    setPdfDiscount(quote.discount || 0);
    setPdfTaxRate(quote.taxRate || 13.8);
    setPdfSubsidyAmount(quote.subsidyAmount ?? (quote.solarSystemCapacityKW >= 3 ? 78000 : quote.solarSystemCapacityKW === 2 ? 60000 : 30000));
    setPdfSelectedPaymentMode(quote.selectedPaymentMode || 'All');

    if (quote.loanDetails) {
      setLoanBankPartner(quote.loanDetails.bankPartner || 'SBI PM Surya Ghar Solar Loan');
      setLoanDownPaymentPct(quote.loanDetails.downPaymentPercent || 15);
      setLoanInterestRate(quote.loanDetails.interestRate || 7.0);
      setLoanTenureYears(quote.loanDetails.tenureYears || 7);
    }

    setPdfPaymentTerms(quote.paymentTerms);
    setPdfNotesExclusions(quote.notesAndExclusions);
    setPdfSignatoryName(quote.signatoryName || 'Nagarjuna Kypa');
    setPdfSignatoryDesignation(quote.signatoryDesignation || 'Managing Director & Technical Head');
    setPdfShowDigitalSeal(quote.showDigitalSeal !== false);
  };

  // Calculations for live PDF
  const computedSubtotal = useMemo(() => {
    return pdfLineItems.reduce((acc, item) => acc + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  }, [pdfLineItems]);

  const computedTaxableAmount = Math.max(0, computedSubtotal - Number(pdfDiscount || 0));
  const computedTaxAmount = Math.round((computedTaxableAmount * Number(pdfTaxRate || 0)) / 100);
  const computedGrandTotal = computedTaxableAmount + computedTaxAmount;
  const effectiveSubsidy = pdfIncludeSubsidy ? Number(pdfSubsidyAmount || 0) : 0;
  const computedNetPayable = Math.max(0, computedGrandTotal - effectiveSubsidy);

  // Solar ROI Calculations
  const roiMonthlyUnits = Math.round(Number(pdfCapacityKW) * 130);
  const roiAnnualUnits = roiMonthlyUnits * 12;
  const roiMonthlySavings = Math.round(roiMonthlyUnits * 8.2);
  const roiAnnualSavings = roiMonthlySavings * 12;
  const roiPaybackYears = computedNetPayable > 0 && roiAnnualSavings > 0
    ? (computedNetPayable / roiAnnualSavings).toFixed(1)
    : '3.2';
  const roiLifetimeSavings = (roiAnnualSavings * 25 * 0.9) - computedNetPayable;

  // Loan EMI calculations
  const loanDownPaymentAmt = Math.round((computedNetPayable * Number(loanDownPaymentPct)) / 100);
  const loanPrincipalAmt = computedNetPayable - loanDownPaymentAmt;
  const loanMonthlyRate = (Number(loanInterestRate) / 100) / 12;
  const loanMonths = Number(loanTenureYears) * 12;
  const computedMonthlyEMI = loanPrincipalAmt > 0 && loanMonthlyRate > 0 && loanMonths > 0
    ? Math.round(
        (loanPrincipalAmt * loanMonthlyRate * Math.pow(1 + loanMonthlyRate, loanMonths)) /
        (Math.pow(1 + loanMonthlyRate, loanMonths) - 1)
      )
    : 0;
  const monthlyNetCashflowGain = roiMonthlySavings - computedMonthlyEMI;

  // Custom Logo File Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPdfLogoUrl(reader.result);
          addToast({
            type: 'success',
            title: 'Logo Uploaded',
            message: 'Custom corporate logo applied to proposal preview.',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Line Item Handlers
  const handleUpdateLineItem = (id: string, field: keyof QuotationLineItem, value: any) => {
    setPdfLineItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = Number(updated.quantity || 0) * Number(updated.unitPrice || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleAddLineItem = () => {
    const newItem: QuotationLineItem = {
      id: `ITEM-${Date.now().toString().slice(-4)}`,
      description: 'Lightning Arrester (Early Streamer Emission) & Dedicated Earthing Pit',
      quantity: 1,
      unit: 'Set',
      unitPrice: 8500,
      total: 8500,
    };
    setPdfLineItems(prev => [...prev, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    setPdfLineItems(prev => prev.filter(i => i.id !== id));
  };

  // Save All Changes back to CRM Quotation
  const handleSavePdfChanges = () => {
    if (!activeQuotation) return;

    updateQuotation(activeQuotation.id, {
      customerName: pdfCustomerName,
      customerMobile: pdfCustomerMobile,
      customerEmail: pdfCustomerEmail,
      projectLocation: pdfProjectLocation,
      consumerNumber: pdfConsumerNumber,
      sanctionedLoadKW: Number(pdfSanctionedLoad),
      quotationNumber: pdfQuotationNumber,
      validityDays: Number(pdfValidityDays),
      solarSystemCapacityKW: Number(pdfCapacityKW),
      panelBrand: pdfPanelBrand,
      panelModel: pdfPanelModel,
      panelWattage: Number(pdfPanelWattage),
      panelQuantity: Number(pdfPanelQuantity),
      inverterBrand: pdfInverterBrand,
      inverterCapacityKW: Number(pdfInverterCapacityKW),
      inverterPhase: pdfInverterPhase,
      mountingStructure: pdfMountingStructure,
      lineItems: pdfLineItems,
      subtotal: computedSubtotal,
      discount: Number(pdfDiscount),
      taxRate: Number(pdfTaxRate),
      taxAmount: computedTaxAmount,
      grandTotal: computedGrandTotal,
      subsidyAmount: effectiveSubsidy,
      netPayableAfterSubsidy: computedNetPayable,
      logoUrl: pdfLogoUrl,
      showLogo: pdfShowLogo,
      logoSize: pdfLogoSize,
      selectedPaymentMode: pdfSelectedPaymentMode,
      paymentTerms: pdfPaymentTerms,
      notesAndExclusions: pdfNotesExclusions,
      signatoryName: pdfSignatoryName,
      signatoryDesignation: pdfSignatoryDesignation,
      showDigitalSeal: pdfShowDigitalSeal,
      customCompanyDetails: {
        companyName: pdfCompanyName,
        tagline: pdfTagline,
        address: pdfOffice,
        phone: pdfPhone,
        email: pdfEmail,
        website: pdfWebsite,
        cin: pdfCin,
        gstin: pdfGstin,
      },
      loanDetails: {
        bankPartner: loanBankPartner,
        downPaymentPercent: Number(loanDownPaymentPct),
        downPaymentAmount: loanDownPaymentAmt,
        loanAmount: loanPrincipalAmt,
        interestRate: Number(loanInterestRate),
        tenureYears: Number(loanTenureYears),
        monthlyEMI: computedMonthlyEMI,
        monthlySavings: roiMonthlySavings,
      },
    });

    addToast({
      type: 'success',
      title: 'Quotation Saved',
      message: `Quotation ${pdfQuotationNumber} saved successfully with customized BOM and financing milestones.`,
    });
  };

  // --------------------------------------------------------------------------
  // SEND QUOTATION WORKFLOW (WHATSAPP, EMAIL, LINK)
  // --------------------------------------------------------------------------
  const handleOpenSendModal = (quote: Quotation) => {
    setSendingQuote(quote);
    setRecipientPhone(quote.customerMobile || '');
    setRecipientEmail(quote.customerEmail || '');
    setEmailSubject(`KYPAS Solar Proposal: ${quote.quotationNumber} (${quote.solarSystemCapacityKW} kWp Plant)`);

    const netPayable = quote.netPayableAfterSubsidy || quote.grandTotal - (quote.subsidyAmount || 0);
    setEmailBody(
`Dear ${quote.customerName},

Greetings from KYPAS SOLAR POWER PRIVATE LIMITED!

We are pleased to submit our official techno-commercial proposal for your grid-connected Solar Photovoltaic Plant:

• Quotation Reference: ${quote.quotationNumber} (V${quote.version})
• Proposed System Capacity: ${quote.solarSystemCapacityKW} kWp
• PV Modules: ${quote.panelBrand} (${quote.panelQuantity}x ${quote.panelWattage}W Bifacial)
• Inverter: ${quote.inverterBrand} ${quote.inverterCapacityKW} kW (${quote.inverterPhase})
• Turnkey Plant Cost: ₹${quote.grandTotal.toLocaleString('en-IN')}
• Eligible PM Surya Ghar Subsidy: ₹${(quote.subsidyAmount || 78000).toLocaleString('en-IN')} (Govt DBT)
• Effective Net Cost Payable: ₹${netPayable.toLocaleString('en-IN')}

FINANCING & PAYMENT MILESTONES:
1. Advance Token (20%): ₹${Math.round((quote.grandTotal * 0.2)).toLocaleString('en-IN')} (Immediate upon signing)
2. Material Dispatch (60%): ₹${Math.round((quote.grandTotal * 0.6)).toLocaleString('en-IN')} (Within 7-10 Days)
3. Testing & Net-Meter Sync (20%): ₹${Math.round((quote.grandTotal * 0.2)).toLocaleString('en-IN')} (Within 21-25 Days)
* Subsidized Solar Loan Available: 7.0% p.a. with approx ₹${quote.loanDetails?.monthlyEMI || Math.round(netPayable * 0.016)}/mo EMI.

View and download your official proposal PDF here:
https://crm.kypassolar.com/proposals/${quote.quotationNumber.replace(/\//g, '-')}

We look forward to empowering your premises with sustainable green solar power.

Warm regards,
${quote.signatoryName || 'Nagarjuna Kypa'}
Technical Sales Head
KYPAS SOLAR POWER PVT LTD
Tel: ${settings.phone} | ${settings.email}`
    );

    setShowSendModal(true);
  };

  const getWhatsAppMessageText = () => {
    if (!sendingQuote) return '';
    const net = sendingQuote.netPayableAfterSubsidy || sendingQuote.grandTotal - (sendingQuote.subsidyAmount || 0);
    const emi = sendingQuote.loanDetails?.monthlyEMI || Math.round(net * 0.016);

    if (sendTemplate === 'subsidy') {
      return (
`☀️ *KYPAS SOLAR POWER PROPOSAL* ☀️
Dear *${sendingQuote.customerName}*,

Here is your official *${sendingQuote.solarSystemCapacityKW} kWp Rooftop Solar Proposal* (${sendingQuote.quotationNumber}):

💰 *Total Turnkey Cost:* ₹${sendingQuote.grandTotal.toLocaleString('en-IN')}
🏛️ *PM Surya Ghar Subsidy:* -₹${(sendingQuote.subsidyAmount || 78000).toLocaleString('en-IN')} (Direct DBT)
✅ *Net Payable by You:* *₹${net.toLocaleString('en-IN')}*

⚡ *Monthly Electricity Savings:* ~₹${Math.round(sendingQuote.solarSystemCapacityKW * 130 * 8.2).toLocaleString('en-IN')} / month
💳 *Zero-Down Solar Loan EMI:* from only *₹${emi} / month* at 7.0% subsidized interest!

📄 *Download Official A4 PDF Proposal:*
https://crm.kypassolar.com/proposals/${sendingQuote.quotationNumber.replace(/\//g, '-')}

Please reply *YES* to confirm engineering site survey & net-metering application.
_KYPAS Solar Pro • Hyderabad_ 📞 ${settings.phone}`
      );
    } else if (sendTemplate === 'loan') {
      return (
`⚡ *SWITCH TO ZERO ELECTRICITY BILL WITH KYPAS SOLAR*
Dear *${sendingQuote.customerName}*,

Invest zero from your pocket! With our *Collateral-Free Solar Loan*, your power bill savings exceed your loan installment from Month 1!

• *System Size:* ${sendingQuote.solarSystemCapacityKW} kWp Rooftop
• *Net System Cost:* ₹${net.toLocaleString('en-IN')} (After Subsidy)
• *Subsidized Loan EMI:* ~₹${emi}/mo (84 Months @ 7% p.a.)
• *Monthly Bill Savings:* ~₹${Math.round(sendingQuote.solarSystemCapacityKW * 130 * 8.2).toLocaleString('en-IN')}/mo
✨ *Net Monthly Cashflow Gain:* *+₹${Math.max(0, Math.round(sendingQuote.solarSystemCapacityKW * 130 * 8.2) - emi).toLocaleString('en-IN')} / month in your pocket!*

📄 *Review Official PDF Quote:*
https://crm.kypassolar.com/proposals/${sendingQuote.quotationNumber.replace(/\//g, '-')}

_KYPAS Solar • ${settings.companyName}_`
      );
    } else {
      return (
`☀️ *Commercial Solar Proposal - ${sendingQuote.quotationNumber}*
Client: *${sendingQuote.customerName}*
Plant Capacity: *${sendingQuote.solarSystemCapacityKW} kWp* (${sendingQuote.panelBrand} Bifacial)
Net Payable: *₹${net.toLocaleString('en-IN')}*

Payment Milestones:
1. 20% Advance Token with Work Order
2. 60% upon Material Dispatch from Warehouse
3. 20% on Testing & TSSPDCL Net-Meter Commissioning

📄 Proposal Link: https://crm.kypassolar.com/proposals/${sendingQuote.quotationNumber.replace(/\//g, '-')}
KYPAS Solar Power Pvt Ltd 📞 ${settings.phone}`
      );
    }
  };

  const handleConfirmSendWhatsApp = () => {
    if (!sendingQuote) return;
    const cleanNumber = recipientPhone.replace(/\D/g, '').slice(-10);
    const text = encodeURIComponent(getWhatsAppMessageText());
    const whatsappUrl = `https://wa.me/91${cleanNumber}?text=${text}`;

    // Update status to 'Sent' and record CRM interaction
    updateQuotation(sendingQuote.id, { status: 'Sent' });
    addInteraction({
      customerId: sendingQuote.customerId,
      type: 'Quotation Sent',
      summary: `Dispatched proposal ${sendingQuote.quotationNumber} (${sendingQuote.solarSystemCapacityKW} kWp, ₹${sendingQuote.grandTotal.toLocaleString('en-IN')}) via WhatsApp to +91 ${cleanNumber}.`,
      performedBy: currentUser?.name || 'Sales Staff',
    });

    addToast({
      type: 'success',
      title: 'Quotation Sent via WhatsApp',
      message: `Quotation ${sendingQuote.quotationNumber} sent to ${sendingQuote.customerName}. Status updated to Sent.`,
    });

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowSendModal(false);
  };

  const handleConfirmSendEmail = () => {
    if (!sendingQuote) return;
    updateQuotation(sendingQuote.id, { status: 'Sent' });
    addInteraction({
      customerId: sendingQuote.customerId,
      type: 'Quotation Sent',
      summary: `Emailed proposal ${sendingQuote.quotationNumber} to ${recipientEmail} with complete BOM breakdown and payment terms.`,
      performedBy: currentUser?.name || 'Sales Staff',
    });

    addToast({
      type: 'success',
      title: 'Quotation Sent via Email',
      message: `Official proposal dispatched to ${recipientEmail}. Logged in customer activity history.`,
    });

    setShowSendModal(false);
  };

  const handleCopyProposalLink = () => {
    if (!sendingQuote) return;
    const link = `https://crm.kypassolar.com/proposals/${sendingQuote.quotationNumber.replace(/\//g, '-')}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    addToast({
      type: 'info',
      title: 'Proposal Link Copied',
      message: 'Shareable proposal URL copied to clipboard.',
    });
  };

  // --------------------------------------------------------------------------
  // HIGH-RESOLUTION PDF GENERATION & DOWNLOAD
  // --------------------------------------------------------------------------
  const handleDownloadPDF = async (targetSelector: string = '#a4-printable-document', quoteNumber?: string) => {
    setIsDownloadingPdf(true);
    try {
      const targetDoc = document.querySelector(targetSelector) as HTMLElement;
      if (!targetDoc) {
        addToast({
          type: 'warning',
          title: 'Document Preview Rendering',
          message: 'Preparing proposal view for export...',
        });
      }

      const filename = `KYPAS_Solar_Quotation_${(quoteNumber || pdfQuotationNumber || 'Draft').replace(/[\/\\]/g, '-')}`;
      const success = await downloadElementAsPDF(targetSelector, {
        filename,
        scale: 2,
      });

      if (success) {
        addToast({
          type: 'success',
          title: 'PDF Downloaded',
          message: `${filename}.pdf downloaded successfully to your device.`,
        });
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleTableDownloadPDF = (quote: Quotation) => {
    setActivePrintQuotation(quote);
    setTimeout(() => {
      handleDownloadPDF('#modal-printable-document', quote.quotationNumber);
    }, 450);
  };

  // --------------------------------------------------------------------------
  // BULK IMPORT QUOTATIONS & BOM ITEMS
  // --------------------------------------------------------------------------
  const QUOTATION_IMPORT_COLUMNS: ExpectedColumn[] = [
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'customerMobile', label: 'Customer Mobile', required: true },
    { key: 'solarSystemCapacityKW', label: 'Capacity kW', required: true },
    { key: 'grandTotal', label: 'Grand Total', required: true },
    { key: 'subsidyAmount', label: 'Subsidy Amount' },
    { key: 'netPayable', label: 'Net Payable' },
    { key: 'projectLocation', label: 'Project Location' },
    { key: 'status', label: 'Status' },
  ];

  const QUOTATION_SAMPLE_DATA = [
    {
      'Customer Name': 'Venkatesh Rao',
      'Customer Mobile': '9848022334',
      'Capacity kW': 5,
      'Project Location': 'Jubilee Hills, Hyderabad',
      'Grand Total': 285000,
      'Subsidy Amount': 78000,
      'Net Payable': 207000,
      'Status': 'Draft',
    },
    {
      'Customer Name': 'Srinivas Murthy',
      'Customer Mobile': '9849011223',
      'Capacity kW': 3,
      'Project Location': 'Kukatpally, Hyderabad',
      'Grand Total': 195000,
      'Subsidy Amount': 78000,
      'Net Payable': 117000,
      'Status': 'Sent',
    },
  ];

  const BOM_IMPORT_COLUMNS: ExpectedColumn[] = [
    { key: 'description', label: 'Item Description', required: true },
    { key: 'quantity', label: 'Quantity', required: true },
    { key: 'unit', label: 'Unit', required: true },
    { key: 'unitPrice', label: 'Unit Price', required: true },
  ];

  const BOM_SAMPLE_DATA = [
    {
      'Item Description': 'Waaree 540Wp Mono PERC Bifacial Solar PV Modules (ALMM Approved)',
      'Quantity': 10,
      'Unit': 'Nos',
      'Unit Price': 13500,
    },
    {
      'Item Description': 'Growatt 5kW Single Phase Grid-Tie Inverter with Wi-Fi Kit',
      'Quantity': 1,
      'Unit': 'Set',
      'Unit Price': 52000,
    },
    {
      'Item Description': 'HDGI Hot Dip Galvanized Elevated Rooftop Mounting Structure',
      'Quantity': 1,
      'Unit': 'Set',
      'Unit Price': 28000,
    },
    {
      'Item Description': 'Balance of System (ACDB, DCDB, Solar Cable, Earthing Pit & Lightning Arrester)',
      'Quantity': 1,
      'Unit': 'Lot',
      'Unit Price': 32000,
    },
    {
      'Item Description': 'Turnkey Installation, Testing, TSSPDCL Net Meter Inspection & Liaisoning',
      'Quantity': 1,
      'Unit': 'Job',
      'Unit Price': 28000,
    },
  ];

  const handleImportQuotations = async (rows: Record<string, any>[]) => {
    const mapped = rows.map((r, i) => {
      const custName = r['Customer Name'] || r['customerName'] || `Client ${i + 1}`;
      const mobile = String(r['Customer Mobile'] || r['customerMobile'] || r['Mobile'] || '9848011223');
      const cap = Number(r['Capacity kW'] || r['solarSystemCapacityKW'] || 5);
      const total = Number(r['Grand Total'] || r['grandTotal'] || 250000);
      const sub = Number(r['Subsidy Amount'] || r['subsidyAmount'] || (cap >= 3 ? 78000 : 60000));
      const net = Number(r['Net Payable'] || r['netPayable'] || Math.max(0, total - sub));
      const loc = r['Project Location'] || r['projectLocation'] || 'Hyderabad, Telangana';
      const status = (r['Status'] || r['status'] || 'Draft') as QuotationStatus;

      return {
        customerId: customers.find(c => c.mobile.includes(mobile.slice(-10)))?.id || customers[0]?.id || 'CUST-IMPORT',
        customerName: custName,
        customerMobile: mobile,
        customerEmail: `${custName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
        projectLocation: loc,
        solarSystemCapacityKW: cap,
        panelBrand: 'Waaree Solar',
        panelModel: '540W Mono PERC Bifacial',
        panelWattage: 540,
        panelQuantity: Math.round((cap * 1000) / 540),
        inverterBrand: 'Growatt',
        inverterCapacityKW: cap,
        inverterPhase: cap > 5 ? 'Three Phase On-Grid' : 'Single Phase On-Grid',
        mountingStructure: 'HDGI Hot Dip Galvanized Elevated Structure',
        lineItems: [
          { id: `I-${i}-1`, description: `${cap}kW Turnkey Solar PV Plant BOM with Bifacial Modules`, quantity: 1, unit: 'Set', unitPrice: Math.round(total / 1.138), total: Math.round(total / 1.138) },
        ],
        subtotal: Math.round(total / 1.138),
        discount: 0,
        taxRate: 13.8,
        taxAmount: Math.round(total - total / 1.138),
        grandTotal: total,
        subsidyAmount: sub,
        netPayableAfterSubsidy: net,
        status: status,
        paymentTerms: '20% Advance, 60% Material Dispatch, 20% Net Meter Sync',
        notesAndExclusions: 'Standard 25 Yrs Performance Warranty on Solar PV Modules.',
        validityDays: 30,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        date: new Date().toISOString(),
      };
    });

    const res = importQuotationsBatch(mapped);
    setShowQuoteImportModal(false);
    return { success: res.success, skipped: res.skipped };
  };

  const handleImportBOMItems = async (rows: Record<string, any>[]) => {
    const newItems: QuotationLineItem[] = rows.map((r, i) => {
      const desc = r['Item Description'] || r['description'] || r['Description'] || `Solar Component ${i + 1}`;
      const qty = Number(r['Quantity'] || r['quantity'] || r['Qty'] || 1);
      const unit = r['Unit'] || r['unit'] || 'Nos';
      const unitPrice = Number(r['Unit Price'] || r['unitPrice'] || r['Rate'] || r['Price'] || 0);
      return {
        id: `BOM-IMP-${Date.now()}-${i}`,
        description: desc,
        quantity: qty,
        unit: unit,
        unitPrice: unitPrice,
        total: qty * unitPrice,
      };
    });

    setPdfLineItems(newItems);
    setShowBomImportModal(false);
    addToast({
      type: 'success',
      title: 'BOM Items Loaded',
      message: `Imported ${newItems.length} technical line items into proposal editor.`,
    });
  };

  // --------------------------------------------------------------------------
  // CREATE NEW QUOTATION BUILDER MODAL STATE & ACTIONS
  // --------------------------------------------------------------------------
  const [newQuoteCustomerId, setNewQuoteCustomerId] = useState(customers[0]?.id || '');
  const [newQuoteSelectedPreset, setNewQuoteSelectedPreset] = useState(SOLAR_PACKAGE_PRESETS[1]);
  const [newQuoteNotes, setNewQuoteNotes] = useState(settings.quotationDefaults.standardExclusions);

  const handleCreateNewQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === newQuoteCustomerId) || customers[0];
    if (!cust) return;

    const sub = newQuoteSelectedPreset.lineItems.reduce((acc, i) => acc + i.total, 0);
    const taxAmt = Math.round((sub * (settings.taxConfig.defaultSolarGSTRate || 13.8)) / 100);
    const gTotal = sub + taxAmt;
    const net = Math.max(0, gTotal - newQuoteSelectedPreset.subsidyAmount);

    const result = createQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerEmail: cust.email,
      projectLocation: `${cust.address}, ${cust.city}`,
      solarSystemCapacityKW: newQuoteSelectedPreset.capacityKW,
      panelBrand: newQuoteSelectedPreset.panelBrand,
      panelModel: newQuoteSelectedPreset.panelModel,
      panelWattage: newQuoteSelectedPreset.panelWattage,
      panelQuantity: newQuoteSelectedPreset.panelQuantity,
      inverterBrand: newQuoteSelectedPreset.inverterBrand,
      inverterCapacityKW: newQuoteSelectedPreset.inverterCapacityKW,
      inverterPhase: newQuoteSelectedPreset.inverterPhase,
      mountingStructure: newQuoteSelectedPreset.mountingStructure,
      lineItems: newQuoteSelectedPreset.lineItems,
      subtotal: sub,
      discount: 0,
      taxRate: settings.taxConfig.defaultSolarGSTRate || 13.8,
      taxAmount: taxAmt,
      grandTotal: gTotal,
      subsidyAmount: newQuoteSelectedPreset.subsidyAmount,
      netPayableAfterSubsidy: net,
      paymentTerms: settings.quotationDefaults.defaultPaymentTerms,
      validityDays: 30,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      date: new Date().toISOString(),
      notesAndExclusions: newQuoteNotes,
      status: 'Draft',
    });

    if (result.success && result.quotationId) {
      setShowBuilderModal(false);
      setSelectedQuoteId(result.quotationId);
      setActiveMainTab('edit-pdf');
      addToast({
        type: 'success',
        title: 'New Quotation Created',
        message: 'Opened in Live PDF Studio for logo branding and customization.',
      });
    }
  };

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches =
          q.quotationNumber.toLowerCase().includes(query) ||
          q.customerName.toLowerCase().includes(query) ||
          q.customerMobile.includes(query) ||
          q.projectLocation.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      return true;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Handle Revision creation
  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionQuote) return;
    reviseQuotation(revisionQuote.id, revisionNotes);
    setShowRevisionModal(false);
    setRevisionQuote(null);
    setRevisionNotes('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" /> Quotation Management & Proposal Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create itemized solar proposals, send via WhatsApp & Email, customize live A4 PDF branding, and manage Bank, Loan, and Cash given-time milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Create New Quotation Button */}
          {hasPermission('Quotations', 'create') && (
            <button
              onClick={() => setShowBuilderModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quotation</span>
            </button>
          )}

          {/* Quick Send Proposal Button */}
          <button
            onClick={() => handleOpenSendModal(activeQuotation)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Dispatch Quotation to Customer via WhatsApp / Email"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Quotation</span>
          </button>

          {hasPermission('Quotations', 'export') && (
            <button
              onClick={() => {
                const exportData = filteredQuotations.map(q => ({
                  'Quote Number': q.quotationNumber,
                  'Version': `V${q.version}`,
                  'Customer Name': q.customerName,
                  'Mobile': q.customerMobile,
                  'Location': q.projectLocation,
                  'Capacity (kW)': q.solarSystemCapacityKW,
                  'Subtotal': q.subtotal,
                  'Subsidy': q.subsidyAmount || 0,
                  'Net Payable': q.netPayableAfterSubsidy || q.grandTotal,
                  'Status': q.status,
                  'Valid Until': formatDate(q.validUntil),
                }));
                exportToExcel(exportData, `KYPAS_Quotations_${new Date().toISOString().slice(0, 10)}`);
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          )}

          <button
            onClick={() => setShowQuoteImportModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Import Quotations from Excel (.xlsx) or CSV"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Import Proposals</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: 1. Directory | 2. Live PDF Studio (Edit PDF) | 3. Loan, Bank & Cash Milestones */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveMainTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'directory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations Directory</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            activeMainTab === 'directory' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {quotations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('edit-pdf')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'edit-pdf'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit PDF Studio (Live Customizer)</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-400 text-slate-950">
            All Editable
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('financing-plans')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMainTab === 'financing-plans'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Loan, Bank & Cash Payment Milestones</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500 text-white">
            Given Time
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: QUOTATIONS DIRECTORY LIST & MANAGEMENT                            */}
      {/* ========================================================================= */}
      {activeMainTab === 'directory' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Pipeline Value</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatINR(quotations.reduce((acc, q) => acc + q.grandTotal, 0))}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Approved Quotes</span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {quotations.filter(q => q.status === 'Approved').length} Proposals
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Dispatched (Sent)</span>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {quotations.filter(q => q.status === 'Sent' || q.status === 'Under Discussion').length} Proposals
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gov Subsidy Volume</span>
              <p className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">
                {formatINR(quotations.reduce((acc, q) => acc + (q.subsidyAmount || 78000), 0))}
              </p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search quote number, customer, phone, location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="all">All Statuses ({quotations.length})</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent to Customer</option>
                <option value="Under Discussion">Under Discussion</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Quote Ref & Version</th>
                    <th className="py-3 px-4">Customer & Contact</th>
                    <th className="py-3 px-4">System Specs</th>
                    <th className="py-3 px-4">Commercials & Net</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Validity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6 text-slate-300" />
                          <p>No quotations found matching current filters.</p>
                          <button
                            onClick={() => setShowBuilderModal(true)}
                            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            + Create a new quotation now
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map(quote => {
                      const netPayable = quote.netPayableAfterSubsidy || quote.grandTotal - (quote.subsidyAmount || 0);

                      return (
                        <tr key={quote.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{quote.quotationNumber}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                                V{quote.version}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{quote.id}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{quote.customerName}</div>
                            <div className="text-[10px] text-slate-500">{quote.customerMobile}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{quote.projectLocation}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{quote.solarSystemCapacityKW} kW Plant</div>
                            <div className="text-[10px] text-slate-500">{quote.panelBrand} ({quote.panelQuantity}x {quote.panelWattage}W)</div>
                            <div className="text-[9px] text-blue-600 dark:text-blue-400">{quote.inverterBrand} {quote.inverterCapacityKW}kW</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-black text-slate-900 dark:text-white">{formatINR(quote.grandTotal)}</div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Net: {formatINR(netPayable)}
                              {quote.subsidyAmount ? ` (Subsidy -${formatINR(quote.subsidyAmount)})` : ''}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <Badge status={quote.status} />
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-slate-700 dark:text-slate-300">{formatDate(quote.validUntil)}</div>
                            <div className="text-[10px] text-slate-400">{quote.validityDays} days validity</div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* 1. SEND QUOTATION (WhatsApp / Email / Link) */}
                              <button
                                onClick={() => handleOpenSendModal(quote)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                                title="Send Quotation to Customer (WhatsApp / Email / Link)"
                              >
                                <Send className="w-4 h-4" />
                              </button>

                              {/* 2. EDIT PDF STUDIO */}
                              <button
                                onClick={() => {
                                  handleSelectQuotationForEdit(quote);
                                  setActiveMainTab('edit-pdf');
                                }}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                title="Open in Live PDF Studio (Edit All Fields & Logo)"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* 3. DOWNLOAD OFFICIAL PDF */}
                              <button
                                onClick={() => handleTableDownloadPDF(quote)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                                title="Download Official A4 PDF Document"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              {/* 4. PRINT / VIEW A4 PDF */}
                              <button
                                onClick={() => setActivePrintQuotation(quote)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title="Print / Export A4 PDF"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* 4. REVISE VERSION */}
                              <button
                                onClick={() => {
                                  setRevisionQuote(quote);
                                  setRevisionNotes('');
                                  setShowRevisionModal(true);
                                }}
                                className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer"
                                title="Create New Revision (V2, V3...)"
                              >
                                <GitBranch className="w-4 h-4" />
                              </button>

                              {/* 5. DUPLICATE */}
                              <button
                                onClick={() => duplicateQuotation(quote.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                title="Duplicate Quote"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              {/* 6. CONVERT TO INSTALLATION (If approved) */}
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
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                                  title="Schedule Installation"
                                >
                                  <Wrench className="w-4 h-4" />
                                </button>
                              )}

                              {/* 7. DELETE */}
                              {hasPermission('Quotations', 'delete') && (
                                <button
                                  onClick={() => {
                                    showConfirmDialog({
                                      title: `Delete Quotation ${quote.quotationNumber}`,
                                      message: `Are you sure you want to permanently delete quotation ${quote.quotationNumber} for ${quote.customerName}?`,
                                      isDestructive: true,
                                      confirmText: 'Delete Quotation',
                                      onConfirm: () => deleteQuotation(quote.id),
                                    });
                                  }}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                  title="Delete Quotation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: LIVE PDF STUDIO (EDIT PDF SUB-TAB - ALL EDITABLE + LOGO)          */}
      {/* ========================================================================= */}
      {activeMainTab === 'edit-pdf' && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Live A4 PDF Proposal Studio & Customizer
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    All Editable
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Select a quotation to customize: Change company logo, edit line items, modify customer details, and update payment terms.
                </p>
              </div>
            </div>

            {/* Actions: Send Quote, Save Changes, Print PDF */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedQuoteId}
                onChange={e => {
                  const target = quotations.find(q => q.id === e.target.value);
                  if (target) handleSelectQuotationForEdit(target);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {quotations.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} - {q.customerName} ({q.solarSystemCapacityKW}kW)
                  </option>
                ))}
              </select>

              {/* HOW TO SEND QUOTATION: Prominent action button */}
              <button
                type="button"
                onClick={() => handleOpenSendModal(activeQuotation)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Quotation to Customer</span>
              </button>

              <button
                type="button"
                onClick={handleSavePdfChanges}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </button>

              <button
                type="button"
                disabled={isDownloadingPdf}
                onClick={() => handleDownloadPDF('#a4-printable-document', pdfQuotationNumber)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download high-resolution official A4 PDF document"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Print proposal via browser dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Dual-Pane Layout: Left Pane Controls (All Editable), Right Pane Live A4 Document Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANE: Editor Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4 print:hidden">
              {/* Accordion navigation pills */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('branding')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEditorSection === 'branding'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Logo & Company
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('client')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEditorSection === 'client'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Customer & Site
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('bom')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEditorSection === 'bom'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Line Items (BOM)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('financials')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEditorSection === 'financials'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Subsidy & GST
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('financing')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEditorSection === 'financing'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Loan / Bank / Cash
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorSection('terms')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeEditorSection === 'terms'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Terms & Signature
                </button>
              </div>

              {/* SECTION 1: LOGO & BRANDING */}
              {activeEditorSection === 'branding' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-blue-600" />
                    Company Logo & Header Letterhead
                  </h3>

                  {/* Logo Controls */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Logo on Proposal</span>
                      <input
                        type="checkbox"
                        checked={pdfShowLogo}
                        onChange={e => setPdfShowLogo(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                    </div>

                    {pdfShowLogo && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-xs">
                            <img src={pdfLogoUrl} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              Upload Custom Logo / Pick Brand Image
                            </label>
                            <div className="flex items-center gap-2">
                              <label className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold cursor-pointer border border-blue-200 dark:border-blue-800 transition-all">
                                <Upload className="w-3 h-3 inline mr-1" />
                                <span>Browse...</span>
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                              </label>
                              <button
                                type="button"
                                onClick={() => setPdfLogoUrl('/assets/aistudio/image_3720f2fa.png')}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                              >
                                Corporate Default
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Logo Size */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-slate-600 dark:text-slate-400 font-semibold">Logo Size</span>
                          <div className="flex items-center gap-1">
                            {(['small', 'medium', 'large'] as const).map(size => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setPdfLogoSize(size)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                                  pdfLogoSize === size
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Company Details Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Legal Name</label>
                      <input
                        type="text"
                        value={pdfCompanyName}
                        onChange={e => setPdfCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand Tagline</label>
                      <input
                        type="text"
                        value={pdfTagline}
                        onChange={e => setPdfTagline(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CIN</label>
                        <input
                          type="text"
                          value={pdfCin}
                          onChange={e => setPdfCin(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                        <input
                          type="text"
                          value={pdfGstin}
                          onChange={e => setPdfGstin(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Registered Office Address</label>
                      <textarea
                        rows={2}
                        value={pdfOffice}
                        onChange={e => setPdfOffice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Phone</label>
                        <input
                          type="text"
                          value={pdfPhone}
                          onChange={e => setPdfPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                        <input
                          type="email"
                          value={pdfEmail}
                          onChange={e => setPdfEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: CUSTOMER & SITE DETAILS */}
              {activeEditorSection === 'client' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Customer, Site & Document Reference
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quote Reference #</label>
                      <input
                        type="text"
                        value={pdfQuotationNumber}
                        onChange={e => setPdfQuotationNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
                      <input
                        type="date"
                        value={pdfDate}
                        onChange={e => setPdfDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer / Entity Name *</label>
                    <input
                      type="text"
                      value={pdfCustomerName}
                      onChange={e => setPdfCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Mobile</label>
                      <input
                        type="tel"
                        value={pdfCustomerMobile}
                        onChange={e => setPdfCustomerMobile(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Email</label>
                      <input
                        type="email"
                        value={pdfCustomerEmail}
                        onChange={e => setPdfCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Site Location</label>
                    <input
                      type="text"
                      value={pdfProjectLocation}
                      onChange={e => setPdfProjectLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">DISCOM Consumer #</label>
                      <input
                        type="text"
                        value={pdfConsumerNumber}
                        onChange={e => setPdfConsumerNumber(e.target.value)}
                        placeholder="e.g. TSSPDCL 10092348"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanctioned Load (kW)</label>
                      <input
                        type="number"
                        value={pdfSanctionedLoad}
                        onChange={e => setPdfSanctionedLoad(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: LINE ITEMS / BILL OF MATERIALS (BOM) */}
              {activeEditorSection === 'bom' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      Itemized Bill of Materials (BOM)
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowBomImportModal(true)}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        title="Bulk import BOM line items from Excel or CSV"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Import BOM</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>
                  </div>

                  {/* Major Equipment Specs */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold">Plant Capacity:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={pdfCapacityKW}
                        onChange={e => setPdfCapacityKW(Number(e.target.value))}
                        className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Panel Brand:</span>
                      <input
                        type="text"
                        value={pdfPanelBrand}
                        onChange={e => setPdfPanelBrand(e.target.value)}
                        className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Inverter Model:</span>
                      <input
                        type="text"
                        value={pdfInverterBrand}
                        onChange={e => setPdfInverterBrand(e.target.value)}
                        className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Inverter Phase:</span>
                      <input
                        type="text"
                        value={pdfInverterPhase}
                        onChange={e => setPdfInverterPhase(e.target.value)}
                        className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                    {pdfLineItems.map((item, idx) => (
                      <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item.description}
                            onChange={e => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg font-medium text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400">Qty:</span>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg text-center font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400">Unit:</span>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={e => handleUpdateLineItem(item.id, 'unit', e.target.value)}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg text-center"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400">Rate (₹):</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={e => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg text-right font-bold"
                            />
                          </div>
                        </div>

                        <div className="text-right text-[11px] font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                          Item Total: {formatINR(item.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: FINANCIALS, CENTRAL SUBSIDY & GST */}
              {activeEditorSection === 'financials' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-blue-600" />
                    Financial Calculations, Subsidy & Net Payable
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">BOM Subtotal:</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{formatINR(computedSubtotal)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Special Discount (₹):</span>
                      <input
                        type="number"
                        value={pdfDiscount}
                        onChange={e => setPdfDiscount(Number(e.target.value))}
                        className="w-32 px-3 py-1.5 text-right bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">Solar Composite GST (%):</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={pdfTaxRate}
                          onChange={e => setPdfTaxRate(Number(e.target.value))}
                          className="w-20 px-3 py-1.5 text-right bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                        />
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatINR(computedTaxAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-b border-slate-200 dark:border-slate-700 font-bold">
                      <span className="text-slate-900 dark:text-white">Total Project Turnkey Cost:</span>
                      <span className="text-base font-black text-blue-600 dark:text-blue-400">
                        {formatINR(computedGrandTotal)}
                      </span>
                    </div>

                    {/* Central Gov Subsidy (PM Surya Ghar) */}
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={pdfIncludeSubsidy}
                            onChange={e => setPdfIncludeSubsidy(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600"
                          />
                          PM Surya Ghar Central Subsidy
                        </label>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-300">
                          Direct DBT to Customer
                        </span>
                      </div>

                      {pdfIncludeSubsidy && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Eligible Subsidy Amount (₹):</span>
                          <input
                            type="number"
                            value={pdfSubsidyAmount}
                            onChange={e => setPdfSubsidyAmount(Number(e.target.value))}
                            className="w-28 px-3 py-1 text-right bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-bold text-emerald-800 dark:text-emerald-200"
                          />
                        </div>
                      )}
                    </div>

                    {/* Net Customer Outflow */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                          Effective Net Customer Cost
                        </span>
                        <span className="text-xs text-slate-300">(After Gov DBT Subsidy)</span>
                      </div>
                      <span className="text-xl font-black text-emerald-400">
                        {formatINR(computedNetPayable)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: FINANCING MODES - LOAN, BANK & CASH (WITH GIVEN TIME) */}
              {activeEditorSection === 'financing' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Payment Modes & Time Milestone Schedules
                  </h3>

                  {/* Mode Presentation Selector */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Display Mode on Official PDF
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'All', label: 'All 3 (Comparison)' },
                        { id: 'Bank', label: 'Bank Transfer' },
                        { id: 'Loan', label: 'Solar Loan EMI' },
                        { id: 'Cash', label: 'Cash Payment' },
                      ].map(mode => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPdfSelectedPaymentMode(mode.id as any)}
                          className={`p-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                            pdfSelectedPaymentMode === mode.id
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1. BANK TRANSFER MILESTONES (GIVEN TIME) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-blue-600" /> Bank Transfer Milestones & Given Time
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Total: 100%</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>1. Advance Booking ({bankMilestoneAdvancePct}%):</span>
                          <span className="text-blue-600">{formatINR((computedGrandTotal * bankMilestoneAdvancePct) / 100)}</span>
                        </div>
                        <input
                          type="text"
                          value={bankMilestoneAdvanceTime}
                          onChange={e => setBankMilestoneAdvanceTime(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[10px]"
                        />
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>2. Material Dispatch ({bankMilestoneDispatchPct}%):</span>
                          <span className="text-blue-600">{formatINR((computedGrandTotal * bankMilestoneDispatchPct) / 100)}</span>
                        </div>
                        <input
                          type="text"
                          value={bankMilestoneDispatchTime}
                          onChange={e => setBankMilestoneDispatchTime(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[10px]"
                        />
                      </div>

                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>3. Net-Meter Commissioning ({bankMilestoneCommissionPct}%):</span>
                          <span className="text-blue-600">{formatINR((computedGrandTotal * bankMilestoneCommissionPct) / 100)}</span>
                        </div>
                        <input
                          type="text"
                          value={bankMilestoneCommissionTime}
                          onChange={e => setBankMilestoneCommissionTime(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. SOLAR LOAN & EMI (GIVEN TIME DISBURSEMENT) */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Solar Loan & Subsidized EMI Calculator
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Bank Partner:</span>
                        <input
                          type="text"
                          value={loanBankPartner}
                          onChange={e => setLoanBankPartner(e.target.value)}
                          className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-semibold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500">Down Payment %:</span>
                        <input
                          type="number"
                          value={loanDownPaymentPct}
                          onChange={e => setLoanDownPaymentPct(Number(e.target.value))}
                          className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500">Interest Rate (% p.a.):</span>
                        <input
                          type="number"
                          step="0.1"
                          value={loanInterestRate}
                          onChange={e => setLoanInterestRate(Number(e.target.value))}
                          className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500">Tenure (Years):</span>
                        <input
                          type="number"
                          value={loanTenureYears}
                          onChange={e => setLoanTenureYears(Number(e.target.value))}
                          className="w-full px-2 py-1 mt-0.5 bg-white dark:bg-slate-900 border rounded-lg font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Monthly EMI</span>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400">{formatINR(computedMonthlyEMI)} / mo</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Net Cashflow Gain</span>
                        <p className="text-sm font-black text-emerald-600">+{formatINR(monthlyNetCashflowGain)} / mo</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[10px]">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Given Time Disbursement Milestones:</span>
                      <input
                        type="text"
                        value={loanTranche1Time}
                        onChange={e => setLoanTranche1Time(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg"
                      />
                      <input
                        type="text"
                        value={loanTranche2Time}
                        onChange={e => setLoanTranche2Time(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: TERMS, WARRANTY & SIGNATURES */}
              {activeEditorSection === 'terms' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Warranties, Commercial Exclusions & Signature
                  </h3>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Standard Payment Terms Text</label>
                    <textarea
                      rows={2}
                      value={pdfPaymentTerms}
                      onChange={e => setPdfPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Warranty & Standard Exclusions</label>
                    <textarea
                      rows={3}
                      value={pdfNotesExclusions}
                      onChange={e => setPdfNotesExclusions(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Signatory Name</label>
                      <input
                        type="text"
                        value={pdfSignatoryName}
                        onChange={e => setPdfSignatoryName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Signatory Designation</label>
                      <input
                        type="text"
                        value={pdfSignatoryDesignation}
                        onChange={e => setPdfSignatoryDesignation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Show Digital Stamp & Seal</span>
                    <input
                      type="checkbox"
                      checked={pdfShowDigitalSeal}
                      onChange={e => setPdfShowDigitalSeal(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANE: LIVE OFFICIAL A4 PRINTABLE DOCUMENT PREVIEW (7 cols) */}
            <div className="lg:col-span-7 bg-slate-200/80 dark:bg-slate-950 p-2 sm:p-4 rounded-3xl border border-slate-300 dark:border-slate-800 flex justify-center">
              <div
                id="a4-printable-document"
                className="w-full max-w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl p-6 sm:p-10 rounded-2xl space-y-5 text-[11px] leading-relaxed select-text"
              >
                {/* 1. Header & Letterhead */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-slate-950 gap-4">
                  <div className="flex items-start gap-3">
                    {pdfShowLogo && pdfLogoUrl ? (
                      <div
                        className={`rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 ${
                          pdfLogoSize === 'small' ? 'w-12 h-12' : pdfLogoSize === 'large' ? 'w-20 h-20' : 'w-16 h-16'
                        }`}
                      >
                        <img src={pdfLogoUrl} alt={pdfCompanyName} className="w-full h-full object-contain" />
                      </div>
                    ) : null}

                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
                        {pdfCompanyName}
                      </h2>
                      <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">{pdfTagline}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                        CIN: {pdfCin} • GSTIN: {pdfGstin}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-600 space-y-0.5 max-w-[240px]">
                    <p className="font-bold text-slate-950">Corporate Office:</p>
                    <p className="truncate">{pdfOffice}</p>
                    <p>Phone: <span className="font-semibold text-slate-900">{pdfPhone}</span></p>
                    <p>Email: <span className="font-semibold text-slate-900">{pdfEmail}</span></p>
                    <p className="text-blue-700 font-semibold">{pdfWebsite}</p>
                  </div>
                </div>

                {/* 2. Document Title & Reference Metadata */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200 text-xs">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 tracking-tight">
                      TECHNO-COMMERCIAL SOLAR POWER PROPOSAL
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Grid-Connected Solar Photovoltaic Plant with Net-Metering
                    </p>
                  </div>
                  <div className="text-right text-[10px] space-y-0.5">
                    <p><span className="font-bold text-slate-950">Ref:</span> <span className="font-mono font-bold text-blue-700">{pdfQuotationNumber}</span></p>
                    <p><span className="font-bold text-slate-950">Date:</span> {formatDate(pdfDate)}</p>
                    <p><span className="font-bold text-slate-950">Valid:</span> {pdfValidityDays} Days (Until {formatDate(new Date(Date.now() + pdfValidityDays * 24 * 60 * 60 * 1000).toISOString())})</p>
                  </div>
                </div>

                {/* 3. Client & Project Technical Summary */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-500 uppercase tracking-wider text-[9px]">Customer & Site Info</p>
                    <p className="font-black text-xs text-slate-950">{pdfCustomerName}</p>
                    <p><span className="text-slate-500">Mobile:</span> <span className="font-semibold">{pdfCustomerMobile}</span></p>
                    <p><span className="text-slate-500">Location:</span> {pdfProjectLocation}</p>
                    <p><span className="text-slate-500">Consumer No:</span> <span className="font-mono">{pdfConsumerNumber}</span> ({pdfSanctionedLoad} kW Load)</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-black text-slate-500 uppercase tracking-wider text-[9px]">System Configuration</p>
                    <p className="font-black text-xs text-blue-700">{pdfCapacityKW} kWp Solar PV Plant</p>
                    <p><span className="text-slate-500">PV Modules:</span> {pdfPanelBrand} ({pdfPanelQuantity}x {pdfPanelWattage}W)</p>
                    <p><span className="text-slate-500">Solar Inverter:</span> {pdfInverterBrand} {pdfInverterCapacityKW} kW ({pdfInverterPhase})</p>
                    <p><span className="text-slate-500">Structure:</span> {pdfMountingStructure}</p>
                  </div>
                </div>

                {/* 4. Itemized Bill of Materials (BOM) Table */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-950">
                      Itemized Bill of Materials (BOM) & Turnkey Scope
                    </h4>
                  </div>
                  <table className="w-full text-left border border-slate-200 text-[10px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="py-1.5 px-2.5 border-b border-slate-200 w-8">#</th>
                        <th className="py-1.5 px-2.5 border-b border-slate-200">Item & Technical Description</th>
                        <th className="py-1.5 px-2 border-b border-slate-200 w-12 text-center">Qty</th>
                        <th className="py-1.5 px-2 border-b border-slate-200 w-12 text-center">Unit</th>
                        <th className="py-1.5 px-2.5 border-b border-slate-200 w-20 text-right">Rate (₹)</th>
                        <th className="py-1.5 px-2.5 border-b border-slate-200 w-24 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pdfLineItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2.5 text-slate-500">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-medium text-slate-900">{item.description}</td>
                          <td className="py-1.5 px-2 text-center font-bold">{item.quantity}</td>
                          <td className="py-1.5 px-2 text-center text-slate-500">{item.unit}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono">{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-950">{Number(item.total).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. Financial Summary & Subsidy Deduction */}
                <div className="flex justify-end">
                  <div className="w-80 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">System BOM Subtotal:</span>
                      <span className="font-semibold">{formatINR(computedSubtotal)}</span>
                    </div>

                    {pdfDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Promotional Discount:</span>
                        <span>- {formatINR(pdfDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Composite Solar GST ({pdfTaxRate}%):</span>
                      <span className="font-mono">{formatINR(computedTaxAmount)}</span>
                    </div>

                    <div className="pt-1 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-950">
                      <span>Total Turnkey Plant Cost:</span>
                      <span className="text-blue-700">{formatINR(computedGrandTotal)}</span>
                    </div>

                    {pdfIncludeSubsidy && effectiveSubsidy > 0 && (
                      <div className="flex justify-between font-bold text-emerald-700 pt-0.5">
                        <span>Less: PM Surya Ghar Central DBT Subsidy:</span>
                        <span>- {formatINR(effectiveSubsidy)}</span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t-2 border-slate-950 flex justify-between items-center font-black text-sm text-slate-950">
                      <span>Net Payable by Customer:</span>
                      <span className="text-emerald-700">{formatINR(computedNetPayable)}</span>
                    </div>
                  </div>
                </div>

                {/* 6. ADVANCED PAYMENT MODES BREAKDOWN WITH GIVEN TIMELINE */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      Payment Plans & Time-Bound Milestone Schedules
                    </h4>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Given Time Schedule
                    </span>
                  </div>

                  {/* Mode 1: Bank Transfer Schedule */}
                  {(pdfSelectedPaymentMode === 'All' || pdfSelectedPaymentMode === 'Bank') && (
                    <div className="space-y-1">
                      <p className="font-bold text-[10px] text-slate-900 flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-blue-600" /> Option A: Direct Bank Transfer Milestones
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[9px]">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-950">Stage 1: Advance Token (20%)</p>
                          <p className="text-blue-700 font-bold font-mono">{formatINR((computedGrandTotal * bankMilestoneAdvancePct) / 100)}</p>
                          <p className="text-slate-500 mt-0.5 text-[8.5px]">Due: {bankMilestoneAdvanceTime}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-950">Stage 2: Material Dispatch (60%)</p>
                          <p className="text-blue-700 font-bold font-mono">{formatINR((computedGrandTotal * bankMilestoneDispatchPct) / 100)}</p>
                          <p className="text-slate-500 mt-0.5 text-[8.5px]">Due: {bankMilestoneDispatchTime}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-950">Stage 3: Net Meter Sync (20%)</p>
                          <p className="text-blue-700 font-bold font-mono">{formatINR((computedGrandTotal * bankMilestoneCommissionPct) / 100)}</p>
                          <p className="text-slate-500 mt-0.5 text-[8.5px]">Due: {bankMilestoneCommissionTime}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Solar Bank Loan / Easy EMI Schedule */}
                  {(pdfSelectedPaymentMode === 'All' || pdfSelectedPaymentMode === 'Loan') && (
                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-[10px] text-indigo-900 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-indigo-600" /> Option B: Solar Rooftop Loan ({loanBankPartner})
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-700">Subsidized Interest: {loanInterestRate}% p.a.</span>
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-[9px]">
                        <div className="p-2 bg-white rounded-lg border border-indigo-200">
                          <p className="text-slate-500">Margin Money (Down Payment):</p>
                          <p className="font-black text-indigo-950 font-mono">{formatINR(loanDownPaymentAmt)} ({loanDownPaymentPct}%)</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-indigo-200">
                          <p className="text-slate-500">Loan Amount Financed:</p>
                          <p className="font-black text-indigo-950 font-mono">{formatINR(loanPrincipalAmt)} ({100 - loanDownPaymentPct}%)</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-indigo-200">
                          <p className="text-slate-500">Monthly EMI ({loanTenureYears} Years):</p>
                          <p className="font-black text-indigo-600 font-mono">{formatINR(computedMonthlyEMI)} / mo</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-emerald-700 font-semibold">Net Monthly Cash Gain:</p>
                          <p className="font-black text-emerald-800 font-mono">+{formatINR(monthlyNetCashflowGain)} / mo</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] text-slate-500 bg-white p-1.5 rounded-lg border border-slate-200">
                        <span><strong>Disbursement Timeline:</strong> Tranche 1 (50%): {loanTranche1Time}</span>
                        <span>Tranche 2 (50%): {loanTranche2Time}</span>
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Cash Payment Schedule */}
                  {(pdfSelectedPaymentMode === 'All' || pdfSelectedPaymentMode === 'Cash') && (
                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-[10px] text-amber-900 flex items-center gap-1">
                        <Banknote className="w-3 h-3 text-amber-600" /> Option C: Cash Payment Schedule (Section 269ST Compliant)
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[8.5px] text-slate-600">
                        <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                          <p className="font-bold text-slate-900">Token Advance:</p>
                          <p className="text-slate-500">{cashMilestoneAdvanceTime}</p>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                          <p className="font-bold text-slate-900">Dispatch Tranche:</p>
                          <p className="text-slate-500">{cashMilestoneDispatchTime}</p>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                          <p className="font-bold text-slate-900">Commissioning Tranche:</p>
                          <p className="text-slate-500">{cashMilestoneCommissionTime}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Solar Generation & Savings */}
                <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-[9px]">
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Est. Monthly Units</p>
                    <p className="font-black text-blue-700 text-xs mt-0.5">~{roiMonthlyUnits} kWh</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Annual Savings</p>
                    <p className="font-black text-emerald-700 text-xs mt-0.5">{formatINR(roiAnnualSavings)}</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Payback Period</p>
                    <p className="font-black text-slate-950 text-xs mt-0.5">{roiPaybackYears} Years</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">25-Yr Net Savings</p>
                    <p className="font-black text-blue-800 text-xs mt-0.5">{formatINR(roiLifetimeSavings)}</p>
                  </div>
                </div>

                {/* 8. Bank Details */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[9.5px]">
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Beneficiary Bank Details:</h5>
                    <p><span className="text-slate-500">Bank:</span> <span className="font-bold">{settings.bankDetails.bankName}</span></p>
                    <p><span className="text-slate-500">A/C No:</span> <span className="font-mono font-bold text-slate-950">{settings.bankDetails.accountNumber}</span></p>
                    <p><span className="text-slate-500">IFSC:</span> <span className="font-mono font-bold">{settings.bankDetails.ifscCode}</span></p>
                    <p><span className="text-slate-500">Branch:</span> {settings.bankDetails.branch}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Commercial Terms & Warranty:</h5>
                    <p className="text-slate-600 text-[9px] line-clamp-3">{pdfNotesExclusions}</p>
                  </div>
                </div>

                {/* 9. Signatures */}
                <div className="pt-6 flex items-end justify-between border-t border-slate-300 text-[10px]">
                  <div className="space-y-6">
                    <p className="font-bold text-slate-700">Client Acceptance Signature:</p>
                    <div className="w-44 border-b border-slate-400" />
                    <p className="text-[9px] text-slate-500">Name / Date: _____________________</p>
                  </div>

                  <div className="text-right space-y-4">
                    <p className="font-bold text-slate-950">For {pdfCompanyName}</p>
                    {pdfShowDigitalSeal && (
                      <div className="ml-auto w-24 h-10 border border-blue-300 bg-blue-50/50 rounded-lg flex items-center justify-center text-[8px] font-bold text-blue-700 tracking-wider">
                        [DIGITAL SEAL]
                      </div>
                    )}
                    <div className="w-48 ml-auto border-b border-slate-400" />
                    <p className="font-bold text-slate-950">{pdfSignatoryName}</p>
                    <p className="text-[9px] text-slate-500">{pdfSignatoryDesignation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: PAYMENT PLANS & GIVEN TIME MILESTONES (LOAN, BANK, CASH)          */}
      {/* ========================================================================= */}
      {activeMainTab === 'financing-plans' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Advanced Financing & Milestone Schedule Hub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed breakdown of Direct Bank Transfer, Solar Rooftop Loan (Collateral-Free Subsidized EMI), and Cash Payment terms with exact given-time milestones.
              </p>
            </div>

            <button
              onClick={() => handleOpenSendModal(activeQuotation)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Payment Plan to Client</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan 1: Bank Transfer */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Bank Transfer (Milestones)</h3>
                  <p className="text-[10px] text-slate-500">Direct RTGS / NEFT / IMPS</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 1: 20% Advance</span>
                  <span className="text-blue-600 font-bold block">{formatINR((computedGrandTotal * 20) / 100)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: Upon Work Order confirmation & site engineering survey</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 2: 60% Material Dispatch</span>
                  <span className="text-blue-600 font-bold block">{formatINR((computedGrandTotal * 60) / 100)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: Within 7-10 Days (Prior to warehouse dispatch of panels & inverters)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 3: 20% Testing & Commissioning</span>
                  <span className="text-blue-600 font-bold block">{formatINR((computedGrandTotal * 20) / 100)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: Within 21-25 Days (Upon TSSPDCL net-meter sync & CEIG approval)</span>
                </div>
              </div>
            </div>

            {/* Plan 2: Solar Rooftop Bank Loan */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Solar Rooftop Bank Loan</h3>
                  <p className="text-[10px] text-indigo-600 font-bold">PM Surya Ghar Collateral-Free</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-slate-500 block text-[11px]">Down Payment Required (15%):</span>
                  <span className="font-black text-base text-indigo-900 dark:text-indigo-200 block">{formatINR(loanDownPaymentAmt)}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Financed Loan Amount: {formatINR(loanPrincipalAmt)}</span>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold block text-[11px]">Subsidized Monthly EMI:</span>
                  <span className="font-black text-lg text-emerald-700 dark:text-emerald-400 block">{formatINR(computedMonthlyEMI)} / month</span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">Interest: 7.0% p.a. • Tenure: 84 Months (7 Yrs)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Given Time Bank Tranche Releases:</span>
                  <p className="text-[10px] text-slate-500">• Tranche 1 (50%): Released Day 7-10 on site material delivery</p>
                  <p className="text-[10px] text-slate-500">• Tranche 2 (50%): Released Day 21-30 on net-meter commissioning</p>
                </div>
              </div>
            </div>

            {/* Plan 3: Cash Payment */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Cash Payment Terms</h3>
                  <p className="text-[10px] text-slate-500">Statutory Tax Compliance</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-[11px]">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Section 269ST IT Compliance:</span>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Cash receipts are capped per statutory norms. Receipts issued on official KYPAS serialized vouchers with stamp.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">Given Time Cash Stages:</span>
                  <p className="text-[10px] text-slate-500">• Day 0: On-site booking token receipt</p>
                  <p className="text-[10px] text-slate-500">• Day 7: Material unloading verification receipt</p>
                  <p className="text-[10px] text-slate-500">• Day 25: Commissioning and meter handshake receipt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SEND QUOTATION DISPATCH HUB (WHATSAPP, EMAIL, LINK, SMS)         */}
      {/* ========================================================================= */}
      {showSendModal && sendingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowSendModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Send Quotation to Customer
                </h3>
                <p className="text-xs text-slate-500">
                  Dispatch official solar proposal <strong className="text-slate-800 dark:text-slate-200">{sendingQuote.quotationNumber}</strong> to <strong className="text-slate-800 dark:text-slate-200">{sendingQuote.customerName}</strong>.
                </p>
              </div>
            </div>

            {/* Commercial Highlights Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Capacity</span>
                <p className="font-black text-slate-900 dark:text-white">{sendingQuote.solarSystemCapacityKW} kWp</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Turnkey Total</span>
                <p className="font-black text-slate-900 dark:text-white">{formatINR(sendingQuote.grandTotal)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Net After Subsidy</span>
                <p className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatINR(sendingQuote.netPayableAfterSubsidy || sendingQuote.grandTotal - (sendingQuote.subsidyAmount || 0))}
                </p>
              </div>
            </div>

            {/* Channel Tabs: WhatsApp | Email | Shareable Link */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
              <button
                type="button"
                onClick={() => setSendChannel('whatsapp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sendChannel === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => setSendChannel('email')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sendChannel === 'email'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => setSendChannel('link')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sendChannel === 'link'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Shareable Link</span>
              </button>
            </div>

            {/* CHANNEL 1: WHATSAPP DISPATCH */}
            {sendChannel === 'whatsapp' && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient WhatsApp Mobile *
                    </label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={e => setRecipientPhone(e.target.value)}
                      placeholder="9849012345"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Message Focus Template
                    </label>
                    <select
                      value={sendTemplate}
                      onChange={e => setSendTemplate(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                    >
                      <option value="subsidy">PM Surya Ghar Subsidy Focus</option>
                      <option value="loan">Zero-Down Solar Loan & EMI Focus</option>
                      <option value="commercial">Commercial Milestone Payment Focus</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Message Preview
                  </label>
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl whitespace-pre-wrap font-mono text-[11px] text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto custom-scrollbar">
                    {getWhatsAppMessageText()}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">
                    Clicking Send opens WhatsApp with this pre-filled message and marks quotation status as <strong>Sent</strong>.
                  </p>

                  <button
                    type="button"
                    onClick={handleConfirmSendWhatsApp}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send on WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHANNEL 2: EMAIL DISPATCH */}
            {sendChannel === 'email' && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Customer Email *
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Body
                  </label>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">
                    Dispatches formal email & logs interaction in customer history.
                  </p>

                  <button
                    type="button"
                    onClick={handleConfirmSendEmail}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Official Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHANNEL 3: SHAREABLE DIGITAL PROPOSAL LINK */}
            {sendChannel === 'link' && (
              <div className="space-y-4 text-xs animate-in fade-in">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Customer Digital Proposal Web Link
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://crm.kypassolar.com/proposals/${sendingQuote.quotationNumber.replace(/\//g, '-')}`}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl font-mono select-all text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleCopyProposalLink}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    This link allows the client to view the high-resolution interactive quotation on any mobile or desktop device.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW QUOTATION BUILDER (WITH SOLAR PACKAGE PRESETS)        */}
      {/* ========================================================================= */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowBuilderModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                Create New Solar Quotation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a target customer, pick an engineered solar package preset, and generate an official proposal.
              </p>
            </div>

            <form onSubmit={handleCreateNewQuotationSubmit} className="space-y-5 text-xs">
              {/* Step 1: Customer Selection */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Select Customer Account *
                </label>
                <select
                  value={newQuoteCustomerId}
                  onChange={e => setNewQuoteCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold text-slate-800 dark:text-slate-200 text-xs"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.mobile}) - {c.city}, {c.state} [{c.solarRequirement}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Solar Package Preset Cards */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  2. Choose Solar Engineering Package Preset:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SOLAR_PACKAGE_PRESETS.map(preset => {
                    const isSelected = newQuoteSelectedPreset.id === preset.id;
                    const estimatedBase = preset.lineItems.reduce((acc, i) => acc + i.total, 0);
                    const netEstimate = Math.max(0, estimatedBase - preset.subsidyAmount);

                    return (
                      <div
                        key={preset.id}
                        onClick={() => setNewQuoteSelectedPreset(preset)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-slate-900 dark:text-white text-xs">{preset.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            {preset.capacityKW} kW
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {preset.panelBrand} ({preset.panelQuantity}x {preset.panelWattage}W) + {preset.inverterBrand} Inverter
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Estimated Net:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-black">{formatINR(netEstimate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Terms & Exclusions */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  3. Standard Warranty & Exclusions
                </label>
                <textarea
                  rows={2}
                  value={newQuoteNotes}
                  onChange={e => setNewQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Generate Quotation & Open in Studio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: STANDALONE A4 PRINT / SAVE PDF MODAL                             */}
      {/* ========================================================================= */}
      {activePrintQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-10 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
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
                  type="button"
                  onClick={() => handleOpenSendModal(activePrintQuotation)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Client</span>
                </button>
                <button
                  type="button"
                  disabled={isDownloadingPdf}
                  onClick={() => handleDownloadPDF('#modal-printable-document', activePrintQuotation.quotationNumber)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  title="Download official PDF file to device"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                  title="Print proposal via browser dialog"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePrintQuotation(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Body */}
            <div id="modal-printable-document" className="space-y-5 text-xs text-slate-800 bg-white p-4 rounded-xl">
              <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <img
                    src={activePrintQuotation.logoUrl || settings.logoUrl || '/assets/aistudio/image_3720f2fa.png'}
                    alt="Logo"
                    className="w-14 h-14 object-contain rounded-xl border border-slate-200 p-1"
                  />
                  <div>
                    <h2 className="text-base font-black text-slate-950">{settings.companyName}</h2>
                    <p className="text-[10px] text-slate-500">{settings.tagline} • GSTIN: {settings.gstin}</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600">
                  <p>{settings.registeredOffice}</p>
                  <p>Phone: {settings.phone} • {settings.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-950">TECHNO-COMMERCIAL SOLAR PROPOSAL</h3>
                <p className="text-[11px] font-mono font-bold text-blue-700">{activePrintQuotation.quotationNumber} (V{activePrintQuotation.version})</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px]">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{activePrintQuotation.customerName}</p>
                  <p>Mobile: {activePrintQuotation.customerMobile}</p>
                  <p>Site: {activePrintQuotation.projectLocation}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Plant Capacity:</span> {activePrintQuotation.solarSystemCapacityKW} kWp</p>
                  <p><span className="font-semibold">PV Modules:</span> {activePrintQuotation.panelBrand} ({activePrintQuotation.panelQuantity} Nos)</p>
                  <p><span className="font-semibold">Inverter:</span> {activePrintQuotation.inverterBrand} ({activePrintQuotation.inverterPhase})</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border border-slate-200 text-[10px]">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Description</th>
                    <th className="p-2 w-12 text-center">Qty</th>
                    <th className="p-2 w-12 text-center">Unit</th>
                    <th className="p-2 w-20 text-right">Rate (₹)</th>
                    <th className="p-2 w-24 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePrintQuotation.lineItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-medium">{item.description}</td>
                      <td className="p-2 text-center font-bold">{item.quantity}</td>
                      <td className="p-2 text-center text-slate-500">{item.unit}</td>
                      <td className="p-2 text-right font-mono">{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono font-bold">{Number(item.total).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-72 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatINR(activePrintQuotation.subtotal)}</span>
                  </div>
                  {activePrintQuotation.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount:</span>
                      <span>- {formatINR(activePrintQuotation.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST ({activePrintQuotation.taxRate}%):</span>
                    <span>{formatINR(activePrintQuotation.taxAmount)}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-950">
                    <span>Grand Total:</span>
                    <span className="text-blue-700">{formatINR(activePrintQuotation.grandTotal)}</span>
                  </div>
                  {activePrintQuotation.subsidyAmount && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>PM Surya Ghar Subsidy:</span>
                      <span>- {formatINR(activePrintQuotation.subsidyAmount)}</span>
                    </div>
                  )}
                  <div className="pt-1 border-t-2 border-slate-950 flex justify-between font-black text-sm text-slate-950">
                    <span>Net Customer Payable:</span>
                    <span className="text-emerald-700">{formatINR(activePrintQuotation.netPayableAfterSubsidy || activePrintQuotation.grandTotal - (activePrintQuotation.subsidyAmount || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex items-end justify-between border-t border-slate-300 text-[10px]">
                <div className="space-y-6">
                  <p className="font-bold text-slate-700">Client Acceptance Signature:</p>
                  <div className="w-40 border-b border-slate-400" />
                </div>
                <div className="text-right space-y-6">
                  <p className="font-bold text-slate-950">For {settings.companyName}</p>
                  <div className="w-40 ml-auto border-b border-slate-400" />
                  <p className="text-[9px] text-slate-500">Authorized Technical Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REVISION MODAL (V2, V3...)                                       */}
      {/* ========================================================================= */}
      {showRevisionModal && revisionQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <button
              onClick={() => setShowRevisionModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Confirm Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: BULK IMPORT QUOTATIONS MODAL                                     */}
      {/* ========================================================================= */}
      <DataImportModal
        isOpen={showQuoteImportModal}
        onClose={() => setShowQuoteImportModal(false)}
        title="Import Quotations & Commercial Proposals"
        entityName="Quotations"
        sampleFileName="KYPAS_Quotations_Import_Template"
        sampleData={QUOTATION_SAMPLE_DATA}
        expectedColumns={QUOTATION_IMPORT_COLUMNS}
        onImport={handleImportQuotations}
      />

      {/* ========================================================================= */}
      {/* MODAL 6: BULK IMPORT BOM LINE ITEMS MODAL                                 */}
      {/* ========================================================================= */}
      <DataImportModal
        isOpen={showBomImportModal}
        onClose={() => setShowBomImportModal(false)}
        title="Import Bill of Materials (BOM) Line Items"
        entityName="BOM Items"
        sampleFileName="KYPAS_Solar_BOM_Import_Template"
        sampleData={BOM_SAMPLE_DATA}
        expectedColumns={BOM_IMPORT_COLUMNS}
        onImport={handleImportBOMItems}
      />
    </div>
  );
};
