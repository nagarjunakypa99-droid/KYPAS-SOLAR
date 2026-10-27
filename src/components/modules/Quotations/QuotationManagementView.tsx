import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Printer,
  Copy,
  Trash2,
  X,
  FileDown,
  Sun,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  Sparkles,
  Calculator,
  Check,
  ChevronRight,
  FileText,
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
  ExternalLink,
  Upload,
  Sliders,
  Eye,
  Layers,
  RotateCcw,
  Landmark,
  Wallet,
  Building,
  CreditCard,
  DollarSign,
  Share2,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Quotation, QuotationLineItem, QuotationStatus, SolarRequirement, PaymentCategory } from '../../../types/crm';
import { formatINR, formatDate, exportToExcel } from '../../../utils/formatters';
import { exportElementToPdf } from '../../../utils/pdfExport';
import {
  KypasOfficialProposalDocument,
  ProposalPageData,
  DEFAULT_PROPOSAL_DATA,
  ProposalLogoConfig,
  PageWatermarkConfig,
  PageVisualConfig,
  ProposalCanvasState,
  createDefaultCanvasState,
  createDefaultWatermark,
  createDefaultPageConfigs,
} from './KypasOfficialProposalDocument';
import { AdvancedProposalPageEditor } from './AdvancedProposalPageEditor';
import { PdfQuotationUploadModal } from './PdfQuotationUploadModal';

// Solar Package Presets for Rapid Quotation
const SOLAR_PRESETS = [
  {
    id: 'pkg-3kw',
    name: '3 kW Residential (PM Surya Ghar Subsidy ₹78,000)',
    capacityKW: 3,
    panelBrand: 'Waaree Solar',
    panelModel: '540W Mono PERC Bifacial (ALMM)',
    panelCount: 6,
    inverterBrand: 'Growatt',
    inverterCapacityKW: 3,
    inverterPhase: 'Single Phase On-Grid',
    subsidyAmount: 78000,
    grossPrice: 195000,
    netPayable: 117000,
    lineItems: [
      { id: 'I1', description: 'Waaree 540Wp Mono PERC Bifacial Solar PV Modules (ALMM Approved, 25 Yrs Warranty)', quantity: 6, unit: 'Nos', unitPrice: 14500, total: 87000 },
      { id: 'I2', description: 'Growatt 3kW Grid-Tie Inverter with Wi-Fi Monitoring (5 Yrs Warranty)', quantity: 1, unit: 'Set', unitPrice: 38000, total: 38000 },
      { id: 'I3', description: 'Hot-Dip Galvanized Iron (HDGI) Elevated Solar Mounting Structure (80 microns)', quantity: 1, unit: 'Set', unitPrice: 22000, total: 22000 },
      { id: 'I4', description: 'Balance of System (BOS) - ACDB/DCDB, Polycab 4 sq.mm DC Cable, Dual Copper Earthing', quantity: 1, unit: 'Lot', unitPrice: 26000, total: 26000 },
      { id: 'I5', description: 'Turnkey Installation, Testing, TSSPDCL Net Meter Inspection & Liaisoning', quantity: 1, unit: 'Job', unitPrice: 22000, total: 22000 },
    ],
  },
  {
    id: 'pkg-5kw',
    name: '5 kW Premium Residential Bifacial (Subsidy ₹78,000)',
    capacityKW: 5,
    panelBrand: 'Waaree Solar',
    panelModel: '540W Mono PERC Bifacial (ALMM)',
    panelCount: 10,
    inverterBrand: 'Growatt',
    inverterCapacityKW: 5,
    inverterPhase: 'Single Phase On-Grid',
    subsidyAmount: 78000,
    grossPrice: 295000,
    netPayable: 217000,
    lineItems: [
      { id: 'I1', description: 'Waaree 540Wp Mono PERC Bifacial Solar PV Modules (ALMM Approved, 25 Yrs Warranty)', quantity: 10, unit: 'Nos', unitPrice: 14500, total: 145000 },
      { id: 'I2', description: 'Growatt 5kW Grid-Tie Inverter with Wi-Fi Cloud Monitoring', quantity: 1, unit: 'Set', unitPrice: 52000, total: 52000 },
      { id: 'I3', description: 'HDGI Elevated Structure (Wind rated up to 150 km/h)', quantity: 1, unit: 'Set', unitPrice: 35000, total: 35000 },
      { id: 'I4', description: 'Balance of System (BOS) - ACDB/DCDB Type II SPDs, Polycab Cable, Chemical Earthing', quantity: 1, unit: 'Lot', unitPrice: 35000, total: 35000 },
      { id: 'I5', description: 'Turnkey Civil Erection, Net Meter Testing & TSSPDCL Liaisoning', quantity: 1, unit: 'Job', unitPrice: 28000, total: 28000 },
    ],
  },
  {
    id: 'pkg-10kw',
    name: '10 kW Commercial & Industrial 3-Phase On-Grid',
    capacityKW: 10,
    panelBrand: 'Waaree Solar',
    panelModel: '540W Mono PERC Bifacial (ALMM)',
    panelCount: 19,
    inverterBrand: 'Growatt',
    inverterCapacityKW: 10,
    inverterPhase: 'Three Phase On-Grid',
    subsidyAmount: 0,
    grossPrice: 540000,
    netPayable: 540000,
    lineItems: [
      { id: 'I1', description: 'Waaree 540Wp Mono PERC Bifacial Modules (ALMM Approved)', quantity: 19, unit: 'Nos', unitPrice: 14200, total: 269800 },
      { id: 'I2', description: 'Growatt 10kW 3-Phase Commercial Grid-Tie Inverter with Dual MPPT', quantity: 1, unit: 'Set', unitPrice: 85000, total: 85000 },
      { id: 'I3', description: 'Heavy Duty HDGI Structure with Chemical Anchoring', quantity: 1, unit: 'Set', unitPrice: 65000, total: 65000 },
      { id: 'I4', description: 'LT Commercial Panel Integration, DCDB/ACDB, Multi-point Chemical Earthing', quantity: 1, unit: 'Lot', unitPrice: 65000, total: 65000 },
      { id: 'I5', description: 'CEIG Electrical Inspector Approval & TSSPDCL 3-Phase Net Metering', quantity: 1, unit: 'Job', unitPrice: 55200, total: 55200 },
    ],
  },
];

