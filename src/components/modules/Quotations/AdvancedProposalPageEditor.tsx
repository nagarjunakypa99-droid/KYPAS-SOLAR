import React, { useState } from 'react';
import {
  Image,
  Maximize2,
  Droplets,
  FileText,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Sliders,
  Move,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  PageVisualConfig,
  PageWatermarkConfig,
  ProposalCanvasState,
  ProposalLogoConfig,
  ProposalPageData,
  createDefaultPageConfigs,
  createDefaultWatermark,
} from './KypasOfficialProposalDocument';

interface AdvancedProposalPageEditorProps {
  activePage: number; // 1 to 10
  onSelectPage: (page: number) => void;
  logoConfig: ProposalLogoConfig;
  onChangeLogoConfig: (cfg: ProposalLogoConfig) => void;
  globalWatermark: PageWatermarkConfig;
  onChangeGlobalWatermark: (wm: PageWatermarkConfig) => void;
  pageConfigs: Record<number, PageVisualConfig>;
  onChangePageConfig: (pageNum: number, cfg: PageVisualConfig) => void;
  onResetAllPagesVisuals: () => void;
  // Full Page Content Props & Updaters
  proposalData: ProposalPageData;
  onUpdateCoreField: (field: string, value: any) => void;
  onUpdatePageTexts: (updater: (prev: NonNullable<ProposalPageData['pageTexts']>) => NonNullable<ProposalPageData['pageTexts']>) => void;
  onUpdateWarranty: (field: keyof ProposalPageData['warranty'], value: any) => void;
  onUpdateEnergyGuarantee: (field: keyof ProposalPageData['energyGuarantee'], value: any) => void;
  onUpdateTermsList: (terms: string[]) => void;
  onUpdateEmiPlans: (plans: Array<{ months: number; emi: number }>) => void;
  onUpdateBomItem: (index: number, field: 'description' | 'make' | 'qty' | 'uom', value: any) => void;
  onAddBomItem: () => void;
  onRemoveBomItem: (index: number) => void;
  onUpdateBankDetails: (field: keyof ProposalPageData['bankDetails'], value: string) => void;
  canvasState?: ProposalCanvasState;
  onUpdateCanvasState?: React.Dispatch<React.SetStateAction<ProposalCanvasState>>;
}

const PAGE_IMAGE_SLOTS: Record<
  number,
  Array<{ id: string; label: string; defaultSrc: string; defaultW: number; defaultH: number }>
