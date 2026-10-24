import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { parseExcelOrCSV, downloadSampleTemplate } from '../../utils/formatters';

export interface ExpectedColumn {
  key: string;
  label: string;
  required?: boolean;
  description?: string;
}

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityName: string;
  sampleData: Record<string, any>[];
  sampleFileName: string;
  expectedColumns: ExpectedColumn[];
  onImport: (rows: Record<string, any>[]) => Promise<{ success: number; skipped?: number; errors?: string[] } | void>;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  title,
  entityName,
  sampleData,
  sampleFileName,
  expectedColumns,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ success: number; skipped: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setParseError(null);
    setImportSummary(null);

    try {
      const rows = await parseExcelOrCSV(selectedFile);
      if (!rows || rows.length === 0) {
        setParseError('The uploaded file contains no data or could not be read. Please use the sample template.');
        setParsedRows([]);
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error('File parse error:', err);
      setParseError(err.message || 'Failed to parse file. Please ensure it is a valid Excel (.xlsx, .xls) or CSV file.');
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadSampleTemplate(sampleData, sampleFileName);
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setParseError(null);
    setImportSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await onImport(parsedRows);
      if (res) {
        setImportSummary({
          success: res.success || 0,
          skipped: res.skipped || 0,
          errors: res.errors || [],
        });
      } else {
        onClose();
        handleReset();
      }
    } catch (err: any) {
      setParseError(err.message || 'Import operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check required column matches
  const sampleHeaders = parsedRows.length > 0 ? Object.keys(parsedRows[0]) : [];
  const missingRequired = expectedColumns
    .filter(col => col.required)
    .filter(col => !sampleHeaders.some(h => h.trim().toLowerCase() === col.label.toLowerCase() || h.trim().toLowerCase() === col.key.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
              <p className="text-xs text-slate-500">
                Bulk import {entityName} from Excel (.xlsx, .xls) or CSV files with automated column mapping.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {/* Step 1: Download Sample Template Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Need the correct format?
              </span>
              <p className="text-[11px] text-slate-500">
                Download the standardized template with pre-filled sample rows and required headers.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Template (.xlsx)</span>
            </button>
          </div>

          {/* Expected Columns Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Expected Column Headers:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {expectedColumns.map(col => (
                <span
                  key={col.key}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                    col.required
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title={col.description || col.label}
                >
                  {col.label} {col.required && <strong className="text-rose-500">*</strong>}
                </span>
              ))}
            </div>
          </div>

          {/* Step 2: Upload Dropzone */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50/20 transition-all space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Click to select or drag and drop your spreadsheet
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Supports .xlsx, .xls, and .csv files up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {file.name.split('.').pop()}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows detected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold cursor-pointer transition-all"
              >
                Change File
              </button>
            </div>
          )}

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="py-6 flex items-center justify-center gap-2 text-blue-600 text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Reading & analyzing spreadsheet...</span>
            </div>
          )}

          {/* Parse Error */}
          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Parsing Error</p>
                <p>{parseError}</p>
              </div>
            </div>
          )}

          {/* Missing Required Warning */}
          {missingRequired.length > 0 && parsedRows.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Missing Recommended Columns</p>
                <p>
                  The following fields were not detected in headers: {missingRequired.map(c => c.label).join(', ')}. Default values will be used.
                </p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Data Preview (First {Math.min(parsedRows.length, 5)} of {parsedRows.length} Rows):
                </span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for import
                </span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto max-h-56">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5 w-8">#</th>
                      {sampleHeaders.slice(0, 7).map(header => (
                        <th key={header} className="p-2.5 whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                        {sampleHeaders.slice(0, 7).map(header => (
                          <td key={header} className="p-2.5 text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
                            {String(row[header] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Post-Import Results Summary */}
          {importSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Import Process Completed!</span>
              </div>
              <p>
                Successfully ingested <strong>{importSummary.success}</strong> records.
                {importSummary.skipped > 0 && ` (${importSummary.skipped} duplicates or incomplete rows skipped)`}
              </p>
              {importSummary.errors.length > 0 && (
                <ul className="list-disc pl-5 text-[11px] text-amber-700 dark:text-amber-300">
                  {importSummary.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            {importSummary ? 'Close' : 'Cancel'}
          </button>

          {!importSummary && (
            <button
              type="button"
              disabled={parsedRows.length === 0 || isSubmitting || isParsing}
              onClick={handleConfirmImport}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing Records...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Import {parsedRows.length} {entityName}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
