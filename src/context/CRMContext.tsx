import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  Customer,
  CustomerInteraction,
  Quotation,
  LoanApplication,
  Installation,
  ServiceTicket,
  AMCContract,
  CompanySettings,
  AuditLog,
  CalendarEvent,
  BankPaymentTransaction,
  PaymentCategory,
} from '../types/crm';
import { StorageService } from '../services/storageService';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface CRMContextType {
  // Data
  leads: Lead[];
  customers: Customer[];
  interactions: CustomerInteraction[];
  quotations: Quotation[];
  loans: LoanApplication[];
  installations: Installation[];
  services: ServiceTicket[];
  amcContracts: AMCContract[];
  auditLogs: AuditLog[];
  transactions: BankPaymentTransaction[];
  settings: CompanySettings;
  calendarEvents: CalendarEvent[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Payment & Transaction Actions
  createTransaction: (txn: Omit<BankPaymentTransaction, 'id'>) => { success: boolean; id?: string };
  setCustomerPaymentMode: (customerId: string, mode: PaymentCategory) => void;

  // Leads Actions
  createLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; leadId?: string; error?: string };
  importLeadsBatch: (leadsList: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]) => { success: number; skipped: number };
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => { success: boolean; customerId?: string; error?: string };

  // Customer Actions
  createCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; customerId?: string };
  importCustomersBatch: (customersList: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]) => { success: number; skipped: number };
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addInteraction: (interaction: Omit<CustomerInteraction, 'id' | 'date'>) => void;

  // Quotation Actions
  createQuotation: (quote: Omit<Quotation, 'id' | 'quotationNumber' | 'version' | 'revisions' | 'createdAt' | 'updatedAt'>) => { success: boolean; quotationId?: string };
  importQuotationsBatch: (quotesList: Omit<Quotation, 'id' | 'quotationNumber' | 'version' | 'revisions' | 'createdAt' | 'updatedAt'>[]) => { success: number; skipped: number };
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  reviseQuotation: (id: string, revisionNotes: string, newTotalOverrides?: Partial<Quotation>) => void;
  duplicateQuotation: (id: string) => string;
  convertQuotationToInstallation: (quotationId: string) => { success: boolean; installationId?: string; error?: string };

  // Loan Actions
  createLoan: (loan: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; loanId?: string };
  importLoansBatch: (loansList: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt'>[]) => { success: number; skipped: number };
  updateLoan: (id: string, updates: Partial<LoanApplication>) => void;
  toggleLoanDoc: (loanId: string, docId: string, submitted: boolean, notes?: string) => void;

  // Installation Actions
  createInstallation: (inst: Omit<Installation, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; installationId?: string };
  updateInstallation: (id: string, updates: Partial<Installation>) => void;
  toggleInstallationChecklist: (installationId: string, key: keyof Installation['checklist']) => void;

  // Service Actions
  createServiceTicket: (ticket: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => { success: boolean; ticketId?: string };
  updateServiceTicket: (id: string, updates: Partial<ServiceTicket>) => void;

  // AMC Actions
  createAMCContract: (amc: Omit<AMCContract, 'id' | 'contractNumber' | 'visitsHistory' | 'createdAt' | 'updatedAt'>) => { success: boolean; amcId?: string };
  updateAMCContract: (id: string, updates: Partial<AMCContract>) => void;
  recordAMCRenewal: (id: string, newEndDate: string, renewalValue: number, notes?: string) => void;
  addMaintenanceVisit: (amcId: string, visit: { date: string; technicianName: string; type: 'Preventive' | 'Breakdown' | 'Routine Cleaning & Inspection'; status: 'Completed'; findings: string; generationReadingKW?: number }) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  resetDatabase: (mode: 'demo' | 'clean') => void;

  // UI helpers
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  confirmDialog: ConfirmDialogOptions | null;
  showConfirmDialog: (options: ConfirmDialogOptions) => void;
  closeConfirmDialog: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [services, setServices] = useState<ServiceTicket[]>([]);
  const [amcContracts, setAMCContracts] = useState<AMCContract[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [transactions, setTransactions] = useState<BankPaymentTransaction[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(StorageService.getSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kypas_crm_theme_v1');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('kypas_crm_theme_v1', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load data on mount
  useEffect(() => {
    StorageService.init();
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setLeads(StorageService.getLeads());
    setCustomers(StorageService.getCustomers());
    setInteractions(StorageService.getInteractions());
    setQuotations(StorageService.getQuotations());
    setLoans(StorageService.getLoans());
    setInstallations(StorageService.getInstallations());
    setServices(StorageService.getServices());
    setAMCContracts(StorageService.getAMC());
    setAuditLogs(StorageService.getAuditLogs());
    setTransactions(StorageService.getTransactions());
    setSettings(StorageService.getSettings());
  };

  // Toast Helpers
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showConfirmDialog = (options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  // 1. Leads
  const createLead = (newLeadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check duplicate mobile
    const dupCheck = StorageService.checkDuplicateMobile(newLeadData.mobile);
    if (dupCheck.isDuplicate) {
      addToast({
        type: 'warning',
        title: 'Duplicate Contact Warning',
        message: `Mobile number ${newLeadData.mobile} already exists for ${dupCheck.name} in ${dupCheck.matchedIn} records!`,
      });
    }

    const nextNum = leads.length + 1;
    const leadId = `KYP-LD-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const createdLead: Lead = {
      ...newLeadData,
      id: leadId,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [createdLead, ...leads];
    setLeads(updated);
    StorageService.saveLeads(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Leads',
      recordId: leadId,
      recordIdentifier: createdLead.customerName,
      details: `Created lead ${leadId} for ${createdLead.customerName} (${createdLead.systemCapacityKW} kW).`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Lead Registered',
      message: `Lead ${leadId} successfully created for ${createdLead.customerName}.`,
    });

    return { success: true, leadId };
  };

  const importLeadsBatch = (leadsList: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[]): { success: number; skipped: number } => {
    if (!leadsList || leadsList.length === 0) return { success: 0, skipped: 0 };
    
    let successCount = 0;
    let skippedCount = 0;
    const now = new Date().toISOString();
    const newItems: Lead[] = [];
    const currentLeads = [...leads];

    leadsList.forEach((item, index) => {
      const cleanPhone = (item.mobile || '').replace(/\D/g, '').slice(-10);
      // Skip if phone is invalid or already present in current batch or existing leads
      if (!cleanPhone || cleanPhone.length < 10) {
        skippedCount++;
        return;
      }

      const isDuplicate = currentLeads.some(l => (l.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone) ||
                          newItems.some(l => (l.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone);

      if (isDuplicate) {
        skippedCount++;
        return;
      }

      const nextNum = currentLeads.length + newItems.length + 1;
      const leadId = `KYP-LD-2026-${String(nextNum).padStart(3, '0')}`;
      newItems.push({
        ...item,
        id: leadId,
        createdAt: now,
        updatedAt: now,
      });
      successCount++;
    });

    if (newItems.length > 0) {
      const updated = [...newItems, ...leads];
      setLeads(updated);
      StorageService.saveLeads(updated);

      StorageService.addAuditLog({
        userId: currentUser?.id || 'SYS',
        userName: currentUser?.name || 'System User',
        userRole: currentUser?.role || 'Administrator',
        action: 'CREATE',
        module: 'Leads',
        recordId: 'BATCH_IMPORT',
        recordIdentifier: `${successCount} Leads`,
        details: `Bulk imported ${successCount} leads from spreadsheet (${skippedCount} duplicates/invalid skipped).`,
      });
      setAuditLogs(StorageService.getAuditLogs());

      addToast({
        type: 'success',
        title: 'Leads Bulk Imported',
        message: `Successfully ingested ${successCount} leads into CRM database.`,
      });
    }

    return { success: successCount, skipped: skippedCount };
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const updated = leads.map(l => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    setLeads(updated);
    StorageService.saveLeads(updated);

    const lead = leads.find(l => l.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: updates.status && updates.status !== lead?.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'Leads',
      recordId: id,
      recordIdentifier: lead?.customerName || id,
      details: updates.status ? `Updated status to "${updates.status}".` : `Updated lead details.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'Lead Updated',
      message: `Lead ${id} has been saved.`,
    });
  };

  const deleteLead = (id: string) => {
    const lead = leads.find(l => l.id === id);
    const filtered = leads.filter(l => l.id !== id);
    setLeads(filtered);
    StorageService.saveLeads(filtered);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'DELETE',
      module: 'Leads',
      recordId: id,
      recordIdentifier: lead?.customerName || id,
      details: `Deleted lead ${id}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Lead Removed',
      message: `Lead ${id} was deleted.`,
    });
  };

  const convertLeadToCustomer = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return { success: false, error: 'Lead not found.' };

    if (lead.convertedCustomerId) {
      return { success: false, error: `Lead is already converted to customer ${lead.convertedCustomerId}` };
    }

    // Check duplicate customer by mobile
    const existing = customers.find(c => c.mobile.replace(/\D/g, '').slice(-10) === lead.mobile.replace(/\D/g, '').slice(-10));
    if (existing) {
      // Link to existing customer without creating duplicate
      updateLead(leadId, { status: 'Converted', convertedCustomerId: existing.id });
      addToast({
        type: 'info',
        title: 'Lead Linked to Customer',
        message: `Linked to existing customer profile ${existing.id} (${existing.name}).`,
      });
      return { success: true, customerId: existing.id };
    }

    const nextCustNum = 1000 + customers.length + 1;
    const customerId = `KYP-CUST-${nextCustNum}`;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id: customerId,
      name: lead.customerName,
      mobile: lead.mobile,
      email: lead.email,
      address: lead.fullAddress,
      city: lead.city,
      district: lead.district,
      state: lead.state,
      pincode: lead.pincode,
      leadId: lead.id,
      assignedExecutiveId: lead.assignedExecutiveId,
      assignedExecutiveName: lead.assignedExecutiveName,
      solarRequirement: lead.solarRequirement,
      systemCapacityKW: lead.systemCapacityKW,
      status: 'Active',
      notes: `Converted from Lead ${lead.id}. ${lead.notes}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedCustomers = [newCustomer, ...customers];
    setCustomers(updatedCustomers);
    StorageService.saveCustomers(updatedCustomers);

    // Update lead status
    updateLead(leadId, { status: 'Converted', convertedCustomerId: customerId });

    // Add initial interaction
    addInteraction({
      customerId,
      type: 'Meeting',
      summary: `Lead converted to customer account. Assigned to ${lead.assignedExecutiveName}.`,
      performedBy: currentUser?.name || 'Administrator',
    });

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CONVERT',
      module: 'Customers',
      recordId: customerId,
      recordIdentifier: newCustomer.name,
      details: `Converted lead ${leadId} to Customer account ${customerId}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Customer Created',
      message: `Lead converted successfully into Customer ${customerId} (${newCustomer.name}).`,
    });

    return { success: true, customerId };
  };

  // 2. Customers
  const createCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextNum = 1000 + customers.length + 1;
    const customerId = `KYP-CUST-${nextNum}`;
    const now = new Date().toISOString();

    const created: Customer = {
      ...customerData,
      id: customerId,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [created, ...customers];
    setCustomers(updated);
    StorageService.saveCustomers(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Customers',
      recordId: customerId,
      recordIdentifier: created.name,
      details: `Created customer profile ${customerId} for ${created.name}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Customer Registered',
      message: `Profile ${customerId} created for ${created.name}.`,
    });

    return { success: true, customerId };
  };

  const importCustomersBatch = (customersList: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]): { success: number; skipped: number } => {
    if (!customersList || customersList.length === 0) return { success: 0, skipped: 0 };

    let successCount = 0;
    let skippedCount = 0;
    const now = new Date().toISOString();
    const newItems: Customer[] = [];
    const currentCusts = [...customers];

    customersList.forEach((item, index) => {
      const cleanPhone = (item.mobile || '').replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length < 10) {
        skippedCount++;
        return;
      }

      const isDuplicate = currentCusts.some(c => (c.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone) ||
                          newItems.some(c => (c.mobile || '').replace(/\D/g, '').slice(-10) === cleanPhone);

      if (isDuplicate) {
        skippedCount++;
        return;
      }

      const nextNum = 1000 + currentCusts.length + newItems.length + 1;
      const customerId = `KYP-CUST-${nextNum}`;
      newItems.push({
        ...item,
        id: customerId,
        createdAt: now,
        updatedAt: now,
      });
      successCount++;
    });

    if (newItems.length > 0) {
      const updated = [...newItems, ...customers];
      setCustomers(updated);
      StorageService.saveCustomers(updated);

      StorageService.addAuditLog({
        userId: currentUser?.id || 'SYS',
        userName: currentUser?.name || 'System User',
        userRole: currentUser?.role || 'Administrator',
        action: 'CREATE',
        module: 'Customers',
        recordId: 'BATCH_IMPORT',
        recordIdentifier: `${successCount} Customers`,
        details: `Bulk imported ${successCount} customers from spreadsheet (${skippedCount} duplicates/invalid skipped).`,
      });
      setAuditLogs(StorageService.getAuditLogs());

      addToast({
        type: 'success',
        title: 'Customers Bulk Imported',
        message: `Successfully ingested ${successCount} customers into CRM database.`,
      });
    }

    return { success: successCount, skipped: skippedCount };
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updated = customers.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    setCustomers(updated);
    StorageService.saveCustomers(updated);

    const cust = customers.find(c => c.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'UPDATE',
      module: 'Customers',
      recordId: id,
      recordIdentifier: cust?.name || id,
      details: `Updated customer information.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'Customer Updated',
      message: `Customer ${id} profile has been saved.`,
    });
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    const filtered = customers.filter(c => c.id !== id);
    setCustomers(filtered);
    StorageService.saveCustomers(filtered);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'DELETE',
      module: 'Customers',
      recordId: id,
      recordIdentifier: cust?.name || id,
      details: `Deleted customer profile ${id}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Customer Deleted',
      message: `Customer ${id} removed.`,
    });
  };

  const addInteraction = (interactionData: Omit<CustomerInteraction, 'id' | 'date'>) => {
    const newInt: CustomerInteraction = {
      ...interactionData,
      id: `INT-${Date.now()}`,
      date: new Date().toISOString(),
    };
    const updated = [newInt, ...interactions];
    setInteractions(updated);
    StorageService.saveInteractions(updated);
  };

  // 3. Quotations
  const createQuotation = (quoteData: Omit<Quotation, 'id' | 'quotationNumber' | 'version' | 'revisions' | 'createdAt' | 'updatedAt'>) => {
    const nextNum = quotations.length + 1;
    const quotationId = `KYP-QT-2026-${String(nextNum).padStart(3, '0')}`;
    const quotationNumber = `KYP/QT/26-27/${String(nextNum + 40).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const created: Quotation = {
      ...quoteData,
      id: quotationId,
      quotationNumber,
      version: 1,
      revisions: [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [created, ...quotations];
    setQuotations(updated);
    StorageService.saveQuotations(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Quotations',
      recordId: quotationId,
      recordIdentifier: quotationNumber,
      details: `Created quotation ${quotationNumber} for ${created.customerName} (₹${created.grandTotal.toLocaleString('en-IN')}).`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Quotation Created',
      message: `Quotation ${quotationNumber} generated successfully.`,
    });

    return { success: true, quotationId };
  };

  const importQuotationsBatch = (quotesList: Omit<Quotation, 'id' | 'quotationNumber' | 'version' | 'revisions' | 'createdAt' | 'updatedAt'>[]): { success: number; skipped: number } => {
    if (!quotesList || quotesList.length === 0) return { success: 0, skipped: 0 };

    let successCount = 0;
    const now = new Date().toISOString();
    const newItems: Quotation[] = [];

    quotesList.forEach((item, index) => {
      const nextNum = quotations.length + newItems.length + 1;
      const quotationId = `KYP-QT-2026-${String(nextNum).padStart(3, '0')}`;
      const quotationNumber = `KYP/QT/26-27/${String(nextNum + 40).padStart(3, '0')}`;
      newItems.push({
        ...item,
        id: quotationId,
        quotationNumber,
        version: 1,
        revisions: [],
        createdAt: now,
        updatedAt: now,
      });
      successCount++;
    });

    if (newItems.length > 0) {
      const updated = [...newItems, ...quotations];
      setQuotations(updated);
      StorageService.saveQuotations(updated);

      StorageService.addAuditLog({
        userId: currentUser?.id || 'SYS',
        userName: currentUser?.name || 'System User',
        userRole: currentUser?.role || 'Administrator',
        action: 'CREATE',
        module: 'Quotations',
        recordId: 'BATCH_IMPORT',
        recordIdentifier: `${successCount} Proposals`,
        details: `Bulk imported ${successCount} quotations from spreadsheet.`,
      });
      setAuditLogs(StorageService.getAuditLogs());

      addToast({
        type: 'success',
        title: 'Quotations Bulk Imported',
        message: `Successfully imported ${successCount} quotations into CRM database.`,
      });
    }

    return { success: successCount, skipped: 0 };
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    const updated = quotations.map(q => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q));
    setQuotations(updated);
    StorageService.saveQuotations(updated);

    const quote = quotations.find(q => q.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: updates.status && updates.status !== quote?.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'Quotations',
      recordId: id,
      recordIdentifier: quote?.quotationNumber || id,
      details: updates.status ? `Updated quotation status to "${updates.status}".` : `Updated quotation details.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'Quotation Saved',
      message: `Quotation ${quote?.quotationNumber || id} updated.`,
    });
  };

  const deleteQuotation = (id: string) => {
    const quote = quotations.find(q => q.id === id);
    const updated = quotations.filter(q => q.id !== id);
    setQuotations(updated);
    StorageService.saveQuotations(updated);

    if (quote) {
      StorageService.addAuditLog({
        userId: currentUser?.id || 'SYS',
        userName: currentUser?.name || 'System User',
        userRole: currentUser?.role || 'Administrator',
        action: 'DELETE',
        module: 'Quotations',
        recordId: id,
        recordIdentifier: quote.quotationNumber,
        details: `Deleted quotation ${quote.quotationNumber} (${quote.customerName}).`,
      });
      setAuditLogs(StorageService.getAuditLogs());

      addToast({
        type: 'info',
        title: 'Quotation Deleted',
        message: `Quotation ${quote.quotationNumber} permanently deleted.`,
      });
    }
  };

  const reviseQuotation = (id: string, revisionNotes: string, newTotalOverrides?: Partial<Quotation>) => {
    const quote = quotations.find(q => q.id === id);
    if (!quote) return;

    const previousRevisionRecord = {
      version: quote.version,
      date: quote.updatedAt || quote.createdAt,
      subtotal: quote.subtotal,
      discount: quote.discount,
      taxAmount: quote.taxAmount,
      grandTotal: quote.grandTotal,
      status: quote.status,
      notes: revisionNotes || `Revision to Version ${quote.version + 1}`,
      createdBy: currentUser?.name || 'Sales Staff',
    };

    const newVersion = quote.version + 1;
    const updatedRevisions = [...quote.revisions, previousRevisionRecord];

    const updated = quotations.map(q => {
      if (q.id === id) {
        return {
          ...q,
          ...(newTotalOverrides || {}),
          version: newVersion,
          revisions: updatedRevisions,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    });

    setQuotations(updated);
    StorageService.saveQuotations(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'UPDATE',
      module: 'Quotations',
      recordId: id,
      recordIdentifier: quote.quotationNumber,
      details: `Created quotation Revision V${newVersion}: ${revisionNotes}`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: `Revised to V${newVersion}`,
      message: `Quotation updated with version history preserved.`,
    });
  };

  const duplicateQuotation = (id: string): string => {
    const source = quotations.find(q => q.id === id);
    if (!source) return '';

    const nextNum = quotations.length + 1;
    const quotationId = `KYP-QT-2026-${String(nextNum).padStart(3, '0')}`;
    const quotationNumber = `KYP/QT/26-27/${String(nextNum + 40).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const duplicated: Quotation = {
      ...source,
      id: quotationId,
      quotationNumber,
      version: 1,
      status: 'Draft',
      revisions: [],
      createdAt: now,
      updatedAt: now,
      convertedToInstallationId: undefined,
    };

    const updated = [duplicated, ...quotations];
    setQuotations(updated);
    StorageService.saveQuotations(updated);

    addToast({
      type: 'info',
      title: 'Quotation Duplicated',
      message: `Created draft copy ${quotationNumber} from ${source.quotationNumber}.`,
    });

    return quotationId;
  };

  const convertQuotationToInstallation = (quotationId: string) => {
    const quote = quotations.find(q => q.id === quotationId);
    if (!quote) return { success: false, error: 'Quotation not found.' };

    if (quote.convertedToInstallationId) {
      return { success: false, error: `Already linked to installation ${quote.convertedToInstallationId}` };
    }

    const nextNum = installations.length + 1;
    const installationId = `KYP-INS-${String(nextNum + 100)}`;
    const now = new Date().toISOString();

    const newInstallation: Installation = {
      id: installationId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerMobile: quote.customerMobile,
      relatedQuotationId: quote.id,
      projectAddress: quote.projectLocation,
      solarCapacityKW: quote.solarSystemCapacityKW,
      panelDetails: `${quote.panelBrand} ${quote.panelModel} (${quote.panelQuantity} Nos)`,
      panelSerialNumbers: 'Pending barcode scanning',
      inverterDetails: `${quote.inverterBrand} ${quote.inverterCapacityKW}kW ${quote.inverterPhase}`,
      inverterSerialNumber: 'Pending unboxing',
      structureDetails: quote.mountingStructure,
      installationTeam: 'Hyderabad Alpha Operations Team',
      assignedTechnicianId: 'USR-006',
      assignedTechnicianName: 'Anji Babu',
      plannedInstallationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Site Survey',
      warrantyPanelYears: 25,
      warrantyInverterYears: 5,
      warrantyWorkmanshipYears: 5,
      completionNotes: `Generated from Approved Quotation ${quote.quotationNumber}.`,
      checklist: {
        siteSurveyDone: false,
        civilStructureComplete: false,
        panelsMounted: false,
        electricalWiringEarthingDone: false,
        inverterTestingComplete: false,
        netMeterInstalled: false,
        handoverDocSigned: false,
      },
      createdAt: now,
      updatedAt: now,
    };

    const updatedInstallations = [newInstallation, ...installations];
    setInstallations(updatedInstallations);
    StorageService.saveInstallations(updatedInstallations);

    // Update quote
    updateQuotation(quotationId, {
      status: 'Approved',
      convertedToInstallationId: installationId,
    });

    // Update customer status
    updateCustomer(quote.customerId, { status: 'Installation in Progress' });

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CONVERT',
      module: 'Installations',
      recordId: installationId,
      recordIdentifier: quote.customerName,
      details: `Converted approved quotation ${quote.quotationNumber} into project installation ${installationId}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Installation Scheduled',
      message: `Project ${installationId} initialized for ${quote.customerName}.`,
    });

    return { success: true, installationId };
  };

  // 4. Loans
  const createLoan = (loanData: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextNum = loans.length + 1;
    const loanId = `KYP-LN-${String(nextNum + 100)}`;
    const now = new Date().toISOString();

    const created: LoanApplication = {
      ...loanData,
      id: loanId,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [created, ...loans];
    setLoans(updated);
    StorageService.saveLoans(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Loans',
      recordId: loanId,
      recordIdentifier: created.applicationRefNo || loanId,
      details: `Created loan record ${loanId} for ${created.customerName} with ${created.bankName}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Loan Tracker Created',
      message: `Loan record ${loanId} created for ${created.customerName}.`,
    });

    return { success: true, loanId };
  };

  const importLoansBatch = (loansList: Omit<LoanApplication, 'id' | 'createdAt' | 'updatedAt'>[]): { success: number; skipped: number } => {
    if (!loansList || loansList.length === 0) return { success: 0, skipped: 0 };

    let successCount = 0;
    const now = new Date().toISOString();
    const newItems: LoanApplication[] = [];

    loansList.forEach((item) => {
      const nextNum = loans.length + newItems.length + 1;
      const loanId = `KYP-LN-${String(nextNum + 100)}`;
      newItems.push({
        ...item,
        id: loanId,
        createdAt: now,
        updatedAt: now,
      });
      successCount++;
    });

    if (newItems.length > 0) {
      const updated = [...newItems, ...loans];
      setLoans(updated);
      StorageService.saveLoans(updated);

      StorageService.addAuditLog({
        userId: currentUser?.id || 'SYS',
        userName: currentUser?.name || 'System User',
        userRole: currentUser?.role || 'Administrator',
        action: 'CREATE',
        module: 'Loans',
        recordId: 'BATCH_IMPORT',
        recordIdentifier: `${successCount} Loan Records`,
        details: `Bulk imported ${successCount} loan applications from spreadsheet.`,
      });
      setAuditLogs(StorageService.getAuditLogs());

      addToast({
        type: 'success',
        title: 'Loans Bulk Imported',
        message: `Successfully imported ${successCount} loan applications into financing tracker.`,
      });
    }

    return { success: successCount, skipped: 0 };
  };

  const updateLoan = (id: string, updates: Partial<LoanApplication>) => {
    const updated = loans.map(l => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
    setLoans(updated);
    StorageService.saveLoans(updated);

    const loan = loans.find(l => l.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: updates.status && updates.status !== loan?.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'Loans',
      recordId: id,
      recordIdentifier: loan?.applicationRefNo || id,
      details: updates.status ? `Updated loan status to "${updates.status}".` : `Updated loan information.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'Loan Record Updated',
      message: `Loan application ${id} saved.`,
    });
  };

  const toggleLoanDoc = (loanId: string, docId: string, submitted: boolean, notes?: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const updatedDocs = loan.documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          submitted,
          submissionDate: submitted ? new Date().toISOString() : undefined,
          notes: notes !== undefined ? notes : d.notes,
        };
      }
      return d;
    });

    // Check if any required doc is still pending
    const hasPendingRequired = updatedDocs.some(d => d.required && !d.submitted);
    const newStatus = hasPendingRequired ? 'Documents Pending' : loan.status === 'Documents Pending' ? 'Under Verification' : loan.status;

    updateLoan(loanId, { documents: updatedDocs, status: newStatus });
  };

  // 5. Installations
  const createInstallation = (instData: Omit<Installation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nextNum = installations.length + 1;
    const installationId = `KYP-INS-${String(nextNum + 100)}`;
    const now = new Date().toISOString();

    const created: Installation = {
      ...instData,
      id: installationId,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [created, ...installations];
    setInstallations(updated);
    StorageService.saveInstallations(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Installations',
      recordId: installationId,
      recordIdentifier: created.customerName,
      details: `Scheduled new solar installation ${installationId} (${created.solarCapacityKW} kW).`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Installation Created',
      message: `Installation ${installationId} created for ${created.customerName}.`,
    });

    return { success: true, installationId };
  };

  const updateInstallation = (id: string, updates: Partial<Installation>) => {
    const updated = installations.map(ins => (ins.id === id ? { ...ins, ...updates, updatedAt: new Date().toISOString() } : ins));
    setInstallations(updated);
    StorageService.saveInstallations(updated);

    const inst = installations.find(i => i.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: updates.status && updates.status !== inst?.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'Installations',
      recordId: id,
      recordIdentifier: inst?.customerName || id,
      details: updates.status ? `Updated installation stage to "${updates.status}".` : `Updated installation progress.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'Installation Updated',
      message: `Installation ${id} has been saved.`,
    });
  };

  const toggleInstallationChecklist = (installationId: string, key: keyof Installation['checklist']) => {
    const inst = installations.find(i => i.id === installationId);
    if (!inst) return;

    const newChecklist = { ...inst.checklist, [key]: !inst.checklist[key] };
    
    // If all checklist items complete, offer to set status to Commissioned
    const allChecked = Object.values(newChecklist).every(val => val === true);
    const updates: Partial<Installation> = { checklist: newChecklist };
    if (allChecked && inst.status !== 'Commissioned') {
      updates.status = 'Commissioned';
      updates.commissioningDate = new Date().toISOString();
      updates.warrantyStartDate = new Date().toISOString();
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + (inst.warrantyPanelYears || 25));
      updates.warrantyExpiryDate = expDate.toISOString();

      // Also update customer status
      updateCustomer(inst.customerId, { status: 'Commissioned' });
    }

    updateInstallation(installationId, updates);
  };

  // 6. Services
  const createServiceTicket = (ticketData: Omit<ServiceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => {
    const nextNum = services.length + 1;
    const ticketId = `KYP-SRV-${String(nextNum + 100)}`;
    const ticketNumber = `SRV-2026-${String(nextNum + 40).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const created: ServiceTicket = {
      ...ticketData,
      id: ticketId,
      ticketNumber,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [created, ...services];
    setServices(updated);
    StorageService.saveServices(updated);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Services',
      recordId: ticketId,
      recordIdentifier: ticketNumber,
      details: `Logged service ticket ${ticketNumber} (${created.category}) for ${created.customerName}.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Service Ticket Logged',
      message: `Ticket ${ticketNumber} assigned to ${created.assignedTechnicianName}.`,
    });

    return { success: true, ticketId };
  };

  const updateServiceTicket = (id: string, updates: Partial<ServiceTicket>) => {
    const updated = services.map(s => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
    setServices(updated);
    StorageService.saveServices(updated);

    const ticket = services.find(s => s.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: updates.status && updates.status !== ticket?.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'Services',
      recordId: id,
      recordIdentifier: ticket?.ticketNumber || id,
      details: updates.status ? `Updated service status to "${updates.status}".` : `Updated service ticket details.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'Ticket Updated',
      message: `Service ticket ${ticket?.ticketNumber || id} updated.`,
    });
  };

  // 7. AMC
  const createAMCContract = (amcData: Omit<AMCContract, 'id' | 'contractNumber' | 'visitsHistory' | 'createdAt' | 'updatedAt'>) => {
    const nextNum = amcContracts.length + 1;
    const amcId = `KYP-AMC-${String(nextNum + 100)}`;
    const contractNumber = `AMC-2026-${String(nextNum + 30).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const created: AMCContract = {
      ...amcData,
      id: amcId,
      contractNumber,
      visitsHistory: [],
      createdAt: now,
      updatedAt: now,
    };

    const updated = [created, ...amcContracts];
    setAMCContracts(updated);
    StorageService.saveAMC(updated);

    updateCustomer(created.customerId, { status: 'Under AMC' });

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'AMC',
      recordId: amcId,
      recordIdentifier: contractNumber,
      details: `Created AMC Contract ${contractNumber} for ${created.customerName} (₹${created.contractValue.toLocaleString('en-IN')}).`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'AMC Contract Created',
      message: `Contract ${contractNumber} registered.`,
    });

    return { success: true, amcId };
  };

  const updateAMCContract = (id: string, updates: Partial<AMCContract>) => {
    const updated = amcContracts.map(a => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
    setAMCContracts(updated);
    StorageService.saveAMC(updated);

    const amc = amcContracts.find(a => a.id === id);
    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: updates.status && updates.status !== amc?.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'AMC',
      recordId: id,
      recordIdentifier: amc?.contractNumber || id,
      details: updates.status ? `Updated AMC status to "${updates.status}".` : `Updated AMC contract details.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'info',
      title: 'AMC Contract Saved',
      message: `AMC contract ${amc?.contractNumber || id} updated.`,
    });
  };

  const recordAMCRenewal = (id: string, newEndDate: string, renewalValue: number, notes?: string) => {
    const amc = amcContracts.find(a => a.id === id);
    if (!amc) return;

    const updates: Partial<AMCContract> = {
      status: 'Renewed',
      startDate: amc.endDate,
      endDate: newEndDate,
      renewalDate: newEndDate,
      contractValue: renewalValue,
      notes: notes ? `${amc.notes}\n[Renewal ${new Date().toLocaleDateString()}]: ${notes}` : amc.notes,
    };

    updateAMCContract(id, updates);

    addToast({
      type: 'success',
      title: 'AMC Contract Renewed',
      message: `Contract renewed through ${new Date(newEndDate).toLocaleDateString()}.`,
    });
  };

  const addMaintenanceVisit = (amcId: string, visit: { date: string; technicianName: string; type: 'Preventive' | 'Breakdown' | 'Routine Cleaning & Inspection'; status: 'Completed'; findings: string; generationReadingKW?: number }) => {
    const amc = amcContracts.find(a => a.id === amcId);
    if (!amc) return;

    const newVisit = {
      ...visit,
      id: `MV-${Date.now()}`,
    };

    const updatedVisits = [...amc.visitsHistory, newVisit];
    updateAMCContract(amcId, { visitsHistory: updatedVisits });

    addToast({
      type: 'success',
      title: 'Maintenance Visit Logged',
      message: `Visit on ${visit.date} recorded for ${amc.customerName}.`,
    });
  };

  // 8. Settings & DB Reset
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    StorageService.saveSettings(merged);

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'UPDATE',
      module: 'Settings',
      recordId: 'SETTINGS',
      recordIdentifier: 'Company Settings',
      details: `Updated company configuration and tax settings.`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Company profile and parameters successfully updated.',
    });
  };

  const resetDatabase = (mode: 'demo' | 'clean') => {
    if (mode === 'demo') {
      StorageService.resetToDemoData();
      refreshAllData();
      addToast({
        type: 'success',
        title: 'Demo Data Restored',
        message: 'Kypas Solar demonstration records loaded successfully.',
      });
    } else {
      StorageService.resetToCleanSlate();
      refreshAllData();
      addToast({
        type: 'warning',
        title: 'Clean Slate Active',
        message: 'All records cleared. Ready for fresh production data entry.',
      });
    }
  };

  const createTransaction = (txnData: Omit<BankPaymentTransaction, 'id'>) => {
    const nextNum = transactions.length + 1;
    const prefix = txnData.paymentType === 'Cash' ? 'TXN-CSH' : 'TXN-BNK';
    const id = `${prefix}-${String(nextNum + 10).padStart(3, '0')}`;

    const newTxn: BankPaymentTransaction = {
      ...txnData,
      id,
    };

    const updated = [newTxn, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(updated);

    // Also update customer's totalPaid
    const cust = customers.find(c => c.id === txnData.customerId);
    if (cust) {
      const currentPaid = cust.totalPaid || 0;
      updateCustomer(cust.id, {
        totalPaid: currentPaid + txnData.amount,
        paymentMode: txnData.paymentType,
      });
    }

    StorageService.addAuditLog({
      userId: currentUser?.id || 'SYS',
      userName: currentUser?.name || 'System User',
      userRole: currentUser?.role || 'Administrator',
      action: 'CREATE',
      module: 'Customers',
      recordId: id,
      recordIdentifier: newTxn.receiptNumber,
      details: `Recorded ${txnData.paymentType} payment of ₹${txnData.amount.toLocaleString('en-IN')} for ${newTxn.customerName} (${newTxn.paymentStage}).`,
    });
    setAuditLogs(StorageService.getAuditLogs());

    addToast({
      type: 'success',
      title: 'Payment Recorded',
      message: `${txnData.paymentType} payment of ₹${txnData.amount.toLocaleString('en-IN')} recorded for ${newTxn.customerName}.`,
    });

    return { success: true, id };
  };

  const setCustomerPaymentMode = (customerId: string, mode: PaymentCategory) => {
    updateCustomer(customerId, { paymentMode: mode });
    addToast({
      type: 'info',
      title: 'Payment Mode Updated',
      message: `Customer payment method set to ${mode}.`,
    });
  };

  const calendarEvents = StorageService.getCalendarEvents();

  return (
    <CRMContext.Provider
      value={{
        leads,
        customers,
        interactions,
        quotations,
        loans,
        installations,
        services,
        amcContracts,
        auditLogs,
        transactions,
        settings,
        calendarEvents,
        theme,
        toggleTheme,

        createTransaction,
        setCustomerPaymentMode,

        createLead,
        importLeadsBatch,
        updateLead,
        deleteLead,
        convertLeadToCustomer,

        createCustomer,
        importCustomersBatch,
        updateCustomer,
        deleteCustomer,
        addInteraction,

        createQuotation,
        importQuotationsBatch,
        updateQuotation,
        deleteQuotation,
        reviseQuotation,
        duplicateQuotation,
        convertQuotationToInstallation,

        createLoan,
        importLoansBatch,
        updateLoan,
        toggleLoanDoc,

        createInstallation,
        updateInstallation,
        toggleInstallationChecklist,

        createServiceTicket,
        updateServiceTicket,

        createAMCContract,
        updateAMCContract,
        recordAMCRenewal,
        addMaintenanceVisit,

        updateSettings,
        resetDatabase,

        toasts,
        addToast,
        removeToast,
        confirmDialog,
        showConfirmDialog,
        closeConfirmDialog,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