> = {
  1: [
    { id: 'p1.skyBanner', label: 'Top Sky & Sunbeams Banner', defaultSrc: '/assets/proposal-template/crops/p1-sky-clean.png', defaultW: 794, defaultH: 185 },
    { id: 'p1.headerLogo', label: 'Cover KYPAS Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 195, defaultH: 72 },
    { id: 'p1.familyPhoto', label: 'Cover Hero Family & Solar Home Photo', defaultSrc: '/assets/proposal-template/crops/p1-family-clean.png', defaultW: 794, defaultH: 605 },
  ],
  2: [
    { id: 'p2.headerLogo', label: 'Page 2 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 190, defaultH: 68 },
    { id: 'p2.villageIllustration', label: 'Solar Village Hero Illustration', defaultSrc: '/assets/proposal-template/crops/p2-village-clean.png', defaultW: 794, defaultH: 580 },
  ],
  3: [
    { id: 'p3.headerLogo', label: 'Page 3 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 185, defaultH: 66 },
    { id: 'p3.zamMainPhoto', label: 'ZAM Mounting Structure Diagram', defaultSrc: '/assets/proposal-template/crops/p3-zam-structure-full.png', defaultW: 730, defaultH: 575 },
    { id: 'p3.loanStamp', label: 'Easy Solar Loan Stamp', defaultSrc: '/assets/proposal-template/crops/p3-loan-stamp.png', defaultW: 200, defaultH: 150 },
  ],
  4: [
    { id: 'p4.headerLogo', label: 'Page 4 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 185, defaultH: 66 },
    { id: 'p4.solarPanelImg', label: 'Solar Panel Product Photo', defaultSrc: '/assets/proposal-template/crops/p4-solar-panel-img.png', defaultW: 190, defaultH: 150 },
    { id: 'p4.inverterImg', label: 'Solar Inverter Product Photo', defaultSrc: '/assets/proposal-template/crops/p4-inverter-img.png', defaultW: 190, defaultH: 150 },
  ],
  5: [
    { id: 'p5.headerLogo', label: 'Page 5 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 175, defaultH: 62 },
  ],
  6: [
    { id: 'p6.headerLogo', label: 'Page 6 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 175, defaultH: 62 },
  ],
  7: [
    { id: 'p7.headerLogo', label: 'Page 7 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 175, defaultH: 62 },
    { id: 'p7.financingMainImg', label: 'Financing & Zero-Investment Graphic', defaultSrc: '/assets/proposal-template/crops/p7-financing-clean.png', defaultW: 730, defaultH: 480 },
  ],
  8: [
    { id: 'p8.headerLogo', label: 'Page 8 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 175, defaultH: 62 },
  ],
  9: [
    { id: 'p9.headerLogo', label: 'Page 9 Header Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 175, defaultH: 62 },
  ],
  10: [
    { id: 'p10.topSunriseBanner', label: 'Page 10 Top Sunrise Solar Banner', defaultSrc: '/assets/proposal-template/crops/p10-top-sunrise.png', defaultW: 794, defaultH: 300 },
    { id: 'p10.centerLogo', label: 'Page 10 Center Brand Logo', defaultSrc: '/assets/proposal-template/crops/kypas-header-logo.png', defaultW: 225, defaultH: 82 },
    { id: 'p10.bottomAerialBanner', label: 'Page 10 Bottom Aerial Solar Roof Banner', defaultSrc: '/assets/proposal-template/crops/p10-bottom-aerial.png', defaultW: 794, defaultH: 250 },
  ],
};

const PAGE_LABELS: Record<number, string> = {
  1: 'Page 1: Cover Page',
  2: 'Page 2: 1 Lakh Homes',
  3: 'Page 3: ZAM Structure',
  4: 'Page 4: ALMM Brands',
  5: 'Page 5: Commercial Offer',
  6: 'Page 6: Bill of Materials',
  7: 'Page 7: Financing & EMI',
  8: 'Page 8: Warranty & Terms',
  9: 'Page 9: Energy Guarantee',
  10: 'Page 10: Contact Us',
};

export const AdvancedProposalPageEditor: React.FC<AdvancedProposalPageEditorProps> = ({
  activePage,
  onSelectPage,
  logoConfig,
  onChangeLogoConfig,
  globalWatermark,
  onChangeGlobalWatermark,
  pageConfigs,
  onChangePageConfig,
  onResetAllPagesVisuals,
  proposalData,
  onUpdateCoreField,
  onUpdatePageTexts,
  onUpdateWarranty,
  onUpdateEnergyGuarantee,
  onUpdateTermsList,
  onUpdateEmiPlans,
  onUpdateBomItem,
  onAddBomItem,
  onRemoveBomItem,
  onUpdateBankDetails,
  canvasState,
  onUpdateCanvasState,
}) => {
  const [subTab, setSubTab] = useState<'images' | 'watermark' | 'content'>('images');

  const currentConfig = pageConfigs[activePage] || createDefaultPageConfigs()[activePage];
  const pageTexts = proposalData.pageTexts!;

  // Helper to read local image file as Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateCurrentConfig = (partial: Partial<PageVisualConfig>) => {
    onChangePageConfig(activePage, {
      ...currentConfig,
      ...partial,
    });
  };

  const updateCustomImage = (partial: Partial<PageVisualConfig['customImage']>) => {
    onChangePageConfig(activePage, {
      ...currentConfig,
      customImage: {
        ...currentConfig.customImage,
        ...partial,
      },
    });
  };

  const updatePageWatermark = (partial: Partial<PageWatermarkConfig>) => {
    onChangePageConfig(activePage, {
      ...currentConfig,
      watermark: {
        ...currentConfig.watermark,
        ...partial,
      },
    });
  };

  const resetCurrentPageImage = () => {
    const defaults = createDefaultPageConfigs()[activePage];
    onChangePageConfig(activePage, {
      ...currentConfig,
      backgroundImageUrl: defaults.backgroundImageUrl,
      showBackgroundImage: defaults.showBackgroundImage,
      imageScale: 100,
      imageFit: 'cover',
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageOpacity: defaults.imageOpacity,
    });
  };

  return (
    <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-sm">
      {/* Top Header & Active Page Selector */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Advanced Page-to-Page Studio
              </h3>
              <p className="text-[10px] text-slate-500">
                Replace & resize images, configure page-wise watermarks, and edit all 10 pages
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResetAllPagesVisuals}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Reset all page images and watermarks to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset Visuals
          </button>
        </div>

        {/* Page Selector Dropdown + Quick Pills */}
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-600 dark:text-slate-400 shrink-0 text-[11px]">
            Editing Page:
          </label>
          <select
            value={activePage}
            onChange={e => onSelectPage(Number(e.target.value))}
            className="flex-1 px-3 py-1.5 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl font-black text-blue-700 dark:text-blue-300 text-xs cursor-pointer"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>
                {PAGE_LABELS[num]}
              </option>
            ))}
          </select>
        </div>

        {/* 3 Mode Sub-Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setSubTab('images')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'images'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Images & Sizing</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('watermark')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'watermark'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Watermark</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('content')}
            className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'content'
                ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Page {activePage} Content</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SUB-TAB 1: PAGE IMAGES REPLACEMENT & SIZING                           */}
      {/* ===================================================================== */}
      {subTab === 'images' && (
        <div className="space-y-4">
          {/* SECTION 0: INDIVIDUAL DECOMPOSED IMAGES ON THIS PAGE */}
          {canvasState && onUpdateCanvasState && PAGE_IMAGE_SLOTS[activePage] && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2.5">
              <div>
                <h4 className="font-black text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Page {activePage} Individual Photos & Banners (Direct Slot Editor)
                </h4>
                <p className="text-[10px] text-slate-500">
                  Replace, resize, or reset individual images on Page {activePage} (or drag & resize them directly on the PDF)
                </p>
              </div>

              <div className="space-y-2">
                {PAGE_IMAGE_SLOTS[activePage].map(slot => {
                  const transform = canvasState.elementTransforms[slot.id] || { x: 0, y: 0 };
                  const currentUrl = canvasState.imageOverrides[slot.id] || slot.defaultSrc;
                  const currentW = transform.width ?? slot.defaultW;
                  const currentH = transform.height ?? slot.defaultH;
                  return (
                    <div
                      key={slot.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={currentUrl}
                            alt={slot.label}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                          <div className="min-w-0">
                            <span className="font-black text-[11px] text-slate-900 dark:text-white block truncate">
                              {slot.label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {currentW}×{currentH}px
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <label className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg cursor-pointer text-[10px] flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Replace</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e =>
                                handleFileUpload(e, dataUrl => {
                                  onUpdateCanvasState(prev => ({
                                    ...prev,
                                    imageOverrides: {
                                      ...prev.imageOverrides,
                                      [slot.id]: dataUrl,
                                    },
                                  }));
                                })
                              }
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateCanvasState(prev => {
                                const nextImg = { ...prev.imageOverrides };
                                const nextTf = { ...prev.elementTransforms };
                                delete nextImg[slot.id];
                                delete nextTf[slot.id];
                                return {
                                  ...prev,
                                  imageOverrides: nextImg,
                                  elementTransforms: nextTf,
                                };
                              });
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                            title="Reset this image slot to original photo, size & position"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>Width:</span>
                            <span>{currentW}px</span>
                          </div>
                          <input
                            type="range"
                            min={40}
                            max={820}
                            value={currentW}
                            onChange={e => {
                              const w = Number(e.target.value);
                              onUpdateCanvasState(prev => ({
                                ...prev,
                                elementTransforms: {
                                  ...prev.elementTransforms,
                                  [slot.id]: {
                                    ...(prev.elementTransforms[slot.id] || { x: 0, y: 0 }),
                                    width: w,
                                  },
                                },
                              }));
                            }}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] font-bold text-slate-500">
                            <span>Height:</span>
                            <span>{currentH}px</span>
                          </div>
                          <input
                            type="range"
                            min={24}
                            max={750}
                            value={currentH}
                            onChange={e => {
                              const h = Number(e.target.value);
                              onUpdateCanvasState(prev => ({
                                ...prev,
                                elementTransforms: {
                                  ...prev.elementTransforms,
                                  [slot.id]: {
                                    ...(prev.elementTransforms[slot.id] || { x: 0, y: 0 }),
                                    height: h,
                                  },
                                },
                              }));
                            }}
                            className="w-full accent-emerald-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION A: PRIMARY PAGE TEMPLATE / BACKGROUND IMAGE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-blue-600" />
                  {PAGE_LABELS[activePage]} — Full-Page Background Overlay
                </h4>
                <p className="text-[10px] text-slate-500">
                  Optional full-page background artwork overlay with zoom, fit, and X/Y offsets
                </p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.showBackgroundImage}
                  onChange={e => updateCurrentConfig({ showBackgroundImage: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Show</span>
              </label>
            </div>

            {/* Thumbnail & Upload Buttons */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                {currentConfig.backgroundImageUrl ? (
                  <img
                    src={currentConfig.backgroundImageUrl}
                    alt={`Page ${activePage}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-5 h-5 text-slate-300" />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-[11px] shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Replace Page {activePage} Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e =>
                        handleFileUpload(e, url =>
                          updateCurrentConfig({
                            backgroundImageUrl: url,
                            showBackgroundImage: true,
                            imageOpacity: 1,
                          })
                        )
                      }
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={resetCurrentPageImage}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Default
                  </button>
                </div>

                <input
                  type="text"
                  value={currentConfig.backgroundImageUrl}
                  onChange={e => updateCurrentConfig({ backgroundImageUrl: e.target.value })}
                  placeholder="Or paste image URL..."
                  className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px]"
                />
              </div>
            </div>

            {/* Image Sizing, Fit, Scale & Offset Sliders */}
            {currentConfig.showBackgroundImage && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Image Scale / Zoom:</span>
                      <span className="text-blue-600">{currentConfig.imageScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={180}
                      value={currentConfig.imageScale}
                      onChange={e => updateCurrentConfig({ imageScale: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Image Opacity:</span>
                      <span className="text-blue-600">{Math.round(currentConfig.imageOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      value={Math.round(currentConfig.imageOpacity * 100)}
                      onChange={e => updateCurrentConfig({ imageOpacity: Number(e.target.value) / 100 })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Horizontal Offset (X):</span>
                      <span className="font-mono">{currentConfig.imageOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min={-250}
                      max={250}
                      value={currentConfig.imageOffsetX}
                      onChange={e => updateCurrentConfig({ imageOffsetX: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Vertical Offset (Y):</span>
                      <span className="font-mono">{currentConfig.imageOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min={-250}
                      max={250}
                      value={currentConfig.imageOffsetY}
                      onChange={e => updateCurrentConfig({ imageOffsetY: Number(e.target.value) })}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Image Sizing Mode:</span>
                  <div className="flex gap-1">
                    {(['cover', 'contain', 'fill'] as const).map(fitMode => (
                      <button
                        key={fitMode}
                        type="button"
                        onClick={() => updateCurrentConfig({ imageFit: fitMode })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                          currentConfig.imageFit === fitMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {fitMode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: ADD / REPLACE EXTRA FLOATING CUSTOM IMAGE ON THIS PAGE */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-indigo-950 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                  Custom Floating Image / Photo / Stamp (Page {activePage})
                </h4>
                <p className="text-[10px] text-slate-500">
                  Add a site photo, 3D layout, QR code, or stamp on Page {activePage} & resize freely
                </p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.customImage.enabled}
                  onChange={e => updateCustomImage({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">Enable</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-[11px] shadow-xs shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    handleFileUpload(e, url =>
                      updateCustomImage({ url, enabled: true })
                    )
                  }
                  className="hidden"
                />
              </label>
              <input
                type="text"
                value={currentConfig.customImage.url}
                onChange={e => updateCustomImage({ url: e.target.value, enabled: true })}
                placeholder="Or paste custom image URL..."
                className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px]"
              />
              {currentConfig.customImage.url && (
                <button
                  type="button"
                  onClick={() => updateCustomImage({ url: '', enabled: false })}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Remove custom image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {currentConfig.customImage.enabled && (
              <div className="space-y-2.5 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Width (px):</span>
                      <span className="text-indigo-600 font-mono">{currentConfig.customImage.width}px</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={720}
                      value={currentConfig.customImage.width}
                      onChange={e => updateCustomImage({ width: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Height (px):</span>
                      <span className="text-indigo-600 font-mono">{currentConfig.customImage.height}px</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={800}
                      value={currentConfig.customImage.height}
                      onChange={e => updateCustomImage({ height: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Position Left (X%):</span>
                      <span className="font-mono">{currentConfig.customImage.x}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={currentConfig.customImage.x}
                      onChange={e => updateCustomImage({ x: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>Position Top (Y%):</span>
                      <span className="font-mono">{currentConfig.customImage.y}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={currentConfig.customImage.y}
                      onChange={e => updateCustomImage({ y: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-[10px] font-bold mb-1">Caption (Optional)</label>
                    <input
                      type="text"
                      value={currentConfig.customImage.caption}
                      onChange={e => updateCustomImage({ caption: e.target.value })}
                      placeholder="e.g. Proposed 3D Roof Layout"
                      className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border rounded-lg text-[11px]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentConfig.customImage.showBorder}
                        onChange={e => updateCustomImage({ showBorder: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-indigo-600"
                      />
                      <span className="text-[10px] font-bold">Frame Border</span>
                    </label>
                    <select
                      value={currentConfig.customImage.fit}
                      onChange={e => updateCustomImage({ fit: e.target.value as any })}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg text-[10px] font-bold"
                    >
                      <option value="contain">Fit: Contain</option>
                      <option value="cover">Fit: Cover</option>
                      <option value="fill">Fit: Stretch</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION C: HEADER COMPANY LOGO IMAGE & SIZING */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 dark:text-white text-xs">
                Company Header Logo & Sizing (Pages 5, 6, 8, 9, 10)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logoConfig.showLogo}
                  onChange={e => onChangeLogoConfig({ ...logoConfig, showLogo: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-[11px] font-bold">Show Logo</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                <img src={logoConfig.url} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-[11px]">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e =>
                    handleFileUpload(e, url => onChangeLogoConfig({ ...logoConfig, url }))
                  }
                  className="hidden"
                />
              </label>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <span className="block text-[9px] font-bold text-slate-500">Width: {logoConfig.width}px</span>
                  <input
                    type="range"
                    min={36}
                    max={200}
                    value={logoConfig.width}
                    onChange={e => onChangeLogoConfig({ ...logoConfig, width: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-500">Height: {logoConfig.height}px</span>
                  <input
                    type="range"
                    min={24}
                    max={110}
                    value={logoConfig.height}
                    onChange={e => onChangeLogoConfig({ ...logoConfig, height: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: GLOBAL & PAGE-WISE WATERMARK EDITOR                        */}
      {/* ===================================================================== */}
      {subTab === 'watermark' && (
        <div className="space-y-4">
          {/* GLOBAL WATERMARK SETTINGS */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-blue-950 dark:text-blue-200 text-xs flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  Global Document Watermark (All Pages)
                </h4>
                <p className="text-[10px] text-slate-500">
                  Apply text or logo watermark across the proposal PDF
                </p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={globalWatermark.enabled}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600"
                />
                <span className="text-[11px] font-black text-blue-700">Enable Global</span>
              </label>
            </div>

            {/* Watermark Mode: Text | Image | Both */}
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: 'text', label: 'Text Watermark' },
                { id: 'image', label: 'Logo / Image' },
                { id: 'both', label: 'Logo + Text' },
              ] as const).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeGlobalWatermark({ ...globalWatermark, mode: m.id, enabled: true })}
                  className={`py-1.5 rounded-xl font-bold text-[10px] cursor-pointer border transition-all ${
                    globalWatermark.mode === m.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Watermark Text & Quick Presets */}
            {(globalWatermark.mode === 'text' || globalWatermark.mode === 'both') && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={globalWatermark.text}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, text: e.target.value, enabled: true })
                  }
                  placeholder="e.g. KYPAS SOLAR POWER"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {['KYPAS SOLAR POWER', 'OFFICIAL PROPOSAL', 'CONFIDENTIAL', 'APPROVED MNRE VENDOR'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        onChangeGlobalWatermark({ ...globalWatermark, text: preset, enabled: true })
                      }
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-bold text-slate-600 hover:border-blue-400 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Watermark Image Upload */}
            {(globalWatermark.mode === 'image' || globalWatermark.mode === 'both') && (
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 text-[11px] shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Watermark Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e =>
                      handleFileUpload(e, url =>
                        onChangeGlobalWatermark({ ...globalWatermark, imageUrl: url, enabled: true })
                      )
                    }
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={globalWatermark.imageUrl}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, imageUrl: e.target.value })
                  }
                  placeholder="Watermark image URL..."
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl text-[10px]"
                />
              </div>
            )}

            {/* Size, Opacity, Rotation & Position Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Text Size:</span>
                  <span className="text-blue-600 font-mono">{globalWatermark.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={110}
                  value={globalWatermark.fontSize}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, fontSize: Number(e.target.value) })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Logo Width:</span>
                  <span className="text-blue-600 font-mono">{globalWatermark.imageWidth}px</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={480}
                  value={globalWatermark.imageWidth}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, imageWidth: Number(e.target.value) })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Opacity:</span>
                  <span className="text-blue-600 font-mono">{Math.round(globalWatermark.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={60}
                  value={Math.round(globalWatermark.opacity * 100)}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, opacity: Number(e.target.value) / 100 })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Rotation Angle:</span>
                  <span className="text-blue-600 font-mono">{globalWatermark.rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  value={globalWatermark.rotation}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, rotation: Number(e.target.value) })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 items-center">
              <div>
                <label className="block text-[10px] font-bold mb-1">Watermark Position</label>
                <select
                  value={globalWatermark.position}
                  onChange={e =>
                    onChangeGlobalWatermark({ ...globalWatermark, position: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold text-[11px]"
                >
                  <option value="center">Center Page</option>
                  <option value="tiled">Tiled Grid (Repeat All Over)</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="bottom-right">Bottom Right Corner</option>
                  <option value="top-left">Top Left Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1">Watermark Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={globalWatermark.color}
                    onChange={e =>
                      onChangeGlobalWatermark({ ...globalWatermark, color: e.target.value })
                    }
                    className="w-8 h-7 rounded cursor-pointer border-0"
                  />
                  {['#0b4ea2', '#f26522', '#334155', '#059669', '#dc2626'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onChangeGlobalWatermark({ ...globalWatermark, color: c })}
                      style={{ backgroundColor: c }}
                      className="w-5 h-5 rounded-full border border-white shadow-2xs cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PAGE-WISE WATERMARK OVERRIDE FOR ACTIVE PAGE */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs">
                  Page {activePage} Specific Watermark Override
                </h4>
                <p className="text-[10px] text-slate-500">
                  Customize or disable watermark specifically on {PAGE_LABELS[activePage]}
                </p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentConfig.watermark.useCustom}
                  onChange={e =>
                    updatePageWatermark({
                      useCustom: e.target.checked,
                      enabled: e.target.checked ? true : currentConfig.watermark.enabled,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  Override on Page {activePage}
                </span>
              </label>
            </div>

            {currentConfig.watermark.useCustom && (
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold">Show Watermark on Page {activePage}:</span>
                  <input
                    type="checkbox"
                    checked={currentConfig.watermark.enabled}
                    onChange={e => updatePageWatermark({ enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </div>

                {currentConfig.watermark.enabled && (
                  <>
                    <div className="grid grid-cols-3 gap-1">
                      {(['text', 'image', 'both'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => updatePageWatermark({ mode: m })}
                          className={`py-1 rounded-lg font-bold text-[10px] uppercase cursor-pointer ${
                            currentConfig.watermark.mode === m
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 border text-slate-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={currentConfig.watermark.text}
                      onChange={e => updatePageWatermark({ text: e.target.value })}
                      placeholder={`Custom watermark text for Page ${activePage}...`}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl text-xs font-bold"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="block text-[9px] font-bold">Size: {currentConfig.watermark.fontSize}px</span>
                        <input
                          type="range"
                          min={18}
                          max={110}
                          value={currentConfig.watermark.fontSize}
                          onChange={e => updatePageWatermark({ fontSize: Number(e.target.value) })}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold">
                          Opacity: {Math.round(currentConfig.watermark.opacity * 100)}%
                        </span>
                        <input
                          type="range"
                          min={2}
                          max={60}
                          value={Math.round(currentConfig.watermark.opacity * 100)}
                          onChange={e => updatePageWatermark({ opacity: Number(e.target.value) / 100 })}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold">Angle: {currentConfig.watermark.rotation}°</span>
                        <input
                          type="range"
                          min={-90}
                          max={90}
                          value={currentConfig.watermark.rotation}
                          onChange={e => updatePageWatermark({ rotation: Number(e.target.value) })}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quick 10-Page Watermark Matrix */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-500 mb-1.5">
                Page-by-Page Watermark Visibility Matrix (Click any page to toggle watermark ON/OFF):
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(pNum => {
                  const pCfg = pageConfigs[pNum] || createDefaultPageConfigs()[pNum];
                  const isActive = pCfg.watermark.useCustom
                    ? pCfg.watermark.enabled
                    : globalWatermark.enabled;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => {
                        onChangePageConfig(pNum, {
                          ...pCfg,
                          watermark: {
                            ...pCfg.watermark,
                            useCustom: true,
                            enabled: !isActive,
                          },
                        });
                      }}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <span>P{pNum}</span>
                      {isActive ? <Check className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: PAGE-BY-PAGE ALL CONTENT EDITOR (PAGES 1 TO 10)            */}
      {/* ===================================================================== */}
      {subTab === 'content' && (
        <div className="space-y-4">
          {/* PAGE 1 CONTENT EDITOR */}
          {activePage === 1 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 dark:text-white text-xs">
                  Page 1: Cover Page Card & Customer Details
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentConfig.showCustomTextOverlay}
                    onChange={e => updateCurrentConfig({ showCustomTextOverlay: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-[11px] font-bold">Show Customer Card</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Top Badge Text</label>
                  <input
                    type="text"
                    value={currentConfig.customBadgeText}
                    onChange={e => updateCurrentConfig({ customBadgeText: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Heading Prefix</label>
                  <input
                    type="text"
                    value={currentConfig.customHeading}
                    onChange={e => updateCurrentConfig({ customHeading: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={proposalData.customerName}
                    onChange={e => onUpdateCoreField('customerName', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">City / Location</label>
                  <input
                    type="text"
                    value={proposalData.customerCity}
                    onChange={e => onUpdateCoreField('customerCity', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold mb-1">Subtitle / Plant Description</label>
                  <input
                    type="text"
                    value={currentConfig.customSubheading}
                    onChange={e => updateCurrentConfig({ customSubheading: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="block text-[10px] font-bold mb-1">
                    Card Vertical Position (Y: {currentConfig.overlayCardY}%)
                  </span>
                  <input
                    type="range"
                    min={10}
                    max={85}
                    value={currentConfig.overlayCardY}
                    onChange={e => updateCurrentConfig({ overlayCardY: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold mb-1">
                    Card Width ({currentConfig.overlayCardWidth}%)
                  </span>
                  <input
                    type="range"
                    min={50}
                    max={96}
                    value={currentConfig.overlayCardWidth}
                    onChange={e => updateCurrentConfig({ overlayCardWidth: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PAGES 2, 3, 4 CONTENT EDITOR */}
          {(activePage === 2 || activePage === 3 || activePage === 4) && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 dark:text-white text-xs">
                  {PAGE_LABELS[activePage]} — Custom Text Callout Overlay
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentConfig.showCustomTextOverlay}
                    onChange={e => updateCurrentConfig({ showCustomTextOverlay: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-[11px] font-bold">Show Callout Banner</span>
                </label>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Badge Label</label>
                  <input
                    type="text"
                    value={currentConfig.customBadgeText}
                    onChange={e => updateCurrentConfig({ customBadgeText: e.target.value, showCustomTextOverlay: true })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Callout Heading</label>
                  <input
                    type="text"
                    value={currentConfig.customHeading}
                    onChange={e => updateCurrentConfig({ customHeading: e.target.value, showCustomTextOverlay: true })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Callout Description</label>
                  <input
                    type="text"
                    value={currentConfig.customSubheading}
                    onChange={e => updateCurrentConfig({ customSubheading: e.target.value, showCustomTextOverlay: true })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="block text-[10px] font-bold mb-1">Position Y ({currentConfig.overlayCardY}%)</span>
                    <input
                      type="range"
                      min={10}
                      max={88}
                      value={currentConfig.overlayCardY}
                      onChange={e => updateCurrentConfig({ overlayCardY: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold mb-1">Width ({currentConfig.overlayCardWidth}%)</span>
                    <input
                      type="range"
                      min={50}
                      max={96}
                      value={currentConfig.overlayCardWidth}
                      onChange={e => updateCurrentConfig({ overlayCardWidth: Number(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5 CONTENT EDITOR: COMMERCIAL OFFER, SPECS, PRICING & BANK */}
          {activePage === 5 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs">
                Page 5: Commercial Offer, Specs, Pricing & Bank Details
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Page 5 Heading</label>
                  <input
                    type="text"
                    value={currentConfig.customHeading}
                    onChange={e => updateCurrentConfig({ customHeading: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={proposalData.customerName}
                    onChange={e => onUpdateCoreField('customerName', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">System Size (kW)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={proposalData.systemSizeKW}
                    onChange={e => onUpdateCoreField('systemSizeKW', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Panel Series / Model</label>
                  <input
                    type="text"
                    value={proposalData.panelModel}
                    onChange={e => onUpdateCoreField('panelModel', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Inverter Brand</label>
                  <input
                    type="text"
                    value={proposalData.inverterBrand}
                    onChange={e => onUpdateCoreField('inverterBrand', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Structure Details</label>
                  <input
                    type="text"
                    value={proposalData.structureDetails}
                    onChange={e => onUpdateCoreField('structureDetails', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Free Service (Years)</label>
                  <input
                    type="number"
                    value={proposalData.freeServiceYears}
                    onChange={e => onUpdateCoreField('freeServiceYears', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Special Offering Kit</label>
                  <input
                    type="text"
                    value={proposalData.offeringKit}
                    onChange={e => onUpdateCoreField('offeringKit', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              {/* Pricing Fields */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    value={proposalData.discount}
                    onChange={e => onUpdateCoreField('discount', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Subsidy (₹)</label>
                  <input
                    type="number"
                    value={proposalData.subsidyAmount}
                    onChange={e => onUpdateCoreField('subsidyAmount', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-mono text-emerald-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Extra Charges (₹)</label>
                  <input
                    type="number"
                    value={proposalData.additionalCharges}
                    onChange={e => onUpdateCoreField('additionalCharges', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-[10px] text-slate-700 dark:text-slate-300">Bank Account Details on Page 5:</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={proposalData.bankDetails.companyName}
                    onChange={e => onUpdateBankDetails('companyName', e.target.value)}
                    placeholder="Beneficiary Name"
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                  <input
                    type="text"
                    value={proposalData.bankDetails.bankName}
                    onChange={e => onUpdateBankDetails('bankName', e.target.value)}
                    placeholder="Bank Name"
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                  <input
                    type="text"
                    value={proposalData.bankDetails.accountNo}
                    onChange={e => onUpdateBankDetails('accountNo', e.target.value)}
                    placeholder="Account No"
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-mono"
                  />
                  <input
                    type="text"
                    value={proposalData.bankDetails.ifsc}
                    onChange={e => onUpdateBankDetails('ifsc', e.target.value)}
                    placeholder="IFSC Code"
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Bottom Payment Note</label>
                  <input
                    type="text"
                    value={pageTexts.paymentNote}
                    onChange={e =>
                      onUpdatePageTexts(prev => ({ ...prev, paymentNote: e.target.value }))
                    }
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold text-orange-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PAGE 6 CONTENT EDITOR: BILL OF MATERIALS (BOM) */}
          {activePage === 6 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 dark:text-white text-xs">
                  Page 6: Bill of Materials (BOM) Items ({proposalData.lineItems.length})
                </h4>
                <button
                  type="button"
                  onClick={onAddBomItem}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {proposalData.lineItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-blue-600">#{idx + 1}</span>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => onUpdateBomItem(idx, 'description', e.target.value)}
                        placeholder="Item Description"
                        className="flex-1 px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg font-semibold text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveBomItem(idx)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold">Make / Brand</span>
                        <input
                          type="text"
                          value={item.make}
                          onChange={e => onUpdateBomItem(idx, 'make', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[10px] font-bold"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold">Quantity</span>
                        <input
                          type="text"
                          value={item.qty}
                          onChange={e => onUpdateBomItem(idx, 'qty', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[10px] font-mono"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold">UoM (Unit)</span>
                        <input
                          type="text"
                          value={item.uom}
                          onChange={e => onUpdateBomItem(idx, 'uom', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border rounded-lg text-[10px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 7 CONTENT EDITOR: FINANCING & EMI PLANS */}
          {activePage === 7 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs">
                Page 7: Easy Financing, EMI Plans & Documents
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Top Subtitle</label>
                  <input
                    type="text"
                    value={currentConfig.customSubheading}
                    onChange={e => updateCurrentConfig({ customSubheading: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Main Portal Heading</label>
                  <input
                    type="text"
                    value={currentConfig.customHeading}
                    onChange={e => updateCurrentConfig({ customHeading: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[10px] text-slate-700 dark:text-slate-300">
                    Customize EMI Plan Tenures & Amounts:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateEmiPlans([...proposalData.financing.emiPlans, { months: 96, emi: 1750 }])
                    }
                    className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    + Add Tenure
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {proposalData.financing.emiPlans.map((plan, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <input
                        type="number"
                        value={plan.months}
                        onChange={e => {
                          const next = [...proposalData.financing.emiPlans];
                          next[idx] = { ...next[idx], months: Number(e.target.value) };
                          onUpdateEmiPlans(next);
                        }}
                        className="w-12 px-1.5 py-1 bg-slate-50 dark:bg-slate-800 border rounded text-[10px] font-bold text-center"
                      />
                      <span className="text-[9px] text-slate-400">Mo: ₹</span>
                      <input
                        type="number"
                        value={plan.emi}
                        onChange={e => {
                          const next = [...proposalData.financing.emiPlans];
                          next[idx] = { ...next[idx], emi: Number(e.target.value) };
                          onUpdateEmiPlans(next);
                        }}
                        className="flex-1 px-1.5 py-1 bg-slate-50 dark:bg-slate-800 border rounded text-[10px] font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 8 CONTENT EDITOR: WARRANTY & TERMS */}
          {activePage === 8 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs">
                Page 8: Component Warranty Years & Terms
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Solar Panel (Product Yrs)</label>
                  <input
                    type="number"
                    value={proposalData.warranty.panelProductYears}
                    onChange={e => onUpdateWarranty('panelProductYears', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Solar Panel (Production Yrs)</label>
                  <input
                    type="number"
                    value={proposalData.warranty.panelProductionYears}
                    onChange={e => onUpdateWarranty('panelProductionYears', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Inverter Warranty (Yrs)</label>
                  <input
                    type="number"
                    value={proposalData.warranty.inverterYears}
                    onChange={e => onUpdateWarranty('inverterYears', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">ZAM Structure Warranty (Yrs)</label>
                  <input
                    type="number"
                    value={proposalData.warranty.structureWarrantyYears}
                    onChange={e => onUpdateWarranty('structureWarrantyYears', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Other Components (Yrs)</label>
                  <input
                    type="number"
                    value={proposalData.warranty.otherComponentsYears}
                    onChange={e => onUpdateWarranty('otherComponentsYears', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Performance Guarantee</label>
                  <input
                    type="text"
                    value={proposalData.warranty.plantPerformanceGuarantee}
                    onChange={e => onUpdateWarranty('plantPerformanceGuarantee', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>

              {/* Terms & Conditions Clauses */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[10px]">Terms & Conditions Clauses:</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateTermsList([
                        ...proposalData.termsAndConditions,
                        `${proposalData.termsAndConditions.length + 1}. Additional standard solar EPC condition.`,
                      ])
                    }
                    className="px-2 py-0.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    + Add Clause
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {proposalData.termsAndConditions.map((term, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <textarea
                        rows={2}
                        value={term}
                        onChange={e => {
                          const next = [...proposalData.termsAndConditions];
                          next[i] = e.target.value;
                          onUpdateTermsList(next);
                        }}
                        className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border rounded-lg text-[10px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateTermsList(proposalData.termsAndConditions.filter((_, idx) => idx !== i))
                        }
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 9 CONTENT EDITOR: ASSURED ENERGY SAVINGS GUARANTEE */}
          {activePage === 9 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white text-xs">
                Page 9: Assured Energy Savings & Compensation Guarantee
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold mb-1">Year 1 Units</label>
                  <input
                    type="number"
                    value={proposalData.energyGuarantee.year1Units}
                    onChange={e => onUpdateEnergyGuarantee('year1Units', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Years 2-5 Units/Yr</label>
                  <input
                    type="number"
                    value={proposalData.energyGuarantee.years2to5UnitsPerYear}
                    onChange={e => onUpdateEnergyGuarantee('years2to5UnitsPerYear', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Compensation (₹/Unit)</label>
                  <input
                    type="number"
                    value={proposalData.energyGuarantee.compensationPerUnit}
                    onChange={e => onUpdateEnergyGuarantee('compensationPerUnit', Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold font-mono text-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="block font-bold text-[10px]">Guarantee Details Clauses:</span>
                {pageTexts.guaranteeDetailsList.map((clause, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={clause}
                    onChange={e => {
                      const next = [...pageTexts.guaranteeDetailsList];
                      next[idx] = e.target.value;
                      onUpdatePageTexts(prev => ({ ...prev, guaranteeDetailsList: next }));
                    }}
                    className="w-full px-2.5 py-1 bg-white dark:bg-slate-900 border rounded-lg text-[10px]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* PAGE 10 CONTENT EDITOR: CONTACT US & BACK COVER */}
          {activePage === 10 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 dark:text-white text-xs">
                  Page 10: Contact Us & Corporate Back Cover
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentConfig.showCustomTextOverlay}
                    onChange={e => updateCurrentConfig({ showCustomTextOverlay: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="text-[11px] font-bold">Show Custom Contact Card</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold mb-1">Company Name</label>
                  <input
                    type="text"
                    value={proposalData.companyDetails.name}
                    onChange={e => onUpdateCoreField('companyName', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold mb-1">Corporate Office Address</label>
                  <textarea
                    rows={2}
                    value={proposalData.companyDetails.address}
                    onChange={e => onUpdateCoreField('office', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={proposalData.companyDetails.phone1}
                    onChange={e => onUpdateCoreField('phone', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold mb-1">Email</label>
                  <input
                    type="text"
                    value={proposalData.companyDetails.email}
                    onChange={e => onUpdateCoreField('email', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
