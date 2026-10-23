import {
  User,
  Lead,
  Customer,
  Quotation,
  LoanApplication,
  Installation,
  ServiceTicket,
  AMCContract,
  CompanySettings,
  AuditLog,
  CustomerInteraction,
  CalendarEvent,
  BankPaymentTransaction,
} from '../types/crm';
import {
  initialUsers,
  initialCompanySettings,
  initialLeads,
  initialCustomers,
  initialInteractions,
  initialQuotations,
  initialLoans,
  initialInstallations,
  initialServiceTickets,
  initialAMCContracts,
  initialAuditLogs,
  initialTransactions,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'kypas_crm_users_v1',
  SETTINGS: 'kypas_crm_settings_v1',
  LEADS: 'kypas_crm_leads_v1',
  CUSTOMERS: 'kypas_crm_customers_v1',
  INTERACTIONS: 'kypas_crm_interactions_v1',
  QUOTATIONS: 'kypas_crm_quotations_v1',
  LOANS: 'kypas_crm_loans_v1',
  INSTALLATIONS: 'kypas_crm_installations_v1',
  SERVICES: 'kypas_crm_services_v1',
  AMC: 'kypas_crm_amc_v1',
  AUDIT_LOGS: 'kypas_crm_audit_logs_v1',
  TRANSACTIONS: 'kypas_crm_transactions_v1',
  CURRENT_USER: 'kypas_crm_auth_user_v1',
  THEME: 'kypas_crm_theme_v1',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function setItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export class StorageService {
  // Initialize storage if not already present
  static init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setItem(STORAGE_KEYS.USERS, initialUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setItem(STORAGE_KEYS.SETTINGS, initialCompanySettings);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      setItem(STORAGE_KEYS.LEADS, initialLeads);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      setItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTERACTIONS)) {
      setItem(STORAGE_KEYS.INTERACTIONS, initialInteractions);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUOTATIONS)) {
      setItem(STORAGE_KEYS.QUOTATIONS, initialQuotations);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
      setItem(STORAGE_KEYS.LOANS, initialLoans);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INSTALLATIONS)) {
      setItem(STORAGE_KEYS.INSTALLATIONS, initialInstallations);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      setItem(STORAGE_KEYS.SERVICES, initialServiceTickets);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AMC)) {
      setItem(STORAGE_KEYS.AMC, initialAMCContracts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      setItem(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    }
  }

  // Transactions (Bank and Cash Payments)
  static getTransactions(): BankPaymentTransaction[] {
    return getItem(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  }
  static saveTransactions(transactions: BankPaymentTransaction[]): void {
    setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  }
  static addTransaction(txn: BankPaymentTransaction): void {
    const list = this.getTransactions();
    list.unshift(txn);
    this.saveTransactions(list);
  }

  // Users
  static getUsers(): User[] {
    return getItem(STORAGE_KEYS.USERS, initialUsers);
  }
  static saveUsers(users: User[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  }

  // Settings
  static getSettings(): CompanySettings {
    const saved = getItem(STORAGE_KEYS.SETTINGS, initialCompanySettings);
    return {
      ...initialCompanySettings,
      ...saved,
    };
  }
  static saveSettings(settings: CompanySettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Leads
  static getLeads(): Lead[] {
    return getItem(STORAGE_KEYS.LEADS, initialLeads);
  }
  static saveLeads(leads: Lead[]): void {
    setItem(STORAGE_KEYS.LEADS, leads);
  }

  // Check duplicate mobile
  static checkDuplicateMobile(mobile: string, currentLeadId?: string): { isDuplicate: boolean; matchedIn: 'lead' | 'customer' | null; name?: string } {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length < 10) return { isDuplicate: false, matchedIn: null };

    const leads = this.getLeads();
    const existingLead = leads.find(l => l.id !== currentLeadId && l.mobile.replace(/\D/g, '').slice(-10) === cleanMobile);
    if (existingLead) {
      return { isDuplicate: true, matchedIn: 'lead', name: existingLead.customerName };
    }

    const customers = this.getCustomers();
    const existingCustomer = customers.find(c => c.mobile.replace(/\D/g, '').slice(-10) === cleanMobile);
    if (existingCustomer) {
      return { isDuplicate: true, matchedIn: 'customer', name: existingCustomer.name };
    }

    return { isDuplicate: false, matchedIn: null };
  }

  // Customers
  static getCustomers(): Customer[] {
    return getItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }
  static saveCustomers(customers: Customer[]): void {
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // Interactions
  static getInteractions(): CustomerInteraction[] {
    return getItem(STORAGE_KEYS.INTERACTIONS, initialInteractions);
  }
  static saveInteractions(interactions: CustomerInteraction[]): void {
    setItem(STORAGE_KEYS.INTERACTIONS, interactions);
  }

  // Quotations
  static getQuotations(): Quotation[] {
    return getItem(STORAGE_KEYS.QUOTATIONS, initialQuotations);
  }
  static saveQuotations(quotations: Quotation[]): void {
    setItem(STORAGE_KEYS.QUOTATIONS, quotations);
  }

  // Loans
  static getLoans(): LoanApplication[] {
    return getItem(STORAGE_KEYS.LOANS, initialLoans);
  }
  static saveLoans(loans: LoanApplication[]): void {
    setItem(STORAGE_KEYS.LOANS, loans);
  }

  // Installations
  static getInstallations(): Installation[] {
    return getItem(STORAGE_KEYS.INSTALLATIONS, initialInstallations);
  }
  static saveInstallations(installations: Installation[]): void {
    setItem(STORAGE_KEYS.INSTALLATIONS, installations);
  }

  // Services
  static getServices(): ServiceTicket[] {
    return getItem(STORAGE_KEYS.SERVICES, initialServiceTickets);
  }
  static saveServices(services: ServiceTicket[]): void {
    setItem(STORAGE_KEYS.SERVICES, services);
  }

  // AMC
  static getAMC(): AMCContract[] {
    return getItem(STORAGE_KEYS.AMC, initialAMCContracts);
  }
  static saveAMC(amcList: AMCContract[]): void {
    setItem(STORAGE_KEYS.AMC, amcList);
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  }
  static addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 500 logs to avoid unbounded growth
    setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500));
  }

  // Get Calendar Events dynamically from Leads, Loans, Installations, Services, AMC
  static getCalendarEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const leads = this.getLeads();
    const loans = this.getLoans();
    const installations = this.getInstallations();
    const services = this.getServices();
    const amcs = this.getAMC();

    // 1. Sales follow-ups
    leads.forEach(lead => {
      if (lead.nextFollowUpDate && lead.status !== 'Converted' && lead.status !== 'Lost') {
        const dateStr = lead.nextFollowUpDate.split('T')[0];
        events.push({
          id: `EV-LD-${lead.id}`,
          title: `Sales Follow-up: ${lead.customerName} (${lead.systemCapacityKW} kW)`,
          type: 'Sales Follow-up',
          date: dateStr,
          time: lead.nextFollowUpDate.includes('T') ? lead.nextFollowUpDate.split('T')[1].slice(0, 5) : '10:00',
          customerId: lead.convertedCustomerId || '',
          customerName: lead.customerName,
          relatedRecordId: lead.id,
          relatedRecordType: 'lead',
          assignedTo: lead.assignedExecutiveName,
          status: new Date(lead.nextFollowUpDate) < new Date() ? 'Overdue' : 'Pending',
          location: lead.location,
          notes: lead.notes,
        });
      }
    });

    // 2. Loan follow-ups
    loans.forEach(loan => {
      if (loan.followUpDate && loan.status !== 'Approved' && loan.status !== 'Disbursed' && loan.status !== 'Rejected') {
        const dateStr = loan.followUpDate.split('T')[0];
        events.push({
          id: `EV-LN-${loan.id}`,
          title: `Loan Follow-up: ${loan.bankName} - ${loan.customerName}`,
          type: 'Loan Follow-up',
          date: dateStr,
          customerId: loan.customerId,
          customerName: loan.customerName,
          relatedRecordId: loan.id,
          relatedRecordType: 'loan',
          assignedTo: loan.bankRepName,
          status: new Date(loan.followUpDate) < new Date() ? 'Overdue' : 'Pending',
          notes: loan.notes,
        });
      }
    });

    // 3. Installations
    installations.forEach(ins => {
      if (ins.plannedInstallationDate && ins.status !== 'Commissioned') {
        const dateStr = ins.plannedInstallationDate.split('T')[0];
        events.push({
          id: `EV-INS-${ins.id}`,
          title: `Solar Installation: ${ins.customerName} (${ins.solarCapacityKW} kW)`,
          type: 'Installation',
          date: dateStr,
          customerId: ins.customerId,
          customerName: ins.customerName,
          relatedRecordId: ins.id,
          relatedRecordType: 'installation',
          assignedTo: ins.assignedTechnicianName,
          status: new Date(ins.plannedInstallationDate) < new Date() ? 'Overdue' : 'Pending',
          location: ins.projectAddress,
          notes: ins.completionNotes,
        });
      }
    });

    // 4. Service Visits
    services.forEach(srv => {
      if (srv.scheduledVisitDate && srv.status !== 'Resolved') {
        const dateStr = srv.scheduledVisitDate.split('T')[0];
        events.push({
          id: `EV-SRV-${srv.id}`,
          title: `Service Visit: ${srv.category} - ${srv.customerName}`,
          type: 'Service Visit',
          date: dateStr,
          customerId: srv.customerId,
          customerName: srv.customerName,
          relatedRecordId: srv.id,
          relatedRecordType: 'service',
          assignedTo: srv.assignedTechnicianName,
          status: new Date(srv.scheduledVisitDate) < new Date() ? 'Overdue' : 'Pending',
          notes: srv.issueDescription,
        });
      }
    });

    // 5. AMC Renewals & Preventive
    amcs.forEach(amc => {
      if (amc.renewalDate) {
        const dateStr = amc.renewalDate.split('T')[0];
        events.push({
          id: `EV-AMC-${amc.id}`,
          title: `AMC Renewal Deadline: ${amc.customerName}`,
          type: 'AMC Renewal',
          date: dateStr,
          customerId: amc.customerId,
          customerName: amc.customerName,
          relatedRecordId: amc.id,
          relatedRecordType: 'amc',
          assignedTo: amc.assignedServiceTeam,
          status: new Date(amc.renewalDate) < new Date() && amc.status !== 'Renewed' ? 'Overdue' : 'Pending',
          notes: `Contract value: ₹${amc.contractValue.toLocaleString('en-IN')}`,
        });
      }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Backup & Restore
  static exportEntireDatabase(): string {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      company: 'KYPAS Solar Power Private Limited',
      users: this.getUsers(),
      settings: this.getSettings(),
      leads: this.getLeads(),
      customers: this.getCustomers(),
      interactions: this.getInteractions(),
      quotations: this.getQuotations(),
      loans: this.getLoans(),
      installations: this.getInstallations(),
      services: this.getServices(),
      amc: this.getAMC(),
      auditLogs: this.getAuditLogs(),
      transactions: this.getTransactions(),
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  static importDatabase(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.leads || !data.customers || !data.quotations) {
        return { success: false, message: 'Invalid CRM backup file format.' };
      }
      if (data.users) setItem(STORAGE_KEYS.USERS, data.users);
      if (data.settings) setItem(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.leads) setItem(STORAGE_KEYS.LEADS, data.leads);
      if (data.customers) setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.interactions) setItem(STORAGE_KEYS.INTERACTIONS, data.interactions);
      if (data.quotations) setItem(STORAGE_KEYS.QUOTATIONS, data.quotations);
      if (data.loans) setItem(STORAGE_KEYS.LOANS, data.loans);
      if (data.installations) setItem(STORAGE_KEYS.INSTALLATIONS, data.installations);
      if (data.services) setItem(STORAGE_KEYS.SERVICES, data.services);
      if (data.amc) setItem(STORAGE_KEYS.AMC, data.amc);
      if (data.auditLogs) setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);
      if (data.transactions) setItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      return { success: true, message: 'Database successfully imported!' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Parse error';
      return { success: false, message: `Failed to restore database: ${msg}` };
    }
  }

  static resetToDemoData(): void {
    setItem(STORAGE_KEYS.USERS, initialUsers);
    setItem(STORAGE_KEYS.SETTINGS, initialCompanySettings);
    setItem(STORAGE_KEYS.LEADS, initialLeads);
    setItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    setItem(STORAGE_KEYS.INTERACTIONS, initialInteractions);
    setItem(STORAGE_KEYS.QUOTATIONS, initialQuotations);
    setItem(STORAGE_KEYS.LOANS, initialLoans);
    setItem(STORAGE_KEYS.INSTALLATIONS, initialInstallations);
    setItem(STORAGE_KEYS.SERVICES, initialServiceTickets);
    setItem(STORAGE_KEYS.AMC, initialAMCContracts);
    setItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    setItem(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  }

  static resetToCleanSlate(): void {
    setItem(STORAGE_KEYS.USERS, initialUsers);
    setItem(STORAGE_KEYS.SETTINGS, initialCompanySettings);
    setItem(STORAGE_KEYS.LEADS, []);
    setItem(STORAGE_KEYS.CUSTOMERS, []);
    setItem(STORAGE_KEYS.INTERACTIONS, []);
    setItem(STORAGE_KEYS.QUOTATIONS, []);
    setItem(STORAGE_KEYS.LOANS, []);
    setItem(STORAGE_KEYS.INSTALLATIONS, []);
    setItem(STORAGE_KEYS.SERVICES, []);
    setItem(STORAGE_KEYS.AMC, []);
    setItem(STORAGE_KEYS.AUDIT_LOGS, []);
    setItem(STORAGE_KEYS.TRANSACTIONS, []);
  }
}
