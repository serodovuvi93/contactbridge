import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepUpload } from './components/StepUpload';
import { StepMapping } from './components/StepMapping';
import { StepPreview } from './components/StepPreview';
import { StepSplit } from './components/StepSplit';
import { LandingPage, PageType } from './components/LandingPage';
import { PrivacyModal, TermsModal } from './components/LegalModals';
import { ConversionType, InternalContact, ColumnMapping, VCardVersion } from './types';
import { parseCSV, parseVCF } from './services/parserService';
import { generateBulkVCF, generateCSV } from './services/generatorService';
import { Activity, ShieldCheck, RefreshCw, Scissors } from 'lucide-react';

enum Step {
  HOME = 0,
  UPLOAD = 1,
  MAPPING = 2,
  PREVIEW = 3,
  SPLIT = 4,
}

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(Step.HOME);
  const [conversionType, setConversionType] = useState<ConversionType | null>(null);
  const [defaultUploadMode, setDefaultUploadMode] = useState<'convert' | 'split'>('convert');
  const [rawFileContent, setRawFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Legal Modals
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // CSV State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

  // Mapped Contacts
  const [contacts, setContacts] = useState<InternalContact[]>([]);

  // Determine current Page Type from URL
  const getPageType = (): PageType => {
    const path = location.pathname;
    if (path.includes('csv-to-vcf')) return 'csv-to-vcf';
    if (path.includes('vcf-to-csv')) return 'vcf-to-csv';
    if (path.includes('splitter')) return 'splitter';
    return 'home';
  };

  const pageType = getPageType();

  // Reset logic when navigating to home, or switching tools
  useEffect(() => {
    if (pageType === 'home') {
       if (step !== Step.HOME) setStep(Step.HOME);
    } else {
       // We are on a tool page

       // Sync Upload Mode with Page Type
       if (pageType === 'splitter') {
          if (defaultUploadMode !== 'split') setDefaultUploadMode('split');
       } else {
          if (defaultUploadMode !== 'convert') setDefaultUploadMode('convert');
       }

       // If step is HOME (just arrived), start the tool
       if (step === Step.HOME) {
           setStep(Step.UPLOAD);
           setContacts([]);
           setCsvData([]);
       }
    }
  }, [location.pathname, pageType]); // Depend on pathname (and thus pageType)

  const handleStartConvert = () => {
    setDefaultUploadMode('convert');
    setStep(Step.UPLOAD);
  };

  const handleStartSplit = () => {
    setDefaultUploadMode('split');
    setStep(Step.UPLOAD);
  };

  const handleFileSelect = async (file: File, type: ConversionType) => {
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    setConversionType(type);
    const text = await file.text();
    setRawFileContent(text);

    if (type === ConversionType.CSV_TO_VCF) {
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setCsvData(parsed);
        setCsvHeaders(Object.keys(parsed[0]));
        setStep(Step.MAPPING);
      } else {
        alert("CSV appears empty or invalid.");
      }
    } else if (type === ConversionType.VCF_TO_CSV) {
      const parsedContacts = parseVCF(text);
      if (parsedContacts.length > 0) {
        setContacts(parsedContacts);
        setStep(Step.PREVIEW);
      } else {
        alert("Could not parse contacts from this VCard file.");
      }
    } else if (type === ConversionType.VCF_SPLIT) {
       const parsedContacts = parseVCF(text);
       if (parsedContacts.length > 0) {
         setContacts(parsedContacts);
         setStep(Step.SPLIT);
       } else {
         alert("Could not parse contacts from this VCard file.");
       }
    }
  };

  const handleMappingConfirm = (mapping: ColumnMapping) => {
    const mappedContacts: InternalContact[] = csvData.map((row, idx) => {
      const contact: InternalContact = {
        id: `c-${idx}`,
        firstName: '',
        lastName: '',
      };

      (Object.keys(mapping) as Array<keyof InternalContact>).forEach((fieldKey) => {
        const csvHeader = mapping[fieldKey];
        if (csvHeader) {
          contact[fieldKey] = row[csvHeader] || '';
        }
      });

      if (!contact.firstName && !contact.lastName) {
         contact.firstName = 'Unknown';
      }

      return contact;
    });

    setContacts(mappedContacts);
    setStep(Step.PREVIEW);
  };

  const handleDownload = (version: VCardVersion) => {
    if (typeof window === 'undefined') return;

    let content = '';
    let mimeType = '';
    let extension = '';

    if (conversionType === ConversionType.CSV_TO_VCF) {
      content = generateBulkVCF(contacts, version);
      mimeType = 'text/vcard;charset=utf-8';
      extension = 'vcf';
    } else {
      content = generateCSV(contacts);
      mimeType = 'text/csv;charset=utf-8';
      extension = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}_converted.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSplitMode = step === Step.SPLIT || (step === Step.UPLOAD && defaultUploadMode === 'split');
  const isHome = step === Step.HOME;

  // Render the tool steps as a component to pass to LandingPage
  const toolContent = (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 text-left relative z-20">
      {step === Step.UPLOAD && <StepUpload onFileSelect={handleFileSelect} defaultMode={defaultUploadMode} />}

      {step === Step.MAPPING && (
        <StepMapping
          csvHeaders={csvHeaders}
          csvSample={csvData[0] || {}}
          onConfirm={handleMappingConfirm}
          onBack={() => setStep(Step.UPLOAD)}
        />
      )}

      {step === Step.PREVIEW && (
        <StepPreview
          contacts={contacts}
          conversionType={conversionType!}
          onDownload={handleDownload}
          onBack={() => conversionType === ConversionType.CSV_TO_VCF ? setStep(Step.MAPPING) : setStep(Step.UPLOAD)}
        />
      )}

      {step === Step.SPLIT && (
        <StepSplit
          contacts={contacts}
          onBack={() => setStep(Step.UPLOAD)}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-600 cursor-pointer" onClick={() => {
            navigate('/');
            setStep(Step.HOME);
          }}>
            <RefreshCw size={24} />
            <span className="text-xl font-bold tracking-tight text-slate-900">ContactBridge <span className="text-blue-600">Pro</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-500">
             {isHome ? (
               <nav className="flex space-x-6">
                 <button onClick={() => navigate('/csv-to-vcf/')} className={`transition-colors ${pageType === 'csv-to-vcf' ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}`}>CSV to VCF</button>
                 <button onClick={() => navigate('/vcf-to-csv/')} className={`transition-colors ${pageType === 'vcf-to-csv' ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}`}>VCF to CSV</button>
                 <button onClick={() => navigate('/splitter/')} className={`transition-colors ${pageType === 'splitter' ? 'text-blue-600 font-semibold' : 'hover:text-blue-600'}`}>Splitter</button>
               </nav>
             ) : (
               <>
                 {!isSplitMode && (
                   <>
                    <div className={`flex items-center space-x-2 ${step === Step.UPLOAD ? 'text-blue-600' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === Step.UPLOAD ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>1</div>
                      <span>Upload</span>
                    </div>
                    <div className="w-8 h-px bg-slate-200"></div>
                    <div className={`flex items-center space-x-2 ${step === Step.MAPPING ? 'text-blue-600' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === Step.MAPPING ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2</div>
                      <span>Map</span>
                    </div>
                    <div className="w-8 h-px bg-slate-200"></div>
                    <div className={`flex items-center space-x-2 ${step === Step.PREVIEW ? 'text-blue-600' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${step === Step.PREVIEW ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>3</div>
                      <span>Convert</span>
                    </div>
                   </>
                 )}
                 {isSplitMode && (
                   <div className="text-blue-600 flex items-center font-semibold">
                     <Scissors size={18} className="mr-2" /> VCF Splitter Mode
                   </div>
                 )}
               </>
             )}
          </div>

          <div className="flex items-center text-green-600 text-xs font-medium bg-green-50 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="mr-1.5" />
            Secure Client-Side
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        {pageType === 'home' ? (
          <LandingPage
            pageType="home"
            onStartConvert={handleStartConvert}
            onStartSplit={handleStartSplit}
          />
        ) : (
          <LandingPage
            pageType={pageType}
            onStartConvert={handleStartConvert}
            onStartSplit={handleStartSplit}
            toolComponent={toolContent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="font-semibold text-slate-900 mb-1">ContactBridge Pro</p>
              <p>© 2026 ContactBridge Pro. All rights reserved.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
               <button onClick={() => setShowPrivacy(true)} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
               <button onClick={() => setShowTerms(true)} className="hover:text-blue-600 transition-colors">Terms of Service</button>
               <span className="flex items-center text-slate-400"><Activity size={14} className="mr-1" /> v3.0 Support</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default App;