import React, { useState, useRef } from 'react';
import {
  Sun,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Building,
  Award,
  Phone,
  Globe,
  Move,
  Edit3,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Sparkles,
  Hand,
  Type,
  Layers,
  Copy,
  FilePlus,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export interface PageWatermarkConfig {
  enabled: boolean;
  useCustom: boolean;
  mode: 'text' | 'image' | 'both';
  text: string;
  imageUrl: string;
  fontSize: number;
  imageWidth: number;
  opacity: number;
  rotation: number;
  position: 'center' | 'tiled' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  color: string;
}

export interface PageCustomImageOverlay {
  enabled: boolean;
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
  fit: 'contain' | 'cover' | 'fill';
  borderRadius: number;
  opacity: number;
  showBorder: boolean;
  caption: string;
}

export interface PageVisualConfig {
  pageNumber: number;
  title: string;
  backgroundImageUrl: string;
  showBackgroundImage: boolean;
  imageScale: number;
  imageFit: 'cover' | 'contain' | 'fill';
  imageOffsetX: number;
  imageOffsetY: number;
  imageOpacity: number;
  customImage: PageCustomImageOverlay;
  watermark: PageWatermarkConfig;
  showCustomTextOverlay: boolean;
  customHeading: string;
  customSubheading: string;
  customBadgeText: string;
  overlayCardY: number;
  overlayCardWidth: number;
}

export interface ProposalLogoConfig {
  url: string;
  showLogo: boolean;
  width: number;
  height: number;
  fit: 'contain' | 'cover';
}

export interface ElementTransform {
  x: number;
  y: number;
  scale?: number;
  width?: number;
  height?: number;
  fit?: 'contain' | 'cover' | 'fill';
  hidden?: boolean;
}

export interface TextStyleOverride {
  fontSize?: number;
  color?: string;
  bgColor?: string;
  uppercase?: boolean;
}

export interface FreeformCanvasElement {
  id: string;
  pageNumber: number;
  type: 'text' | 'image' | 'stamp';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  subtext?: string;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  imageUrl?: string;
}

export interface CustomAddedPage {
  pageNumber: number;
  title: string;
  subtitle: string;
  template: 'branded-blank' | 'photo-showcase' | 'custom-notes';
  bodyText: string;
  heroImageUrl?: string;
  secondImageUrl?: string;
}

export interface ProposalCanvasState {
  elementTransforms: Record<string, ElementTransform>;
  textOverrides: Record<string, string>;
  textStyles?: Record<string, TextStyleOverride>;
  imageOverrides: Record<string, string>;
  freeformElements: FreeformCanvasElement[];
  customPages?: CustomAddedPage[];
  hiddenPages?: number[];
}

export interface ProposalPageData {
  quotationNumber: string;
  date: string;
  customerName: string;
  customerMobile: string;
  customerCity: string;
  customerAddress?: string;
  consumerNumber?: string;
  sanctionedLoadKW?: number;
  systemSizeKW: number;
  panelBrand: string;
  panelModel: string;
  panelWattage: number;
  panelQuantity: number;
  inverterBrand: string;
  inverterCapacityKW: number;
  inverterPhase: string;
  structureDetails: string;
  freeServiceYears: number;
  offeringKit: string;
  rooftopSystemPrice: number;
  additionalCharges: number;
  deepCleanBrush: string;
  discount: number;
  gstRate: number;
  gstAmount: number;
  netPriceWithGST: number;
  subsidyAmount: number;
  netEffectivePrice: number;
  paymentTerms: {
    advancePct: number;
    advanceTime: string;
    dispatchPct: number;
    dispatchTime: string;
    netmeterPct: number;
    netmeterTime: string;
  };
  bankDetails: {
    companyName: string;
    bankName: string;
    branch: string;
    accountNo: string;
    ifsc: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    make: string;
    makeImageUrl?: string;
    qty: number | string;
    uom: string;
  }>;
  financing: {
    solarSystemPrice: number;
    downPaymentPct: number;
    downPaymentAmount: number;
    loanAmount: number;
    interestRate: number;
    processingFees: number;
    emiPlans: Array<{ months: number; emi: number }>;
  };
  warranty: {
    panelProductYears: number;
    panelProductionYears: number;
    inverterYears: number;
    structureDesignLifeYears: number;
    structureWarrantyYears: number;
    otherComponentsYears: number;
    plantPerformanceGuarantee: string;
  };
  termsAndConditions: string[];
  energyGuarantee: {
    systemKW: number;
    year1Units: number;
    years2to5UnitsPerYear: number;
    compensationPerUnit: number;
  };
  companyDetails: {
    name: string;
    tagline: string;
    address: string;
    phone1: string;
    phone2: string;
    email: string;
    website: string;
    cin?: string;
    gstin?: string;
  };
  logoConfig?: ProposalLogoConfig;
  globalWatermark?: PageWatermarkConfig;
  pageConfigs?: Record<number, PageVisualConfig>;
  canvasState?: ProposalCanvasState;
  pageTexts?: {
    coverBadgeText: string;
    coverTitlePrefix: string;
    showCoverCustomerCard: boolean;
    page5Title: string;
    paymentNote: string;
    page6Title: string;
    page7Title: string;
    page7Subtitle: string;
    documentsIndividual: string[];
    documentsPartnership: string[];
    documentsProprietorship: string[];
    documentsPvtLtd: string[];
    page8Title: string;
    termsTitle: string;
    page9Title: string;
    promiseTitle: string;
    promiseLines: string[];
    exampleLines: string[];
    guaranteeDetailsList: string[];
  };
}

export const DEFAULT_BOM_IMAGES: Record<number, string> = {
  0: '/assets/proposal-template/crops/bom-waaree.png',
  1: '/assets/proposal-template/crops/bom-polycab.png',
  2: '/assets/proposal-template/crops/bom-structure.png',
  3: '/assets/proposal-template/crops/bom-dcdb.png',
  4: '/assets/proposal-template/crops/bom-acdb.png',
  5: '/assets/proposal-template/crops/bom-polycab.png',
  6: '/assets/proposal-template/crops/bom-polycab.png',
  7: '/assets/proposal-template/crops/bom-la.png',
  8: '/assets/proposal-template/crops/bom-polycab.png',
};

// Speed-Place Asset Library for 1-click placement or swapping on any page
export const SPEED_PLACE_IMAGE_LIBRARY = [
  { label: 'KYPAS Crown Logo', url: '/assets/proposal-template/crops/kypas-header-logo.png', w: 150, h: 72 },
  { label: 'Waaree Logo', url: '/assets/proposal-template/crops/brand-waaree.png', w: 130, h: 55 },
  { label: 'Polycab Logo', url: '/assets/proposal-template/crops/bom-polycab.png', w: 130, h: 50 },
  { label: 'Tata Power Logo', url: '/assets/proposal-template/crops/brand-tatapower.png', w: 140, h: 58 },
  { label: 'Adani Solar Logo', url: '/assets/proposal-template/crops/brand-adani.png', w: 110, h: 65 },
  { label: 'Premier Energies', url: '/assets/proposal-template/crops/brand-premier.png', w: 140, h: 52 },
  { label: 'Eastman Logo', url: '/assets/proposal-template/crops/brand-eastman.png', w: 135, h: 68 },
  { label: 'ZAM Structure (Dual)', url: '/assets/proposal-template/crops/bom-structure.png', w: 170, h: 76 },
  { label: 'DCDB Box Photo', url: '/assets/proposal-template/crops/bom-dcdb.png', w: 100, h: 90 },
  { label: 'ACDB Box Photo', url: '/assets/proposal-template/crops/bom-acdb.png', w: 100, h: 90 },
  { label: 'Lightning Arrester', url: '/assets/proposal-template/crops/bom-la.png', w: 100, h: 95 },
  { label: 'Cleaning Brush Kit', url: '/assets/proposal-template/crops/p3-cleaning-kit.png', w: 140, h: 140 },
  { label: '6% Loan Stamp', url: '/assets/proposal-template/crops/p3-loan-stamp.png', w: 140, h: 120 },
  { label: 'Bifacial Solar Panel', url: '/assets/proposal-template/crops/p4-solar-panel-tall.png', w: 160, h: 310 },
  { label: 'Family Solar Photo', url: '/assets/proposal-template/crops/p1-family-clean.png', w: 280, h: 160 },
  { label: 'Solar Village Homes', url: '/assets/proposal-template/crops/p2-village-clean.png', w: 280, h: 160 },
  { label: 'Sunrise Solar Panels', url: '/assets/proposal-template/crops/page10-top-banner.png', w: 280, h: 120 },
];

export const createDefaultCanvasState = (): ProposalCanvasState => ({
  elementTransforms: {},
  textOverrides: {},
  textStyles: {},
  imageOverrides: {},
  freeformElements: [],
  customPages: [],
  hiddenPages: [],
});

export const createDefaultWatermark = (enabled = false): PageWatermarkConfig => ({
  enabled,
  useCustom: false,
  mode: 'text',
  text: 'KYPAS SOLAR POWER',
  imageUrl: '/assets/proposal-template/crops/kypas-header-logo.png',
  fontSize: 48,
  imageWidth: 200,
  opacity: 0.08,
  rotation: -32,
  position: 'center',
  color: '#0b4ea2',
});

export const createDefaultPageConfigs = (): Record<number, PageVisualConfig> => {
  const titles: Record<
    number,
    {
      title: string;
      bg: string;
      showBg: boolean;
      showOverlay: boolean;
      heading: string;
      sub: string;
      badge: string;
      y: number;
    }
  > = {
    1: {
      title: 'Page 1: Cover Page',
      bg: '/assets/proposal-template/page-01.png',
      showBg: false, // Now 100% decomposed into live editable & draggable images + text!
      showOverlay: true,
      heading: "LET'S BRING SUN INTO OUR LIVES & KEEP YOUR POWER AS SOLAR",
      sub: "Affordable rooftop Solar for all - it's not just a Dream, it's our Blueprint",
      badge: 'Keep Your Power As Solar',
      y: 34,
    },
    2: {
      title: 'Page 2: 1 Lakh Homes Mission',
      bg: '/assets/proposal-template/page-02.png',
      showBg: false, // Now 100% decomposed into live editable & draggable images + text!
      showOverlay: true,
      heading: 'Our target is to provide solar power to 1,00,000 Homes',
      sub: 'PM Surya Ghar Scheme',
      badge: 'National Solar Mission',
      y: 78,
    },
    3: {
      title: 'Page 3: Anti-Rust ZAM Structure',
      bg: '/assets/proposal-template/page-03.png',
      showBg: false, // Now 100% decomposed into live editable & draggable images + text!
      showOverlay: true,
      heading: 'Anti-Rust ZAM Structure',
      sub: 'with Self Healing TECHNOLOGY',
      badge: 'Cyclone Proof 160 km/h',
      y: 80,
    },
    4: {
      title: 'Page 4: ALMM Approved Brands',
      bg: '/assets/proposal-template/page-04.png',
      showBg: false, // Now 100% decomposed into live editable & draggable images + text!
      showOverlay: true,
      heading: 'Kypas Solar offering ALMM Brands',
      sub: 'HJT (Heterojunction Technology) Topcon BIFACIAL Solar Panels',
      badge: '30 Yrs Performance Warranty',
      y: 80,
    },
    5: {
      title: 'Page 5: Commercial Offer & Bank Details',
      bg: '/assets/proposal-template/page-05.png',
      showBg: false,
      showOverlay: false,
      heading: 'Our offer for you',
      sub: 'Turnkey EPC Commercial Proposal & Payment Milestones',
      badge: 'Commercial Offer',
      y: 10,
    },
    6: {
      title: 'Page 6: Bill of Materials (BOM)',
      bg: '/assets/proposal-template/page-06.png',
      showBg: false,
      showOverlay: false,
      heading: 'Bill of Material',
      sub: 'Complete Engineering Scope of Supply',
      badge: 'Technical BOM',
      y: 10,
    },
    7: {
      title: 'Page 7: Easy Financing & EMI Plans',
      bg: '/assets/proposal-template/page-07.png',
      showBg: false,
      showOverlay: false,
      heading: 'PM Surya Ghar / Jan Samarth Portal',
      sub: 'Easy financing from',
      badge: 'Solar Financing',
      y: 10,
    },
    8: {
      title: 'Page 8: Warranty & Terms',
      bg: '/assets/proposal-template/page-08.png',
      showBg: false,
      showOverlay: false,
      heading: 'Warranty & Services',
      sub: 'Comprehensive Warranty & Standard Terms',
      badge: '25-30 Yrs Protection',
      y: 10,
    },
    9: {
      title: 'Page 9: Assured Energy Savings',
      bg: '/assets/proposal-template/page-09.png',
      showBg: false,
      showOverlay: false,
      heading: 'KYPAS Solar : Assured Energy Savings',
      sub: 'Backed by ₹8/Unit Generation Shortfall Compensation',
      badge: 'Generation Guarantee',
      y: 10,
    },
    10: {
      title: 'Page 10: Contact Us & Back Cover',
      bg: '/assets/proposal-template/page-10.png',
      showBg: false, // Now 100% decomposed into live editable & draggable images + text!
      showOverlay: true,
      heading: 'KYPAS SOLAR POWER PRIVATE LIMITED',
      sub: 'Keep Your Power As Solar',
      badge: 'Corporate Head Office',
      y: 52,
    },
  };

  const configs: Record<number, PageVisualConfig> = {};
  for (let i = 1; i <= 10; i++) {
    const t = titles[i];
    configs[i] = {
      pageNumber: i,
      title: t.title,
      backgroundImageUrl: t.bg,
      showBackgroundImage: t.showBg,
      imageScale: 100,
      imageFit: 'cover',
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageOpacity: 0.15,
      customImage: {
        enabled: false,
        url: '',
        width: 180,
        height: 120,
        x: 70,
        y: 75,
        fit: 'contain',
        borderRadius: 12,
        opacity: 1,
        showBorder: true,
        caption: '',
      },
      watermark: createDefaultWatermark(false),
      showCustomTextOverlay: t.showOverlay,
      customHeading: t.heading,
      customSubheading: t.sub,
      customBadgeText: t.badge,
      overlayCardY: t.y,
      overlayCardWidth: 88,
    };
  }
  return configs;
};

export const DEFAULT_PROPOSAL_DATA: ProposalPageData = {
  quotationNumber: 'KYP/QT/26-27/041',
  date: '2025-06-10',
  customerName: 'Mr.varanasi kesanna',
  customerMobile: '+919849571791',
  customerCity: 'Anantapur',
  customerAddress: 'Near Sub-Station, Anantapur District, Andhra Pradesh',
  consumerNumber: 'AP-SPDCL-882194',
  sanctionedLoadKW: 3,
  systemSizeKW: 3,
  panelBrand: 'Waaree',
  panelModel: 'TOPCON BIFACIAL 585Wp SERIES',
  panelWattage: 585,
  panelQuantity: 5,
  inverterBrand: 'Polycab',
  inverterCapacityKW: 3,
  inverterPhase: 'Single Phase On-Grid',
  structureDetails: 'ZAM Structure with 25 Years Warranty',
  freeServiceYears: 5,
  offeringKit: 'FREE CLEANING BRUSH KIT',
  rooftopSystemPrice: 235000,
  additionalCharges: 0,
  deepCleanBrush: 'Included',
  discount: 10000,
  gstRate: 8.9,
  gstAmount: 18400,
  netPriceWithGST: 225000,
  subsidyAmount: 78000,
  netEffectivePrice: 147000,
  paymentTerms: {
    advancePct: 10,
    advanceTime: 'Advance at the time of Order',
    dispatchPct: 70,
    dispatchTime: 'On Material dispatch',
    netmeterPct: 20,
    netmeterTime: 'After Netmeter Installation',
  },
  bankDetails: {
    companyName: 'Kypas Solar Power Pvt Ltd',
    bankName: 'ICICI Bank',
    branch: 'Diamond point branch',
    accountNo: '068105002790',
    ifsc: 'ICIC0000681',
  },
  lineItems: [
    {
      id: 'B1',
      description: 'Solar Panel\nTOPCON BIFACIAL 585Wp SERIES',
      make: 'Waaree',
      makeImageUrl: '/assets/proposal-template/crops/bom-waaree.png',
      qty: 5,
      uom: 'Nos',
    },
    {
      id: 'B2',
      description: 'Solar Grid Tie Inverter\nSolar ON GRID 3KW INVERTER',
      make: 'Polycab',
      makeImageUrl: '/assets/proposal-template/crops/bom-polycab.png',
      qty: 1,
      uom: 'Nos',
    },
    {
      id: 'B3',
      description: 'Structure\nAnti-rust ZAM Structure, SOUTH 7 FEET AND NORTH 9 FEET',
      make: 'Kypas ZAM',
      makeImageUrl: '/assets/proposal-template/crops/bom-structure.png',
      qty: 'As per Req.',
      uom: 'Set',
    },
    {
      id: 'B4',
      description: 'DCDB\n1 Input 1 Output',
      make: 'Polycab',
      makeImageUrl: '/assets/proposal-template/crops/bom-dcdb.png',
      qty: 1,
      uom: 'Nos',
    },
    {
      id: 'B5',
      description: 'ACDB\n1 Input 1 Output',
      make: 'Polycab',
      makeImageUrl: '/assets/proposal-template/crops/bom-acdb.png',
      qty: 1,
      uom: 'Nos',
    },
    {
      id: 'B6',
      description: 'AC Cable\nInverter to ACDB: 2C x 4 sq.mm Cu. and ACDB to Mains: 4C x 6 sq.mm AL. Armoured',
      make: 'Polycab',
      makeImageUrl: '/assets/proposal-template/crops/bom-polycab.png',
      qty: 30,
      uom: 'Mtr',
    },
    {
      id: 'B7',
      description: 'DC Cable\n1C x 4 sq.mm Cu.',
      make: 'Polycab',
      makeImageUrl: '/assets/proposal-template/crops/bom-polycab.png',
      qty: 30,
      uom: 'Mtr',
    },
    {
      id: 'B8',
      description: 'Lightning Arrester\nAdvanced 2 feet 25m radius, 1.3 mtr Aluminium Earth Rod for LA',
      make: 'Advanced',
      makeImageUrl: '/assets/proposal-template/crops/bom-la.png',
      qty: 1,
      uom: 'Nos',
    },
    {
      id: 'B9',
      description: 'Earth Cable\n1C x 4 sq.mm Cu, 10 sq.mm AL for LA',
      make: 'Polycab',
      makeImageUrl: '/assets/proposal-template/crops/bom-polycab.png',
      qty: 100,
      uom: 'Mtr',
    },
  ],
  financing: {
    solarSystemPrice: 147000,
    downPaymentPct: 10,
    downPaymentAmount: 14700,
    loanAmount: 132300,
    interestRate: 6,
    processingFees: 0,
    emiPlans: [
      { months: 6, emi: 24500 },
      { months: 12, emi: 11387 },
      { months: 24, emi: 5864 },
      { months: 36, emi: 4025 },
      { months: 48, emi: 3107 },
      { months: 60, emi: 2558 },
      { months: 72, emi: 2193 },
      { months: 84, emi: 1933 },
    ],
  },
  warranty: {
    panelProductYears: 12,
    panelProductionYears: 30,
    inverterYears: 8,
    structureDesignLifeYears: 25,
    structureWarrantyYears: 25,
    otherComponentsYears: 5,
    plantPerformanceGuarantee: 'Applicable',
  },
  termsAndConditions: [
    '1. Please note that additional charges may apply for changes to your electricity bill, such as load, name, or phase adjustments.',
    '2. To process your application, please provide all necessary documents, including PAN card, Aadhaar card, and electricity bill.',
    '3. Customers opting for bank financing may need to submit extra documents as required by the financial institution.',
    "4. Delays due to missing or incomplete documents are not Kypas Solar's responsibility.",
    '5. Solar generation calculated based on location-specific deemed generation for Global Horizontal Irradiance.',
  ],
  energyGuarantee: {
    systemKW: 3,
    year1Units: 4200,
    years2to5UnitsPerYear: 16800,
    compensationPerUnit: 8,
  },
  companyDetails: {
    name: 'KYPAS SOLAR POWER PRIVATE LIMITED',
    tagline: 'Keep Your Power As Solar',
    address:
      'Beside BSNL Office, Plot no 102/1, Annapurna Enclave, Mallikarjun Residency, Block no 6, Chanda Nagar, Hyderabad 500050',
    phone1: '+91 8074870621',
    phone2: '9100522215',
    email: 'rajeevkypa@kypassolar.com',
    website: 'www.kypassolar.com',
    cin: 'U40106TG2023PTC174821',
    gstin: '36AAGCK9021M1ZX',
  },
  logoConfig: {
    url: '/assets/proposal-template/crops/kypas-header-logo.png',
    showLogo: true,
    width: 145,
    height: 68,
    fit: 'contain',
  },
  globalWatermark: createDefaultWatermark(false),
  pageConfigs: createDefaultPageConfigs(),
  canvasState: createDefaultCanvasState(),
  pageTexts: {
    coverBadgeText: 'Official Techno-Commercial Proposal',
    coverTitlePrefix: 'Prepared For:',
    showCoverCustomerCard: false,
    page5Title: 'Our offer for you',
    paymentNote: '*PAYMENT CAN BE PAID IN: NEFT/RTGS/UPI/CASH',
    page6Title: 'Bill of Material',
    page7Title: 'PM Surya Ghar / Jan Samarth Portal',
    page7Subtitle: 'Easy financing from',
    documentsIndividual: [
      '• PAN card and Aadhar card of a person',
      '• Recent Electricity bill',
      '• Bank Statement of salary credited account (6 Months)',
      '• ITR return of last 2 year / Form 16',
      '• Payslips of last 6 months',
      "• Applicant's email id and active mobile",
      '• Cancel cheque and passbook copy',
    ],
    documentsPartnership: [
      '• PAN & Aadhaar of all Partners',
      '• Partnership Deed',
      '• Financials of last 3 FY',
    ],
    documentsProprietorship: ['• 3 Years ITR returns', '• Balance Sheet and P&L'],
    documentsPvtLtd: [
      '• PAN & Aadhaar of all Directors',
      '• MOA & AOA, Shareholding',
      '• Financials of last 3 FY',
    ],
    page8Title: 'Warranty & Services',
    termsTitle: 'Terms and conditions',
    page9Title: 'KYPAS Solar : Assured Energy Savings',
    promiseTitle: 'Our Promise:',
    promiseLines: [
      'We guarantee the performance of your solar system.',
      "If it doesn't meet the expected energy output, we'll compensate you.",
    ],
    exampleLines: [
      "• If your system produces only 3000 units in Year 1, we'll pay you ₹9600.",
      "• If your system produces 16300 units in a year between 2 and 5, we'll pay you ₹4000.",
    ],
    guaranteeDetailsList: [
      'The final energy generation target is set after a thorough site assessment and your approval.',
      '"Lost units" are calculated as the difference between the guaranteed and actual output, excluding losses beyond our control.',
      "Extra energy produced in Year 1 is credited to the following year. The inverter's readings are the official measure of energy produced.",
      "We're not responsible for losses due to grid outages, Wi-Fi problems, site changes, weather events, or lack of maintenance.",
      'You must provide Wi-Fi access to the inverter.',
      'The guarantee starts after a 30-day system setup period.',
    ],
  },
};

// ============================================================================
// ============================================================================
// INTERACTIVE DRAGGABLE + INLINE EDITABLE PRIMITIVES (ALL PAGES 1 TO 10+)
// ============================================================================

interface ProposalCanvasContextValue {
  canvasZoom: number;
  textStyles: Record<string, TextStyleOverride>;
  onUpdateTextStyle?: (textKey: string, partial: Partial<TextStyleOverride> | null) => void;
  onResetTextValue?: (textKey: string) => void;
}

const ProposalCanvasContext = React.createContext<ProposalCanvasContextValue>({
  canvasZoom: 1,
  textStyles: {},
});

interface MovableBlockProps {
  blockId: string;
  interactive: boolean;
  manualMoveMode: boolean;
  transform?: ElementTransform;
  onUpdateTransform?: (blockId: string, next: ElementTransform) => void;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  children: React.ReactNode;
}

const MovableBlock: React.FC<MovableBlockProps> = ({
  blockId,
  interactive,
  manualMoveMode,
  transform,
  onUpdateTransform,
  className = '',
  style = {},
  label,
  children,
}) => {
  const { canvasZoom } = React.useContext(ProposalCanvasContext);
  const [isDragging, setIsDragging] = useState(false);
  const [localOffset, setLocalOffset] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  if (transform?.hidden) {
    if (!interactive) return null;
    return (
      <button
        type="button"
        data-html2canvas-ignore="true"
        onClick={e => {
          e.stopPropagation();
          onUpdateTransform?.(blockId, { ...transform, hidden: false });
        }}
        className="print:hidden pointer-events-auto px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 rounded text-[9px] font-bold cursor-pointer z-40"
      >
        + Restore {label || 'Block'}
      </button>
    );
  }

  const tx = localOffset ? localOffset.x : transform?.x || 0;
  const ty = localOffset ? localOffset.y : transform?.y || 0;
  const scale = transform?.scale || 1;
  const zoomFactor = canvasZoom || 1;

  const startDrag = (e: React.MouseEvent) => {
    if (!interactive || !onUpdateTransform) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: transform?.x || 0,
      origY: transform?.y || 0,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = (moveEvent.clientX - dragStartRef.current.startX) / zoomFactor;
      const dy = (moveEvent.clientY - dragStartRef.current.startY) / zoomFactor;
      setLocalOffset({
        x: Math.round(dragStartRef.current.origX + dx),
        y: Math.round(dragStartRef.current.origY + dy),
      });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (dragStartRef.current && onUpdateTransform) {
        const dx = (upEvent.clientX - dragStartRef.current.startX) / zoomFactor;
        const dy = (upEvent.clientY - dragStartRef.current.startY) / zoomFactor;
        onUpdateTransform(blockId, {
          ...transform,
          x: Math.round(dragStartRef.current.origX + dx),
          y: Math.round(dragStartRef.current.origY + dy),
        });
      }
      dragStartRef.current = null;
      setLocalOffset(null);
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const hasMoved = tx !== 0 || ty !== 0 || scale !== 1;

  return (
    <div
      onMouseDown={manualMoveMode ? startDrag : undefined}
      style={{
        ...style,
        transform: `${style.transform ? style.transform + ' ' : ''}translate(${tx}px, ${ty}px)${
          scale !== 1 ? ` scale(${scale})` : ''
        }`,
        zIndex: isDragging ? 60 : hasMoved ? 25 : style.zIndex,
      }}
      className={`group/movable pointer-events-auto relative transition-shadow ${
        interactive && manualMoveMode
          ? 'cursor-move hover:outline-2 hover:outline-dashed hover:outline-amber-500 rounded-lg'
          : interactive
          ? 'hover:outline-1 hover:outline-dashed hover:outline-blue-400/60 rounded'
          : ''
      } ${isDragging ? 'outline-2 outline-blue-600 shadow-2xl' : ''} ${className}`}
    >
      {/* Floating Drag Handle, Scale +/- & Reset Pill (Hidden during Print / PDF Download) */}
      {interactive && onUpdateTransform && (
        <div
          data-html2canvas-ignore="true"
          className={`print:hidden absolute -top-5 left-0 z-50 items-center gap-1 bg-slate-900/95 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-md select-none whitespace-nowrap ${
            isDragging ? 'flex' : 'hidden group-hover/movable:flex'
          }`}
        >
          <button
            type="button"
            onMouseDown={startDrag}
            className="flex items-center gap-1 cursor-move text-amber-300 hover:text-white"
            title="Hold & drag to move anywhere on page"
          >
            <Move className="w-2.5 h-2.5" />
            <span>{label || 'Move'}</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              const nextScale = Math.max(0.5, Number(((transform?.scale || 1) - 0.08).toFixed(2)));
              onUpdateTransform(blockId, { ...(transform || { x: 0, y: 0 }), scale: nextScale });
            }}
            className="px-1 text-slate-300 hover:text-white cursor-pointer"
            title="Scale block smaller"
          >
            -
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              const nextScale = Math.min(2.2, Number(((transform?.scale || 1) + 0.08).toFixed(2)));
              onUpdateTransform(blockId, { ...(transform || { x: 0, y: 0 }), scale: nextScale });
            }}
            className="px-1 text-slate-300 hover:text-white cursor-pointer"
            title="Scale block larger"
          >
            +
          </button>
          {hasMoved && (
            <>
              <span className="text-slate-400 font-mono">
                ({tx},{ty})
              </span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onUpdateTransform(blockId, { ...transform, x: 0, y: 0, scale: 1 });
                }}
                className="ml-0.5 text-emerald-300 hover:text-white cursor-pointer"
                title="Reset position & scale"
              >
                ↺
              </button>
            </>
          )}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onUpdateTransform(blockId, { ...(transform || { x: 0, y: 0 }), hidden: true });
            }}
            className="ml-1 text-rose-400 hover:text-rose-200 cursor-pointer"
            title="Hide this block"
          >
            ×
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

