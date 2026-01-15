import React, { useState } from 'react';
import { InternalContact, VCardVersion } from '../types';
import { generateVCard } from '../services/generatorService';
import { Download, Scissors, Layers, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

interface StepSplitProps {
  contacts: InternalContact[];
  onBack: () => void;
}

type SplitMethod = 'by_count' | 'by_files';

export const StepSplit: React.FC<StepSplitProps> = ({ contacts, onBack }) => {
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('by_count');
  const [inputValue, setInputValue] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const totalContacts = contacts.length;
  let fileCount = 0;
  let contactsPerFile = 0;

  if (splitMethod === 'by_count') {
    contactsPerFile = Math.max(1, inputValue);
    fileCount = Math.ceil(totalContacts / contactsPerFile);
  } else {
    fileCount = Math.max(1, inputValue);
    contactsPerFile = Math.ceil(totalContacts / fileCount);
  }

  const handleDownload = async () => {
    setIsProcessing(true);
    // Yield to render UI
    await new Promise(r => setTimeout(r, 50));

    try {
      const zip = new JSZip();

      for (let i = 0; i < fileCount; i++) {
        const start = i * contactsPerFile;
        const end = Math.min(start + contactsPerFile, totalContacts);
        const chunk = contacts.slice(start, end);

        if (chunk.length === 0) break;

        const vcfContent = chunk.map(c => generateVCard(c, VCardVersion.V3_0)).join('\n');
        zip.file(`contacts_part_${i + 1}.vcf`, vcfContent);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'split_contacts.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      alert("Error generating zip file");
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
           <div>
             <h2 className="text-xl font-bold text-slate-800 flex items-center">
               <Scissors size={20} className="mr-2 text-blue-600" />
               Split VCF File
             </h2>
             <p className="text-sm text-slate-500">Divide your contacts into smaller manageable files.</p>
           </div>
           <div className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
             {totalContacts} Contacts
           </div>
        </div>

        <div className="p-8">

          {/* Method Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setSplitMethod('by_count')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${splitMethod === 'by_count' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-200'}`}
            >
              <div className="flex items-center space-x-2 mb-2 text-slate-800 font-semibold">
                <FileText size={18} />
                <span>Contacts per File</span>
              </div>
              <p className="text-xs text-slate-500">Specify the maximum number of contacts in each file.</p>
            </button>

            <button
              onClick={() => setSplitMethod('by_files')}
              className={`p-4 border-2 rounded-xl text-left transition-all ${splitMethod === 'by_files' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-200'}`}
            >
               <div className="flex items-center space-x-2 mb-2 text-slate-800 font-semibold">
                <Layers size={18} />
                <span>Total Files</span>
              </div>
              <p className="text-xs text-slate-500">Specify exactly how many files you want to create.</p>
            </button>
          </div>

          {/* Input Configuration */}
          <div className="mb-8">
             <label className="block text-sm font-medium text-slate-700 mb-2">
               {splitMethod === 'by_count' ? 'Max Contacts per File' : 'Number of Files to Create'}
             </label>
             <input
                type="number"
                min="1"
                max={totalContacts}
                value={inputValue}
                onChange={(e) => setInputValue(parseInt(e.target.value) || 1)}
                className="w-full text-2xl font-bold p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
             />
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
               Result: <strong className="text-slate-900">{fileCount} files</strong> with ~<strong className="text-slate-900">{contactsPerFile}</strong> contacts each.
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
           <button
             onClick={onBack}
             className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center"
           >
             <ArrowLeft size={16} className="mr-2" /> Back
           </button>

           <button
             onClick={handleDownload}
             disabled={isProcessing}
             className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md transition-all flex items-center space-x-2 disabled:opacity-70 disabled:cursor-wait"
           >
             {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
             <span>{isProcessing ? 'Processing...' : 'Download ZIP'}</span>
           </button>
        </div>

      </div>
    </div>
  );
};