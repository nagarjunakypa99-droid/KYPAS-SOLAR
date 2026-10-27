import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  X,
  FileSpreadsheet,
  FileDown,
  Upload,
  Zap,
  MessageCircle,
  Globe,
  Sun,
  Layers,
  Eye,
  Check,
  Copy,
  Headphones,
  Ban,
  User,
  List,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../../context/CRMContext';
import { useAuth } from '../../../context/AuthContext';
import { Lead, LeadSource, LeadStatus, SolarRequirement, CustomerPreference } from '../../../types/crm';
import { Badge } from '../../common/Badge';
import { DataImportModal, ExpectedColumn } from '../../common/DataImportModal';
import { formatDate, isOverdue, exportToExcel, exportToCSV } from '../../../utils/formatters';
import { LeadCalendar } from './LeadCalendar';

export interface AIScoreResult {
  leadId: string;
  score: number;
  tier: 'HOT' | 'WARM' | 'COLD / NURTURE';
  urgency: string;
  recommendedAction: string;
  estimatedSubsidy: number;
  conversionProbability: string;
}

export interface SolarSizingResult {
  recommendedKW: number;
}

const LEAD_SOURCES: LeadSource[] = [
  'Facebook Meta Ads',
  'Instagram Ads',
  'Google Ads',
  'WhatsApp Inbound',
  'Website',
  'Referral',
  'Marketing Campaign',
  'Field Sales',
  'Exhibition / Expo',
  'Walk-in',
  'Channel Partner / Dealer',
];

const META_CAMPAIGNS = [
  {
    id: 'CAMP_META_SURYA_GHAR_HYD_2026',
    name: 'PM Surya Ghar Muft Bijli Yojana - Telangana Residential',
    formId: 'FORM_META_SURYA_GHAR_78K_SUBSIDY',
  },
  {
    id: 'CAMP_META_VILLAS_GATED_2026',
    name: 'Hyderabad Villas & Gated Communities Rooftop Solar',
    formId: 'FORM_META_PREMIUM_VILLA_NETMETER',
  },
  {
    id: 'CAMP_META_COMMERCIAL_NET_2026',
    name: 'Telangana Commercial & Industrial Solar Net-Metering',
    formId: 'FORM_META_CI_HIGH_BILL_REDUCTION',
  },
  {
    id: 'CAMP_META_AGRI_PUMP_2026',
    name: 'PM-KUSUM Telangana Agricultural Solar Pumping Scheme',
    formId: 'FORM_META_PM_KUSUM_FARM_PUMP',
  },
];

const DISQUALIFICATION_REASONS = [
  'Rooftop Shadowed / Insufficient Roof Area (<200 sqft)',
  'Tenant / Rented Property (No Roof Ownership Rights)',
  'Location Outside KYPAS Service Territory',
  'Budget Mismatch / Unwilling to Invest in Solar',
  'Single Phase Grid Connection (Incompatible with Required Capacity)',
  'Invalid / Unreachable Phone Number',
  'No Genuine Solar Interest / Accidental Ad Click',
  'Opted for Competitor / Alternative Energy Solution',
  'Other / Custom Disqualification Reason',
];

interface LeadManagementViewProps {
  onNavigateToQuotation?: (lead?: Partial<Lead>) => void;
}

