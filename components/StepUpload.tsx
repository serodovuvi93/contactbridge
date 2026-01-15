import React, { useCallback, useState, useEffect } from 'react';
import { Upload, FileText, AlertCircle, Scissors, ArrowRightLeft } from 'lucide-react';
import { ConversionType } from '../types';

interface StepUploadProps {
  onFileSelect: (file: File, type: ConversionType) => void;
  defaultMode?: 'convert' | 'split';
}

export const StepUpload: React.FC<StepUploadProps> = ({ onFileSelect, defaultMode = 'convert' }) => {
  const [mode, setMode] = useState<'convert' | 'split'>(defaultMode);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [mode]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isVCF = file.name.toLowerCase().endsWith('.vcf') || file.name.toLowerCase().endsWith('.vcard');

    if (mode === 'split') {
      if (!isVCF) {
        alert("Splitting is only available for VCF files. Please upload a .vcf file.");
        return;
      }
      onFileSelect(file, ConversionType.VCF_SPLIT);
      return;
    }

    // Convert Mode
    if (isCSV) {
      onFileSelect(file, ConversionType.CSV_TO_VCF);
    } else if (isVCF) {
      onFileSelect(file, ConversionType.VCF_TO_CSV);
    } else {
      alert("Please upload a .csv or .vcf file");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">

      {/* Mode Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm inline-flex">
          <button
            onClick={() => setMode('convert')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'convert' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <ArrowRightLeft size={16} />
            <span>Convert</span>
          </button>
          <button
            onClick={() => setMode('split')}
             className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'split' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Scissors size={16} />
            <span>Split VCF</span>
          </button>
        </div>
      </div>

      <div
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 bg-white dark:bg-slate-800 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer shadow-sm group"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          {mode === 'split' ? <Scissors size={32} /> : <Upload size={32} />}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          {mode === 'split' ? 'Drop VCF file to split' : 'Drop your contacts file here'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {mode === 'split'
            ? 'Support for .VCF or .VCARD files'
            : 'Support for .CSV (Excel) or .VCF (vCard 2.1, 3.0, 4.0)'
          }
        </p>

        <input
          type="file"
          id="fileInput"
          className="hidden"
          accept={mode === 'split' ? ".vcf,.vcard" : ".csv,.vcf,.vcard"}
          onChange={handleInput}
        />

        <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-blue-200 dark:shadow-none shadow-lg">
          Browse Files
        </button>

        <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
          <AlertCircle size={14} />
          <span>Your data is processed 100% locally in your browser. No data upload.</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className={`p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-3 transition-opacity ${mode === 'split' ? 'opacity-50' : 'opacity-100'}`}>
          <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg">
             <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold dark:text-white">CSV to vCard</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">For iOS & Android Import</p>
          </div>
        </div>
        <div className={`p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-3 transition-opacity ${mode === 'split' ? 'opacity-50' : 'opacity-100'}`}>
           <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg">
             <FileText size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold dark:text-white">vCard to CSV</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">For Excel & CRM Cleanup</p>
          </div>
        </div>
      </div>
    </div>
  );
};