interface EditableTextProps {
  textKey: string;
  value: string | number;
  interactive: boolean;
  manualMoveMode: boolean;
  textOverrides?: Record<string, string>;
  onCommitText?: (textKey: string, newValue: string) => void;
  className?: string;
  style?: React.CSSProperties;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({
  textKey,
  value,
  interactive,
  manualMoveMode,
  textOverrides,
  onCommitText,
  className = '',
  style,
  as: Tag = 'span',
}) => {
  const { textStyles, onUpdateTextStyle, onResetTextValue } = React.useContext(ProposalCanvasContext);
  const [isFocused, setIsFocused] = useState(false);
  const elemRef = useRef<HTMLElement | null>(null);

  const resolvedValue =
    textOverrides && textOverrides[textKey] !== undefined
      ? textOverrides[textKey]
      : String(value ?? '');

  const customStyle = textStyles?.[textKey];
  const mergedStyle: React.CSSProperties = {
    ...style,
    ...(customStyle?.fontSize ? { fontSize: `${customStyle.fontSize}px`, lineHeight: 1.2 } : {}),
    ...(customStyle?.color ? { color: customStyle.color } : {}),
    ...(customStyle?.bgColor
      ? {
          backgroundColor: customStyle.bgColor,
          paddingLeft: '6px',
          paddingRight: '6px',
          borderRadius: '4px',
        }
      : {}),
    ...(customStyle?.uppercase ? { textTransform: 'uppercase' } : {}),
  };

  React.useEffect(() => {
    if (!isFocused && elemRef.current && elemRef.current.innerText !== resolvedValue) {
      elemRef.current.innerText = resolvedValue;
    }
  }, [resolvedValue, isFocused]);

  if (!interactive || manualMoveMode || !onCommitText) {
    return (
      <Tag className={className} style={mergedStyle}>
        {resolvedValue}
      </Tag>
    );
  }

  return (
    <span className="relative inline">
      <Tag
        ref={elemRef as any}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={e => {
          setIsFocused(false);
          const nextText = e.currentTarget.innerText;
          if (nextText !== resolvedValue) {
            onCommitText(textKey, nextText);
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        title="Click to edit text or style (Font size, Color, Highlight)"
        style={mergedStyle}
        className={`outline-none focus:ring-2 focus:ring-blue-500 focus:bg-amber-50/95 focus:text-slate-950 focus:px-1 focus:rounded hover:bg-blue-500/10 rounded-xs transition-colors cursor-text ${className}`}
      >
        {resolvedValue}
      </Tag>

      {/* Floating Rich Text Mini-Toolbar when focused */}
      {isFocused && onUpdateTextStyle && (
        <div
          data-html2canvas-ignore="true"
          onMouseDown={e => {
            // Prevent blur when clicking toolbar buttons
            e.preventDefault();
            e.stopPropagation();
          }}
          className="print:hidden absolute -top-8 left-0 z-[95] flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-lg shadow-2xl border border-slate-700 text-[10px] font-bold whitespace-nowrap select-none"
        >
          <button
            type="button"
            onClick={() => {
              const curr = customStyle?.fontSize || 16;
              onUpdateTextStyle(textKey, { fontSize: Math.max(9, curr - 2) });
            }}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 cursor-pointer"
            title="Decrease Font Size"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => {
              const curr = customStyle?.fontSize || 16;
              onUpdateTextStyle(textKey, { fontSize: Math.min(84, curr + 2) });
            }}
            className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 cursor-pointer"
            title="Increase Font Size"
          >
            A+
          </button>
          <span className="text-slate-600">|</span>
          {[
            { c: '#f26522', lbl: 'KYPAS Orange' },
            { c: '#0b4ea2', lbl: 'Royal Blue' },
            { c: '#0f172a', lbl: 'Dark Slate' },
            { c: '#ffffff', lbl: 'White' },
            { c: '#fff200', lbl: 'Solar Yellow' },
            { c: '#059669', lbl: 'Emerald Green' },
          ].map(sw => (
            <button
              key={sw.c}
              type="button"
              onClick={() => onUpdateTextStyle(textKey, { color: sw.c })}
              style={{ backgroundColor: sw.c }}
              className="w-3.5 h-3.5 rounded-full border border-white/60 hover:scale-110 transition-transform cursor-pointer"
              title={`Text Color: ${sw.lbl}`}
            />
          ))}
          <span className="text-slate-600">|</span>
          <button
            type="button"
            onClick={() =>
              onUpdateTextStyle(textKey, {
                bgColor: customStyle?.bgColor ? undefined : '#fffbeb',
              })
            }
            className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 rounded cursor-pointer"
            title="Toggle Highlight Pill"
          >
            Bg
          </button>
          <button
            type="button"
            onClick={() => {
              onUpdateTextStyle(textKey, null);
              onResetTextValue?.(textKey);
            }}
            className="px-1.5 py-0.5 bg-rose-950 hover:bg-rose-800 text-rose-300 rounded cursor-pointer"
            title="Reset text & style to default"
          >
            ↺
          </button>
        </div>
      )}
    </span>
  );
};

interface EditableImageBoxProps {
  imageKey: string;
  defaultUrl: string;
  alt: string;
  width: number;
  height: number;
  fit?: 'contain' | 'cover' | 'fill';
  interactive: boolean;
  manualMoveMode: boolean;
  imageOverrides?: Record<string, string>;
  transform?: ElementTransform;
  onCommitImage?: (imageKey: string, dataUrl: string) => void;
  onUpdateTransform?: (imageKey: string, next: ElementTransform) => void;
  className?: string;
}

const EditableImageBox: React.FC<EditableImageBoxProps> = ({
  imageKey,
  defaultUrl,
  alt,
  width,
  height,
  fit = 'contain',
  interactive,
  manualMoveMode,
  imageOverrides,
  transform,
  onCommitImage,
  onUpdateTransform,
  className = '',
}) => {
  const { canvasZoom } = React.useContext(ProposalCanvasContext);
  const [showPopover, setShowPopover] = useState(false);
  const [isDraggingImg, setIsDraggingImg] = useState(false);
  const [isResizingImg, setIsResizingImg] = useState(false);
  const [localOffset, setLocalOffset] = useState<{ x: number; y: number } | null>(null);
  const [localSize, setLocalSize] = useState<{ w: number; h: number } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeStartRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUrl =
    imageOverrides && imageOverrides[imageKey] !== undefined
      ? imageOverrides[imageKey]
      : defaultUrl;

  const actualW = localSize ? localSize.w : transform?.width || width;
  const actualH = localSize ? localSize.h : transform?.height || height;
  const actualFit = transform?.fit || fit;
  const scale = transform?.scale || 1;
  const tx = localOffset ? localOffset.x : transform?.x || 0;
  const ty = localOffset ? localOffset.y : transform?.y || 0;
  const zoomFactor = canvasZoom || 1;

  // Large/banner images keep their toolbar and popover INSIDE the image frame so nothing clips!
  const isLargeBanner = actualH >= 140 || actualW >= 400;

  if (transform?.hidden) {
    if (!interactive) return null;
    return (
      <button
        type="button"
        data-html2canvas-ignore="true"
        onClick={e => {
          e.stopPropagation();
          onUpdateTransform?.(imageKey, { ...transform, hidden: false });
        }}
        className="print:hidden pointer-events-auto px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-[9px] font-bold text-slate-600 border border-dashed border-slate-300 cursor-pointer z-30"
      >
        + Restore {alt}
      </button>
    );
  }

  const startImageDrag = (e: React.MouseEvent) => {
    if (!interactive || !onUpdateTransform) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingImg(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: transform?.x || 0,
      origY: transform?.y || 0,
    };

    const handleMove = (mv: MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = (mv.clientX - dragStartRef.current.startX) / zoomFactor;
      const dy = (mv.clientY - dragStartRef.current.startY) / zoomFactor;
      setLocalOffset({
        x: Math.round(dragStartRef.current.origX + dx),
        y: Math.round(dragStartRef.current.origY + dy),
      });
    };

    const handleUp = (up: MouseEvent) => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      if (dragStartRef.current && onUpdateTransform) {
        const dx = (up.clientX - dragStartRef.current.startX) / zoomFactor;
        const dy = (up.clientY - dragStartRef.current.startY) / zoomFactor;
        onUpdateTransform(imageKey, {
          ...(transform || { x: 0, y: 0 }),
          width: actualW,
          height: actualH,
          fit: actualFit,
          x: Math.round(dragStartRef.current.origX + dx),
          y: Math.round(dragStartRef.current.origY + dy),
        });
      }
      dragStartRef.current = null;
      setLocalOffset(null);
      setIsDraggingImg(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const startCornerResize = (e: React.MouseEvent) => {
    if (!interactive || !onUpdateTransform) return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizingImg(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: actualW,
      origH: actualH,
    };

    const handleMove = (mv: MouseEvent) => {
      if (!resizeStartRef.current) return;
      const dw = (mv.clientX - resizeStartRef.current.startX) / zoomFactor;
      const dh = (mv.clientY - resizeStartRef.current.startY) / zoomFactor;
      setLocalSize({
        w: Math.max(28, Math.min(794, Math.round(resizeStartRef.current.origW + dw))),
        h: Math.max(20, Math.min(1123, Math.round(resizeStartRef.current.origH + dh))),
      });
    };

    const handleUp = (up: MouseEvent) => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      if (resizeStartRef.current && onUpdateTransform) {
        const dw = (up.clientX - resizeStartRef.current.startX) / zoomFactor;
        const dh = (up.clientY - resizeStartRef.current.startY) / zoomFactor;
        onUpdateTransform(imageKey, {
          ...(transform || { x: tx, y: ty }),
          x: tx,
          y: ty,
          fit: actualFit,
          width: Math.max(28, Math.min(794, Math.round(resizeStartRef.current.origW + dw))),
          height: Math.max(20, Math.min(1123, Math.round(resizeStartRef.current.origH + dh))),
        });
      }
      resizeStartRef.current = null;
      setLocalSize(null);
      setIsResizingImg(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCommitImage) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCommitImage(imageKey, reader.result);
        setShowPopover(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        transform: `translate(${tx}px, ${ty}px)${scale !== 1 ? ` scale(${scale})` : ''}`,
        zIndex: isDraggingImg || isResizingImg || showPopover ? 80 : tx !== 0 || ty !== 0 ? 25 : undefined,
      }}
      className={`relative inline-flex items-center justify-center group/img pointer-events-auto ${className}`}
    >
      {/* Direct Image Drag + Edit Action Bar on Hover (Positioned inside for large banners so it never clips!) */}
      {interactive && (
        <div
          data-html2canvas-ignore="true"
          className={`print:hidden absolute ${
            isLargeBanner ? 'top-2 right-2' : '-top-5 left-0'
          } z-50 items-center gap-1 bg-blue-950/95 text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-lg border border-blue-400/30 select-none whitespace-nowrap ${
            isDraggingImg || isResizingImg || showPopover ? 'flex' : 'hidden group-hover/img:flex'
          }`}
        >
          <button
            type="button"
            onMouseDown={startImageDrag}
            className="flex items-center gap-0.5 cursor-move text-amber-300 hover:text-white"
            title="Hold & drag to move this image anywhere"
          >
            <Move className="w-2.5 h-2.5" />
            <span>Drag Img</span>
          </button>
          <span className="text-slate-500">|</span>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setShowPopover(prev => !prev);
            }}
            className="text-blue-300 hover:text-white cursor-pointer flex items-center gap-0.5"
          >
            <Upload className="w-2.5 h-2.5" /> Replace / Resize
          </button>
          {(tx !== 0 || ty !== 0 || actualW !== width || actualH !== height || currentUrl !== defaultUrl) && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onCommitImage?.(imageKey, defaultUrl);
                onUpdateTransform?.(imageKey, { x: 0, y: 0, width, height, fit, scale: 1 });
              }}
              className="ml-0.5 text-emerald-300 hover:text-white cursor-pointer"
              title="Reset image size & position"
            >
              ↺
            </button>
          )}
        </div>
      )}