export const QuotationManagementView: React.FC = () => {
  const {
    quotations,
    leads,
    customers,
    settings,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    duplicateQuotation,
    addToast,
    showConfirmDialog,
  } = useCRM();

  const { currentUser, hasPermission } = useAuth();

  // Active view tab: directory | edit-pdf | financing-plans | official_pdf
  const [activeTab, setActiveTab] = useState<'directory' | 'edit-pdf' | 'financing-plans' | 'official_pdf'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Currently selected quote for editing in Live PDF Studio
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotations[0]?.id || '');
  const selectedQuote = useMemo(() => {
    return quotations.find((q) => q.id === selectedQuoteId) || quotations[0];
  }, [quotations, selectedQuoteId]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTargetQuote, setSendTargetQuote] = useState<Quotation | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quotation | null>(null);
  const [isPdfUploadOpen, setIsPdfUploadOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Send WhatsApp / Email modal state
  const [sendPitchType, setSendPitchType] = useState<'subsidy' | 'loan' | 'commercial'>('subsidy');
  const [targetMobile, setTargetMobile] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Live PDF Studio Customizer Sub-tabs: branding | client | bom | financials | financing | terms
  const [customizerTab, setCustomizerTab] = useState<'branding' | 'client' | 'bom' | 'financials' | 'financing' | 'terms'>('branding');

  // Live PDF Studio Form States (initialized from selectedQuote)
  const [logoUrl, setLogoUrl] = useState(selectedQuote?.logoUrl || settings?.logoUrl || '/assets/proposal-template/crops/kypas-header-logo.png');
  const [showLogo, setShowLogo] = useState(selectedQuote?.showLogo !== false);
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>(selectedQuote?.logoSize || 'medium');
  const [companyName, setCompanyName] = useState(selectedQuote?.customCompanyDetails?.companyName || settings?.companyName || 'KYPAS SOLAR POWER PVT LTD');
  const [companyTagline, setCompanyTagline] = useState(selectedQuote?.customCompanyDetails?.tagline || settings?.tagline || 'Leading Solar Energy EPC Provider in Telangana & AP');
  const [companyCin, setCompanyCin] = useState(selectedQuote?.customCompanyDetails?.cin || settings?.cin || 'U40106TG2020PTC145892');
  const [companyGstin, setCompanyGstin] = useState(selectedQuote?.customCompanyDetails?.gstin || settings?.gstin || '36AAGCK9842K1ZK');
  const [companyAddress, setCompanyAddress] = useState(selectedQuote?.customCompanyDetails?.address || settings?.registeredOffice || 'Plot 82, Phase II, Kavuri Hills, Madhapur, Hyderabad, Telangana 500081');
  const [companyPhone, setCompanyPhone] = useState(selectedQuote?.customCompanyDetails?.phone || settings?.phone || '+91 94900 11223');
  const [companyEmail, setCompanyEmail] = useState(selectedQuote?.customCompanyDetails?.email || settings?.email || 'contact@kypassolar.com');
  const [companyWebsite, setCompanyWebsite] = useState(selectedQuote?.customCompanyDetails?.website || settings?.website || 'www.kypassolar.com');

  // Customer & Site info
  const [custName, setCustName] = useState(selectedQuote?.customerName || '');
  const [custMobile, setCustMobile] = useState(selectedQuote?.customerMobile || '');
  const [custEmail, setCustEmail] = useState(selectedQuote?.customerEmail || '');
  const [projLocation, setProjLocation] = useState(selectedQuote?.projectLocation || 'Hyderabad, Telangana');
  const [consumerNo, setConsumerNo] = useState(selectedQuote?.consumerNumber || 'TS-DISCOM-89234120');
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(selectedQuote?.sanctionedLoadKW || 5);
  const [quoteNumber, setQuoteNumber] = useState(selectedQuote?.quotationNumber || 'KSP/2026-27/QT-01');
  const [quoteDate, setQuoteDate] = useState(selectedQuote?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
  const [validityDays, setValidityDays] = useState<number>(selectedQuote?.validityDays || 30);
  const [systemCapacityKW, setSystemCapacityKW] = useState<number>(selectedQuote?.solarSystemCapacityKW || 3);

  // Technical Specs
  const [panelBrand, setPanelBrand] = useState(selectedQuote?.panelBrand || 'Waaree Solar');
  const [panelModel, setPanelModel] = useState(selectedQuote?.panelModel || '540W Mono PERC Bifacial');
  const [panelWattage, setPanelWattage] = useState<number>(selectedQuote?.panelWattage || 540);
  const [panelQuantity, setPanelQuantity] = useState<number>(selectedQuote?.panelQuantity || 6);
  const [inverterBrand, setInverterBrand] = useState(selectedQuote?.inverterBrand || 'Growatt');
  const [inverterCapacityKW, setInverterCapacityKW] = useState<number>(selectedQuote?.inverterCapacityKW || 3);
  const [inverterPhase, setInverterPhase] = useState(selectedQuote?.inverterPhase || 'Single Phase On-Grid');
  const [mountingStructure, setMountingStructure] = useState(selectedQuote?.mountingStructure || 'HDGI Hot Dip Galvanized Elevated Structure');

  // Line items
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>(selectedQuote?.lineItems || SOLAR_PRESETS[0].lineItems);
  const [discount, setDiscount] = useState<number>(selectedQuote?.discount || 0);
  const [taxRate, setTaxRate] = useState<number>(selectedQuote?.taxRate || 13.8);
  const [showTaxes, setShowTaxes] = useState(true);
  const [subsidyAmount, setSubsidyAmount] = useState<number>(selectedQuote?.subsidyAmount ?? (systemCapacityKW >= 3 ? 78000 : 60000));

  // Financing milestones
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentCategory | 'All'>(selectedQuote?.selectedPaymentMode || 'All');
  const [advancePct, setAdvancePct] = useState(20);
  const [dispatchPct, setDispatchPct] = useState(60);
  const [syncPct, setSyncPct] = useState(20);
  const [advanceDueTime, setAdvanceDueTime] = useState('Immediate upon Work Order Signing');
  const [dispatchDueTime, setDispatchDueTime] = useState('Within 7-10 Days (Warehouse Dispatch)');
  const [syncDueTime, setSyncDueTime] = useState('Within 21-25 Days (Net Meter Sync)');
  const [bankPartner, setBankPartner] = useState(selectedQuote?.loanDetails?.bankPartner || 'SBI PM Surya Ghar Solar Loan');
  const [downPaymentPct, setDownPaymentPct] = useState(selectedQuote?.loanDetails?.downPaymentPercent || 15);
  const [loanInterestRate, setLoanInterestRate] = useState(selectedQuote?.loanDetails?.interestRate || 7.0);
  const [loanTenureYears, setLoanTenureYears] = useState(selectedQuote?.loanDetails?.tenureYears || 7);
  const [loanTranche1Due, setLoanTranche1Due] = useState('Day 7-10 upon Site Material Verification (50%)');
  const [loanTranche2Due, setLoanTranche2Due] = useState('Day 21-30 upon Discom Net Meter Inspection (50%)');
  const [cashTokenDue, setCashTokenDue] = useState('Day 0 - On-Site Token Receipt');
  const [cashDispatchDue, setCashDispatchDue] = useState('Day 7 - Warehouse Unloading Receipt');
  const [cashCommissioningDue, setCashCommissioningDue] = useState('Day 25 - Final Commissioning Receipt');

  // Terms & Signatory
  const [paymentTerms, setPaymentTerms] = useState(selectedQuote?.paymentTerms || '20% Advance with Order, 60% upon Material Dispatch, 20% on Testing and Net-meter Commissioning.');
  const [notesAndExclusions, setNotesAndExclusions] = useState(
    selectedQuote?.notesAndExclusions ||
      'Includes 5 years comprehensive free AMC. Solar panels carry 25 years linear power performance warranty. Inverter carries 5 years manufacturer replacement warranty. Civil foundation extra if rooftop height exceeds 10 feet. Net meter charges billed by utility at actuals.'
  );
  const [signatoryName, setSignatoryName] = useState(selectedQuote?.signatoryName || 'Nagarjuna Kypa');
  const [signatoryDesignation, setSignatoryDesignation] = useState(selectedQuote?.signatoryDesignation || 'Managing Director & Technical Head');
  const [showDigitalSeal, setShowDigitalSeal] = useState(selectedQuote?.showDigitalSeal !== false);

  // Sync state when selected quote changes
  const handleSelectQuoteForEdit = (quote: Quotation) => {
    setSelectedQuoteId(quote.id);
    setLogoUrl(quote.logoUrl || settings?.logoUrl || '/assets/proposal-template/crops/kypas-header-logo.png');
    setShowLogo(quote.showLogo !== false);
    setLogoSize(quote.logoSize || 'medium');
    setCustName(quote.customerName);
    setCustMobile(quote.customerMobile);
    setCustEmail(quote.customerEmail || '');
    setProjLocation(quote.projectLocation || 'Hyderabad, Telangana');
    setConsumerNo(quote.consumerNumber || 'TS-DISCOM-89234120');
    setSanctionedLoad(quote.sanctionedLoadKW || 5);
    setQuoteNumber(quote.quotationNumber);
    setQuoteDate(quote.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    setValidityDays(quote.validityDays || 30);
    setSystemCapacityKW(quote.solarSystemCapacityKW);
    setPanelBrand(quote.panelBrand);
    setPanelModel(quote.panelModel);
    setPanelWattage(quote.panelWattage || 540);
    setPanelQuantity(quote.panelQuantity || 6);
    setInverterBrand(quote.inverterBrand);
    setInverterCapacityKW(quote.inverterCapacityKW);
    setInverterPhase(quote.inverterPhase);
    setMountingStructure(quote.mountingStructure);
    setLineItems(quote.lineItems || []);
    setDiscount(quote.discount || 0);
    setTaxRate(quote.taxRate || 13.8);
    setSubsidyAmount(quote.subsidyAmount ?? (quote.solarSystemCapacityKW >= 3 ? 78000 : 60000));
    setSelectedPaymentMode(quote.selectedPaymentMode || 'All');
    if (quote.paymentTerms) setPaymentTerms(quote.paymentTerms);
    if (quote.notesAndExclusions) setNotesAndExclusions(quote.notesAndExclusions);
    if (quote.signatoryName) setSignatoryName(quote.signatoryName);
    if (quote.signatoryDesignation) setSignatoryDesignation(quote.signatoryDesignation);
    setShowDigitalSeal(quote.showDigitalSeal !== false);
  };

  // Calculations for Live PDF Studio
  const bomSubtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  }, [lineItems]);

  const afterDiscount = Math.max(0, bomSubtotal - Number(discount || 0));
  const gstAmount = Math.round((afterDiscount * Number(taxRate || 0)) / 100);
  const grandTotal = afterDiscount + gstAmount;
  const netSubsidy = showTaxes ? Number(subsidyAmount || 0) : 0;
  const netPayable = Math.max(0, grandTotal - netSubsidy);

  // Solar generation & ROI metrics
  const monthlyUnits = Math.round(Number(systemCapacityKW) * 130);
  const monthlySavings = Math.round(monthlyUnits * 8.2);
  const annualSavings = monthlySavings * 12;
  const paybackYears = netPayable > 0 && annualSavings > 0 ? (netPayable / annualSavings).toFixed(1) : '3.2';
  const twentyFiveYrSavings = annualSavings * 25 * 0.9 - netPayable;

  // Loan EMI calculations
  const downPaymentAmount = Math.round((netPayable * Number(downPaymentPct)) / 100);
  const loanFinancedAmount = netPayable - downPaymentAmount;
  const monthlyInterestRate = Number(loanInterestRate) / 100 / 12;
  const totalMonths = Number(loanTenureYears) * 12;
  const calculatedEmi =
    loanFinancedAmount > 0 && monthlyInterestRate > 0 && totalMonths > 0
      ? Math.round(
          (loanFinancedAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
            (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
        )
      : 0;
  const netMonthlyGain = monthlySavings - calculatedEmi;

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          addToast({ title: 'Logo Uploaded', message: 'Custom company logo applied to proposal preview.', type: 'success' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Line Item edits
  const handleUpdateLineItem = (id: string, field: 'description' | 'quantity' | 'unit' | 'unitPrice', val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
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
    setLineItems((prev) => [...prev, newItem]);
  };

  const handleDeleteLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Save all changes back to quotation
  const handleSaveAllChanges = () => {
    if (!selectedQuote) return;
    updateQuotation(selectedQuote.id, {
      customerName: custName,
      customerMobile: custMobile,
      customerEmail: custEmail,
      projectLocation: projLocation,
      consumerNumber: consumerNo,
      sanctionedLoadKW: Number(sanctionedLoad),
      quotationNumber: quoteNumber,
      validityDays: Number(validityDays),
      solarSystemCapacityKW: Number(systemCapacityKW),
      panelBrand,
      panelModel,
      panelWattage: Number(panelWattage),
      panelQuantity: Number(panelQuantity),
      inverterBrand,
      inverterCapacityKW: Number(inverterCapacityKW),
      inverterPhase,
      mountingStructure,
      lineItems,
      subtotal: bomSubtotal,
      discount: Number(discount),
      taxRate: Number(taxRate),
      taxAmount: gstAmount,
      grandTotal,
      subsidyAmount: netSubsidy,
      netPayableAfterSubsidy: netPayable,
      logoUrl,
      showLogo,
      logoSize,
      selectedPaymentMode,
      paymentTerms,
      notesAndExclusions,
      signatoryName,
      signatoryDesignation,
      showDigitalSeal,
      customCompanyDetails: {
        companyName,
        tagline: companyTagline,
        address: companyAddress,
        phone: companyPhone,
        email: companyEmail,
        website: companyWebsite,
        cin: companyCin,
        gstin: companyGstin,
      },
      loanDetails: {
        bankPartner,
        downPaymentPercent: Number(downPaymentPct),
        downPaymentAmount,
        loanAmount: loanFinancedAmount,
        interestRate: Number(loanInterestRate),
        tenureYears: Number(loanTenureYears),
        monthlyEMI: calculatedEmi,
        monthlySavings,
      },
    });

    addToast({
      title: 'Quotation Saved',
      message: `Quotation ${quoteNumber} saved successfully with customized BOM and financing milestones.`,
      type: 'success',
    });
  };

  // Download PDF handler
  const handleDownloadPdf = async (selector: string = '#a4-printable-document', filename: string = quoteNumber) => {
    setIsGeneratingPdf(true);
    try {
      const success = await exportElementToPdf(selector, {
        filename: `KYPAS_Solar_Quotation_${filename.replace(/[\/\\]/g, '-')}`,
        scale: 2,
      });
      if (success) {
        addToast({ title: 'PDF Downloaded', message: `${filename}.pdf downloaded successfully.`, type: 'success' });
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Send modal trigger
  const handleOpenSendModal = (quote: Quotation) => {
    setSendTargetQuote(quote);
    setTargetMobile(quote.customerMobile || '');
    setTargetEmail(quote.customerEmail || '');
    setEmailSubject(`KYPAS Solar Proposal: ${quote.quotationNumber} (${quote.solarSystemCapacityKW} kWp Plant)`);
    const net = quote.netPayableAfterSubsidy || (quote.grandTotal - (quote.subsidyAmount || 0));
    setEmailBody(
      `Dear ${quote.customerName},\n\nGreetings from ${settings?.companyName || 'KYPAS SOLAR POWER PRIVATE LIMITED'}!\n\nWe are pleased to submit our official techno-commercial proposal for your grid-connected Solar Photovoltaic Plant:\n• Quotation Reference: ${quote.quotationNumber} (V${quote.version})\n• Proposed System Capacity: ${quote.solarSystemCapacityKW} kWp\n• PV Modules: ${quote.panelBrand} (${quote.panelQuantity}x ${quote.panelWattage}W Bifacial)\n• Inverter: ${quote.inverterBrand} ${quote.inverterCapacityKW} kW (${quote.inverterPhase})\n• Turnkey Plant Cost: ₹${quote.grandTotal.toLocaleString('en-IN')}\n• Eligible PM Surya Ghar Subsidy: ₹${(quote.subsidyAmount || 78000).toLocaleString('en-IN')} (Govt DBT)\n• Effective Net Cost Payable: ₹${net.toLocaleString('en-IN')}\n\nFINANCING & PAYMENT MILESTONES:\n1. Advance Token (20%): ₹${Math.round(quote.grandTotal * 0.2).toLocaleString('en-IN')} (Immediate upon signing)\n2. Material Dispatch (60%): ₹${Math.round(quote.grandTotal * 0.6).toLocaleString('en-IN')} (Within 7-10 Days)\n3. Testing & Net-Meter Sync (20%): ₹${Math.round(quote.grandTotal * 0.2).toLocaleString('en-IN')} (Within 21-25 Days)\n* Subsidized Solar Loan Available: 7.0% p.a. with approx ₹${quote.loanDetails?.monthlyEMI || Math.round(net * 0.016)}/mo EMI.\n\nView and download your official proposal PDF here:\nhttps://crm.kypassolar.com/proposals/${quote.quotationNumber.replace(/\//g, '-')}\n\nWarm regards,\n${quote.signatoryName || 'Nagarjuna Kypa'}\nTechnical Sales Head\nKYPAS SOLAR POWER PVT LTD\nTel: ${settings?.phone || '+91 94900 11223'}`
    );
    setShowSendModal(true);
  };

  // WhatsApp quick text builder
  const getWhatsAppMessage = () => {
    if (!sendTargetQuote) return '';
    const net = sendTargetQuote.netPayableAfterSubsidy || (sendTargetQuote.grandTotal - (sendTargetQuote.subsidyAmount || 0));
    const emi = sendTargetQuote.loanDetails?.monthlyEMI || Math.round(net * 0.016);

    if (sendPitchType === 'subsidy') {
      return `☀️ *KYPAS SOLAR POWER PROPOSAL* ☀️\nDear *${sendTargetQuote.customerName}*,\n\nHere is your official *${sendTargetQuote.solarSystemCapacityKW} kWp Rooftop Solar Proposal* (${sendTargetQuote.quotationNumber}):\n💰 *Total Turnkey Cost:* ₹${sendTargetQuote.grandTotal.toLocaleString('en-IN')}\n🏛️ *PM Surya Ghar Subsidy:* -₹${(sendTargetQuote.subsidyAmount || 78000).toLocaleString('en-IN')} (Direct DBT)\n✅ *Net Payable by You:* *₹${net.toLocaleString('en-IN')}*\n\n⚡ *Monthly Electricity Savings:* ~₹${Math.round(sendTargetQuote.solarSystemCapacityKW * 130 * 8.2).toLocaleString('en-IN')} / month\n💳 *Zero-Down Solar Loan EMI:* from only *₹${emi} / month* at 7.0% subsidized interest!\n\n📄 *Download Official A4 PDF Proposal:*\nhttps://crm.kypassolar.com/proposals/${sendTargetQuote.quotationNumber.replace(/\//g, '-')}\n\nPlease reply *YES* to confirm engineering site survey & net-metering application.\n_KYPAS Solar Pro • Hyderabad_ 📞 ${settings?.phone || '+91 94900 11223'}`;
    }
    return `⚡ *SWITCH TO ZERO ELECTRICITY BILL WITH KYPAS SOLAR*\nDear *${sendTargetQuote.customerName}*,\n\nInvest zero from your pocket! With our *Collateral-Free Solar Loan*, your power bill savings exceed your loan installment from Month 1!\n• *System Size:* ${sendTargetQuote.solarSystemCapacityKW} kWp Rooftop\n• *Net System Cost:* ₹${net.toLocaleString('en-IN')} (After Subsidy)\n• *Subsidized Loan EMI:* ~₹${emi}/mo (84 Months @ 7% p.a.)\n• *Monthly Bill Savings:* ~₹${Math.round(sendTargetQuote.solarSystemCapacityKW * 130 * 8.2).toLocaleString('en-IN')}/mo\n\n✨ *Net Monthly Cashflow Gain:* *+₹${Math.max(0, Math.round(sendTargetQuote.solarSystemCapacityKW * 130 * 8.2) - emi).toLocaleString('en-IN')} / month in your pocket!*\n\n📄 *Review Official PDF Quote:*\nhttps://crm.kypassolar.com/proposals/${sendTargetQuote.quotationNumber.replace(/\//g, '-')}\n\n_KYPAS Solar • ${settings?.companyName}_`;
  };

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      const matchesSearch =
        q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customerMobile.includes(searchQuery) ||
        (q.projectLocation && q.projectLocation.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalVal = quotations.reduce((sum, q) => sum + q.grandTotal, 0);
    const approvedVal = quotations
      .filter((q) => q.status === 'Approved')
      .reduce((sum, q) => sum + q.grandTotal, 0);
    const avgSize = quotations.length > 0 ? (quotations.reduce((sum, q) => sum + q.solarSystemCapacityKW, 0) / quotations.length).toFixed(1) : '5.0';
    return {
      count: quotations.length,
      totalVal,
      approvedVal,
      avgSize,
    };
  }, [quotations]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/90 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                Quotation Management & Proposal Dispatch
              </h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                PM Surya Ghar Ready
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Create itemized solar proposals, send via WhatsApp & Email, customize live A4 PDF branding, and manage Bank, Loan, and Cash given-time milestones.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission('Quotations', 'create') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quotation</span>
            </button>
          )}

          <button
            onClick={() => handleOpenSendModal(selectedQuote || quotations[0])}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Dispatch Quotation to Customer via WhatsApp / Email"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Quotation</span>
          </button>

          <button
            onClick={() => {
              exportToExcel(
                filteredQuotations.map((q) => ({
                  'Quote Number': q.quotationNumber,
                  Version: `V${q.version}`,
                  'Customer Name': q.customerName,
                  Mobile: q.customerMobile,
                  Location: q.projectLocation,
                  'Capacity (kW)': q.solarSystemCapacityKW,
                  Subtotal: q.subtotal,
                  Subsidy: q.subsidyAmount || 0,
                  'Net Payable': q.netPayableAfterSubsidy || q.grandTotal,
                  Status: q.status,
                  'Valid Until': formatDate(q.validUntil),
                })),
                `KYPAS_Quotations_${new Date().toISOString().slice(0, 10)}`
              );
            }}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsPdfUploadOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Import Quotations from PDF or Excel"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Quotations Directory</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'directory' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {quotations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('edit-pdf')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'edit-pdf'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Edit PDF Studio (Live Customizer)</span>
          <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-400 text-slate-950">
            All Editable
          </span>
        </button>

        <button
          onClick={() => setActiveTab('financing-plans')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'financing-plans'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Loan, Bank & Cash Payment Milestones</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500 text-white">
            Given Time
          </span>
        </button>

        <button
          onClick={() => setActiveTab('official_pdf')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'official_pdf'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>10-Page Official Document</span>
        </button>
      </div>

      {/* VIEW 1: QUOTATIONS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Pipeline Value</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{formatINR(metrics.totalVal)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Approved Proposals</span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{formatINR(metrics.approvedVal)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Average System Size</span>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{metrics.avgSize} kWp</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-500 uppercase">Total Generated</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{metrics.count}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotations by quote ref #, customer name, mobile, location..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
            >
              <option value="all">All Quotation Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Under Discussion">Under Discussion</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Quotations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Quote Ref #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Grand Total</th>
                    <th className="py-3 px-4">Subsidy (DBT)</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {q.quotationNumber}
                        <span className="ml-1 text-[10px] text-slate-400 font-normal">v{q.version}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{q.customerName}</p>
                        <p className="text-[10px] text-slate-400">{q.customerMobile} • {q.projectLocation}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {q.solarSystemCapacityKW} kWp
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {formatINR(q.grandTotal)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">
                        - {formatINR(q.subsidyAmount || 78000)}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-600">
                        {formatINR(q.netPayableAfterSubsidy || (q.grandTotal - (q.subsidyAmount || 78000)))}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : q.status === 'Sent'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              handleSelectQuoteForEdit(q);
                              setActiveTab('edit-pdf');
                            }}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            title="Edit Proposal in Live PDF Studio"
                          >
                            Edit PDF
                          </button>
                          <button
                            onClick={() => handleOpenSendModal(q)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 rounded-lg cursor-pointer"
                            title="Dispatch via WhatsApp / Email"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateQuotation(q.id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                            title="Duplicate Quote"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              showConfirmDialog({
                                title: 'Delete Quotation',
                                message: `Are you sure you want to delete quotation ${q.quotationNumber}?`,
                                isDestructive: true,
                                onConfirm: () => deleteQuotation(q.id),
                              });
                            }}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-500 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EDIT PDF STUDIO (LIVE CUSTOMIZER) */}
      {activeTab === 'edit-pdf' && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
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

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedQuoteId}
                onChange={(e) => {
                  const q = quotations.find((quote) => quote.id === e.target.value);
                  if (q) handleSelectQuoteForEdit(q);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} - {q.customerName} ({q.solarSystemCapacityKW}kW)
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleOpenSendModal(selectedQuote || quotations[0])}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Quotation</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAllChanges}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={() => handleDownloadPdf('#a4-printable-document', quoteNumber)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Studio Grid: Left 5 cols (Customizer) | Right 7 cols (Live A4 Preview) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Customizer Panel */}
            <div className="lg:col-span-5 space-y-4 print:hidden">
              {/* Sub-tab navigation */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setCustomizerTab('branding')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    customizerTab === 'branding' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Logo & Company
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('client')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    customizerTab === 'client' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Customer & Site
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('bom')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    customizerTab === 'bom' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Line Items (BOM)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('financials')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    customizerTab === 'financials' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Subsidy & GST
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('financing')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    customizerTab === 'financing' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Loan / Bank / Cash
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab('terms')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    customizerTab === 'terms' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Terms & Signature
                </button>
              </div>

              {/* Sub-tab 1: Logo & Company */}
              {customizerTab === 'branding' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-blue-600" />
                    Company Logo & Header Letterhead
                  </h3>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Logo on Proposal</span>
                      <input
                        type="checkbox"
                        checked={showLogo}
                        onChange={(e) => setShowLogo(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Logo Size</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setLogoSize(size)}
                            className={`py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer border ${
                              logoSize === size ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload New Logo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={companyTagline}
                        onChange={(e) => setCompanyTagline(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">CIN</label>
                        <input
                          type="text"
                          value={companyCin}
                          onChange={(e) => setCompanyCin(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                        <input
                          type="text"
                          value={companyGstin}
                          onChange={(e) => setCompanyGstin(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Customer & Site */}
              {customizerTab === 'client' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Customer, Site & Document Reference
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quote Reference #</label>
                      <input
                        type="text"
                        value={quoteNumber}
                        onChange={(e) => setQuoteNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quote Date</label>
                      <input
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Mobile</label>
                      <input
                        type="text"
                        value={custMobile}
                        onChange={(e) => setCustMobile(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Installation Site Location</label>
                    <input
                      type="text"
                      value={projLocation}
                      onChange={(e) => setProjLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">DISCOM Consumer No.</label>
                      <input
                        type="text"
                        value={consumerNo}
                        onChange={(e) => setConsumerNo(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sanctioned Load (kW)</label>
                      <input
                        type="number"
                        value={sanctionedLoad}
                        onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Line Items (BOM) */}
              {customizerTab === 'bom' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                      Itemized Bill of Materials (BOM)
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {lineItems.map((item, idx) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[10px] text-slate-400">Item #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteLineItem(item.id)}
                            className="text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Qty</span>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(item.id, 'quantity', Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Unit</span>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateLineItem(item.id, 'unit', e.target.value)}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Rate (₹)</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Subsidy & GST */}
              {customizerTab === 'financials' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-blue-600" />
                    Financial Calculations, Subsidy & Net Payable
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">BOM Subtotal:</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{formatINR(bomSubtotal)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount (₹)</label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Rate (%)</label>
                        <input
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 dark:text-emerald-200">PM Surya Ghar Subsidy (DBT)</span>
                        <input
                          type="checkbox"
                          checked={showTaxes}
                          onChange={(e) => setShowTaxes(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                      </div>
                      <input
                        type="number"
                        value={subsidyAmount}
                        onChange={(e) => setSubsidyAmount(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-emerald-300 rounded-xl font-bold text-emerald-700"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex justify-between items-center">
                      <span className="font-black text-slate-900 dark:text-white">Net Payable by Client:</span>
                      <span className="text-xl font-black text-emerald-600">{formatINR(netPayable)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Loan / Bank / Cash */}
              {customizerTab === 'financing' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-blue-600" />
                    Payment Modes & Time Milestone Schedules
                  </h3>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Display Mode on Official PDF</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'All', label: 'All 3' },
                        { id: 'Bank', label: 'Bank' },
                        { id: 'Loan', label: 'Loan' },
                        { id: 'Cash', label: 'Cash' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedPaymentMode(m.id as any)}
                          className={`py-1.5 rounded-lg font-bold text-[11px] border cursor-pointer ${
                            selectedPaymentMode === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Bank Transfer Given-Time Milestones</span>
                    <input
                      type="text"
                      value={advanceDueTime}
                      onChange={(e) => setAdvanceDueTime(e.target.value)}
                      placeholder="Stage 1 Due Date"
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-[11px]"
                    />
                    <input
                      type="text"
                      value={dispatchDueTime}
                      onChange={(e) => setDispatchDueTime(e.target.value)}
                      placeholder="Stage 2 Due Date"
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-[11px]"
                    />
                    <input
                      type="text"
                      value={syncDueTime}
                      onChange={(e) => setSyncDueTime(e.target.value)}
                      placeholder="Stage 3 Due Date"
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-[11px]"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block">Subsidized Solar Loan (7.0%)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={bankPartner}
                        onChange={(e) => setBankPartner(e.target.value)}
                        placeholder="Bank Partner"
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-[11px]"
                      />
                      <input
                        type="number"
                        value={downPaymentPct}
                        onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                        placeholder="Down Payment %"
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 6: Terms & Signature */}
              {customizerTab === 'terms' && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Warranties, Commercial Exclusions & Signature
                  </h3>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Standard Payment Terms Text</label>
                    <textarea
                      rows={2}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes & Exclusions</label>
                    <textarea
                      rows={3}
                      value={notesAndExclusions}
                      onChange={(e) => setNotesAndExclusions(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Signatory Name</label>
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                      <input
                        type="text"
                        value={signatoryDesignation}
                        onChange={(e) => setSignatoryDesignation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Show Authorized Digital Seal</span>
                    <input
                      type="checkbox"
                      checked={showDigitalSeal}
                      onChange={(e) => setShowDigitalSeal(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Live A4 Preview */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div
                id="a4-printable-document"
                className="w-full max-w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl p-6 sm:p-10 rounded-2xl space-y-5 text-[11px] leading-relaxed select-text"
              >
                {/* Proposal Header */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-slate-950 gap-4">
                  <div className="flex items-start gap-3">
                    {showLogo && logoUrl && (
                      <div
                        className={`rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 ${
                          logoSize === 'small' ? 'w-12 h-12' : logoSize === 'large' ? 'w-20 h-20' : 'w-16 h-16'
                        }`}
                      >
                        <img src={logoUrl} alt={companyName} className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase">
                        {companyName}
                      </h2>
                      <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">{companyTagline}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                        CIN: {companyCin} • GSTIN: {companyGstin}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-600 space-y-0.5 max-w-[240px]">
                    <p className="font-bold text-slate-950">Corporate Office:</p>
                    <p className="truncate">{companyAddress}</p>
                    <p>Phone: <span className="font-semibold text-slate-900">{companyPhone}</span></p>
                    <p>Email: <span className="font-semibold text-slate-900">{companyEmail}</span></p>
                    <p className="text-blue-700 font-semibold">{companyWebsite}</p>
                  </div>
                </div>

                {/* Proposal Title & Metadata */}
                <div className="flex items-center justify-between py-2 border-b border-slate-200 text-xs">
                  <div>
                    <h3 className="text-sm font-black text-slate-950 tracking-tight">
                      TECHNO-COMMERCIAL SOLAR POWER PROPOSAL
                    </h3>
                    <p className="text-[10px] text-slate-500">Grid-Connected Solar Photovoltaic Plant with Net-Metering</p>
                  </div>
                  <div className="text-right text-[10px] space-y-0.5">
                    <p><span className="font-bold text-slate-950">Ref:</span> <span className="font-mono font-bold text-blue-700">{quoteNumber}</span></p>
                    <p><span className="font-bold text-slate-950">Date:</span> {formatDate(quoteDate)}</p>
                    <p><span className="font-bold text-slate-950">Valid:</span> {validityDays} Days</p>
                  </div>
                </div>

                {/* Customer Particulars & Plant Specs */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px]">
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-500 uppercase tracking-wider text-[9px]">Customer & Site Info</p>
                    <p className="font-black text-xs text-slate-950">{custName}</p>
                    <p><span className="text-slate-500">Mobile:</span> <span className="font-semibold">{custMobile}</span></p>
                    <p><span className="text-slate-500">Location:</span> {projLocation}</p>
                    <p><span className="text-slate-500">Consumer No:</span> <span className="font-mono">{consumerNo}</span> ({sanctionedLoad} kW Load)</p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-black text-slate-500 uppercase tracking-wider text-[9px]">System Configuration</p>
                    <p className="font-black text-xs text-blue-700">{systemCapacityKW} kWp Solar PV Plant</p>
                    <p><span className="text-slate-500">PV Modules:</span> {panelBrand} ({panelQuantity}x {panelWattage}W)</p>
                    <p><span className="text-slate-500">Solar Inverter:</span> {inverterBrand} {inverterCapacityKW} kW ({inverterPhase})</p>
                    <p><span className="text-slate-500">Structure:</span> {mountingStructure}</p>
                  </div>
                </div>

                {/* BOM Table */}
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
                      {lineItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-2.5 text-slate-500">{idx + 1}</td>
                          <td className="py-1.5 px-2.5 font-medium text-slate-900">{item.description}</td>
                          <td className="py-1.5 px-2 text-center font-bold">{item.quantity}</td>
                          <td className="py-1.5 px-2 text-center text-slate-500">{item.unit}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono">{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-950">
                            {Number(item.total).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary Box */}
                <div className="flex justify-end">
                  <div className="w-80 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">System BOM Subtotal:</span>
                      <span className="font-semibold">{formatINR(bomSubtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Promotional Discount:</span>
                        <span>- {formatINR(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Composite Solar GST ({taxRate}%):</span>
                      <span className="font-mono">{formatINR(gstAmount)}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-950">
                      <span>Total Turnkey Plant Cost:</span>
                      <span className="text-blue-700">{formatINR(grandTotal)}</span>
                    </div>
                    {showTaxes && netSubsidy > 0 && (
                      <div className="flex justify-between font-bold text-emerald-700 pt-0.5">
                        <span>Less: PM Surya Ghar Central DBT Subsidy:</span>
                        <span>- {formatINR(netSubsidy)}</span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t-2 border-slate-950 flex justify-between items-center font-black text-sm text-slate-950">
                      <span>Net Payable by Customer:</span>
                      <span className="text-emerald-700">{formatINR(netPayable)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Milestones Table with Given Times */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Payment Plans & Time-Bound Milestone Schedules
                    </h4>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      Given Time Schedule
                    </span>
                  </div>

                  {(selectedPaymentMode === 'All' || selectedPaymentMode === 'Bank') && (
                    <div className="space-y-1">
                      <p className="font-bold text-[10px] text-slate-900 flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-600" />
                        Option A: Direct Bank Transfer Milestones
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[9px]">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-950">Stage 1: Advance Token (20%)</p>
                          <p className="text-blue-700 font-bold font-mono">{formatINR((grandTotal * advancePct) / 100)}</p>
                          <p className="text-slate-500 mt-0.5 text-[8.5px]">Due: {advanceDueTime}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-950">Stage 2: Material Dispatch (60%)</p>
                          <p className="text-blue-700 font-bold font-mono">{formatINR((grandTotal * dispatchPct) / 100)}</p>
                          <p className="text-slate-500 mt-0.5 text-[8.5px]">Due: {dispatchDueTime}</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <p className="font-bold text-slate-950">Stage 3: Net Meter Sync (20%)</p>
                          <p className="text-blue-700 font-bold font-mono">{formatINR((grandTotal * syncPct) / 100)}</p>
                          <p className="text-slate-500 mt-0.5 text-[8.5px]">Due: {syncDueTime}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedPaymentMode === 'All' || selectedPaymentMode === 'Loan') && (
                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-[10px] text-indigo-900 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-indigo-600" />
                          Option B: Solar Rooftop Loan ({bankPartner})
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-700">
                          Subsidized Interest: {loanInterestRate}% p.a.
                        </span>
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-[9px]">
                        <div className="p-2 bg-white rounded-lg border border-indigo-200">
                          <p className="text-slate-500">Margin Money (Down Payment):</p>
                          <p className="font-black text-indigo-950 font-mono">{formatINR(downPaymentAmount)} ({downPaymentPct}%)</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-indigo-200">
                          <p className="text-slate-500">Loan Amount Financed:</p>
                          <p className="font-black text-indigo-950 font-mono">{formatINR(loanFinancedAmount)} ({100 - downPaymentPct}%)</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-indigo-200">
                          <p className="text-slate-500">Monthly EMI ({loanTenureYears} Years):</p>
                          <p className="font-black text-indigo-600 font-mono">{formatINR(calculatedEmi)} / mo</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-emerald-700 font-semibold">Net Monthly Cash Gain:</p>
                          <p className="font-black text-emerald-800 font-mono">+{formatINR(Math.max(0, netMonthlyGain))} / mo</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[8.5px] text-slate-500 bg-white p-1.5 rounded-lg border border-slate-200">
                        <span><strong>Disbursement Timeline:</strong> Tranche 1 (50%): {loanTranche1Due}</span>
                        <span>Tranche 2 (50%): {loanTranche2Due}</span>
                      </div>
                    </div>
                  )}

                  {(selectedPaymentMode === 'All' || selectedPaymentMode === 'Cash') && (
                    <div className="space-y-1 pt-1">
                      <p className="font-bold text-[10px] text-amber-900 flex items-center gap-1">
                        <Wallet className="w-3 h-3 text-amber-600" />
                        Option C: Cash Payment Schedule (Section 269ST Compliant)
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[8.5px] text-slate-600">
                        <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                          <p className="font-bold text-slate-900">Token Advance:</p>
                          <p className="text-slate-500">{cashTokenDue}</p>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                          <p className="font-bold text-slate-900">Dispatch Tranche:</p>
                          <p className="text-slate-500">{cashDispatchDue}</p>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-amber-200">
                          <p className="font-bold text-slate-900">Commissioning Tranche:</p>
                          <p className="text-slate-500">{cashCommissioningDue}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Energy & Financial ROI Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-[9px]">
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Est. Monthly Units</p>
                    <p className="font-black text-blue-700 text-xs mt-0.5">~{monthlyUnits} kWh</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Annual Savings</p>
                    <p className="font-black text-emerald-700 text-xs mt-0.5">{formatINR(annualSavings)}</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Payback Period</p>
                    <p className="font-black text-slate-950 text-xs mt-0.5">{paybackYears} Years</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-blue-100">
                    <p className="text-slate-500 font-bold uppercase text-[8px]">25-Yr Net Savings</p>
                    <p className="font-black text-blue-800 text-xs mt-0.5">{formatINR(twentyFiveYrSavings)}</p>
                  </div>
                </div>

                {/* Bank Account & Commercial Terms */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[9.5px]">
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Beneficiary Bank Details:</h5>
                    <p><span className="text-slate-500">Bank:</span> <span className="font-bold">{settings?.bankDetails?.bankName || 'State Bank of India'}</span></p>
                    <p><span className="text-slate-500">A/C No:</span> <span className="font-mono font-bold text-slate-950">{settings?.bankDetails?.accountNumber || '409823419082'}</span></p>
                    <p><span className="text-slate-500">IFSC:</span> <span className="font-mono font-bold">{settings?.bankDetails?.ifscCode || 'SBIN0004128'}</span></p>
                    <p><span className="text-slate-500">Branch:</span> {settings?.bankDetails?.branch || 'Kavuri Hills, Hyderabad'}</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Commercial Terms & Warranty:</h5>
                    <p className="text-slate-600 text-[9px] line-clamp-3">{notesAndExclusions}</p>
                  </div>
                </div>

                {/* Signatory & Digital Seal */}
                <div className="pt-6 flex items-end justify-between border-t border-slate-300 text-[10px]">
                  <div className="space-y-6">
                    <p className="font-bold text-slate-700">Client Acceptance Signature:</p>
                    <div className="w-44 border-b border-slate-400" />
                    <p className="text-[9px] text-slate-500">Name / Date: _____________________</p>
                  </div>

                  <div className="text-right space-y-4">
                    <p className="font-bold text-slate-950">For {companyName}</p>
                    {showDigitalSeal && (
                      <div className="ml-auto w-24 h-10 border border-blue-300 bg-blue-50/50 rounded-lg flex items-center justify-center text-[8px] font-bold text-blue-700 tracking-wider">
                        [DIGITAL SEAL]
                      </div>
                    )}
                    <div className="w-48 ml-auto border-b border-slate-400" />
                    <p className="font-bold text-slate-950">{signatoryName}</p>
                    <p className="text-[9px] text-slate-500">{signatoryDesignation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FINANCING PLANS & MILESTONE SCHEDULE HUB */}
      {activeTab === 'financing-plans' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-600" />
                Advanced Financing & Milestone Schedule Hub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed breakdown of Direct Bank Transfer, Solar Rooftop Loan (Collateral-Free Subsidized EMI), and Cash Payment terms with exact given-time milestones.
              </p>
            </div>
            <button
              onClick={() => handleOpenSendModal(selectedQuote || quotations[0])}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Payment Plan to Client</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Bank Transfer */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Bank Transfer (Milestones)</h3>
                  <p className="text-[10px] text-slate-500">Direct RTGS / NEFT / IMPS</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 1: 20% Advance</span>
                  <span className="text-blue-600 font-bold block">{formatINR((grandTotal * 20) / 100)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: Upon Work Order confirmation & site engineering survey</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 2: 60% Material Dispatch</span>
                  <span className="text-blue-600 font-bold block">{formatINR((grandTotal * 60) / 100)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: Within 7-10 Days (Prior to warehouse dispatch of panels & inverters)</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 3: 20% Testing & Sync</span>
                  <span className="text-blue-600 font-bold block">{formatINR((grandTotal * 20) / 100)}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: Within 21-25 Days (Upon net-meter synchronization & handover)</span>
                </div>
              </div>
            </div>

            {/* Card 2: Subsidized Solar Loan */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Subsidized Solar Loan</h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Collateral-Free @ 7.0% p.a.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loan Amount:</span>
                    <span className="font-bold text-indigo-950 dark:text-indigo-200">{formatINR(loanFinancedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Subsidized EMI:</span>
                    <span className="font-bold text-indigo-600">{formatINR(calculatedEmi)} / mo</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Monthly Power Savings:</span>
                    <span>~ {formatINR(monthlySavings)} / mo</span>
                  </div>
                  <div className="pt-1 border-t border-indigo-200 dark:border-indigo-800 flex justify-between font-black text-emerald-700 dark:text-emerald-300">
                    <span>Net Monthly Gain:</span>
                    <span>+{formatINR(Math.max(0, netMonthlyGain))} / mo</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                  <p>• <strong>Step 1:</strong> Digital KYC & Electricity Bill upload.</p>
                  <p>• <strong>Step 2:</strong> 15% Down Payment to KYPAS Solar.</p>
                  <p>• <strong>Step 3:</strong> Direct bank disbursement upon site delivery.</p>
                </div>
              </div>
            </div>

            {/* Card 3: Cash Payment */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Cash Payment Terms</h3>
                  <p className="text-[10px] text-slate-500">Section 269ST Compliant</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 1: Token Advance</span>
                  <span className="text-amber-600 font-bold block">{formatINR(Math.min(25000, grandTotal * 0.1))}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: {cashTokenDue}</span>
                </div>
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 2: Dispatch Tranche</span>
                  <span className="text-amber-600 font-bold block">{formatINR(Math.min(100000, grandTotal * 0.5))}</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: {cashDispatchDue}</span>
                </div>
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40">
                  <span className="font-bold text-slate-900 dark:text-white block">Milestone 3: Final Handover</span>
                  <span className="text-amber-600 font-bold block">Balance Cash / Cheque</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: {cashCommissioningDue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: 10-PAGE OFFICIAL PROPOSAL DOCUMENT */}
      {activeTab === 'official_pdf' && (
        <div className="space-y-4">
          <KypasOfficialProposalDocument data={DEFAULT_PROPOSAL_DATA} interactive={true} />
        </div>
      )}

      {/* SEND QUOTATION (WHATSAPP / EMAIL) MODAL */}
      {showSendModal && sendTargetQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Send Proposal: {sendTargetQuote.quotationNumber}
                </h3>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSendPitchType('subsidy')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  sendPitchType === 'subsidy' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                PM Surya Ghar Subsidy Pitch
              </button>
              <button
                type="button"
                onClick={() => setSendPitchType('loan')}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  sendPitchType === 'loan' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Zero-Down 7% Loan Pitch
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Message Preview
              </label>
              <textarea
                rows={9}
                readOnly
                value={getWhatsAppMessage()}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border rounded-xl font-mono text-[11px] leading-relaxed select-all"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500">Customer: {targetMobile}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`https://wa.me/91${targetMobile.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(getWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW QUOTATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Create New Solar Quotation
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Rapid Preset Package
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SOLAR_PRESETS.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => {
                        setSystemCapacityKW(pkg.capacityKW);
                        setSubsidyAmount(pkg.subsidyAmount);
                        setLineItems(pkg.lineItems);
                        addToast({ title: 'Package Selected', message: pkg.name, type: 'info' });
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-left hover:border-blue-500 cursor-pointer"
                    >
                      <p className="font-bold text-slate-900 dark:text-white">{pkg.capacityKW} kW System</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{formatINR(pkg.grossPrice)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Ramesh Naidu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    value={custMobile}
                    onChange={(e) => setCustMobile(e.target.value)}
                    placeholder="9848011223"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Installation Site</label>
                <input
                  type="text"
                  value={projLocation}
                  onChange={(e) => setProjLocation(e.target.value)}
                  placeholder="Kavuri Hills, Hyderabad"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!custName || !custMobile) {
                      addToast({ title: 'Missing Info', message: 'Customer Name and Mobile are required.', type: 'error' });
                      return;
                    }
                    const newQuoteRes = createQuotation({
                      date: new Date().toISOString(),
                      validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
                      customerId: `CUST-${Date.now().toString().slice(-4)}`,
                      customerName: custName,
                      customerMobile: custMobile,
                      customerEmail: custEmail,
                      projectLocation: projLocation,
                      solarSystemCapacityKW: systemCapacityKW,
                      panelBrand,
                      panelModel,
                      panelWattage,
                      panelQuantity,
                      inverterBrand,
                      inverterCapacityKW: systemCapacityKW,
                      inverterPhase,
                      mountingStructure,
                      lineItems,
                      subtotal: bomSubtotal,
                      discount,
                      taxRate,
                      taxAmount: gstAmount,
                      grandTotal,
                      subsidyAmount: netSubsidy,
                      netPayableAfterSubsidy: netPayable,
                      status: 'Draft',
                      paymentTerms,
                      notesAndExclusions,
                      signatoryName,
                      signatoryDesignation,
                      showDigitalSeal,
                      validityDays,
                      consumerNumber: consumerNo,
                      sanctionedLoadKW: sanctionedLoad,
                    });

                    if (newQuoteRes.success && newQuoteRes.quotationId) {
                      setSelectedQuoteId(newQuoteRes.quotationId);
                      setActiveTab('edit-pdf');
                      addToast({ title: 'Quotation Created', message: 'Opened in Live PDF Studio for customization.', type: 'success' });
                    }
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Create & Open Live Customizer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      {isPdfUploadOpen && (
        <PdfQuotationUploadModal
          isOpen={isPdfUploadOpen}
          onClose={() => setIsPdfUploadOpen(false)}
          onProposalLoaded={(loadedData) => {
            setCustName(loadedData.customerName);
            setCustMobile(loadedData.customerMobile);
            setProjLocation(loadedData.customerCity);
            setSystemCapacityKW(loadedData.systemSizeKW);
            setIsPdfUploadOpen(false);
            setActiveTab('edit-pdf');
          }}
        />
      )}
    </div>
  );
};
