/**
 * KYPAS SOLAR CRM PRO - Comprehensive Type Definitions
 * Enterprise Solar Power Sales, Installation, Financing Coordination, and After-Sales Service
 */

export type UserRole = 
  | 'Administrator'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Loan Processing Executive'
  | 'Service Manager'
  | 'Service Technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  isActive: boolean;
  department: 'Sales' | 'Finance' | 'Operations & Service' | 'Management';
  lastLogin?: string;
  createdAt: string;
}

export type LeadSource = 
  | 'Website'
  | 'Referral'
  | 'Marketing Campaign'
  | 'Field Sales';

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Interested'
  | 'Converted'
  | 'Lost';

export type SolarRequirement = 
  | 'Rooftop Residential'
  | 'Commercial & Industrial'
  | 'Agricultural Solar Pump'
  | 'Ground Mount';

export type CustomerPreference = 
  | 'On-Grid (Net Metering)'
  | 'Off-Grid (Battery Backup)'
  | 'Hybrid System'
  | 'Bifacial High Efficiency';

export interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  fullAddress: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  location: string;
  source: LeadSource;
  solarRequirement: SolarRequirement;
  systemCapacityKW: number;
  customerPreferences: CustomerPreference;
  assignedExecutiveId: string;
  assignedExecutiveName: string;
  nextFollowUpDate: string;
  status: LeadStatus;
  paymentPreference?: 'Loan' | 'Bank' | 'Cash';
  lostReason?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  convertedCustomerId?: string;
}

export type PaymentCategory = 'Loan' | 'Bank' | 'Cash';