      <div
        onMouseDown={manualMoveMode ? startImageDrag : undefined}
        onClick={e => {
          if (!interactive || manualMoveMode) return;
          e.stopPropagation();
          setShowPopover(prev => !prev);
        }}
        style={{
          width: `${actualW}px`,
          height: `${actualH}px`,
        }}
        className={`relative flex items-center justify-center overflow-hidden ${
          interactive && manualMoveMode
            ? 'cursor-move hover:ring-2 hover:ring-amber-500 rounded-md'
            : interactive
            ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-md transition-all'
            : ''
        }`}
        title={
          interactive
            ? manualMoveMode
              ? 'Drag to move image'
              : `Click "${alt}" to Replace, Swap, Resize or Drag`
            : alt
        }
      >
        <img
          src={currentUrl}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: actualFit }}
          className="select-none pointer-events-none"
        />

        {/* Bottom-Right Live Mouse Corner Resize Handle */}
        {interactive && onUpdateTransform && (
          <div
            data-html2canvas-ignore="true"
            onMouseDown={startCornerResize}
            onClick={e => e.stopPropagation()}
            title="Drag corner to resize image width & height"
            className={`print:hidden absolute bottom-1 right-1 z-40 w-4 h-4 rounded bg-blue-600 text-white text-[9px] font-black items-center justify-center cursor-nwse-resize shadow border border-white ${
              isResizingImg || showPopover ? 'flex' : 'hidden group-hover/img:flex'
            }`}
          >
            ↘
          </div>
        )}
      </div>

      {/* Direct In-Place Image Edit, Quick-Swap & Resize Popover (Never clipped!) */}
      {interactive && showPopover && (
        <div
          data-html2canvas-ignore="true"
          onClick={e => e.stopPropagation()}
          className={`print:hidden absolute ${
            isLargeBanner
              ? 'top-9 right-2'
              : 'top-full left-1/2 -translate-x-1/2 mt-1.5'
          } z-[90] w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 text-[10px] space-y-2.5`}
        >
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
            <span className="font-black text-amber-300 truncate">{alt}</span>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <Upload className="w-3 h-3" /> Upload New Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                onCommitImage?.(imageKey, defaultUrl);
                onUpdateTransform?.(imageKey, { x: 0, y: 0, width, height, fit, scale: 1 });
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
              title="Reset image to original"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateTransform?.(imageKey, {
                  ...(transform || { x: 0, y: 0 }),
                  width: actualW,
                  height: actualH,
                  fit: actualFit,
                  hidden: true,
                });
                setShowPopover(false);
              }}
              className="p-1.5 bg-rose-950 hover:bg-rose-700 rounded-lg text-rose-300 cursor-pointer"
              title="Hide image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Width & Height Sliders */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Width:</span>
              <span className="font-mono font-bold text-blue-300">{actualW}px</span>
            </div>
            <input
              type="range"
              min={30}
              max={794}
              value={actualW}
              onChange={e =>
                onUpdateTransform?.(imageKey, {
                  ...(transform || { x: 0, y: 0 }),
                  width: Number(e.target.value),
                  height: actualH,
                  fit: actualFit,
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Height:</span>
              <span className="font-mono font-bold text-blue-300">{actualH}px</span>
            </div>
            <input
              type="range"
              min={20}
              max={900}
              value={actualH}
              onChange={e =>
                onUpdateTransform?.(imageKey, {
                  ...(transform || { x: 0, y: 0 }),
                  width: actualW,
                  height: Number(e.target.value),
                  fit: actualFit,
                })
              }
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Image Fit Mode Selector */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-slate-400">Image Fit:</span>
            <div className="flex items-center gap-1">
              {(['contain', 'cover', 'fill'] as const).map(fMode => (
                <button
                  key={fMode}
                  type="button"
                  onClick={() =>
                    onUpdateTransform?.(imageKey, {
                      ...(transform || { x: 0, y: 0 }),
                      width: actualW,
                      height: actualH,
                      fit: fMode,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer ${
                    actualFit === fMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {fMode}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Swap Gallery */}
          <div className="pt-1 border-t border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 block mb-1">
              Quick Swap from Brand / Solar Library:
            </span>
            <div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto pr-1">
              {SPEED_PLACE_IMAGE_LIBRARY.map(asset => (
                <button
                  key={asset.label}
                  type="button"
                  onClick={() => {
                    onCommitImage?.(imageKey, asset.url);
                    setShowPopover(false);
                  }}
                  className="p-1 bg-white rounded hover:ring-2 hover:ring-blue-400 flex flex-col items-center justify-center cursor-pointer"
                  title={asset.label}
                >
                  <img
                    src={asset.url}
                    alt={asset.label}
                    className="h-6 w-full object-contain"
                  />
                  <span className="text-[7px] text-slate-800 font-bold truncate w-full text-center mt-0.5">
                    {asset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HELPER LAYERS: BACKGROUND IMAGE, CUSTOM FLOATING IMAGE, & PAGE WATERMARK
// ============================================================================

const PageBackgroundLayer: React.FC<{ config: PageVisualConfig }> = ({ config }) => {
  if (!config.showBackgroundImage || !config.backgroundImageUrl) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <img
        src={config.backgroundImageUrl}
        alt={config.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: config.imageFit,
          opacity: config.imageOpacity,
          transform: `translate(${config.imageOffsetX}px, ${config.imageOffsetY}px) scale(${
            config.imageScale / 100
          })`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
};

const PageCustomImageLayer: React.FC<{
  config: PageVisualConfig;
}> = ({ config }) => {
  const { customImage } = config;
  if (!customImage?.enabled || !customImage?.url) return null;

  return (
    <div
      className="absolute z-20 flex flex-col items-center"
      style={{
        left: `${customImage.x}%`,
        top: `${customImage.y}%`,
        opacity: customImage.opacity,
      }}
    >
      <div
        style={{
          width: `${customImage.width}px`,
          height: `${customImage.height}px`,
          borderRadius: `${customImage.borderRadius}px`,
        }}
        className={`overflow-hidden bg-white/90 ${
          customImage.showBorder ? 'border-2 border-slate-300 shadow-lg' : ''
        }`}
      >
        <img
          src={customImage.url}
          alt={customImage.caption || 'Custom visual'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: customImage.fit,
          }}
        />
      </div>
      {customImage.caption && (
        <span className="mt-1 px-2 py-0.5 bg-white/90 text-slate-800 text-[9px] font-bold rounded shadow-xs">
          {customImage.caption}
        </span>
      )}
    </div>
  );
};

const PageWatermarkLayer: React.FC<{
  globalWatermark: PageWatermarkConfig;
  pageWatermark: PageWatermarkConfig;
}> = ({ globalWatermark, pageWatermark }) => {
  const isEnabled = pageWatermark.useCustom ? pageWatermark.enabled : globalWatermark.enabled;
  if (!isEnabled) return null;

  const wm = pageWatermark.useCustom ? pageWatermark : globalWatermark;

  const renderSingleStamp = (key?: string | number) => (
    <div
      key={key}
      className="flex flex-col items-center justify-center select-none pointer-events-none"
      style={{
        transform: `rotate(${wm.rotation}deg)`,
        opacity: wm.opacity,
      }}
    >
      {(wm.mode === 'image' || wm.mode === 'both') && wm.imageUrl && (
        <img
          src={wm.imageUrl}
          alt="Watermark"
          style={{
            width: `${wm.imageWidth}px`,
            height: 'auto',
            objectFit: 'contain',
          }}
          className="mb-2"
        />
      )}
      {(wm.mode === 'text' || wm.mode === 'both') && wm.text && (
        <span
          style={{
            fontSize: `${wm.fontSize}px`,
            color: wm.color || '#0b4ea2',
            lineHeight: 1.1,
          }}
          className="font-black uppercase tracking-widest text-center whitespace-nowrap"
        >
          {wm.text}
        </span>
      )}
    </div>
  );

  if (wm.position === 'tiled') {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden grid grid-cols-2 grid-rows-4 place-items-center p-8">
        {Array.from({ length: 8 }).map((_, idx) => renderSingleStamp(idx))}
      </div>
    );
  }

  const posClasses: Record<string, string> = {
    center: 'inset-0 flex items-center justify-center',
    'top-right': 'top-12 right-12 flex items-start justify-end',
    'bottom-right': 'bottom-16 right-12 flex items-end justify-end',
    'top-left': 'top-12 left-12 flex items-start justify-start',
    'bottom-left': 'bottom-16 left-12 flex items-end justify-start',
  };

  return (
    <div
      className={`absolute z-30 pointer-events-none ${
        posClasses[wm.position] || posClasses.center
      }`}
    >
      {renderSingleStamp()}
    </div>
  );
};

// Official Royal Blue Bottom Footer Bar matching All Pages
const OfficialBlueFooterBar: React.FC<{
  pageNum: number;
  website: string;
  phone: string;
  interactive: boolean;
  manualMoveMode: boolean;
  textOverrides?: Record<string, string>;
  transforms?: Record<string, ElementTransform>;
  onCommitText?: (key: string, val: string) => void;
  onUpdateTransform?: (id: string, next: ElementTransform) => void;
  noNegativeMargin?: boolean;
}> = ({
  pageNum,
  website,
  phone,
  interactive,
  manualMoveMode,
  textOverrides,
  transforms,
  onCommitText,
  onUpdateTransform,
  noNegativeMargin = false,
}) => (
  <MovableBlock
    blockId={`p${pageNum}-footer`}
    interactive={interactive}
    manualMoveMode={manualMoveMode}
    transform={transforms?.[`p${pageNum}-footer`]}
    onUpdateTransform={onUpdateTransform}
    label="Footer Bar"
    className={`relative z-20 bg-[#0b4ea2] text-white ${
      noNegativeMargin ? 'w-full px-10 py-3.5' : '-mx-10 -mb-10 px-10 py-3.5'
    } flex items-center justify-between text-sm font-bold`}
  >
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-white text-[#f26522] flex items-center justify-center shrink-0">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <EditableText
        textKey="company.website"
        value={website}
        interactive={interactive}
        manualMoveMode={manualMoveMode}
        textOverrides={textOverrides}
        onCommitText={onCommitText}
      />
    </div>
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-white text-[#f26522] flex items-center justify-center shrink-0">
        <Phone className="w-3.5 h-3.5" />
      </div>
      <EditableText
        textKey="company.phone1"
        value={phone}
        interactive={interactive}
        manualMoveMode={manualMoveMode}
        textOverrides={textOverrides}
        onCommitText={onCommitText}
      />
    </div>
  </MovableBlock>
);

// Official Top Header with Centered Orange/Blue Title + Top-Right KYPAS SOLAR Crown Logo
const OfficialCenteredPageHeader: React.FC<{
  pageNum: number;
  orangePart: string;
  bluePart?: string;
  orangeKey: string;
  blueKey?: string;
  logoConfig: ProposalLogoConfig;
  interactive: boolean;
  manualMoveMode: boolean;
  textOverrides?: Record<string, string>;
  imageOverrides?: Record<string, string>;
  transforms?: Record<string, ElementTransform>;
  onCommitText?: (key: string, val: string) => void;
  onCommitImage?: (key: string, url: string) => void;
  onUpdateTransform?: (id: string, next: ElementTransform) => void;
}> = ({
  pageNum,
  orangePart,
  bluePart,
  orangeKey,
  blueKey,
  logoConfig,
  interactive,
  manualMoveMode,
  textOverrides,
  imageOverrides,
  transforms,
  onCommitText,
  onCommitImage,
  onUpdateTransform,
}) => (
  <div className="relative flex items-center justify-between min-h-[76px] pb-2">
    <div className="w-[140px] shrink-0" />

    <MovableBlock
      blockId={`p${pageNum}-header-title`}
      interactive={interactive}
      manualMoveMode={manualMoveMode}
      transform={transforms?.[`p${pageNum}-header-title`]}
      onUpdateTransform={onUpdateTransform}
      label="Page Title"
      className="flex-1 text-center"
    >
      <h1 className="text-[24px] font-black tracking-tight leading-tight">
        <EditableText
          textKey={orangeKey}
          value={orangePart}
          interactive={interactive}
          manualMoveMode={manualMoveMode}
          textOverrides={textOverrides}
          onCommitText={onCommitText}
          className="text-[#f26522]"
        />
        {bluePart !== undefined && (
          <>
            {' '}
            <EditableText
              textKey={blueKey || `${orangeKey}.blue`}
              value={bluePart}
              interactive={interactive}
              manualMoveMode={manualMoveMode}
              textOverrides={textOverrides}
              onCommitText={onCommitText}
              className="text-[#0b4ea2]"
            />
          </>
        )}
      </h1>
    </MovableBlock>

    <MovableBlock
      blockId={`p${pageNum}-header-logo`}
      interactive={interactive}
      manualMoveMode={manualMoveMode}
      transform={transforms?.[`p${pageNum}-header-logo`]}
      onUpdateTransform={onUpdateTransform}
      label="Brand Logo"
      className="w-[145px] flex justify-end shrink-0"
    >
      {logoConfig.showLogo && (
        <EditableImageBox
          imageKey={`p${pageNum}.logo`}
          defaultUrl={logoConfig.url || '/assets/proposal-template/crops/kypas-header-logo.png'}
          alt="KYPAS Solar Logo"
          width={logoConfig.width || 145}
          height={logoConfig.height || 68}
          fit={logoConfig.fit || 'contain'}
          interactive={interactive}
          manualMoveMode={manualMoveMode}
          imageOverrides={imageOverrides}
          transform={transforms?.[`p${pageNum}.logo`]}
          onCommitImage={onCommitImage}
          onUpdateTransform={onUpdateTransform}
        />
      )}
    </MovableBlock>
  </div>
);

interface KypasOfficialProposalDocumentProps {
  data: ProposalPageData;
  activePageIndex?: number | 'all';
  containerId?: string;
  isPrintMode?: boolean;
  interactive?: boolean;
  onDirectFieldUpdate?: (field: string, value: any) => void;
  onDirectCanvasUpdate?: (updater: (prev: ProposalCanvasState) => ProposalCanvasState) => void;
  onSelectPageConfig?: (pageNum: number, partial: Partial<PageVisualConfig>) => void;
  onNavigatePage?: (page: number | 'all') => void;
}

export const KypasOfficialProposalDocument: React.FC<KypasOfficialProposalDocumentProps> = ({
  data,
  activePageIndex = 'all',
  containerId = 'kypas-proposal-document',
  isPrintMode = false,
  interactive = false,
  onDirectFieldUpdate,
  onDirectCanvasUpdate,
  onSelectPageConfig,
  onNavigatePage,
}) => {
  const [manualMoveMode, setManualMoveMode] = useState(false);
  const [showSpeedPlaceDock, setShowSpeedPlaceDock] = useState(true);
  const [speedDockTab, setSpeedDockTab] = useState<'pages' | 'images' | 'stamps'>('images');
  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [showAlignmentGrid, setShowAlignmentGrid] = useState<boolean>(false);
  const [targetSpeedPage, setTargetSpeedPage] = useState<number>(
    typeof activePageIndex === 'number' ? activePageIndex : 1
  );

  React.useEffect(() => {
    if (typeof activePageIndex === 'number') {
      setTargetSpeedPage(activePageIndex);
    }
  }, [activePageIndex]);

  const defaultConfigs = React.useMemo(() => createDefaultPageConfigs(), []);
  const pageConfigs = data.pageConfigs || defaultConfigs;
  const globalWatermark = data.globalWatermark || createDefaultWatermark(false);
  const logoConfig: ProposalLogoConfig = data.logoConfig || {
    url: '/assets/proposal-template/crops/kypas-header-logo.png',
    showLogo: true,
    width: 145,
    height: 68,
    fit: 'contain',
  };
  const pageTexts = data.pageTexts || DEFAULT_PROPOSAL_DATA.pageTexts!;
  const canvasState = data.canvasState || createDefaultCanvasState();
  const transforms = canvasState.elementTransforms || {};
  const textOverrides = canvasState.textOverrides || {};
  const textStyles = canvasState.textStyles || {};
  const imageOverrides = canvasState.imageOverrides || {};
  const freeformElements = canvasState.freeformElements || [];
  const customPages = canvasState.customPages || [];
  const hiddenPages = canvasState.hiddenPages || [];

  const isInteractive = interactive && !isPrintMode;

  const getPageConfig = (pageNum: number): PageVisualConfig => {
    return pageConfigs[pageNum] || defaultConfigs[pageNum] || defaultConfigs[1];
  };

  const shouldRenderPage = (pageNumber: number) => {
    if (hiddenPages.includes(pageNumber)) return false;
    if (activePageIndex === 'all') return true;
    return activePageIndex === pageNumber;
  };

  // Handler when user edits any text directly on the PDF canvas
  const handleCommitText = (textKey: string, newValue: string) => {
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      textOverrides: {
        ...prev.textOverrides,
        [textKey]: newValue,
      },
    }));

    if (!onDirectFieldUpdate) return;
    const cleanNum = Number(String(newValue).replace(/[^0-9.]/g, ''));

    if (textKey === 'customerName') onDirectFieldUpdate('customerName', newValue);
    else if (textKey === 'customerMobile') onDirectFieldUpdate('customerMobile', newValue);
    else if (textKey === 'customerCity') onDirectFieldUpdate('customerCity', newValue);
    else if (textKey === 'panelModel') onDirectFieldUpdate('panelModel', newValue);
    else if (textKey === 'structureDetails') onDirectFieldUpdate('structureDetails', newValue);
    else if (textKey === 'offeringKit') onDirectFieldUpdate('offeringKit', newValue);
    else if (textKey === 'company.name') onDirectFieldUpdate('companyName', newValue);
    else if (textKey === 'company.address') onDirectFieldUpdate('office', newValue);
    else if (textKey === 'company.phone1') onDirectFieldUpdate('phone', newValue);
    else if (textKey === 'company.email') onDirectFieldUpdate('email', newValue);
    else if (textKey === 'company.website') onDirectFieldUpdate('website', newValue);
    else if (textKey === 'price.discount' && !isNaN(cleanNum))
      onDirectFieldUpdate('discount', cleanNum);
    else if (textKey === 'price.subsidy' && !isNaN(cleanNum))
      onDirectFieldUpdate('subsidyAmount', cleanNum);
    else if (textKey === 'price.additional' && !isNaN(cleanNum))
      onDirectFieldUpdate('additionalCharges', cleanNum);
    else if (textKey.startsWith('bom.desc.')) {
      const idx = Number(textKey.split('.')[2]);
      onDirectFieldUpdate(`bom.description.${idx}`, newValue);
    } else if (textKey.startsWith('bom.qty.')) {
      const idx = Number(textKey.split('.')[2]);
      onDirectFieldUpdate(`bom.qty.${idx}`, newValue);
    } else if (textKey.startsWith('bom.uom.')) {
      const idx = Number(textKey.split('.')[2]);
      onDirectFieldUpdate(`bom.uom.${idx}`, newValue);
    }
  };

  const handleCommitImage = (imageKey: string, dataUrl: string) => {
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      imageOverrides: {
        ...prev.imageOverrides,
        [imageKey]: dataUrl,
      },
    }));
    if (imageKey === 'company.logo') {
      onDirectFieldUpdate?.('logoUrl', dataUrl);
    }
  };

  const handleUpdateTransform = (blockId: string, next: ElementTransform) => {
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      elementTransforms: {
        ...prev.elementTransforms,
        [blockId]: next,
      },
    }));
  };

  const handleUpdateTextStyle = (textKey: string, partial: Partial<TextStyleOverride> | null) => {
    onDirectCanvasUpdate?.(prev => {
      const nextStyles = { ...(prev.textStyles || {}) };
      if (partial === null) {
        delete nextStyles[textKey];
      } else {
        nextStyles[textKey] = {
          ...(nextStyles[textKey] || {}),
          ...partial,
        };
      }
      return {
        ...prev,
        textStyles: nextStyles,
      };
    });
  };

  const handleResetTextValue = (textKey: string) => {
    onDirectCanvasUpdate?.(prev => {
      const nextOverrides = { ...(prev.textOverrides || {}) };
      delete nextOverrides[textKey];
      return {
        ...prev,
        textOverrides: nextOverrides,
      };
    });
  };

  // Speed-Place Helpers
  const handleSpeedPlaceImage = (pageNum: number, url: string, w = 160, h = 100) => {
    const newItem: FreeformCanvasElement = {
      id: `speed-img-${Date.now()}`,
      pageNumber: pageNum,
      type: 'image',
      x: 260,
      y: 220,
      width: w,
      height: h,
      imageUrl: url,
    };
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      freeformElements: [...(prev.freeformElements || []), newItem],
    }));
  };

  const handleSpeedPlaceTextOrStamp = (
    pageNum: number,
    preset: {
      text: string;
      subtext?: string;
      color: string;
      bgColor: string;
      borderColor?: string;
      fontSize?: number;
    }
  ) => {
    const newItem: FreeformCanvasElement = {
      id: `speed-txt-${Date.now()}`,
      pageNumber: pageNum,
      type: preset.subtext ? 'stamp' : 'text',
      x: 200,
      y: 200,
      width: 300,
      height: 70,
      text: preset.text,
      subtext: preset.subtext,
      fontSize: preset.fontSize || 15,
      color: preset.color,
      bgColor: preset.bgColor,
      borderColor: preset.borderColor,
    };
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      freeformElements: [...(prev.freeformElements || []), newItem],
    }));
  };

  const handleAddCustomPage = (template: CustomAddedPage['template']) => {
    const nextPageNum = 11 + customPages.length;
    const newPage: CustomAddedPage = {
      pageNumber: nextPageNum,
      title:
        template === 'photo-showcase'
          ? 'Site Survey & Installation Gallery'
          : template === 'custom-notes'
          ? 'Additional Commercial & Technical Notes'
          : `Custom Proposal Page ${nextPageNum}`,
      subtitle: 'KYPAS Solar Power — Customized Project Annexure',
      template,
      bodyText:
        'Click here to edit custom project specifications, site engineering observations, structure elevation details, or special customer commitments.',
      heroImageUrl: '/assets/proposal-template/crops/p3-zam-structure-full.png',
      secondImageUrl: '/assets/proposal-template/crops/p1-family-clean.png',
    };
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      customPages: [...(prev.customPages || []), newPage],
    }));
    setTargetSpeedPage(nextPageNum);
    onNavigatePage?.('all');
  };

  const handleToggleHidePage = (pageNum: number) => {
    onDirectCanvasUpdate?.(prev => {
      const current = prev.hiddenPages || [];
      const exists = current.includes(pageNum);
      return {
        ...prev,
        hiddenPages: exists ? current.filter(p => p !== pageNum) : [...current, pageNum],
      };
    });
  };

  const handleRemoveFreeformItem = (id: string) => {
    onDirectCanvasUpdate?.(prev => ({
      ...prev,
      freeformElements: (prev.freeformElements || []).filter(el => el.id !== id),
    }));
  };

  const renderFreeformElementsForPage = (pageNum: number) => {
    const items = freeformElements.filter(el => el.pageNumber === pageNum);
    return items.map(item => (
      <MovableBlock
        key={item.id}
        blockId={item.id}
        interactive={isInteractive}
        manualMoveMode={manualMoveMode}
        transform={transforms[item.id] || { x: item.x, y: item.y }}
        onUpdateTransform={handleUpdateTransform}
        label={item.type === 'image' ? 'Placed Image' : 'Placed Block'}
        style={{ position: 'absolute', left: 0, top: 0, zIndex: 35 }}
      >
        <div className="relative group/free">
          {isInteractive && (
            <button
              type="button"
              data-html2canvas-ignore="true"
              onClick={e => {
                e.stopPropagation();
                handleRemoveFreeformItem(item.id);
              }}
              className="print:hidden absolute -top-2.5 -right-2.5 z-50 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover/free:opacity-100 transition-opacity shadow cursor-pointer"
              title="Delete placed element"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {item.type === 'image' ? (
            <EditableImageBox
              imageKey={`free.img.${item.id}`}
              defaultUrl={item.imageUrl || '/assets/proposal-template/crops/kypas-header-logo.png'}
              alt="Placed Image"
              width={item.width || 160}
              height={item.height || 110}
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              imageOverrides={imageOverrides}
              transform={transforms[`free.img.${item.id}`]}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />
          ) : (
            <div
              style={{
                backgroundColor: item.bgColor || 'rgba(255,255,255,0.95)',
                color: item.color || '#0b4ea2',
                borderColor: item.borderColor || '#0b4ea2',
                fontSize: `${item.fontSize || 15}px`,
              }}
              className={`px-4 py-2.5 rounded-xl font-black shadow-md ${
                item.borderColor ? 'border-2' : ''
              }`}
            >
              <EditableText
                as="div"
                textKey={`free.text.${item.id}`}
                value={item.text || 'Click to edit text'}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
              />
              {item.subtext && (
                <EditableText
                  as="div"
                  textKey={`free.subtext.${item.id}`}
                  value={item.subtext}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-xs font-semibold opacity-85 mt-0.5"
                />
              )}
            </div>
          )}
        </div>
      </MovableBlock>
    ));
  };

  // Top-left per-page quick action badge
  const renderPageInteractiveBadge = (pageNum: number, pageTitle: string) => {
    if (!isInteractive) return null;
    return (
      <div
        data-html2canvas-ignore="true"
        className="print:hidden absolute top-2 left-2 z-40 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg border border-white/15"
      >
        <span className="text-amber-400 font-black">
          Page {pageNum}: {pageTitle}
        </span>
        <span className="text-slate-500">|</span>
        <button
          type="button"
          onClick={() =>
            handleSpeedPlaceTextOrStamp(pageNum, {
              text: 'Click to edit custom heading / note',
              color: '#0b4ea2',
              bgColor: 'rgba(255,255,255,0.95)',
              borderColor: '#f26522',
            })
          }
          className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer"
          title="Place movable text box on this page"
        >
          <Type className="w-2.5 h-2.5" /> +Text
        </button>
        <button
          type="button"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = e => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  handleSpeedPlaceImage(pageNum, reader.result, 180, 120);
                }
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }}
          className="px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 cursor-pointer"
          title="Upload & place movable image on this page"
        >
          <ImageIcon className="w-2.5 h-2.5" /> +Image
        </button>
      </div>
    );
  };

  const renderPageDecorations = (pageNum: number, pageTitle: string) => {
    const cfg = getPageConfig(pageNum);
    return (
      <>
        <PageBackgroundLayer config={cfg} />
        <PageCustomImageLayer config={cfg} />
        <PageWatermarkLayer globalWatermark={globalWatermark} pageWatermark={cfg.watermark} />
        {isInteractive && showAlignmentGrid && (
          <div
            data-html2canvas-ignore="true"
            className="print:hidden absolute inset-0 z-30 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(59,130,246,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,0.14) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}
        {renderFreeformElementsForPage(pageNum)}
        {renderPageInteractiveBadge(pageNum, pageTitle)}
      </>
    );
  };

  return (
    <ProposalCanvasContext.Provider
      value={{
        canvasZoom: isInteractive ? canvasZoom : 1,
        textStyles,
        onUpdateTextStyle: handleUpdateTextStyle,
        onResetTextValue: handleResetTextValue,
      }}
    >
      <div
        id={containerId}
        className="kypas-proposal-root flex flex-col items-center gap-6 py-2 print:p-0 print:gap-0 bg-slate-200/60 dark:bg-slate-950 select-text w-full"
      >
        {/* ========================================================================= */}
        {/* TOP INTERACTIVE BAR + SIDE SPEED-PLACE MODULE (HIDDEN IN PRINT/EXPORT)    */}
        {/* ========================================================================= */}
        {isInteractive && (
          <div
            data-html2canvas-ignore="true"
            className="print:hidden sticky top-2 z-50 w-full max-w-[794px] space-y-2"
          >
            {/* Main Mode Bar */}
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setManualMoveMode(false)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    !manualMoveMode
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>✏️ Direct Edit Text & Images</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManualMoveMode(true)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    manualMoveMode
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>✋ Manual Drag & Move</span>
                </button>

                {/* Zoom Controls for Laptop / Full A4 Fit */}
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 text-[10px] font-bold">
                  <span className="text-slate-400">Zoom:</span>
                  {[0.75, 0.85, 1].map(z => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setCanvasZoom(z)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        canvasZoom === z
                          ? 'bg-blue-600 text-white font-black'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {Math.round(z * 100)}%
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAlignmentGrid(prev => !prev)}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer border ${
                    showAlignmentGrid
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="Toggle 40px alignment grid on pages"
                >
                  # Grid
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowSpeedPlaceDock(prev => !prev)}
                  className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    showSpeedPlaceDock
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>⚡ Speed-Place & Pages</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDirectCanvasUpdate?.(() => createDefaultCanvasState())}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset all manual moves and inline edits to original PDF"
                >
                  <RotateCcw className="w-3 h-3" /> Reset All
                </button>
              </div>
            </div>

          {/* Collapsible Speed-Place & All-Pages Studio Module */}
          {showSpeedPlaceDock && (
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpeedDockTab('images')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                      speedDockTab === 'images'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🖼️ Speed-Place Logos & Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedDockTab('stamps')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                      speedDockTab === 'stamps'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    🏷️ Speed-Place Stamps & Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeedDockTab('pages')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer ${
                      speedDockTab === 'pages'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    📄 Add / Manage All Pages ({10 + customPages.length - hiddenPages.length})
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-semibold">Place onto Page:</span>
                  <select
                    value={targetSpeedPage}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setTargetSpeedPage(p);
                      if (activePageIndex !== 'all') onNavigatePage?.(p);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-600 text-amber-300 font-black cursor-pointer"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>
                        Page {n}
                      </option>
                    ))}
                    {customPages.map(cp => (
                      <option key={cp.pageNumber} value={cp.pageNumber}>
                        Page {cp.pageNumber} (Custom)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TAB 1: 1-CLICK SPEED-PLACE IMAGES & BRAND LOGOS */}
              {speedDockTab === 'images' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = e => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            handleSpeedPlaceImage(targetSpeedPage, reader.result, 180, 120);
                          }
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="shrink-0 px-3 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-black text-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer shadow"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <span className="text-[8px] text-blue-200">to Page {targetSpeedPage}</span>
                  </button>

                  {SPEED_PLACE_IMAGE_LIBRARY.map(asset => (
                    <button
                      key={asset.label}
                      type="button"
                      onClick={() =>
                        handleSpeedPlaceImage(targetSpeedPage, asset.url, asset.w, asset.h)
                      }
                      className="shrink-0 w-24 p-1.5 bg-white hover:ring-2 hover:ring-amber-400 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
                      title={`Click to place ${asset.label} onto Page ${targetSpeedPage}`}
                    >
                      <img
                        src={asset.url}
                        alt={asset.label}
                        className="h-8 w-full object-contain"
                      />
                      <span className="text-[9px] font-bold text-slate-800 truncate w-full text-center mt-1 group-hover:text-blue-600">
                        + {asset.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 2: 1-CLICK SPEED-PLACE STAMPS & TEXT BLOCKS */}
              {speedDockTab === 'stamps' && (
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    {
                      label: '+ Customer Prepared-For Box',
                      text: `Prepared For: ${data.customerName}`,
                      subtext: `${data.customerCity} • ${data.systemSizeKW} kWp Rooftop Solar Plant`,
                      color: '#0b4ea2',
                      bgColor: 'rgba(255,255,255,0.96)',
                      borderColor: '#f26522',
                    },
                    {
                      label: '+ ₹78,000 PM Surya Ghar Stamp',
                      text: 'PM SURYA GHAR SUBSIDY: ₹ 78,000/-',
                      subtext: 'Direct DBT Credit to Customer Bank Account',
                      color: '#ffffff',
                      bgColor: '#f26522',
                      borderColor: '#0b4ea2',
                    },
                    {
                      label: '+ 30 Years Warranty Badge',
                      text: '30 YEARS PERFORMANCE WARRANTY',
                      subtext: '100% ALMM Approved Tier-1 Bifacial Modules',
                      color: '#ffffff',
                      bgColor: '#0b4ea2',
                      borderColor: '#f26522',
                    },
                    {
                      label: '+ Authorised Signatory Stamp',
                      text: 'For KYPAS SOLAR POWER PVT LTD',
                      subtext: 'Authorised Signatory & Corporate Seal',
                      color: '#0b4ea2',
                      bgColor: 'rgba(248,250,252,0.96)',
                      borderColor: '#0b4ea2',
                    },
                    {
                      label: '+ Custom Heading Text',
                      text: 'Click to edit custom heading',
                      color: '#f26522',
                      bgColor: 'rgba(255,255,255,0.9)',
                    },
                  ].map(stamp => (
                    <button
                      key={stamp.label}
                      type="button"
                      onClick={() => handleSpeedPlaceTextOrStamp(targetSpeedPage, stamp)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-white rounded-xl font-bold text-[10px] cursor-pointer transition-colors border border-slate-700"
                    >
                      {stamp.label}
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 3: ALL PAGES MANAGER & ADD NEW PAGE */}
              {speedDockTab === 'pages' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddCustomPage('branded-blank')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[11px] flex items-center gap-1 cursor-pointer shadow"
                    >
                      <FilePlus className="w-3.5 h-3.5" /> + Add Branded Page
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomPage('photo-showcase')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[11px] flex items-center gap-1 cursor-pointer shadow"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> + Add Site Photo Page
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomPage('custom-notes')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-[11px] flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Type className="w-3.5 h-3.5" /> + Add Technical Annexure Page
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigatePage?.('all')}
                      className="ml-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[11px] cursor-pointer"
                    >
                      📄 Show All Pages Together
                    </button>
                  </div>

                  {/* Quick Page Pills with Show/Hide Toggle */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(pNum => {
                      const isHidden = hiddenPages.includes(pNum);
                      return (
                        <div
                          key={pNum}
                          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold ${
                            isHidden
                              ? 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                              : targetSpeedPage === pNum
                              ? 'bg-blue-950 border-blue-400 text-white'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setTargetSpeedPage(pNum);
                              onNavigatePage?.(pNum);
                            }}
                            className="cursor-pointer hover:text-amber-300"
                          >
                            Page {pNum}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleHidePage(pNum)}
                            className="ml-1 text-[9px] text-slate-400 hover:text-white cursor-pointer"
                            title={isHidden ? 'Restore page' : 'Hide page from PDF'}
                          >
                            {isHidden ? 'Show' : '×'}
                          </button>
                        </div>
                      );
                    })}
                    {customPages.map(cp => (
                      <div
                        key={cp.pageNumber}
                        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-200 text-[10px] font-bold"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setTargetSpeedPage(cp.pageNumber);
                            onNavigatePage?.(cp.pageNumber);
                          }}
                          className="cursor-pointer"
                        >
                          Page {cp.pageNumber}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDirectCanvasUpdate?.(prev => ({
                              ...prev,
                              customPages: (prev.customPages || []).filter(
                                p => p.pageNumber !== cp.pageNumber
                              ),
                            }))
                          }
                          className="ml-1 text-rose-400 hover:text-rose-200 cursor-pointer"
                          title="Delete custom page"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

          {/* Pages Wrapper with Optional Studio Zoom */}
        <div
          className="flex flex-col items-center gap-6 w-full"
          style={
            isInteractive && canvasZoom !== 1
              ? {
                  transform: `scale(${canvasZoom})`,
                  transformOrigin: 'top center',
                  marginBottom: `${Math.round((canvasZoom - 1) * 1123)}px`,
                }
              : undefined
          }
        >
      {/* ========================================================================= */}
      {/* PAGE 1: OFFICIAL COVER PAGE (100% DECOMPOSED: EVERY IMAGE & TEXT EDITABLE)*/}
      {/* ========================================================================= */}
      {shouldRenderPage(1) && (
        <div
          id="proposal-page-1"
          data-page-number="1"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(1, 'Cover Page')}

          {/* TOP HALF: SUNRISE OVER SOLAR ROOFTOP + EDITABLE LOGO + HEADLINE BOX */}
          <div className="relative w-full h-[520px] bg-gradient-to-b from-[#8b7d9b] via-[#e9944a] to-[#5a4a42] shrink-0">
            {/* Editable / Replaceable Sunrise Background Image */}
            <div className="absolute inset-0 z-0 hover:z-30 focus-within:z-40">
              <EditableImageBox
                imageKey="p1.skyBanner"
                defaultUrl="/assets/proposal-template/crops/p1-sky-clean.png"
                alt="Cover Sunrise Sky Image"
                width={794}
                height={520}
                fit="cover"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p1.skyBanner']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </div>

            {/* Centered KYPAS SOLAR Cover Logo (Draggable & Replaceable) */}
            <div className="relative z-10 flex flex-col items-center pt-7 pointer-events-none">
              <MovableBlock
                blockId="p1-cover-main-logo"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p1-cover-main-logo']}
                onUpdateTransform={handleUpdateTransform}
                label="Cover Brand Logo"
                className="bg-white/85 backdrop-blur-xs px-6 py-2.5 rounded-2xl shadow-sm"
              >
                <EditableImageBox
                  imageKey="p1.centerLogo"
                  defaultUrl={
                    logoConfig.url || '/assets/proposal-template/crops/kypas-header-logo.png'
                  }
                  alt="KYPAS Cover Logo"
                  width={290}
                  height={130}
                  fit="contain"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  imageOverrides={imageOverrides}
                  transform={transforms['p1.centerLogo']}
                  onCommitImage={handleCommitImage}
                  onUpdateTransform={handleUpdateTransform}
                />
              </MovableBlock>

              {/* "Keep Your Power As Solar" Tagline */}
              <MovableBlock
                blockId="p1-cover-tagline"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p1-cover-tagline']}
                onUpdateTransform={handleUpdateTransform}
                label="Cover Tagline"
                className="mt-5"
              >
                <EditableText
                  as="h2"
                  textKey="p1.tagline"
                  value={data.companyDetails.tagline || 'Keep Your Power As Solar'}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  style={{ textShadow: '0 2px 10px rgba(255,255,255,0.6)' }}
                  className="text-[36px] font-black text-slate-950 tracking-tight"
                />
              </MovableBlock>

              {/* Framed White-Border Headline Box ("LET'S BRING SUN INTO OUR LIVES & KEEP YOUR POWER AS SOLAR") */}
              <MovableBlock
                blockId="p1-cover-framed-box"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p1-cover-framed-box']}
                onUpdateTransform={handleUpdateTransform}
                label="Cover Headline Box"
                className="mt-5 w-[86%] border-4 border-white px-6 py-4 text-center bg-black/25 backdrop-blur-[1px]"
              >
                <EditableText
                  as="div"
                  textKey="p1.headline.line1"
                  value="LET'S BRING SUN"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-[42px] font-black text-[#fff200] leading-none tracking-wide uppercase"
                />
                <EditableText
                  as="div"
                  textKey="p1.headline.line2"
                  value="INTO OUR LIVES & KEEP YOUR POWER AS"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-[22px] font-extrabold text-white tracking-wider uppercase mt-2"
                />
                <EditableText
                  as="div"
                  textKey="p1.headline.line3"
                  value="SOLAR"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-[44px] font-black text-[#fff200] leading-none tracking-wide uppercase mt-1"
                />
              </MovableBlock>
            </div>
          </div>

          {/* MIDDLE / BOTTOM PHOTO: HAPPY FAMILY IN FRONT OF SOLAR PANELS (100% REPLACEABLE & DRAGGABLE) */}
          <div className="relative flex-1 w-full bg-slate-100 flex flex-col justify-end pointer-events-none">
            <div className="absolute inset-0 z-0 pointer-events-auto hover:z-30 focus-within:z-40">
              <EditableImageBox
                imageKey="p1.familyPhoto"
                defaultUrl="/assets/proposal-template/crops/p1-family-clean.png"
                alt="Family with Rooftop Solar Photo"
                width={794}
                height={535}
                fit="cover"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p1.familyPhoto']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </div>

            {/* Orange Curved Pill Banner at bottom of family photo */}
            <MovableBlock
              blockId="p1-orange-blueprint-banner"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p1-orange-blueprint-banner']}
              onUpdateTransform={handleUpdateTransform}
              label="Orange Blueprint Banner"
              className="relative z-10 mx-auto w-[88%] bg-[#f26522] text-white py-3.5 px-8 rounded-t-[40px] text-center shadow-lg"
            >
              <EditableText
                as="p"
                textKey="p1.blueprint.line1"
                value="Affordable rooftop Solar for all"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-xl font-black tracking-wide leading-tight"
              />
              <EditableText
                as="p"
                textKey="p1.blueprint.line2"
                value="- it's not just a Dream, it's our Blueprint"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-xl font-black tracking-wide leading-tight"
              />
            </MovableBlock>
          </div>

          {/* ROYAL BLUE COVER FOOTER BAR */}
          <OfficialBlueFooterBar
            pageNum={1}
            website={data.companyDetails.website}
            phone={`${data.companyDetails.phone1} / ${data.companyDetails.phone2}`}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
            noNegativeMargin={true}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: 1,00,000 HOMES MISSION (100% DECOMPOSED & EDITABLE)               */}
      {/* ========================================================================= */}
      {shouldRenderPage(2) && (
        <div
          id="proposal-page-2"
          data-page-number="2"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-gradient-to-b from-[#bce1f7] via-[#dff2fc] to-white text-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(2, '1 Lakh Homes Mission')}

          {/* Top Section: Top-Right Logo + Giant 1,00,000 Homes Headline */}
          <div className="relative z-10 px-8 pt-6">
            <div className="flex justify-end">
              <MovableBlock
                blockId="p2-top-logo"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p2-top-logo']}
                onUpdateTransform={handleUpdateTransform}
                label="Page 2 Logo"
              >
                <EditableImageBox
                  imageKey="p2.logo"
                  defaultUrl={
                    logoConfig.url || '/assets/proposal-template/crops/kypas-header-logo.png'
                  }
                  alt="KYPAS Logo"
                  width={140}
                  height={65}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  imageOverrides={imageOverrides}
                  transform={transforms['p2.logo']}
                  onCommitImage={handleCommitImage}
                  onUpdateTransform={handleUpdateTransform}
                />
              </MovableBlock>
            </div>

            <MovableBlock
              blockId="p2-hero-heading"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p2-hero-heading']}
              onUpdateTransform={handleUpdateTransform}
              label="1,00,000 Homes Heading"
              className="text-center mt-2 space-y-1"
            >
              <EditableText
                as="h2"
                textKey="p2.line1"
                value="Our target is to provide solar power to"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-[28px] font-black text-[#0b4ea2] leading-tight"
              />
              <EditableText
                as="h1"
                textKey="p2.line2"
                value="1,00,000"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                style={{ WebkitTextStroke: '2px #ffffff' }}
                className="text-[76px] font-black text-[#f26522] leading-none tracking-tight"
              />
              <EditableText
                as="h2"
                textKey="p2.line3"
                value="Homes through the"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-[31px] font-black text-[#0b4ea2] leading-tight"
              />
              <EditableText
                as="h2"
                textKey="p2.line4"
                value="PM Surya Ghar Scheme."
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-[31px] font-black text-[#0b4ea2] leading-tight"
              />
            </MovableBlock>
          </div>

          {/* Middle Section: Replaceable & Resizable Solar Village Illustration */}
          <div className="relative z-10 w-full flex-1 flex items-end hover:z-30 focus-within:z-40">
            <EditableImageBox
              imageKey="p2.villageIllustration"
              defaultUrl="/assets/proposal-template/crops/p2-village-clean.png"
              alt="Solar Powered Village Homes Illustration"
              width={794}
              height={465}
              fit="cover"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              imageOverrides={imageOverrides}
              transform={transforms['p2.villageIllustration']}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />
          </div>

          {/* Orange Divider Bar */}
          <div className="relative z-10 h-4 bg-[#f26522] w-full shrink-0" />

          {/* Bottom White Split Section: "up to 90%" | "₹ 78,000." */}
          <div className="relative z-10 bg-white px-8 py-6 grid grid-cols-2 items-center text-center shrink-0">
            <MovableBlock
              blockId="p2-bottom-left"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p2-bottom-left']}
              onUpdateTransform={handleUpdateTransform}
              label="90% Bill Reduction Block"
              className="pr-6 border-r-4 border-[#f26522] space-y-1"
            >
              <EditableText
                as="p"
                textKey="p2.left.sub"
                value="Start your journey with us to reduce your power bills by"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-base font-extrabold text-[#f26522] leading-snug"
              />
              <EditableText
                as="h3"
                textKey="p2.left.big"
                value="up to 90%"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-[46px] font-black text-[#0b4ea2] leading-none pt-1"
              />
            </MovableBlock>

            <MovableBlock
              blockId="p2-bottom-right"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p2-bottom-right']}
              onUpdateTransform={handleUpdateTransform}
              label="₹78,000 Subsidy Block"
              className="pl-6 space-y-1"
            >
              <EditableText
                as="p"
                textKey="p2.right.sub"
                value="Receive a government subsidy of"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-base font-extrabold text-[#f26522] leading-snug"
              />
              <EditableText
                as="h3"
                textKey="p2.right.big"
                value={`₹ ${data.subsidyAmount.toLocaleString('en-IN')}.`}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-[46px] font-black text-[#0b4ea2] leading-none pt-1"
              />
            </MovableBlock>
          </div>

          {/* Royal Blue Bottom Bar */}
          <OfficialBlueFooterBar
            pageNum={2}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
            noNegativeMargin={true}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: ABOUT US & ANTI-RUST ZAM STRUCTURE (100% DECOMPOSED & EDITABLE)   */}
      {/* ========================================================================= */}
      {shouldRenderPage(3) && (
        <div
          id="proposal-page-3"
          data-page-number="3"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(3, 'About Us & ZAM Structure')}

          {/* TOP SECTION: ABOUT US + 3 VISION / MISSION / OUR SERVICES CARDS */}
          <div className="relative z-10 px-8 pt-7 space-y-4">
            <MovableBlock
              blockId="p3-aboutus-intro"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p3-aboutus-intro']}
              onUpdateTransform={handleUpdateTransform}
              label="About Us Intro"
              className="flex items-start gap-4"
            >
              <EditableText
                as="div"
                textKey="p3.aboutus.vertical"
                value="ABOUT US"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-xs font-black tracking-[0.25em] text-slate-400 uppercase border-l-4 border-[#f26522] pl-2 py-1 shrink-0"
              />
              <EditableText
                as="p"
                textKey="p3.aboutus.desc"
                value="Kypas Solar isn't just an installer, we are developers providing end-to-end energy blueprints for residential, commercial, and industrial clients."
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-sm font-medium text-slate-800 leading-relaxed"
              />
            </MovableBlock>

            {/* 3 Cards: VISION | MISSION | OUR SERVICES */}
            <div className="grid grid-cols-3 gap-4">
              {/* Card 1: VISION */}
              <MovableBlock
                blockId="p3-card-vision"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p3-card-vision']}
                onUpdateTransform={handleUpdateTransform}
                label="Vision Card"
                className="rounded-2xl overflow-hidden bg-[#ebebeb] border border-slate-200 shadow-xs"
              >
                <div className="bg-[#f26522] text-white py-2.5 px-4 font-black text-sm text-center">
                  <EditableText
                    textKey="p3.vision.title"
                    value="VISION"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
                <div className="p-4 text-center text-xs text-slate-800 font-medium leading-relaxed">
                  <EditableText
                    as="p"
                    textKey="p3.vision.body"
                    value="Affordable rooftop Solar for all – it's not just a Dream, it's our Blueprint"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </MovableBlock>

              {/* Card 2: MISSION */}
              <MovableBlock
                blockId="p3-card-mission"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p3-card-mission']}
                onUpdateTransform={handleUpdateTransform}
                label="Mission Card"
                className="rounded-2xl overflow-hidden bg-white border-2 border-[#f26522] shadow-xs"
              >
                <div className="bg-[#f26522] text-white py-2.5 px-4 font-black text-sm text-center">
                  <EditableText
                    textKey="p3.mission.title"
                    value="MISSION"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
                <div className="p-4 text-center text-xs text-slate-800 font-medium leading-relaxed">
                  <EditableText
                    as="p"
                    textKey="p3.mission.body"
                    value="Solar for everyone: Hassle-free, Affordable, Accessible"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </MovableBlock>

              {/* Card 3: OUR SERVICES */}
              <MovableBlock
                blockId="p3-card-services"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p3-card-services']}
                onUpdateTransform={handleUpdateTransform}
                label="Our Services Card"
                className="rounded-2xl overflow-hidden bg-[#ebebeb] border border-slate-200 shadow-xs"
              >
                <div className="bg-[#f26522] text-white py-2.5 px-4 font-black text-sm text-center">
                  <EditableText
                    textKey="p3.services.title"
                    value="OUR SERVICES"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
                <div className="p-3.5 text-xs text-slate-800 font-medium space-y-1">
                  <EditableText
                    as="p"
                    textKey="p3.srv.1"
                    value="• Residential Solar"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p3.srv.2"
                    value="• Commercial Solar"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p3.srv.3"
                    value="• Battery Storage"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p3.srv.4"
                    value="• O & M Services"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </MovableBlock>
            </div>
          </div>

          {/* MIDDLE SECTION: ANTI-RUST ZAM STRUCTURE PHOTO + EDITABLE CALLOUT BADGES */}
          <div className="relative z-10 w-full h-[565px] pointer-events-none">
            {/* Replaceable & Draggable ZAM Structure Main Photo */}
            <div className="absolute inset-0 z-0 pointer-events-auto hover:z-30 focus-within:z-40">
              <EditableImageBox
                imageKey="p3.zamMainPhoto"
                defaultUrl="/assets/proposal-template/crops/p3-zam-structure-full.png"
                alt="Anti-Rust ZAM Structure Photo"
                width={794}
                height={565}
                fit="cover"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p3.zamMainPhoto']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </div>

            {/* Editable Ribbon Heading on Top-Left of ZAM Structure */}
            <MovableBlock
              blockId="p3-zam-ribbon"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p3-zam-ribbon']}
              onUpdateTransform={handleUpdateTransform}
              label="ZAM Title Ribbon"
              className="relative z-10 inline-block mt-1"
            >
              <div className="bg-[#0b4ea2] text-white px-7 py-2 font-black text-2xl tracking-tight rounded-r-full shadow">
                <EditableText
                  textKey="p3.zam.heading"
                  value="Anti-Rust ZAM Structure"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                />
              </div>
              <div className="bg-[#f26522] text-white px-6 py-1 font-extrabold text-sm tracking-wide rounded-r-full inline-block">
                <EditableText
                  textKey="p3.zam.subheading"
                  value="with Self Healing TECHNOLOGY"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                />
              </div>
            </MovableBlock>
          </div>

          {/* BOTTOM SECTION: 3 SUBSIDY / ROI BULLETS + JAN SAMARTH 6% LOAN STAMP */}
          <div className="relative z-10 bg-white border-t-4 border-[#f26522] px-8 py-4 flex items-center justify-between gap-4">
            <MovableBlock
              blockId="p3-bottom-bullets"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p3-bottom-bullets']}
              onUpdateTransform={handleUpdateTransform}
              label="Subsidy & ROI Bullets"
              className="space-y-2 text-xs font-bold flex-1"
            >
              <p>
                <span className="text-[#0b4ea2] mr-1">•</span>
                <EditableText
                  textKey="p3.b1.orange"
                  value="Residential : "
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-[#f26522]"
                />
                <EditableText
                  textKey="p3.b1.text"
                  value="Claim up to ₹ 78,000/-via PM Surya Ghar."
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-slate-900"
                />
              </p>
              <p>
                <span className="text-[#0b4ea2] mr-1">•</span>
                <EditableText
                  textKey="p3.b2.orange"
                  value="Apartments/GHS : "
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-[#f26522]"
                />
                <EditableText
                  textKey="p3.b2.text"
                  value="Claim ₹ 18,000/-per KW(up to 500KW)"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-slate-900"
                />
              </p>
              <p>
                <span className="text-[#0b4ea2] mr-1">•</span>
                <EditableText
                  textKey="p3.b3.orange"
                  value="Commercial : "
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-[#f26522]"
                />
                <EditableText
                  textKey="p3.b3.text"
                  value="Enjoy 30%-40% Annual Returns on Investment."
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-slate-900"
                />
              </p>
            </MovableBlock>

            {/* Replaceable & Draggable 6% Loan Stamp Image */}
            <MovableBlock
              blockId="p3-loan-stamp-block"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p3-loan-stamp-block']}
              onUpdateTransform={handleUpdateTransform}
              label="6% Loan Stamp"
            >
              <EditableImageBox
                imageKey="p3.loanStamp"
                defaultUrl="/assets/proposal-template/crops/p3-loan-stamp.png"
                alt="Jan Samarth Get Loan @ 6% Stamp"
                width={135}
                height={110}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p3.loanStamp']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </MovableBlock>
          </div>

          <div className="h-3 bg-[#0b4ea2] w-full shrink-0" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 4: ALMM APPROVED BRANDS & 30/12 YR WARRANTY (100% DECOMPOSED)        */}
      {/* ========================================================================= */}
      {shouldRenderPage(4) && (
        <div
          id="proposal-page-4"
          data-page-number="4"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(4, 'ALMM Approved Brands')}

          {/* TOP ORANGE SECTION + TALL BIFACIAL SOLAR PANEL IMAGE */}
          <div className="relative z-10">
            <div className="bg-[#f26522] px-8 pt-5 pb-8 pr-[310px] space-y-4">
              {/* Top-left Logo */}
              <MovableBlock
                blockId="p4-top-logo"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p4-top-logo']}
                onUpdateTransform={handleUpdateTransform}
                label="Page 4 Logo"
                className="inline-block bg-white px-3 py-1.5 rounded-xl shadow-xs"
              >
                <EditableImageBox
                  imageKey="p4.logo"
                  defaultUrl={
                    logoConfig.url || '/assets/proposal-template/crops/kypas-header-logo.png'
                  }
                  alt="KYPAS Logo"
                  width={125}
                  height={56}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  imageOverrides={imageOverrides}
                  transform={transforms['p4.logo']}
                  onCommitImage={handleCommitImage}
                  onUpdateTransform={handleUpdateTransform}
                />
              </MovableBlock>

              {/* Royal Blue Rounded Box: Kypas Solar offering ALMM Brands */}
              <MovableBlock
                blockId="p4-almm-blue-box"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p4-almm-blue-box']}
                onUpdateTransform={handleUpdateTransform}
                label="ALMM Blue Box"
                className="bg-[#0b4ea2] text-white p-5 rounded-bl-3xl rounded-tr-3xl shadow-md text-center space-y-1"
              >
                <EditableText
                  as="h1"
                  textKey="p4.almm.title"
                  value="Kypas Solar offering"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-2xl font-black text-white"
                />
                <EditableText
                  as="p"
                  textKey="p4.almm.sub"
                  value="ALMM (Approved List Of Models & Manufacturers ) Brands"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-sm font-black text-[#5ce1e6] leading-snug"
                />
              </MovableBlock>

              <MovableBlock
                blockId="p4-hjt-text"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p4-hjt-text']}
                onUpdateTransform={handleUpdateTransform}
                label="HJT Topcon Heading"
              >
                <EditableText
                  as="h2"
                  textKey="p4.hjt.line1"
                  value="HJT (Heterojunction Technology)"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-lg font-black text-white leading-snug"
                />
                <EditableText
                  as="h2"
                  textKey="p4.hjt.line2"
                  value="Topcon BIFACIAL Solar Panels"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-lg font-black text-white leading-snug"
                />
              </MovableBlock>
            </div>

            {/* Right Tall Bifacial Solar Panel Image (Clickable to Replace/Resize/Drag) */}
            <MovableBlock
              blockId="p4-tall-solar-panel"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p4-tall-solar-panel']}
              onUpdateTransform={handleUpdateTransform}
              label="Solar Panel Image"
              className="absolute top-6 right-5 z-20"
            >
              <EditableImageBox
                imageKey="p4.solarPanelImg"
                defaultUrl="/assets/proposal-template/crops/p4-solar-panel-tall.png"
                alt="Bifacial Solar Panel"
                width={265}
                height={510}
                fit="contain"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p4.solarPanelImg']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </MovableBlock>

            {/* 5 Individual Brand Logos Row (Each Brand Logo is Clickable to Replace/Resize/Drag!) */}
            <div className="px-6 py-4 pr-[290px] flex flex-wrap items-center justify-center gap-3 bg-white">
              {[
                {
                  key: 'p4.brand.tata',
                  url: '/assets/proposal-template/crops/brand-tatapower.png',
                  alt: 'Tata Power Solar',
                  w: 115,
                  h: 48,
                },
                {
                  key: 'p4.brand.adani',
                  url: '/assets/proposal-template/crops/brand-adani.png',
                  alt: 'Adani Solar',
                  w: 75,
                  h: 48,
                },
                {
                  key: 'p4.brand.eastman',
                  url: '/assets/proposal-template/crops/brand-eastman.png',
                  alt: 'Eastman Solar',
                  w: 105,
                  h: 52,
                },
                {
                  key: 'p4.brand.waaree',
                  url: '/assets/proposal-template/crops/brand-waaree.png',
                  alt: 'Waaree Solar',
                  w: 115,
                  h: 48,
                },
                {
                  key: 'p4.brand.premier',
                  url: '/assets/proposal-template/crops/brand-premier.png',
                  alt: 'Premier Energies',
                  w: 125,
                  h: 44,
                },
              ].map(b => (
                <MovableBlock
                  key={b.key}
                  blockId={b.key}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms[b.key]}
                  onUpdateTransform={handleUpdateTransform}
                  label={b.alt}
                >
                  <EditableImageBox
                    imageKey={b.key}
                    defaultUrl={b.url}
                    alt={b.alt}
                    width={b.w}
                    height={b.h}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    imageOverrides={imageOverrides}
                    transform={transforms[b.key]}
                    onCommitImage={handleCommitImage}
                    onUpdateTransform={handleUpdateTransform}
                  />
                </MovableBlock>
              ))}
            </div>
          </div>

          {/* BOTTOM LIGHT GRAY CARD: TRANSITION TO A BRIGHTER TOMORROW + 30/12 YR WARRANTIES */}
          <MovableBlock
            blockId="p4-bottom-tech-card"
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            transform={transforms['p4-bottom-tech-card']}
            onUpdateTransform={handleUpdateTransform}
            label="Technology & Warranty Card"
            className="relative z-10 mx-4 mb-2 bg-[#f4f4f4] rounded-3xl p-6 grid grid-cols-12 gap-5 border border-slate-200"
          >
            {/* Left 7 Cols: 5 Technology Features */}
            <div className="col-span-7 space-y-3">
              <EditableText
                as="h3"
                textKey="p4.tech.heading"
                value="Transition to a Brighter Tomorrow"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-lg font-black text-[#0b4ea2] block"
              />

              {[
                {
                  k: 'p4.feat1',
                  t: 'SMBB TECHNOLOGY',
                  d: 'Better light trapping and current collection to improve module power output and reliability',
                },
                {
                  k: 'p4.feat2',
                  t: 'PID Resistance',
                  d: 'Excellent Anti-PID performance guarantee via optimized mass-production process and materials control',
                },
                {
                  k: 'p4.feat3',
                  t: 'Higher Power Output',
                  d: 'Module power increases 5-25% generally, bringing significantly lower LCOE and higher IRR',
                },
                {
                  k: 'p4.feat4',
                  t: 'Auto Bussing & Soldering Technology',
                  d: 'Induction based Improved soldering quality without pollution to module',
                },
                {
                  k: 'p4.feat5',
                  t: 'Enhanced Mechanical Load',
                  d: 'Certified to withstand wind load (2400 Pascal) and snow load (5400 Pascal)',
                },
              ].map(feat => (
                <div key={feat.k} className="flex items-start gap-2.5 text-[11px]">
                  <div className="w-7 h-7 rounded-lg bg-[#f26522] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey={`${feat.k}.title`}
                      value={feat.t}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="font-black text-[#0b4ea2]"
                    />
                    <EditableText
                      as="p"
                      textKey={`${feat.k}.desc`}
                      value={feat.d}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-slate-600 font-medium leading-snug"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Right 5 Cols: High Performance Guarantee! + 30 YRS & 12 YRS Orange Circles + Certifications */}
            <div className="col-span-5 flex flex-col justify-between items-center text-center pt-4">
              <EditableText
                as="h4"
                textKey="p4.guar.heading"
                value="High Performance Guarantee!"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-base font-black text-[#0b4ea2]"
              />

              <div className="grid grid-cols-2 gap-3 w-full my-2">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-[#f26522] text-white flex flex-col items-center justify-center border-2 border-dashed border-white shadow-md">
                    <EditableText
                      textKey="p4.yr30.num"
                      value="30"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-3xl font-black leading-none"
                    />
                    <EditableText
                      textKey="p4.yr30.lbl"
                      value="YEARS"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] font-black"
                    />
                  </div>
                  <EditableText
                    as="p"
                    textKey="p4.yr30.sub"
                    value="LINEAR POWER OUTPUT WARRANTY"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="text-[10px] font-black text-[#0b4ea2] mt-1.5 leading-tight"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-[#f26522] text-white flex flex-col items-center justify-center border-2 border-dashed border-white shadow-md">
                    <EditableText
                      textKey="p4.yr12.num"
                      value="12"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-3xl font-black leading-none"
                    />
                    <EditableText
                      textKey="p4.yr12.lbl"
                      value="YEARS"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] font-black"
                    />
                  </div>
                  <EditableText
                    as="p"
                    textKey="p4.yr12.sub"
                    value="PRODUCT WARRANTY"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="text-[10px] font-black text-[#0b4ea2] mt-1.5 leading-tight"
                  />
                </div>
              </div>

              <EditableImageBox
                imageKey="p4.certificationsImg"
                defaultUrl="/assets/proposal-template/crops/p4-certifications.png"
                alt="IEC & ISO Certifications"
                width={260}
                height={90}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p4.certificationsImg']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </div>
          </MovableBlock>

          {/* Footer Bar */}
          <OfficialBlueFooterBar
            pageNum={4}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
            noNegativeMargin={true}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 5: OUR OFFER FOR YOU (COMMERCIAL PROPOSAL & BANK DETAILS)            */}
      {/* ========================================================================= */}
      {shouldRenderPage(5) && (
        <div
          id="proposal-page-5"
          data-page-number="5"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl p-10 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(5, 'Commercial Offer')}

          <div className="relative z-10 space-y-4">
            <OfficialCenteredPageHeader
              pageNum={5}
              orangePart="Our offer for"
              bluePart="you"
              orangeKey="p5.title.orange"
              blueKey="p5.title.blue"
              logoConfig={logoConfig}
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              textOverrides={textOverrides}
              imageOverrides={imageOverrides}
              transforms={transforms}
              onCommitText={handleCommitText}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />

            <MovableBlock
              blockId="p5-main-offer-card"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p5-main-offer-card']}
              onUpdateTransform={handleUpdateTransform}
              label="Offer & Price Card"
              className="bg-[#f5f5f5] rounded-2xl p-6 space-y-5"
            >
              <MovableBlock
                blockId="p5-customer-block"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p5-customer-block']}
                onUpdateTransform={handleUpdateTransform}
                label="Customer Details"
              >
                <EditableText
                  as="h2"
                  textKey="customerName"
                  value={data.customerName}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-base font-black text-slate-900 block"
                />
                <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                  <EditableText
                    textKey="customerMobile"
                    value={data.customerMobile}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <span>-</span>
                  <EditableText
                    textKey="customerCity"
                    value={data.customerCity}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </MovableBlock>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <MovableBlock
                  blockId="p5-spec-size"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-size']}
                  onUpdateTransform={handleUpdateTransform}
                  label="System Size"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.systemSize"
                      value="System size"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="p5.val.systemSize"
                      value={`${data.systemSizeKW} KW`}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900"
                    />
                  </div>
                </MovableBlock>

                <MovableBlock
                  blockId="p5-spec-panel"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-panel']}
                  onUpdateTransform={handleUpdateTransform}
                  label="Panel Model"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.panel"
                      value="Panel"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="panelModel"
                      value={data.panelModel}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900 uppercase"
                    />
                  </div>
                </MovableBlock>

                <MovableBlock
                  blockId="p5-spec-inverter"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-inverter']}
                  onUpdateTransform={handleUpdateTransform}
                  label="Inverter"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.inverter"
                      value="Inverter"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="p5.val.inverter"
                      value={`ON Grid ${data.inverterCapacityKW || data.systemSizeKW}KW Inverter`}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900"
                    />
                  </div>
                </MovableBlock>

                <MovableBlock
                  blockId="p5-spec-date"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-date']}
                  onUpdateTransform={handleUpdateTransform}
                  label="Quotation Date"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.date"
                      value="Quotation date"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="p5.val.date"
                      value={new Date(data.date).toLocaleDateString('en-GB')}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900"
                    />
                  </div>
                </MovableBlock>

                <MovableBlock
                  blockId="p5-spec-structure"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-structure']}
                  onUpdateTransform={handleUpdateTransform}
                  label="Structure"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.structure"
                      value="Structure"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="structureDetails"
                      value={data.structureDetails}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900"
                    />
                  </div>
                </MovableBlock>

                <MovableBlock
                  blockId="p5-spec-service"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-service']}
                  onUpdateTransform={handleUpdateTransform}
                  label="Free Service"
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.service"
                      value="Free Service"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="p5.val.service"
                      value={`${data.freeServiceYears} Years`}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900"
                    />
                  </div>
                </MovableBlock>

                <MovableBlock
                  blockId="p5-spec-offering"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms['p5-spec-offering']}
                  onUpdateTransform={handleUpdateTransform}
                  label="Offering Kit"
                  className="flex items-center gap-3 col-span-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f26522] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableText
                      as="p"
                      textKey="p5.label.offering"
                      value="Offering"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-[11px] text-slate-500 font-medium"
                    />
                    <EditableText
                      as="p"
                      textKey="offeringKit"
                      value={data.offeringKit}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-black text-slate-900 uppercase"
                    />
                  </div>
                </MovableBlock>
              </div>

              <MovableBlock
                blockId="p5-price-table"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p5-price-table']}
                onUpdateTransform={handleUpdateTransform}
                label="Commercial Price Table"
                className="mt-4 border border-slate-500 bg-white text-xs"
              >
                <div className="grid grid-cols-2 border-b border-slate-500 font-black text-[#0077cc]">
                  <div className="px-4 py-2 border-r border-slate-500">
                    <EditableText
                      textKey="p5.tbl.col1"
                      value="Price"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  </div>
                  <div className="px-4 py-2">
                    <EditableText
                      textKey="p5.tbl.col2"
                      value="Cost"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  </div>
                </div>

                {[
                  {
                    labelKey: 'p5.row1.label',
                    label: 'Rooftop system',
                    valKey: 'price.rooftop',
                    val: data.rooftopSystemPrice.toLocaleString('en-IN'),
                    bold: false,
                  },
                  {
                    labelKey: 'p5.row2.label',
                    label: 'Additional charges',
                    valKey: 'price.additional',
                    val: data.additionalCharges.toLocaleString('en-IN'),
                    bold: false,
                  },
                  {
                    labelKey: 'p5.row3.label',
                    label: 'Deep clean brush',
                    valKey: 'price.brush',
                    val: data.deepCleanBrush,
                    bold: false,
                  },
                  {
                    labelKey: 'p5.row4.label',
                    label: 'Discount',
                    valKey: 'price.discount',
                    val: data.discount.toLocaleString('en-IN'),
                    bold: false,
                  },
                  {
                    labelKey: 'p5.row5.label',
                    label: `Net Price (Inclusive of ${data.gstRate}% GST)`,
                    valKey: 'price.netGst',
                    val: data.netPriceWithGST.toLocaleString('en-IN'),
                    bold: true,
                  },
                  {
                    labelKey: 'p5.row6.label',
                    label: 'PM Surya Ghar Subsidy',
                    valKey: 'price.subsidy',
                    val: data.subsidyAmount.toLocaleString('en-IN'),
                    bold: true,
                  },
                  {
                    labelKey: 'p5.row7.label',
                    label: 'Net Effective Price*',
                    valKey: 'price.netEffective',
                    val: data.netEffectivePrice.toLocaleString('en-IN'),
                    bold: true,
                  },
                ].map((row, idx) => (
                  <div
                    key={row.labelKey}
                    className={`grid grid-cols-2 ${idx < 6 ? 'border-b border-slate-500' : ''} ${
                      row.bold ? 'font-black text-slate-950' : 'font-medium text-slate-800'
                    }`}
                  >
                    <div className="px-4 py-2 border-r border-slate-500">
                      <EditableText
                        textKey={row.labelKey}
                        value={row.label}
                        interactive={isInteractive}
                        manualMoveMode={manualMoveMode}
                        textOverrides={textOverrides}
                        onCommitText={handleCommitText}
                      />
                    </div>
                    <div className="px-4 py-2">
                      <EditableText
                        textKey={row.valKey}
                        value={row.val}
                        interactive={isInteractive}
                        manualMoveMode={manualMoveMode}
                        textOverrides={textOverrides}
                        onCommitText={handleCommitText}
                      />
                    </div>
                  </div>
                ))}
              </MovableBlock>
            </MovableBlock>

            <MovableBlock
              blockId="p5-payment-bank-card"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p5-payment-bank-card']}
              onUpdateTransform={handleUpdateTransform}
              label="Payment & Bank Details"
              className="bg-[#f5f5f5] rounded-2xl p-6 grid grid-cols-2 gap-8 text-xs"
            >
              <div>
                <EditableText
                  as="h4"
                  textKey="p5.paymentTermsHeading"
                  value="PaymentTerms:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-bold text-[#0077cc] mb-2 text-sm block"
                />
                <div className="space-y-1.5 text-slate-600 font-medium leading-relaxed">
                  <EditableText
                    as="p"
                    textKey="p5.pt.1"
                    value={`a. ${data.paymentTerms.advancePct}% ${data.paymentTerms.advanceTime}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p5.pt.2"
                    value={`b. ${data.paymentTerms.dispatchPct}% ${data.paymentTerms.dispatchTime}.`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p5.pt.3"
                    value={`c. ${data.paymentTerms.netmeterPct}% ${data.paymentTerms.netmeterTime}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </div>

              <div>
                <EditableText
                  as="h4"
                  textKey="p5.bankDetailsHeading"
                  value="BankDetails:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-bold text-[#0077cc] mb-2 text-sm block"
                />
                <div className="space-y-1 text-slate-600 font-medium">
                  <EditableText
                    as="p"
                    textKey="bank.company"
                    value={data.bankDetails.companyName}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="bank.name"
                    value={`Bank Name - ${data.bankDetails.bankName}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="bank.branch"
                    value={`Branch - ${data.bankDetails.branch}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="bank.acc"
                    value={`Account no. - ${data.bankDetails.accountNo}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="bank.ifsc"
                    value={`IFSC code - ${data.bankDetails.ifsc}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </div>
            </MovableBlock>

            <MovableBlock
              blockId="p5-payment-note"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p5-payment-note']}
              onUpdateTransform={handleUpdateTransform}
              label="Payment Note"
            >
              <EditableText
                as="p"
                textKey="p5.paymentNote"
                value={pageTexts.paymentNote}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-xs font-black text-[#f26522] tracking-wide pl-2"
              />
            </MovableBlock>
          </div>

          <OfficialBlueFooterBar
            pageNum={5}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 6: BILL OF MATERIAL (WITH REPLACEABLE & DRAGGABLE PRODUCT PHOTOS)    */}
      {/* ========================================================================= */}
      {shouldRenderPage(6) && (
        <div
          id="proposal-page-6"
          data-page-number="6"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl p-10 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(6, 'Bill of Material')}

          <div className="relative z-10">
            <OfficialCenteredPageHeader
              pageNum={6}
              orangePart={pageTexts.page6Title || 'Bill of Material'}
              orangeKey="p6.title"
              logoConfig={logoConfig}
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              textOverrides={textOverrides}
              imageOverrides={imageOverrides}
              transforms={transforms}
              onCommitText={handleCommitText}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />

            <div className="mt-3 space-y-1.5">
              <MovableBlock
                blockId="p6-bom-header"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p6-bom-header']}
                onUpdateTransform={handleUpdateTransform}
                label="BOM Header"
                className="grid grid-cols-12 bg-[#0b4ea2] text-white px-5 py-3 rounded-t-xl font-bold text-xs"
              >
                <div className="col-span-5">
                  <EditableText
                    textKey="p6.col.desc"
                    value="Item Description"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
                <div className="col-span-4 text-center">
                  <EditableText
                    textKey="p6.col.make"
                    value="Make"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
                <div className="col-span-1.5 text-center">
                  <EditableText
                    textKey="p6.col.qty"
                    value="Qty"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
                <div className="col-span-1.5 text-center">
                  <EditableText
                    textKey="p6.col.uom"
                    value="UoM"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </MovableBlock>

              {data.lineItems.map((item, idx) => {
                const isGrayRow = idx % 2 === 1;
                const defaultMakeImg =
                  item.makeImageUrl ||
                  DEFAULT_BOM_IMAGES[idx] ||
                  '/assets/proposal-template/crops/bom-polycab.png';
                const isPhotoRow = idx === 2 || idx === 3 || idx === 4 || idx === 7;

                return (
                  <MovableBlock
                    key={item.id || idx}
                    blockId={`p6-bom-row-${idx}`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    transform={transforms[`p6-bom-row-${idx}`]}
                    onUpdateTransform={handleUpdateTransform}
                    label={`BOM Row ${idx + 1}`}
                    className={`grid grid-cols-12 items-center px-5 py-2.5 rounded-xl text-xs ${
                      isGrayRow ? 'bg-[#e2e2e2]' : 'bg-white'
                    }`}
                  >
                    <div className="col-span-5 pr-3 whitespace-pre-line">
                      <EditableText
                        as="div"
                        textKey={`bom.desc.${idx}`}
                        value={item.description}
                        interactive={isInteractive}
                        manualMoveMode={manualMoveMode}
                        textOverrides={textOverrides}
                        onCommitText={handleCommitText}
                        className="font-bold text-slate-900 leading-snug text-[11.5px]"
                      />
                    </div>

                    <div className="col-span-4 flex flex-col items-center justify-center">
                      <EditableImageBox
                        imageKey={`bom.img.${idx}`}
                        defaultUrl={defaultMakeImg}
                        alt={item.make || `BOM Item ${idx + 1}`}
                        width={idx === 2 ? 155 : isPhotoRow ? 82 : 105}
                        height={isPhotoRow ? 66 : 38}
                        fit="contain"
                        interactive={isInteractive}
                        manualMoveMode={manualMoveMode}
                        imageOverrides={imageOverrides}
                        transform={transforms[`bom.img.${idx}`]}
                        onCommitImage={handleCommitImage}
                        onUpdateTransform={handleUpdateTransform}
                      />
                    </div>

                    <div className="col-span-1.5 text-center font-bold text-slate-800">
                      <EditableText
                        textKey={`bom.qty.${idx}`}
                        value={item.qty}
                        interactive={isInteractive}
                        manualMoveMode={manualMoveMode}
                        textOverrides={textOverrides}
                        onCommitText={handleCommitText}
                      />
                    </div>

                    <div className="col-span-1.5 text-center font-bold text-slate-700">
                      <EditableText
                        textKey={`bom.uom.${idx}`}
                        value={item.uom}
                        interactive={isInteractive}
                        manualMoveMode={manualMoveMode}
                        textOverrides={textOverrides}
                        onCommitText={handleCommitText}
                      />
                    </div>
                  </MovableBlock>
                );
              })}
            </div>
          </div>

          <OfficialBlueFooterBar
            pageNum={6}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 7: EASY FINANCING & EMI PLANS                                        */}
      {/* ========================================================================= */}
      {shouldRenderPage(7) && (
        <div
          id="proposal-page-7"
          data-page-number="7"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl p-10 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(7, 'Easy Financing & EMI')}

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-[140px] shrink-0" />
              <MovableBlock
                blockId="p7-header-title"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p7-header-title']}
                onUpdateTransform={handleUpdateTransform}
                label="Financing Title"
                className="flex-1 text-center"
              >
                <EditableText
                  as="h2"
                  textKey="p7.subtitle"
                  value={pageTexts.page7Subtitle || 'Easy financing from'}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-2xl font-black text-[#f26522] leading-tight"
                />
                <EditableText
                  as="h1"
                  textKey="p7.title"
                  value={pageTexts.page7Title || 'PM Surya Ghar / Jan Samarth Portal'}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-2xl font-black text-[#0b4ea2] leading-tight"
                />
              </MovableBlock>
              <MovableBlock
                blockId="p7-header-logo"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p7-header-logo']}
                onUpdateTransform={handleUpdateTransform}
                label="Brand Logo"
                className="w-[145px] flex justify-end shrink-0"
              >
                {logoConfig.showLogo && (
                  <EditableImageBox
                    imageKey="p7.logo"
                    defaultUrl={
                      logoConfig.url || '/assets/proposal-template/crops/kypas-header-logo.png'
                    }
                    alt="KYPAS Solar Logo"
                    width={logoConfig.width || 145}
                    height={logoConfig.height || 68}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    imageOverrides={imageOverrides}
                    transform={transforms['p7.logo']}
                    onCommitImage={handleCommitImage}
                    onUpdateTransform={handleUpdateTransform}
                  />
                )}
              </MovableBlock>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 pt-2">
              {[
                {
                  id: 'p7-bar-price',
                  labelKey: 'p7.bar1.lbl',
                  label: 'Solar System Price',
                  valKey: 'p7.bar1.val',
                  val: `₹ ${data.financing.solarSystemPrice.toLocaleString('en-IN')}`,
                },
                {
                  id: 'p7-bar-fees',
                  labelKey: 'p7.bar2.lbl',
                  label: 'Processing Fees',
                  valKey: 'p7.bar2.val',
                  val: `₹ ${data.financing.processingFees.toLocaleString('en-IN')}`,
                },
                {
                  id: 'p7-bar-down',
                  labelKey: 'p7.bar3.lbl',
                  label: `Down Payment ( ${data.financing.downPaymentPct} %)`,
                  valKey: 'p7.bar3.val',
                  val: `₹ ${data.financing.downPaymentAmount.toLocaleString('en-IN')}`,
                },
                {
                  id: 'p7-bar-rate',
                  labelKey: 'p7.bar4.lbl',
                  label: 'Interest Rate',
                  valKey: 'p7.bar4.val',
                  val: `${data.financing.interestRate} %`,
                },
                {
                  id: 'p7-bar-loan',
                  labelKey: 'p7.bar5.lbl',
                  label: 'Loan Amount',
                  valKey: 'p7.bar5.val',
                  val: `₹ ${data.financing.loanAmount.toLocaleString('en-IN')}`,
                },
              ].map(bar => (
                <MovableBlock
                  key={bar.id}
                  blockId={bar.id}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms[bar.id]}
                  onUpdateTransform={handleUpdateTransform}
                  label={bar.label}
                  className="grid grid-cols-12 rounded-md overflow-hidden text-white font-bold text-xs shadow-xs"
                >
                  <div className="col-span-7 bg-[#f26522] px-4 py-2.5 flex items-center">
                    <EditableText
                      textKey={bar.labelKey}
                      value={bar.label}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  </div>
                  <div className="col-span-5 bg-[#0b4ea2] px-3 py-2.5 flex items-center justify-center text-center">
                    <EditableText
                      textKey={bar.valKey}
                      value={bar.val}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  </div>
                </MovableBlock>
              ))}
            </div>

            <div className="flex justify-center pt-1">
              <MovableBlock
                blockId="p7-emi-banner"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms['p7-emi-banner']}
                onUpdateTransform={handleUpdateTransform}
                label="EMI Plans Badge"
                className="w-60 rounded-md overflow-hidden shadow-xs text-center"
              >
                <div className="h-2.5 bg-[#0b4ea2]" />
                <div className="bg-[#f26522] text-white py-2 font-black text-base">
                  <EditableText
                    textKey="p7.emiBanner"
                    value="EMI Plans"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              </MovableBlock>
            </div>

            <div className="grid grid-cols-4 gap-5 px-4">
              {data.financing.emiPlans.map((plan, idx) => (
                <MovableBlock
                  key={`emi-${idx}`}
                  blockId={`p7-emi-card-${idx}`}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  transform={transforms[`p7-emi-card-${idx}`]}
                  onUpdateTransform={handleUpdateTransform}
                  label={`${plan.months}M EMI`}
                  className="rounded-xl overflow-hidden text-center shadow-sm"
                >
                  <div className="bg-[#0b4ea2] text-white py-3.5 font-bold text-sm">
                    <EditableText
                      textKey={`p7.emi.months.${idx}`}
                      value={`${plan.months} Months`}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  </div>
                  <div className="bg-[#f26522] text-white py-4 font-black text-base">
                    <EditableText
                      textKey={`p7.emi.val.${idx}`}
                      value={`₹ ${plan.emi.toLocaleString('en-IN')}`}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  </div>
                </MovableBlock>
              ))}
            </div>

            <MovableBlock
              blockId="p7-docs-card"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p7-docs-card']}
              onUpdateTransform={handleUpdateTransform}
              label="Documents Required"
              className="bg-[#f5f5f5] rounded-2xl p-6 space-y-3 text-xs"
            >
              <EditableText
                as="h3"
                textKey="p7.docs.heading"
                value="Documents Required"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="font-black text-slate-900 text-base block"
              />

              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-slate-600 font-medium text-[11px]">
                {pageTexts.documentsIndividual.map((doc, idx) => (
                  <EditableText
                    key={idx}
                    as="p"
                    textKey={`p7.doc.ind.${idx}`}
                    value={doc}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 text-[11px]">
                <div>
                  <EditableText
                    as="p"
                    textKey="p7.doc.part.title"
                    value="For Partnerships"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="font-black text-slate-900 text-xs mb-1"
                  />
                  {pageTexts.documentsPartnership.map((doc, idx) => (
                    <EditableText
                      key={idx}
                      as="p"
                      textKey={`p7.doc.part.${idx}`}
                      value={doc}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-slate-600 font-medium leading-relaxed"
                    />
                  ))}
                </div>

                <div>
                  <EditableText
                    as="p"
                    textKey="p7.doc.prop.title"
                    value="For Proprietorship"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="font-black text-slate-900 text-xs mb-1"
                  />
                  {pageTexts.documentsProprietorship.map((doc, idx) => (
                    <EditableText
                      key={idx}
                      as="p"
                      textKey={`p7.doc.prop.${idx}`}
                      value={doc}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-slate-600 font-medium leading-relaxed"
                    />
                  ))}
                </div>

                <div>
                  <EditableText
                    as="p"
                    textKey="p7.doc.pvt.title"
                    value="For PVT LTD Company"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="font-black text-slate-900 text-xs mb-1"
                  />
                  {pageTexts.documentsPvtLtd.map((doc, idx) => (
                    <EditableText
                      key={idx}
                      as="p"
                      textKey={`p7.doc.pvt.${idx}`}
                      value={doc}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-slate-600 font-medium leading-relaxed"
                    />
                  ))}
                </div>
              </div>
            </MovableBlock>
          </div>

          <OfficialBlueFooterBar
            pageNum={7}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 8: WARRANTY & SERVICES + TERMS AND CONDITIONS                        */}
      {/* ========================================================================= */}
      {shouldRenderPage(8) && (
        <div
          id="proposal-page-8"
          data-page-number="8"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl p-10 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(8, 'Warranty & Terms')}

          <div className="relative z-10 space-y-6">
            <OfficialCenteredPageHeader
              pageNum={8}
              orangePart="Warranty"
              bluePart="& Services"
              orangeKey="p8.title.orange"
              blueKey="p8.title.blue"
              logoConfig={logoConfig}
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              textOverrides={textOverrides}
              imageOverrides={imageOverrides}
              transforms={transforms}
              onCommitText={handleCommitText}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />

            <MovableBlock
              blockId="p8-warranty-card"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p8-warranty-card']}
              onUpdateTransform={handleUpdateTransform}
              label="Warranty Card"
              className="bg-[#f5f5f5] rounded-2xl py-8 px-12 text-center space-y-4"
            >
              <div className="grid grid-cols-2 font-black text-[#f26522] text-base pb-1">
                <EditableText
                  textKey="p8.col1"
                  value="Components"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                />
                <EditableText
                  textKey="p8.col2"
                  value="Years"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                />
              </div>

              {[
                {
                  k1: 'p8.w1.c',
                  c: 'Solar panel (product)',
                  k2: 'p8.w1.y',
                  y: `${data.warranty.panelProductYears} years`,
                },
                {
                  k1: 'p8.w2.c',
                  c: 'Solar panel (production)',
                  k2: 'p8.w2.y',
                  y: `${data.warranty.panelProductionYears} years`,
                },
                {
                  k1: 'p8.w3.c',
                  c: 'Inverter',
                  k2: 'p8.w3.y',
                  y: `${data.warranty.inverterYears} years`,
                },
                {
                  k1: 'p8.w4.c',
                  c: 'Structure design life',
                  k2: 'p8.w4.y',
                  y: `${data.warranty.structureDesignLifeYears}`,
                },
                {
                  k1: 'p8.w5.c',
                  c: 'Structure warranty',
                  k2: 'p8.w5.y',
                  y: `${data.warranty.structureWarrantyYears} years`,
                },
                {
                  k1: 'p8.w6.c',
                  c: 'Other components',
                  k2: 'p8.w6.y',
                  y: `${data.warranty.otherComponentsYears} years`,
                },
                {
                  k1: 'p8.w7.c',
                  c: 'Plant performance guarantee',
                  k2: 'p8.w7.y',
                  y: data.warranty.plantPerformanceGuarantee,
                },
              ].map(row => (
                <div key={row.k1} className="grid grid-cols-2 text-xs text-slate-600 font-semibold">
                  <EditableText
                    textKey={row.k1}
                    value={row.c}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    textKey={row.k2}
                    value={row.y}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>
              ))}
            </MovableBlock>

            <MovableBlock
              blockId="p8-terms-block"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p8-terms-block']}
              onUpdateTransform={handleUpdateTransform}
              label="Terms & Conditions"
              className="pt-4 space-y-4"
            >
              <EditableText
                as="h2"
                textKey="p8.termsTitle"
                value={pageTexts.termsTitle || 'Terms and conditions'}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-xl font-black text-slate-900 block"
              />
              <div className="space-y-4 text-xs text-slate-500 font-semibold leading-relaxed pl-2">
                {data.termsAndConditions.map((term, idx) => (
                  <EditableText
                    key={idx}
                    as="p"
                    textKey={`p8.term.${idx}`}
                    value={term}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                ))}
              </div>
            </MovableBlock>
          </div>

          <OfficialBlueFooterBar
            pageNum={8}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 9: KYPAS SOLAR : ASSURED ENERGY SAVINGS                              */}
      {/* ========================================================================= */}
      {shouldRenderPage(9) && (
        <div
          id="proposal-page-9"
          data-page-number="9"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl p-10 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(9, 'Assured Energy Savings')}

          <div className="relative z-10 space-y-6">
            <OfficialCenteredPageHeader
              pageNum={9}
              orangePart="KYPAS Solar"
              bluePart=": Assured Energy Savings"
              orangeKey="p9.title.orange"
              blueKey="p9.title.blue"
              logoConfig={logoConfig}
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              textOverrides={textOverrides}
              imageOverrides={imageOverrides}
              transforms={transforms}
              onCommitText={handleCommitText}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />

            <MovableBlock
              blockId="p9-guarantee-card"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p9-guarantee-card']}
              onUpdateTransform={handleUpdateTransform}
              label="Energy Guarantee Card"
              className="bg-[#f5f5f5] rounded-2xl p-8 space-y-6 text-xs"
            >
              <div className="space-y-1.5">
                <EditableText
                  as="h2"
                  textKey="p9.promiseTitle"
                  value={pageTexts.promiseTitle || 'Our Promise:'}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-sm font-black text-[#f26522] block"
                />
                {pageTexts.promiseLines.map((line, idx) => (
                  <EditableText
                    key={idx}
                    as="p"
                    textKey={`p9.promise.${idx}`}
                    value={line}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="text-slate-600 font-semibold leading-relaxed"
                  />
                ))}
              </div>

              <div className="space-y-2">
                <EditableText
                  as="h2"
                  textKey="p9.howItWorksTitle"
                  value={`How it Works: Example of a ${data.energyGuarantee.systemKW}kw`}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-sm font-black text-[#f26522] block"
                />

                <div className="space-y-1.5 pl-4 text-slate-800 font-semibold">
                  <EditableText
                    as="p"
                    textKey="p9.hw.1"
                    value={`• Year 1 Guarantee: ${data.energyGuarantee.year1Units} units of energy`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p9.hw.2"
                    value={`• Years 2-5 Guarantee: ${data.energyGuarantee.years2to5UnitsPerYear} units of energy per year`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                  <EditableText
                    as="p"
                    textKey="p9.hw.3"
                    value={`• Compensation: ₹${data.energyGuarantee.compensationPerUnit} for each unit of energy your system falls short.`}
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                  />
                </div>

                <div className="pl-10 pt-2 space-y-1.5 text-slate-600 font-semibold">
                  <EditableText
                    as="p"
                    textKey="p9.examplesHeading"
                    value="Examples:"
                    interactive={isInteractive}
                    manualMoveMode={manualMoveMode}
                    textOverrides={textOverrides}
                    onCommitText={handleCommitText}
                    className="font-black text-slate-900"
                  />
                  {pageTexts.exampleLines.map((ex, idx) => (
                    <EditableText
                      key={idx}
                      as="p"
                      textKey={`p9.example.${idx}`}
                      value={ex}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <EditableText
                  as="h2"
                  textKey="p9.detailsHeading"
                  value="Guarantee Details:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-sm font-black text-[#f26522] block"
                />
                <div className="space-y-2.5 pl-4 text-slate-600 font-semibold leading-relaxed">
                  {pageTexts.guaranteeDetailsList.map((detail, idx) => (
                    <EditableText
                      key={idx}
                      as="p"
                      textKey={`p9.detail.${idx}`}
                      value={`${idx + 1}. ${detail}`}
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                    />
                  ))}
                </div>
              </div>
            </MovableBlock>
          </div>

          <OfficialBlueFooterBar
            pageNum={9}
            website={data.companyDetails.website}
            phone={data.companyDetails.phone1}
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            textOverrides={textOverrides}
            transforms={transforms}
            onCommitText={handleCommitText}
            onUpdateTransform={handleUpdateTransform}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 10: CONTACT US & THANK YOU BACK COVER (100% DECOMPOSED BY DEFAULT)   */}
      {/* ========================================================================= */}
      {shouldRenderPage(10) && (
        <div
          id="proposal-page-10"
          data-page-number="10"
          className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl overflow-hidden flex flex-col justify-between print:shadow-none print:m-0 print:break-after-page"
          style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
        >
          {renderPageDecorations(10, 'Contact Us & Back Cover')}

          {/* TOP BANNER: SOLAR PANELS AT SUNRISE (CLICK TO REPLACE / RESIZE / DRAG) */}
          <div className="relative z-10 hover:z-30 focus-within:z-40 w-full h-[310px] shrink-0">
            <EditableImageBox
              imageKey="p10.topSunriseBanner"
              defaultUrl="/assets/proposal-template/crops/page10-top-banner.png"
              alt="Solar Panels Sunrise Banner"
              width={794}
              height={310}
              fit="cover"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              imageOverrides={imageOverrides}
              transform={transforms['p10.topSunriseBanner']}
              onCommitImage={handleCommitImage}
              onUpdateTransform={handleUpdateTransform}
            />
          </div>

          {/* MIDDLE SECTION: FOR FURTHER QUERIES CONTACT US + KYPAS LOGO */}
          <MovableBlock
            blockId="p10-contact-section"
            interactive={isInteractive}
            manualMoveMode={manualMoveMode}
            transform={transforms['p10-contact-section']}
            onUpdateTransform={handleUpdateTransform}
            label="Contact Us Details"
            className="relative z-20 px-10 py-6 flex-1 flex flex-col justify-center space-y-5 bg-white"
          >
            <div className="flex items-start justify-between">
              <div>
                <EditableText
                  as="h2"
                  textKey="p10.queriesHeading"
                  value="For Further Queries"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-3xl font-black text-[#f26522] leading-tight block"
                />
                <EditableText
                  as="h1"
                  textKey="p10.contactHeading"
                  value="Contact Us:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-3xl font-black text-[#0b4ea2] leading-tight block"
                />
              </div>

              {logoConfig.showLogo && (
                <EditableImageBox
                  imageKey="p10.logo"
                  defaultUrl={
                    logoConfig.url || '/assets/proposal-template/crops/kypas-header-logo.png'
                  }
                  alt="KYPAS Logo"
                  width={185}
                  height={88}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  imageOverrides={imageOverrides}
                  transform={transforms['p10.logo']}
                  onCommitImage={handleCommitImage}
                  onUpdateTransform={handleUpdateTransform}
                />
              )}
            </div>

            <div className="space-y-4 text-sm text-slate-800">
              <div>
                <EditableText
                  as="span"
                  textKey="p10.lbl.address"
                  value="Address:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-black text-[#f26522] text-base block"
                />
                <EditableText
                  as="p"
                  textKey="company.address"
                  value={data.companyDetails.address}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-bold text-slate-800 max-w-lg leading-relaxed"
                />
              </div>

              <div>
                <EditableText
                  as="span"
                  textKey="p10.lbl.contact"
                  value="Contact :"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-black text-[#f26522] text-base block"
                />
                <EditableText
                  as="p"
                  textKey="company.phone1"
                  value={`${data.companyDetails.phone1} / ${data.companyDetails.phone2}`}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-black text-slate-900 text-base"
                />
              </div>

              <div>
                <EditableText
                  as="span"
                  textKey="p10.lbl.email"
                  value="E-Mail:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-black text-[#f26522] text-base block"
                />
                <EditableText
                  as="p"
                  textKey="company.email"
                  value={data.companyDetails.email}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-bold text-slate-900"
                />
              </div>

              <div>
                <EditableText
                  as="span"
                  textKey="p10.lbl.visit"
                  value="Visit Us On:"
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-black text-[#f26522] text-base block"
                />
                <EditableText
                  as="p"
                  textKey="company.website"
                  value={data.companyDetails.website}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="font-black text-[#0b4ea2] text-base"
                />
              </div>
            </div>
          </MovableBlock>

          {/* BOTTOM AERIAL SOLAR HOMES BANNER + EDITABLE "Thank You !" */}
          <div className="relative z-10 w-full h-[300px] flex items-center justify-center shrink-0 pointer-events-none">
            <div className="absolute inset-0 z-0 pointer-events-auto hover:z-30 focus-within:z-40">
              <EditableImageBox
                imageKey="p10.bottomAerialBanner"
                defaultUrl="/assets/proposal-template/crops/page10-bottom-thankyou.png"
                alt="Aerial Solar Houses Banner"
                width={794}
                height={300}
                fit="cover"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                imageOverrides={imageOverrides}
                transform={transforms['p10.bottomAerialBanner']}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />
            </div>

            <MovableBlock
              blockId="p10-thankyou-banner"
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              transform={transforms['p10-thankyou-banner']}
              onUpdateTransform={handleUpdateTransform}
              label="Thank You Text"
              className="relative z-20 text-center bg-white/80 backdrop-blur-xs px-10 py-2 rounded-3xl shadow"
            >
              <EditableText
                as="h1"
                textKey="p10.thankyou"
                value="Thank You !"
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                onCommitText={handleCommitText}
                className="text-[58px] font-black text-[#0b4ea2] tracking-wide leading-none"
              />
            </MovableBlock>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DYNAMIC CUSTOM ADDED PAGES (PAGE 11, 12, ... ADDED BY USER)               */}
      {/* ========================================================================= */}
      {customPages.map(cp => {
        if (!shouldRenderPage(cp.pageNumber)) return null;
        return (
          <div
            key={cp.pageNumber}
            id={`proposal-page-${cp.pageNumber}`}
            data-page-number={String(cp.pageNumber)}
            className="kypas-a4-page relative w-[794px] h-[1123px] bg-white text-slate-900 shadow-2xl p-10 flex flex-col justify-between overflow-hidden print:shadow-none print:m-0 print:break-after-page"
            style={{ width: '794px', height: '1123px', minHeight: '1123px' }}
          >
            {renderPageDecorations(cp.pageNumber, cp.title)}

            <div className="relative z-10 space-y-6">
              <OfficialCenteredPageHeader
                pageNum={cp.pageNumber}
                orangePart={cp.title}
                orangeKey={`cp.${cp.pageNumber}.title`}
                logoConfig={logoConfig}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                textOverrides={textOverrides}
                imageOverrides={imageOverrides}
                transforms={transforms}
                onCommitText={handleCommitText}
                onCommitImage={handleCommitImage}
                onUpdateTransform={handleUpdateTransform}
              />

              <MovableBlock
                blockId={`cp-${cp.pageNumber}-card`}
                interactive={isInteractive}
                manualMoveMode={manualMoveMode}
                transform={transforms[`cp-${cp.pageNumber}-card`]}
                onUpdateTransform={handleUpdateTransform}
                label="Custom Page Content"
                className="bg-[#f5f5f5] rounded-2xl p-8 space-y-6"
              >
                <EditableText
                  as="h3"
                  textKey={`cp.${cp.pageNumber}.subtitle`}
                  value={cp.subtitle}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-lg font-black text-[#0b4ea2] block"
                />

                <EditableText
                  as="p"
                  textKey={`cp.${cp.pageNumber}.body`}
                  value={cp.bodyText}
                  interactive={isInteractive}
                  manualMoveMode={manualMoveMode}
                  textOverrides={textOverrides}
                  onCommitText={handleCommitText}
                  className="text-sm text-slate-700 font-medium leading-relaxed block"
                />

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-xs">
                    <EditableImageBox
                      imageKey={`cp.${cp.pageNumber}.img1`}
                      defaultUrl={
                        cp.heroImageUrl || '/assets/proposal-template/crops/p3-zam-structure-full.png'
                      }
                      alt="Custom Page Visual 1"
                      width={290}
                      height={220}
                      fit="cover"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      imageOverrides={imageOverrides}
                      transform={transforms[`cp.${cp.pageNumber}.img1`]}
                      onCommitImage={handleCommitImage}
                      onUpdateTransform={handleUpdateTransform}
                    />
                    <EditableText
                      as="p"
                      textKey={`cp.${cp.pageNumber}.cap1`}
                      value="Click to edit photo caption 1"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-bold text-slate-700 mt-2"
                    />
                  </div>

                  <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-xs">
                    <EditableImageBox
                      imageKey={`cp.${cp.pageNumber}.img2`}
                      defaultUrl={
                        cp.secondImageUrl || '/assets/proposal-template/crops/p1-family-clean.png'
                      }
                      alt="Custom Page Visual 2"
                      width={290}
                      height={220}
                      fit="cover"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      imageOverrides={imageOverrides}
                      transform={transforms[`cp.${cp.pageNumber}.img2`]}
                      onCommitImage={handleCommitImage}
                      onUpdateTransform={handleUpdateTransform}
                    />
                    <EditableText
                      as="p"
                      textKey={`cp.${cp.pageNumber}.cap2`}
                      value="Click to edit photo caption 2"
                      interactive={isInteractive}
                      manualMoveMode={manualMoveMode}
                      textOverrides={textOverrides}
                      onCommitText={handleCommitText}
                      className="text-xs font-bold text-slate-700 mt-2"
                    />
                  </div>
                </div>
              </MovableBlock>
            </div>

            <OfficialBlueFooterBar
              pageNum={cp.pageNumber}
              website={data.companyDetails.website}
              phone={data.companyDetails.phone1}
              interactive={isInteractive}
              manualMoveMode={manualMoveMode}
              textOverrides={textOverrides}
              transforms={transforms}
              onCommitText={handleCommitText}
              onUpdateTransform={handleUpdateTransform}
            />
          </div>
        );
      })}
        </div>
      </div>
    </ProposalCanvasContext.Provider>
  );
};