export const LeadManagementView: React.FC<LeadManagementViewProps> = () => {
  const { currentUser, hasPermission, users } = useAuth();
  const {
    leads,
    customers,
    createLead,
    importLeadsBatch,
    updateLead,
    deleteLead,
    convertLeadToCustomer,
    showConfirmDialog,
    addToast,
  } = useCRM();

  // Active Telecallers list
  const telecallers = useMemo(() => {
    const activeTc = users.filter((u) => u.role === 'Telecaller' && u.isActive);
    return activeTc.length > 0
      ? activeTc
      : [
          {
            id: 'USR-007',
            name: 'Kavitha Reddy',
            phone: '+91 98480 88123',
            email: 'telecaller.kavitha@kypassolar.com',
            role: 'Telecaller' as const,
            isActive: true,
            department: 'Sales' as const,
            createdAt: '',
          },
          {
            id: 'USR-008',
            name: 'Suma Latha',
            phone: '+91 98480 88124',
            email: 'telecaller.suma@kypassolar.com',
            role: 'Telecaller' as const,
            isActive: true,
            department: 'Sales' as const,
            createdAt: '',
          },
        ];
  }, [users]);

  // View Tab & Filters State
  const [activeView, setActiveView] = useState<'directory' | 'calendar'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [requirementFilter, setRequirementFilter] = useState<string>('all');
  const [execFilter, setExecFilter] = useState<string>('all');
  const [telecallerFilter, setTelecallerFilter] = useState<string>('all');
  const [quickChip, setQuickChip] = useState<string>('all');

  // Modals State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [showMetaWebhookModal, setShowMetaWebhookModal] = useState(false);

  // Telecaller Assignment Modal State
  const [assignTelecallerLead, setAssignTelecallerLead] = useState<Lead | null>(null);
  const [selectedTelecallerName, setSelectedTelecallerName] = useState<string>('');
  const [telecallerCallNote, setTelecallerCallNote] = useState<string>('');

  // Disqualification Modal State
  const [disqualifyTargetLead, setDisqualifyTargetLead] = useState<Lead | null>(null);
  const [selectedDisqualifyReason, setSelectedDisqualifyReason] = useState<string>(DISQUALIFICATION_REASONS[0]);
  const [disqualifyNotes, setDisqualifyNotes] = useState<string>('');

  // Import Expected Columns & Sample Data
  const expectedImportColumns: ExpectedColumn[] = [
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'mobile', label: 'Mobile Number', required: true },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'solarRequirement', label: 'Solar Requirement' },
    { key: 'systemCapacityKW', label: 'Capacity kW' },
    { key: 'customerPreferences', label: 'Customer Preference' },
    { key: 'source', label: 'Lead Source' },
    { key: 'notes', label: 'Notes' },
  ];

  const sampleImportData = [
    {
      'Customer Name': 'Kishore Kumar',
      'Mobile Number': '9848033445',
      Email: 'kishore.kumar@gmail.com',
      City: 'Hyderabad',
      'Solar Requirement': 'Rooftop Residential',
      'Capacity kW': 5,
      'Customer Preference': 'On-Grid (Net Metering)',
      'Lead Source': 'Facebook Meta Ads',
      Notes: 'High summer electricity bills ₹4500/mo. Interested in PM Surya Ghar subsidy.',
    },
    {
      'Customer Name': 'Prasad Varma',
      'Mobile Number': '9849055667',
      Email: 'prasad.varma@gmail.com',
      City: 'Secunderabad',
      'Solar Requirement': 'Commercial & Industrial',
      'Capacity kW': 10,
      'Customer Preference': 'On-Grid (Net Metering)',
      'Lead Source': 'Google Ads',
      Notes: 'Commercial shop roof with 800 sqft area.',
    },
    {
      'Customer Name': 'Anjaneyulu Naidu',
      'Mobile Number': '9848123987',
      Email: 'naidu.farm@gmail.com',
      City: 'Warangal',
      'Solar Requirement': 'Agricultural Solar Pump',
      'Capacity kW': 7.5,
      'Customer Preference': 'Off-Grid (Battery Backup)',
      'Lead Source': 'Referral',
      Notes: 'Paddy farm borewell pump requirement.',
    },
  ];

  const handleBulkImportLeads = async (rows: Record<string, any>[]) => {
    const formattedLeads = rows.map((row, index) => {
      const customerName = row['Customer Name'] || row.customerName || row.Name || `Lead ${index + 1}`;
      const mobile = String(row['Mobile Number'] || row.mobile || row.Phone || row.Contact || '').replace(/\D/g, '').slice(-10);
      const email = row.Email || row.email || `${customerName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`;
      const city = row.City || row.city || 'Hyderabad';
      const state = row.State || row.state || 'Telangana';
      const solarRequirement = (row['Solar Requirement'] || row.solarRequirement || 'Rooftop Residential') as SolarRequirement;
      const systemCapacityKW = Number(row['Capacity kW'] || row.systemCapacityKW || 5);
      const customerPreferences = (row['Customer Preference'] || row.customerPreferences || 'On-Grid (Net Metering)') as CustomerPreference;
      const source = (row['Lead Source'] || row.source || 'Website') as LeadSource;
      const notes = row.Notes || row.notes || 'Bulk imported via Excel spreadsheet.';

      return {
        customerName,
        mobile,
        email,
        fullAddress: `${city}, ${state}`,
        city,
        district: city,
        state,
        pincode: '500001',
        location: city,
        solarRequirement,
        systemCapacityKW,
        customerPreferences,
        source,
        assignedExecutiveId: currentUser?.id || 'USR-003',
        assignedExecutiveName: currentUser?.name || 'Rahul Varma',
        status: 'New' as LeadStatus,
        notes,
        nextFollowUpDate: new Date().toISOString(),
      };
    });

    const result = importLeadsBatch(formattedLeads);
    setShowImportModal(false);
    return { success: result.success, skipped: result.skipped };
  };

  // Lead Create/Edit Form State
  const defaultForm: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
    customerName: '',
    mobile: '',
    email: '',
    fullAddress: '',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    pincode: '500033',
    location: '',
    source: 'Website',
    solarRequirement: 'Rooftop Residential',
    systemCapacityKW: 5,
    customerPreferences: 'On-Grid (Net Metering)',
    assignedExecutiveId: currentUser?.id || 'USR-003',
    assignedExecutiveName: currentUser?.name || 'Rahul Varma',
    assignedTelecallerId: telecallers[0]?.id || '',
    assignedTelecallerName: telecallers[0]?.name || '',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    status: 'New',
    notes: '',
    disqualifiedReason: '',
  };

  const [formData, setFormData] = useState(defaultForm);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Meta Webhook Simulator State
  const [metaCampaign, setMetaCampaign] = useState(META_CAMPAIGNS[0]);
  const [metaName, setMetaName] = useState('Dr. Anand Rao');
  const [metaPhone, setMetaPhone] = useState('9849123456');
  const [metaCity, setMetaCity] = useState('Jubilee Hills, Hyderabad');
  const [metaKw, setMetaKw] = useState<number>(5);
  const [metaReq, setMetaReq] = useState<SolarRequirement>('Rooftop Residential');
  const [metaTelecaller, setMetaTelecaller] = useState(telecallers[0]?.name || 'Kavitha Reddy');
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<any>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);

  const handleMobileChange = (mobileVal: string) => {
    setFormData((prev) => ({ ...prev, mobile: mobileVal }));
    const clean = mobileVal.replace(/\D/g, '').slice(-10);
    if (clean.length === 10) {
      const matchedLead = leads.find(
        (l) => l.id !== editingLead?.id && l.mobile.replace(/\D/g, '').slice(-10) === clean
      );
      const matchedCust = customers.find(
        (c) => c.mobile.replace(/\D/g, '').slice(-10) === clean
      );
      if (matchedLead) {
        setDuplicateWarning(
          `Warning: This mobile matches ${matchedLead.customerName} in existing Lead records.`
        );
      } else if (matchedCust) {
        setDuplicateWarning(
          `Warning: This mobile matches ${matchedCust.name} in existing Customer records.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingLead(null);
    setFormData({
      ...defaultForm,
      assignedExecutiveId: currentUser?.id || 'USR-003',
      assignedExecutiveName: currentUser?.name || 'Rahul Varma',
      assignedTelecallerId: telecallers[0]?.id || '',
      assignedTelecallerName: telecallers[0]?.name || '',
    });
    setDuplicateWarning(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      customerName: lead.customerName,
      mobile: lead.mobile,
      email: lead.email,
      fullAddress: lead.fullAddress,
      state: lead.state,
      district: lead.district,
      city: lead.city,
      pincode: lead.pincode,
      location: lead.location,
      source: lead.source,
      solarRequirement: lead.solarRequirement,
      systemCapacityKW: lead.systemCapacityKW,
      customerPreferences: lead.customerPreferences,
      assignedExecutiveId: lead.assignedExecutiveId,
      assignedExecutiveName: lead.assignedExecutiveName,
      assignedTelecallerId: lead.assignedTelecallerId,
      assignedTelecallerName: lead.assignedTelecallerName,
      nextFollowUpDate: lead.nextFollowUpDate ? lead.nextFollowUpDate.slice(0, 16) : '',
      status: lead.status,
      notes: lead.notes,
      lostReason: lead.lostReason,
      disqualifiedReason: lead.disqualifiedReason,
      metaCampaignId: lead.metaCampaignId,
      metaCampaignName: lead.metaCampaignName,
      metaFormId: lead.metaFormId,
    });
    setDuplicateWarning(null);
    setShowModal(true);
  };

  const handleConvertLead = (lead: Lead) => {
    showConfirmDialog({
      title: 'Convert Lead to Customer Profile',
      message: `Are you sure you want to qualify and convert ${lead.customerName} into an official Customer Account? This will create a permanent customer profile for quotation and installation tracking.`,
      confirmText: 'Convert to Customer',
      onConfirm: () => convertLeadToCustomer(lead.id),
    });
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobile) return;

    if (editingLead) {
      updateLead(editingLead.id, {
        ...formData,
        systemCapacityKW: Number(formData.systemCapacityKW),
      });
      addToast({
        type: 'success',
        title: 'Lead Updated',
        message: `Lead details for ${formData.customerName} saved successfully.`,
      });
    } else {
      createLead({
        ...formData,
        systemCapacityKW: Number(formData.systemCapacityKW),
      });
      addToast({
        type: 'success',
        title: 'Lead Created',
        message: `New solar lead ${formData.customerName} registered successfully.`,
      });
    }
    setShowModal(false);
    setEditingLead(null);
  };

  const handleConfirmTelecallerAssign = () => {
    if (!assignTelecallerLead || !selectedTelecallerName) return;
    const tcObj = telecallers.find((t) => t.name === selectedTelecallerName);
    const existingNotes = assignTelecallerLead.notes || '';
    const updatedNotes = telecallerCallNote.trim()
      ? `${existingNotes}\n[Telecaller Assigned: ${selectedTelecallerName}] Note: ${telecallerCallNote}`.trim()
      : existingNotes;

    updateLead(assignTelecallerLead.id, {
      assignedTelecallerId: tcObj?.id,
      assignedTelecallerName: selectedTelecallerName,
      notes: updatedNotes,
    });

    addToast({
      type: 'success',
      title: 'Telecaller Assigned',
      message: `Lead ${assignTelecallerLead.customerName} successfully assigned to Telecaller ${selectedTelecallerName}.`,
    });

    if (viewLead && viewLead.id === assignTelecallerLead.id) {
      setViewLead({
        ...viewLead,
        assignedTelecallerId: tcObj?.id,
        assignedTelecallerName: selectedTelecallerName,
        notes: updatedNotes,
      });
    }
    setAssignTelecallerLead(null);
    setSelectedTelecallerName('');
    setTelecallerCallNote('');
  };

  const handleConfirmDisqualify = () => {
    if (!disqualifyTargetLead) return;
    const fullReason = disqualifyNotes.trim()
      ? `${selectedDisqualifyReason} - ${disqualifyNotes.trim()}`
      : selectedDisqualifyReason;

    updateLead(disqualifyTargetLead.id, {
      status: 'Disqualified',
      disqualifiedReason: fullReason,
    });

    addToast({
      type: 'warning',
      title: 'Lead Disqualified',
      message: `${disqualifyTargetLead.customerName} marked as Disqualified. Reason: ${fullReason}`,
    });

    if (viewLead && viewLead.id === disqualifyTargetLead.id) {
      setViewLead({
        ...viewLead,
        status: 'Disqualified',
        disqualifiedReason: fullReason,
      });
    }
    setDisqualifyTargetLead(null);
    setDisqualifyNotes('');
  };

  const handleSimulateMetaWebhook = () => {
    setIsSimulatingWebhook(true);
    setWebhookResponse(null);
    setTimeout(() => {
      const kypasLeadId = `KYP-META-${Date.now().toString().slice(-6)}`;
      const assignedTc = telecallers.find((t) => t.name === metaTelecaller) || telecallers[0];
      const followUpIso = new Date().toISOString().slice(0, 16);
      const simulatedPayload = {
        object: 'page',
        entry: [
          {
            id: '109283749281729',
            time: Math.floor(Date.now() / 1000),
            changes: [
              {
                field: 'leadgen',
                value: {
                  ad_id: 'AD_META_' + Math.floor(100000 + Math.random() * 900000),
                  form_id: metaCampaign.formId,
                  leadgen_id: 'LEAD_' + Math.floor(1000000000 + Math.random() * 9000000000),
                  created_time: Math.floor(Date.now() / 1000),
                  page_id: '109283749281729',
                  campaign_name: metaCampaign.name,
                  user_data: {
                    full_name: metaName,
                    phone_number: `+91 ${metaPhone}`,
                    city: metaCity,
                    solar_requirement: metaReq,
                    estimated_kw: metaKw,
                  },
                },
              },
            ],
          },
        ],
      };

      createLead({
        customerName: metaName,
        mobile: metaPhone,
        email: `${metaName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
        fullAddress: `${metaCity}, Telangana`,
        state: 'Telangana',
        district: 'Hyderabad',
        city: metaCity.split(',')[0].trim(),
        pincode: '500081',
        location: metaCity,
        source: 'Facebook Meta Ads',
        solarRequirement: metaReq,
        systemCapacityKW: Number(metaKw),
        customerPreferences: 'On-Grid (Net Metering)',
        assignedExecutiveId: currentUser?.id || 'USR-003',
        assignedExecutiveName: currentUser?.name || 'Rahul Varma',
        assignedTelecallerId: assignedTc?.id,
        assignedTelecallerName: assignedTc?.name,
        nextFollowUpDate: followUpIso,
        status: 'New',
        metaCampaignId: metaCampaign.id,
        metaCampaignName: metaCampaign.name,
        metaFormId: metaCampaign.formId,
        metaAdId: 'AD_META_FEED_SPONSORED',
        metaLeadgenId: 'LEAD_' + Math.floor(10000000 + Math.random() * 90000000),
        metaReceivedAt: new Date().toISOString(),
        notes: `Auto-ingested via Facebook Meta Lead Ads Webhook (${metaCampaign.name}). Routed to Telecaller ${assignedTc?.name} for immediate call qualification.`,
      });

      setWebhookResponse({
        status: 200,
        statusText: 'OK',
        webhookEvent: 'leadgen',
        kypasLeadId,
        assignedTelecaller: assignedTc?.name,
        payload: simulatedPayload,
      });
      setIsSimulatingWebhook(false);
      addToast({
        type: 'success',
        title: 'Meta Lead Ingested!',
        message: `Facebook Lead for ${metaName} (${metaKw} kW) successfully routed to Telecaller ${assignedTc?.name}.`,
      });
      setSearchQuery('');
      setStatusFilter('all');
      setSourceFilter('all');
      setQuickChip('all');
    }, 600);
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText('https://crm.kypassolar.com/api/webhooks/meta-lead-gen');
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (currentUser?.role === 'Sales Executive' && lead.assignedExecutiveName !== currentUser.name) {
        return false;
      }
      if (
        currentUser?.role === 'Telecaller' &&
        lead.assignedTelecallerName &&
        lead.assignedTelecallerName !== currentUser.name
      ) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          lead.customerName.toLowerCase().includes(q) ||
          lead.mobile.includes(q) ||
          lead.id.toLowerCase().includes(q) ||
          lead.city.toLowerCase().includes(q) ||
          (lead.assignedTelecallerName && lead.assignedTelecallerName.toLowerCase().includes(q)) ||
          (lead.source && lead.source.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (quickChip === 'new' && lead.status !== 'New') return false;
      if (quickChip === 'followup' && !['Follow-up', 'Contacted'].includes(lead.status)) return false;
      if (quickChip === 'converted' && lead.status !== 'Converted') return false;
      if (quickChip === 'disqualified' && lead.status !== 'Disqualified') return false;
      if (quickChip === 'meta' && lead.source !== 'Facebook Meta Ads') return false;
      if (quickChip === 'unassigned_tc' && lead.assignedTelecallerName) return false;

      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
      if (requirementFilter !== 'all' && lead.solarRequirement !== requirementFilter) return false;
      if (execFilter !== 'all' && lead.assignedExecutiveName !== execFilter) return false;

      if (telecallerFilter !== 'all') {
        if (telecallerFilter === 'unassigned') {
          if (lead.assignedTelecallerName) return false;
        } else if (lead.assignedTelecallerName !== telecallerFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    leads,
    searchQuery,
    statusFilter,
    sourceFilter,
    requirementFilter,
    execFilter,
    telecallerFilter,
    quickChip,
    currentUser,
  ]);

  const allSourcesList = Array.from(new Set([...LEAD_SOURCES, ...leads.map((l) => l.source).filter(Boolean)]));
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === 'New').length;
  const disqualifiedCount = leads.filter((l) => l.status === 'Disqualified').length;
  const metaLeadsCount = leads.filter((l) => l.source === 'Facebook Meta Ads').length;
  const unassignedTelecallerCount = leads.filter(
    (l) => !l.assignedTelecallerName && !['Converted', 'Lost', 'Disqualified'].includes(l.status)
  ).length;

  const handleExportExcel = () => {
    exportToExcel(
      filteredLeads.map((l) => ({
        'Lead ID': l.id,
        'Customer Name': l.customerName,
        'Mobile Number': l.mobile,
        Email: l.email,
        'City / Location': `${l.city}, ${l.state}`,
        'Solar Requirement': l.solarRequirement,
        'Capacity (kW)': l.systemCapacityKW,
        'Customer Preference': l.customerPreferences,
        'Lead Source': l.source,
        'Assigned Executive': l.assignedExecutiveName,
        'Assigned Telecaller': l.assignedTelecallerName || 'Unassigned',
        Status: l.status,
        'Disqualified Reason': l.disqualifiedReason || '',
        'Next Follow-Up': formatDate(l.nextFollowUpDate, true),
        'Created Date': formatDate(l.createdAt, true),
        'Meta Campaign': l.metaCampaignName || '',
        Notes: l.notes,
      })),
      `Kypas_Solar_Leads_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredLeads.map((l) => ({
        'Lead ID': l.id,
        'Customer Name': l.customerName,
        'Mobile Number': l.mobile,
        Email: l.email,
        City: l.city,
        State: l.state,
        Requirement: l.solarRequirement,
        'Capacity kW': l.systemCapacityKW,
        Source: l.source,
        Executive: l.assignedExecutiveName,
        Telecaller: l.assignedTelecallerName || 'Unassigned',
        Status: l.status,
        'Disqualified Reason': l.disqualifiedReason || '',
        'Next Follow-Up': l.nextFollowUpDate,
      })),
      `Kypas_Solar_Leads_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const renderSourceBadge = (source: string) => {
    switch (source) {
      case 'Facebook Meta Ads':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Zap className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 fill-current" />
            Meta Ads
          </span>
        );
      case 'Instagram Ads':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border border-pink-300 dark:border-pink-800">
            <Sparkles className="w-2.5 h-2.5 text-pink-600 dark:text-pink-400" />
            Instagram
          </span>
        );
      case 'Google Ads':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            <Search className="w-2.5 h-2.5 text-indigo-600" />
            Google Ads
          </span>
        );
      case 'WhatsApp Inbound':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <MessageCircle className="w-2.5 h-2.5 text-emerald-600 fill-current" />
            WhatsApp
          </span>
        );
      case 'Website':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Globe className="w-2.5 h-2.5 text-slate-500" />
            Website
          </span>
        );
      case 'Referral':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <UserCheck className="w-2.5 h-2.5 text-purple-600" />
            Referral
          </span>
        );
      case 'Exhibition / Expo':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sun className="w-2.5 h-2.5 text-amber-600" />
            Expo
          </span>
        );
      case 'Channel Partner / Dealer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Layers className="w-2.5 h-2.5 text-teal-600" />
            Partner
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {source}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-blue-600" /> Lead Management & Telecaller Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture inquiries, assign to telecallers, ingest Facebook Meta Lead Ads in real-time, qualify solar prospects, and track disqualifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMetaWebhookModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-blue-400/30"
            title="Facebook Meta Lead Ads Webhook & Live Ingestion Hub"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
            <span>Meta Lead Trigger</span>
          </button>

          {hasPermission('Leads', 'export') && (
            <>
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Export filtered records to Microsoft Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Export filtered records as CSV"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Import Leads from Excel (.xlsx) or CSV"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Import Leads</span>
          </button>

          {hasPermission('Leads', 'create') && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create New Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveView('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeView === 'directory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Lead Directory (Table List)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeView === 'directory'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeView === 'calendar'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Lead Calendar (Follow-up Schedule)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white">
            Schedule
          </span>
        </button>
      </div>

      {/* Calendar View */}
      {activeView === 'calendar' && (
        <LeadCalendar
          leads={leads}
          onSelectLead={setViewLead}
          onEditLead={handleOpenEditModal}
          onConvertToCustomer={handleConvertLead}
        />
      )}

      {/* Directory View */}
      {activeView === 'directory' && (
        <>
          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setQuickChip('all');
                setStatusFilter('all');
                setSourceFilter('all');
                setTelecallerFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                quickChip === 'all' && statusFilter === 'all' && sourceFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>All Leads</span>
              <span className="text-[10px] opacity-75">({totalCount})</span>
            </button>

            <button
              onClick={() => {
                setQuickChip('new');
                setStatusFilter('New');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                quickChip === 'new'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>New Inquiries</span>
              <span className="text-[10px] font-bold">({newCount})</span>
            </button>

            <button
              onClick={() => {
                setQuickChip('meta');
                setSourceFilter('Facebook Meta Ads');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                quickChip === 'meta'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 hover:bg-blue-50 dark:hover:bg-blue-950/20'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Facebook Meta Leads</span>
              <span className="text-[10px] font-bold">({metaLeadsCount})</span>
            </button>

            <button
              onClick={() => {
                setQuickChip('unassigned_tc');
                setTelecallerFilter('unassigned');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                quickChip === 'unassigned_tc'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'
              }`}
            >
              <Headphones className="w-3 h-3" />
              <span>Unassigned Telecaller</span>
              <span className="text-[10px] font-bold">({unassignedTelecallerCount})</span>
            </button>

            <button
              onClick={() => {
                setQuickChip('disqualified');
                setStatusFilter('Disqualified');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                quickChip === 'disqualified'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 hover:bg-purple-50 dark:hover:bg-purple-950/20'
              }`}
            >
              <Ban className="w-3 h-3" />
              <span>Disqualified</span>
              <span className="text-[10px] font-bold">({disqualifiedCount})</span>
            </button>
          </div>

          {/* Search & Dropdown Filters Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, city, telecaller, source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    if (e.target.value === 'Disqualified') setQuickChip('disqualified');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Statuses ({leads.length})</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Interested">Interested</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                  <option value="Disqualified">Disqualified</option>
                </select>
              </div>

              <div>
                <select
                  value={telecallerFilter}
                  onChange={(e) => setTelecallerFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Telecallers</option>
                  <option value="unassigned">⚠️ Unassigned Telecaller</option>
                  {telecallers.map((tc) => (
                    <option key={tc.id} value={tc.name}>
                      🎧 {tc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Lead Sources</option>
                  {allSourcesList.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={requirementFilter}
                  onChange={(e) => setRequirementFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Solar Types</option>
                  <option value="Rooftop Residential">Rooftop Residential</option>
                  <option value="Commercial & Industrial">Commercial & Industrial</option>
                  <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
                  <option value="Ground Mount">Ground Mount</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Lead ID & Customer</th>
                    <th className="py-3 px-4">Contact & Location</th>
                    <th className="py-3 px-4">Requirement & kW</th>
                    <th className="py-3 px-4">Source & Campaign</th>
                    <th className="py-3 px-4">Telecaller / Exec</th>
                    <th className="py-3 px-4">Next Follow-up</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertTriangle className="w-6 h-6 text-slate-300" />
                          <p>No leads found matching current filters.</p>
                          {(searchQuery || statusFilter !== 'all' || sourceFilter !== 'all' || telecallerFilter !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setSourceFilter('all');
                                setTelecallerFilter('all');
                                setQuickChip('all');
                              }}
                              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              Reset all filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const overdue =
                        lead.nextFollowUpDate &&
                        isOverdue(lead.nextFollowUpDate) &&
                        !['Converted', 'Lost', 'Disqualified'].includes(lead.status);
                      const isDisq = lead.status === 'Disqualified';
                      const isMeta = lead.source === 'Facebook Meta Ads';

                      return (
                        <tr
                          key={lead.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                            isDisq ? 'bg-purple-50/20 dark:bg-purple-950/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div
                              onClick={() => setViewLead(lead)}
                              className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors"
                              title="Click to view full lead profile & follow-up agenda"
                            >
                              {lead.customerName}
                              {lead.convertedCustomerId && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                                  Cust {lead.convertedCustomerId}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <span>{lead.id}</span>
                              {isMeta && (
                                <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1 py-0.2 rounded font-bold">
                                  META AD
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{lead.mobile}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {lead.city}, {lead.state}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {lead.systemCapacityKW} kW
                            </div>
                            <div className="text-[10px] text-slate-500">{lead.solarRequirement}</div>
                            <div className="text-[9px] text-blue-600 dark:text-blue-400">
                              {lead.customerPreferences}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div>{renderSourceBadge(lead.source)}</div>
                            {lead.metaCampaignName && (
                              <div
                                className="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-[160px] mt-0.5"
                                title={lead.metaCampaignName}
                              >
                                {lead.metaCampaignName}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                              <Headphones className="w-3 h-3 text-indigo-500 shrink-0" />
                              {lead.assignedTelecallerName ? (
                                <span className="font-semibold text-indigo-700 dark:text-indigo-300 text-[11px]">
                                  {lead.assignedTelecallerName}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAssignTelecallerLead(lead);
                                    setSelectedTelecallerName(telecallers[0]?.name || '');
                                  }}
                                  className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <span>+ Assign Telecaller</span>
                                </button>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <User className="w-2.5 h-2.5" />
                              <span>Exec: {lead.assignedExecutiveName}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {isDisq ? (
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                Closed (Disqualified)
                              </span>
                            ) : lead.status === 'Converted' ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Active Customer
                              </span>
                            ) : (
                              <>
                                <div
                                  className={`font-semibold flex items-center gap-1 ${
                                    overdue
                                      ? 'text-rose-600 dark:text-rose-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {overdue && <AlertTriangle className="w-3 h-3 shrink-0" />}
                                  <span>{formatDate(lead.nextFollowUpDate, true)}</span>
                                </div>
                                {overdue && (
                                  <span className="text-[9px] text-rose-500 font-bold">
                                    Overdue follow-up!
                                  </span>
                                )}
                              </>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <Badge status={lead.status} />
                            {lead.status === 'Disqualified' && lead.disqualifiedReason && (
                              <div
                                className="text-[9px] text-purple-700 dark:text-purple-300 truncate max-w-[130px] mt-0.5"
                                title={lead.disqualifiedReason}
                              >
                                {lead.disqualifiedReason}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setAssignTelecallerLead(lead);
                                  setSelectedTelecallerName(
                                    lead.assignedTelecallerName || telecallers[0]?.name || ''
                                  );
                                }}
                                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                title="Assign / Reassign Telecaller"
                              >
                                <Headphones className="w-4 h-4" />
                              </button>

                              {!['Converted', 'Disqualified'].includes(lead.status) && (
                                <button
                                  onClick={() => {
                                    setDisqualifyTargetLead(lead);
                                    setSelectedDisqualifyReason(DISQUALIFICATION_REASONS[0]);
                                    setDisqualifyNotes('');
                                  }}
                                  className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                                  title="Mark as Disqualified (Shadow, Tenant, Outside Area, etc.)"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              {lead.status !== 'Converted' && lead.status !== 'Disqualified' && (
                                <button
                                  onClick={() => handleConvertLead(lead)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                                  title="Convert to Customer"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => setViewLead(lead)}
                                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                title="View Lead Profile & Follow-up Agenda"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {hasPermission('Leads', 'edit') && (
                                <button
                                  onClick={() => handleOpenEditModal(lead)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Edit Lead Details"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}

                              {hasPermission('Leads', 'delete') && (
                                <button
                                  onClick={() => {
                                    showConfirmDialog({
                                      title: `Delete Lead ${lead.id}`,
                                      message: `Are you sure you want to permanently delete lead record for ${lead.customerName}?`,
                                      isDestructive: true,
                                      confirmText: 'Delete Lead',
                                      onConfirm: () => deleteLead(lead.id),
                                    });
                                  }}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Delete Lead"
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
        </>
      )}

      {/* MODAL 1: FACEBOOK META LEAD ADS WEBHOOK HUB */}
      {showMetaWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => {
                setShowMetaWebhookModal(false);
                setWebhookResponse(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Zap className="w-6 h-6 fill-current text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Facebook Meta Lead Ads Webhook Hub
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Live Simulator
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Instant webhook receiver for Facebook & Instagram sponsored solar lead forms.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Meta Webhook Endpoint URL
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  HTTP 200 Listening
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex-1 truncate text-slate-800 dark:text-slate-200 select-all">
                  https://crm.kypassolar.com/api/webhooks/meta-lead-gen
                </code>
                <button
                  type="button"
                  onClick={handleCopyWebhookUrl}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedWebhook ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Verify Token:{' '}
                <code className="font-mono text-slate-600 dark:text-slate-300">
                  kypas_meta_solar_verify_2026
                </code>{' '}
                • Handled Event:{' '}
                <code className="font-mono text-slate-600 dark:text-slate-300">leadgen</code>
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quick Test Lead Presets (Click to Populate):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMetaName('Dr. Anand Rao');
                    setMetaPhone('9849123456');
                    setMetaCity('Jubilee Hills, Hyderabad');
                    setMetaKw(5);
                    setMetaReq('Rooftop Residential');
                    setMetaCampaign(META_CAMPAIGNS[0]);
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. Anand Rao</p>
                  <p className="text-[10px] text-slate-500">
                    5 kW Residential • Jubilee Hills (Subsidy)
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMetaName('Smt. Madhavi Latha');
                    setMetaPhone('9849234567');
                    setMetaCity('Hanamkonda, Warangal');
                    setMetaKw(3);
                    setMetaReq('Rooftop Residential');
                    setMetaCampaign(META_CAMPAIGNS[0]);
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Smt. Madhavi Latha
                  </p>
                  <p className="text-[10px] text-slate-500">
                    3 kW Rooftop • Warangal (PM Surya Ghar)
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMetaName('Sri Sai Packaging Industries');
                    setMetaPhone('9849345678');
                    setMetaCity('Patancheru, Sangareddy');
                    setMetaKw(30);
                    setMetaReq('Commercial & Industrial');
                    setMetaCampaign(META_CAMPAIGNS[2]);
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Sri Sai Packaging
                  </p>
                  <p className="text-[10px] text-slate-500">30 kW Commercial • Patancheru</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMetaName('Rajeshwar Goud');
                    setMetaPhone('9849456789');
                    setMetaCity('Armoor, Nizamabad');
                    setMetaKw(7.5);
                    setMetaReq('Agricultural Solar Pump');
                    setMetaCampaign(META_CAMPAIGNS[3]);
                  }}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Rajeshwar Goud</p>
                  <p className="text-[10px] text-slate-500">7.5 kW Solar Agri Pump • Nizamabad</p>
                </button>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Ad Campaign Source *
                  </label>
                  <select
                    value={metaCampaign.id}
                    onChange={(e) => {
                      const found = META_CAMPAIGNS.find((c) => c.id === e.target.value);
                      if (found) setMetaCampaign(found);
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  >
                    {META_CAMPAIGNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Route To Telecaller *</span>
                    <span className="text-[10px] text-indigo-500 font-bold">Desk Assignment</span>
                  </label>
                  <select
                    value={metaTelecaller}
                    onChange={(e) => setMetaTelecaller(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {telecallers.map((tc) => (
                      <option key={tc.id} value={tc.name}>
                        🎧 {tc.name} ({tc.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prospect Name *
                  </label>
                  <input
                    type="text"
                    value={metaName}
                    onChange={(e) => setMetaName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    value={metaPhone}
                    onChange={(e) => setMetaPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={metaCity}
                    onChange={(e) => setMetaCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Requirement
                  </label>
                  <select
                    value={metaReq}
                    onChange={(e) => setMetaReq(e.target.value as SolarRequirement)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  >
                    <option value="Rooftop Residential">Rooftop Residential</option>
                    <option value="Commercial & Industrial">Commercial & Industrial</option>
                    <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
                    <option value="Ground Mount">Ground Mount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity (kW)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={metaKw}
                    onChange={(e) => setMetaKw(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>
              </div>
            </div>

            {webhookResponse && (
              <div className="mt-4 p-3 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-[11px] space-y-1.5 animate-in fade-in border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 text-[10px]">
                  <span>HTTP Response: 200 OK (Webhook Processed)</span>
                  <span className="text-emerald-400 font-bold">Live CRM Lead Created</span>
                </div>
                <pre className="overflow-x-auto custom-scrollbar max-h-40 py-1">
                  {JSON.stringify(webhookResponse, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowMetaWebhookModal(false);
                  setWebhookResponse(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSimulateMetaWebhook}
                disabled={isSimulatingWebhook}
                className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSimulatingWebhook ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Webhook...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-amber-300" />
                    <span>Fire Meta Lead Webhook Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN TELECALLER */}
      {assignTelecallerLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <button
              onClick={() => setAssignTelecallerLead(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Assign Lead to Telecaller
                </h3>
                <p className="text-xs text-slate-500">
                  Target prospect:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {assignTelecallerLead.customerName}
                  </strong>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Telecaller *
                </label>
                <div className="space-y-2">
                  {telecallers.map((tc) => {
                    const isSelected = selectedTelecallerName === tc.name;
                    return (
                      <div
                        key={tc.id}
                        onClick={() => setSelectedTelecallerName(tc.name)}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {tc.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {tc.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{tc.phone}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Call Instructions / Telecaller Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={telecallerCallNote}
                  onChange={(e) => setTelecallerCallNote(e.target.value)}
                  placeholder="e.g. Call urgently; prospect interested in PM Surya Ghar 78k subsidy."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignTelecallerLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTelecallerAssign}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md cursor-pointer"
                >
                  Confirm Telecaller Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DISQUALIFY SOLAR LEAD */}
      {disqualifyTargetLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <button
              onClick={() => setDisqualifyTargetLead(null)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Disqualify Solar Lead
                </h3>
                <p className="text-xs text-slate-500">
                  Mark{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {disqualifyTargetLead.customerName}
                  </strong>{' '}
                  as disqualified.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Reason for Disqualification *
                </label>
                <select
                  value={selectedDisqualifyReason}
                  onChange={(e) => setSelectedDisqualifyReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                >
                  {DISQUALIFICATION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Details / Call Observations (Optional)
                </label>
                <textarea
                  rows={3}
                  value={disqualifyNotes}
                  onChange={(e) => setDisqualifyNotes(e.target.value)}
                  placeholder="e.g. Verified rooftop - high-rise building on southern boundary creates 100% shade throughout daytime."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDisqualifyTargetLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisqualify}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md cursor-pointer"
                >
                  Mark Disqualified
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / EDIT SOLAR LEAD */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {editingLead ? `Edit Lead (${editingLead.id})` : 'Register New Solar Lead'}
              </h2>
              <p className="text-xs text-slate-500">
                Enter client information, rooftop solar capacity requirements, assign executive & telecaller, and schedule follow-ups.
              </p>
            </div>

            {duplicateWarning && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                {duplicateWarning}
              </div>
            )}

            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Chandra / Sri Balaji Mills"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    placeholder="9849012345"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Hyderabad / Vijayawada"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Project Address
                </label>
                <input
                  type="text"
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  placeholder="Street, Landmark, Area"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Telangana">Telangana</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Solar Requirement *
                  </label>
                  <select
                    value={formData.solarRequirement}
                    onChange={(e) =>
                      setFormData({ ...formData, solarRequirement: e.target.value as SolarRequirement })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Rooftop Residential">Rooftop Residential</option>
                    <option value="Commercial & Industrial">Commercial & Industrial</option>
                    <option value="Agricultural Solar Pump">Agricultural Solar Pump</option>
                    <option value="Ground Mount">Ground Mount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Capacity (kW) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.systemCapacityKW}
                    onChange={(e) =>
                      setFormData({ ...formData, systemCapacityKW: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Preference
                  </label>
                  <select
                    value={formData.customerPreferences}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPreferences: e.target.value as CustomerPreference,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="On-Grid (Net Metering)">On-Grid (Net Metering)</option>
                    <option value="Off-Grid (Battery Backup)">Off-Grid (Battery Backup)</option>
                    <option value="Hybrid System">Hybrid System</option>
                    <option value="Bifacial High Efficiency">Bifacial High Efficiency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Source *
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value as LeadSource })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Telecaller
                  </label>
                  <select
                    value={formData.assignedTelecallerName || ''}
                    onChange={(e) => {
                      const tc = telecallers.find((t) => t.name === e.target.value);
                      setFormData({
                        ...formData,
                        assignedTelecallerId: tc?.id || '',
                        assignedTelecallerName: e.target.value,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">-- Unassigned --</option>
                    {telecallers.map((tc) => (
                      <option key={tc.id} value={tc.name}>
                        🎧 {tc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Executive
                  </label>
                  <input
                    type="text"
                    value={formData.assignedExecutiveName}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedExecutiveName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as LeadStatus })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Interested">Interested</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                    <option value="Disqualified">Disqualified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Date/Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextFollowUpDate}
                    onChange={(e) =>
                      setFormData({ ...formData, nextFollowUpDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {formData.status === 'Disqualified' && (
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Disqualification Reason *
                  </label>
                  <select
                    value={formData.disqualifiedReason || DISQUALIFICATION_REASONS[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, disqualifiedReason: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl text-slate-800 dark:text-slate-200"
                  >
                    {DISQUALIFICATION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.status === 'Lost' && (
                <div>
                  <label className="block text-xs font-semibold text-rose-600 mb-1">
                    Reason for Lost Opportunity *
                  </label>
                  <input
                    type="text"
                    value={formData.lostReason || ''}
                    onChange={(e) => setFormData({ ...formData, lostReason: e.target.value })}
                    placeholder="e.g. Budget constraints, opted for competitor..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discussion Notes & Observations
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes from customer phone call, roof shadow conditions, monthly power bill amount..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md cursor-pointer"
                >
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: VIEW LEAD PROFILE & FOLLOW-UP AGENDA */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {viewLead.customerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {viewLead.customerName}
                    </h2>
                    <Badge status={viewLead.status} />
                    {renderSourceBadge(viewLead.source)}
                    {viewLead.convertedCustomerId && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        Customer {viewLead.convertedCustomerId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Lead ID: {viewLead.id} • Registered: {formatDate(viewLead.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewLead(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {viewLead.status === 'Disqualified' && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Lead Disqualified
                    </p>
                    <p className="text-sm font-black mt-0.5">
                      {viewLead.disqualifiedReason || 'Unqualified inquiry'}
                    </p>
                    <p className="text-[11px] opacity-75 mt-1">
                      This lead was screened out by the telecaller team as unsuitable for KYPAS solar installation.
                    </p>
                  </div>
                </div>
              )}

              {viewLead.status !== 'Disqualified' && viewLead.status !== 'Converted' && (
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                    viewLead.nextFollowUpDate &&
                    isOverdue(viewLead.nextFollowUpDate) &&
                    !['Converted', 'Lost', 'Disqualified'].includes(viewLead.status)
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900/80 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-75">
                        Next Scheduled Follow-up
                      </p>
                      <p className="text-base font-black">
                        {formatDate(viewLead.nextFollowUpDate, true)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const target = viewLead;
                      setViewLead(null);
                      handleOpenEditModal(target);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 shadow-xs cursor-pointer"
                  >
                    Reschedule
                  </button>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Assigned Telecaller Desk
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {viewLead.assignedTelecallerName || 'No Telecaller Assigned Yet'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Field Executive: <strong>{viewLead.assignedExecutiveName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAssignTelecallerLead(viewLead);
                    setSelectedTelecallerName(
                      viewLead.assignedTelecallerName || telecallers[0]?.name || ''
                    );
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>
                    {viewLead.assignedTelecallerName ? 'Reassign Telecaller' : 'Assign Telecaller'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Contact & Assignment
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile:
                      </span>
                      <a
                        href={`tel:${viewLead.mobile}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-blue-600"
                      >
                        {viewLead.mobile}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" /> Email:
                      </span>
                      <a
                        href={`mailto:${viewLead.email}`}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:underline truncate max-w-[180px]"
                      >
                        {viewLead.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Field Executive:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {viewLead.assignedExecutiveName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Location & Site
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {viewLead.city}, {viewLead.state} - {viewLead.pincode}
                    </p>
                    {viewLead.fullAddress && (
                      <p className="text-slate-500 text-[11px]">{viewLead.fullAddress}</p>
                    )}
                    <div className="pt-1 flex items-center justify-between text-slate-500">
                      <span>Source:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {viewLead.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Solar Technical Specs
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Requirement</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      {viewLead.solarRequirement}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      System Capacity
                    </p>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1">
                      {viewLead.systemCapacityKW} kW
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Customer Preference
                    </p>
                    <p className="text-xs font-black text-slate-900 dark:text-white mt-1">
                      {viewLead.customerPreferences}
                    </p>
                  </div>
                </div>
              </div>

              {viewLead.metaCampaignName && (
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Meta Lead Ad Campaign Details
                  </p>
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p>
                      Campaign: <strong>{viewLead.metaCampaignName}</strong>
                    </p>
                    {viewLead.metaFormId && (
                      <p className="font-mono text-[10px] text-slate-500">
                        Form ID: {viewLead.metaFormId}
                      </p>
                    )}
                    {viewLead.metaReceivedAt && (
                      <p className="text-[10px] text-slate-500">
                        Received at: {formatDate(viewLead.metaReceivedAt, true)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {viewLead.notes && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Discussion Notes & Logged Remarks
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {viewLead.notes}
                  </p>
                </div>
              )}

              {viewLead.status === 'Lost' && viewLead.lostReason && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
                  <strong>Reason for Lost Opportunity:</strong> {viewLead.lostReason}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${viewLead.mobile}`}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Customer
                </a>
                {!['Converted', 'Disqualified'].includes(viewLead.status) && (
                  <button
                    onClick={() => {
                      setDisqualifyTargetLead(viewLead);
                      setSelectedDisqualifyReason(DISQUALIFICATION_REASONS[0]);
                    }}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" /> Disqualify
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {viewLead.status !== 'Converted' && viewLead.status !== 'Disqualified' && (
                  <button
                    onClick={() => {
                      const target = viewLead;
                      setViewLead(null);
                      handleConvertLead(target);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Customer
                  </button>
                )}
                <button
                  onClick={() => {
                    const target = viewLead;
                    setViewLead(null);
                    handleOpenEditModal(target);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Lead
                </button>
                <button
                  onClick={() => setViewLead(null)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: IMPORT LEADS FROM SPREADSHEET */}
      <DataImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Leads from Spreadsheet"
        entityName="Leads"
        sampleFileName="KYPAS_Solar_Leads_Import_Template"
        sampleData={sampleImportData}
        expectedColumns={expectedImportColumns}
        onImport={handleBulkImportLeads}
      />
    </div>
  );
};