export interface BankPaymentTransaction {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  paymentType: 'Bank' | 'Cash';
  amount: number;
  paymentStage: 'Advance' | 'Material Dispatch' | 'Commissioning' | 'Full Payment';
  date: string;
  bankName?: string;
  transferMode?: 'NEFT' | 'RTGS' | 'IMPS' | 'UPI' | 'Cheque';
  transactionUtrOrCheque?: string;
  targetAccount?: string;
  collectedBy?: string;
  receiptNumber: string;
  status: 'Verified' | 'Pending Verification' | 'Rejected';
  notes?: string;
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  date: string;
  type: 'Call' | 'Site Visit' | 'Email' | 'Meeting' | 'Quotation Sent' | 'Loan Followup' | 'Service Call';
  summary: string;
  performedBy: string;
  nextActionDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  leadId?: string;
  assignedExecutiveId: string;
  assignedExecutiveName: string;
  solarRequirement: SolarRequirement;
  systemCapacityKW: number;
  status: 'Active' | 'Installation in Progress' | 'Commissioned' | 'Under AMC';
  paymentMode?: PaymentCategory;
  totalProjectCost?: number;
  totalPaid?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type QuotationStatus = 
  | 'Draft'
  | 'Sent'
  | 'Under Discussion'
  | 'Approved'
  | 'Rejected';

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface QuotationVersionRecord {
  version: number;
  date: string;
  grandTotal: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  status: QuotationStatus;
  notes: string;
  createdBy: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  version: number;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  projectLocation: string;
  solarSystemCapacityKW: number;
  panelBrand: string;
  panelModel: string;
  panelWattage: number;
  panelQuantity: number;
  inverterBrand: string;
  inverterCapacityKW: number;
  inverterPhase: string;
  mountingStructure: string;
  lineItems: QuotationLineItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // e.g. 13.8 or 18%
  taxAmount: number;
  grandTotal: number;
  paymentTerms: string;
  validityDays: number;
  notesAndExclusions: string;
  status: QuotationStatus;
  revisions: QuotationVersionRecord[];
  convertedToInstallationId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = 
  | 'Not Applied'
  | 'Application Submitted'
  | 'Documents Pending'
  | 'Under Verification'
  | 'Approved'
  | 'Rejected'
  | 'Disbursed';

export interface LoanDocumentItem {
  id: string;
  name: string;
  required: boolean;
  submitted: boolean;
  submissionDate?: string;
  notes?: string;
}

export interface LoanApplication {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  relatedProjectId?: string;
  bankName: string;
  applicationRefNo: string;
  applicationDate: string;
  loanAmountRequested: number;
  loanAmountApproved: number;
  documents: LoanDocumentItem[];
  bankRepName: string;
  bankRepContact: string;
  verificationStatus: 'Pending' | 'In Progress' | 'Site Inspection Done' | 'Approved' | 'Queries Raised';
  approvalDate?: string;
  disbursementDate?: string;
  followUpDate: string;
  status: LoanStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type InstallationStatus = 
  | 'Scheduled'
  | 'Site Survey'
  | 'Structure Mounting'
  | 'Panel Installation'
  | 'Inverter & Wiring'
  | 'Net Metering & Inspection'
  | 'Commissioned';

export interface Installation {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  relatedQuotationId?: string;
  relatedLoanId?: string;
  projectAddress: string;
  solarCapacityKW: number;
  panelDetails: string;
  panelSerialNumbers: string;
  inverterDetails: string;
  inverterSerialNumber: string;
  structureDetails: string;
  installationTeam: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  plannedInstallationDate: string;
  actualInstallationDate?: string;
  commissioningDate?: string;
  status: InstallationStatus;
  warrantyPanelYears: number;
  warrantyInverterYears: number;
  warrantyWorkmanshipYears: number;
  warrantyStartDate?: string;
  warrantyExpiryDate?: string;
  completionNotes: string;
  checklist: {
    siteSurveyDone: boolean;
    civilStructureComplete: boolean;
    panelsMounted: boolean;
    electricalWiringEarthingDone: boolean;
    inverterTestingComplete: boolean;
    netMeterInstalled: boolean;
    handoverDocSigned: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type ServicePriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ServiceStatus = 'Open' | 'Assigned' | 'In Progress' | 'On Hold' | 'Resolved';

export type ServiceCategory = 
  | 'Inverter Fault'
  | 'Panel Cleaning/Damage'
  | 'Generation Drop'
  | 'Wiring/Earthing Issue'
  | 'Net Metering Problem'
  | 'Battery Issue'
  | 'Routine Inspection';

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  installationId: string;
  systemCapacityKW: number;
  category: ServiceCategory;
  issueDescription: string;
  priority: ServicePriority;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  assignedExecutiveName: string;
  scheduledVisitDate: string;
  actualVisitDate?: string;
  inspectionDetails?: string;
  workPerformed?: string;
  resolutionNotes?: string;
  completionDate?: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export type AMCStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Renewed';

export interface MaintenanceVisitRecord {
  id: string;
  date: string;
  technicianName: string;
  type: 'Preventive' | 'Breakdown' | 'Routine Cleaning & Inspection';
  status: 'Completed' | 'Scheduled' | 'Overdue';
  findings: string;
  generationReadingKW?: number;
}

export interface AMCContract {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  installationId: string;
  systemCapacityKW: number;
  startDate: string;
  endDate: string;
  contractValue: number;
  renewalDate: string;
  status: AMCStatus;
  maintenanceFrequency: 'Quarterly' | 'Bi-Annual' | 'Annual';
  preventiveSchedule: string;
  assignedServiceTeam: string;
  renewalFollowUpDate: string;
  notes: string;
  visitsHistory: MaintenanceVisitRecord[];
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 
  | 'Sales Follow-up'
  | 'Loan Follow-up'
  | 'Installation'
  | 'Service Visit'
  | 'Preventive Maintenance'
  | 'AMC Renewal';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time?: string;
  customerId: string;
  customerName: string;
  relatedRecordId: string;
  relatedRecordType: 'lead' | 'loan' | 'installation' | 'service' | 'amc';
  assignedTo: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  location?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'CONVERT' | 'LOGIN' | 'EXPORT';
  module: 'Leads' | 'Customers' | 'Quotations' | 'Loans' | 'Installations' | 'Services' | 'AMC' | 'Users' | 'Settings';
  recordId: string;
  recordIdentifier: string;
  details: string;
}

export interface CompanySettings {
  companyName: string;
  brandName?: string;
  brandBadge?: string;
  logoUrl?: string;
  logoType?: 'image' | 'icon';
  tagline: string;
  cin: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  supportPhone: string;
  website: string;
  registeredOffice: string;
  factoryOffice: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  taxConfig: {
    defaultSolarGSTRate: number; // Composite 13.8% or standard 18%
    enableGSTBreakup: boolean;
  };
  currency: {
    code: string;
    symbol: string;
    format: 'INR' | 'USD';
  };
  quotationDefaults: {
    validityDays: number;
    defaultPaymentTerms: string;
    standardExclusions: string;
  };
  reminderPreferences: {
    advanceAmcReminderDays: number;
    advanceFollowUpHours: number;
  };
}
