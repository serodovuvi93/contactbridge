import React, { useEffect } from 'react';
import {
  FileText, Scissors, ShieldCheck, Zap, Smartphone,
  Download, ChevronDown, ChevronUp, Check, ArrowRightLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type PageType = 'home' | 'csv-to-vcf' | 'vcf-to-csv' | 'splitter';

interface LandingPageProps {
  pageType: PageType;
  onStartConvert: () => void;
  onStartSplit: () => void;
}

const SAMPLE_CSV = `First Name,Last Name,Organization,Job Title,Mobile Phone,Email,Address\nJohn,Doe,Example Inc,Manager,555-0101,john@example.com,"123 Main St, New York, NY"`;
const SAMPLE_VCF = `BEGIN:VCARD\nVERSION:3.0\nFN:Jane Smith\nN:Smith;Jane;;;\nORG:Tech Corp\nTITLE:Developer\nTEL;TYPE=CELL:555-0102\nEMAIL:jane@tech.com\nADR;TYPE=HOME:;;456 Oak Ave;San Francisco;CA;94101;USA\nEND:VCARD`;

const CONTENT = {
  home: {
    title: "Universal Contact Converter",
    metaTitle: "ContactBridge Pro - Universal Contact Converter",
    subtitle: "Securely convert Excel/CSV files to vCard (VCF) and back. Split large contact lists. Everything runs locally in your browser for 100% privacy.",
    faq: [
      { q: "Is my data uploaded to a server?", a: "No. ContactBridge Pro uses client-side technologies (WebAssembly and JavaScript) to process files directly on your device. Your data never touches our servers." },
      { q: "How do I import the VCF file to iPhone?", a: "Email the .vcf file to yourself and open it in the Mail app on your iPhone, or use AirDrop to transfer it from your Mac. iOS will recognize it as contacts." },
      { q: "Does it support non-English characters?", a: "Yes. We use UTF-8 encoding by default, ensuring that accents, Asian characters, and emojis are preserved correctly during conversion." }
    ]
  },
  'csv-to-vcf': {
    title: "Convert CSV to vCard (VCF)",
    metaTitle: "Free CSV to vCard Converter - Excel to VCF Online | ContactBridge Pro",
    subtitle: "The easiest way to move contacts from Excel or Google Sheets to your iPhone, Android, or iCloud.",
    faq: [
      { q: "Which CSV columns are supported?", a: "We support First Name, Last Name, Phone (Mobile/Work), Email, Address, Organization, Job Title, Website, and Notes. You can map these fields manually." },
      { q: "Can I use this for iCloud import?", a: "Yes. Our vCard 3.0 output is fully compatible with iCloud. simply login to iCloud.com and import the generated VCF file." },
      { q: "How to save Excel as CSV?", a: "In Excel, go to File > Save As, and choose 'CSV UTF-8 (Comma delimited) (*.csv)' from the format dropdown." }
    ]
  },
  'vcf-to-csv': {
    title: "Convert vCard (VCF) to CSV",
    metaTitle: "Free VCF to CSV Converter - vCard to Excel Online | ContactBridge Pro",
    subtitle: "Turn your contact backups into readable spreadsheets. Perfect for CRM imports and data cleaning.",
    faq: [
      { q: "Can I open the result in Excel?", a: "Yes. The generated CSV uses UTF-8 BOM encoding, which opens correctly in Microsoft Excel with all special characters preserved." },
      { q: "What if my VCF has multiple contacts?", a: "We handle single VCF files containing thousands of contacts. They will all be listed as rows in your CSV." },
      { q: "Are photos supported?", a: "Currently, binary photo data is stripped to keep the CSV clean and text-based. Text fields like URLs and Notes are preserved." }
    ]
  },
  'splitter': {
    title: "Split Large VCF Files",
    metaTitle: "Free VCF Splitter - Split vCard Files Online | ContactBridge Pro",
    subtitle: "Break down massive contact files into smaller chunks for easier importing.",
    faq: [
      { q: "Why do I need to split VCF files?", a: "Some services (like older Android phones or Google Contacts) have limits on file size or number of contacts per import. Splitting solves this." },
      { q: "Can I choose how many files to create?", a: "Yes. You can split by a fixed number of contacts per file (e.g., 500) or into a specific number of files (e.g., 5 parts)." },
      { q: "Is data lost during splitting?", a: "No. All contact details are preserved exactly as they are in the original file." }
    ]
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ pageType, onStartConvert, onStartSplit }) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const navigate = useNavigate();

  const currentContent = CONTENT[pageType];

  // Dynamic SEO: Update Title, Description, and OG Tags
  useEffect(() => {
    // Update Title
    document.title = currentContent.metaTitle;

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', currentContent.subtitle);
    }

    // Update Open Graph Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', currentContent.metaTitle);
    }

    // Update Open Graph Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', currentContent.subtitle);
    }
  }, [pageType, currentContent]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const downloadSample = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-20 pb-12">

      {/* Hero Section */}
      <div className="text-center space-y-6 pt-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          {currentContent.title}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {currentContent.subtitle}
        </p>

        {pageType !== 'home' && (
          <div className="pt-4">
             {pageType === 'splitter' ? (
                <button onClick={onStartSplit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105">
                  Split VCF Now
                </button>
             ) : (
                <button onClick={onStartConvert} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105">
                  Start Conversion
                </button>
             )}
          </div>
        )}
      </div>

      {/* Tool Cards (Only show others if on specific page, or all on home) */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">

        {/* CSV to VCF */}
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border transition-all group relative overflow-hidden ${pageType === 'csv-to-vcf' ? 'border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">CSV to vCard</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Convert Excel/CSV to .vcf files for iOS & Android.
            </p>
            {pageType === 'home' && (
              <button onClick={() => navigate('/csv-to-vcf')} className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-lg transition-colors mb-4">
                Open Tool
              </button>
            )}
             {pageType === 'csv-to-vcf' && (
               <button onClick={onStartConvert} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors mb-4">
                Start Now
              </button>
             )}
            <button
              onClick={() => downloadSample(SAMPLE_CSV, 'sample_contacts.csv', 'text/csv')}
              className="flex items-center text-xs text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Download size={12} className="mr-1" /> Sample CSV
            </button>
          </div>
        </div>

        {/* VCF to CSV */}
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border transition-all group relative overflow-hidden ${pageType === 'vcf-to-csv' ? 'border-purple-500 ring-4 ring-purple-50 dark:ring-purple-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <ArrowRightLeft size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">vCard to CSV</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Extract contacts to Excel/CSV format.
            </p>
            {pageType === 'home' && (
              <button onClick={() => navigate('/vcf-to-csv')} className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-lg transition-colors mb-4">
                Open Tool
              </button>
            )}
            {pageType === 'vcf-to-csv' && (
               <button onClick={onStartConvert} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors mb-4">
                Start Now
              </button>
             )}
            <button
              onClick={() => downloadSample(SAMPLE_VCF, 'sample_contact.vcf', 'text/vcard')}
              className="flex items-center text-xs text-slate-400 hover:text-purple-600 transition-colors"
            >
              <Download size={12} className="mr-1" /> Sample VCF
            </button>
          </div>
        </div>

        {/* VCF Splitter */}
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border transition-all group relative overflow-hidden ${pageType === 'splitter' ? 'border-orange-500 ring-4 ring-orange-50 dark:ring-orange-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500'}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6">
              <Scissors size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">VCF Splitter</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Divide massive VCF files into smaller chunks.
            </p>
            {pageType === 'home' && (
              <button onClick={() => navigate('/splitter')} className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-lg transition-colors mb-4">
                Open Tool
              </button>
            )}
            {pageType === 'splitter' && (
               <button onClick={onStartSplit} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors mb-4">
                Start Now
              </button>
             )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-slate-800 py-16 border-y border-slate-100 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Why ContactBridge Pro?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Privacy First</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Your data never leaves your device. All processing happens in your browser memory, ensuring your contacts remain 100% private.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lightning Fast</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Optimized parsing algorithms handle thousands of contacts in seconds. No waiting for server uploads or queues.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cross-Platform</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Full support for vCard 3.0 and 4.0 standards ensures compatibility with iOS, Android, Outlook, and Google Contacts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {currentContent.faq.map((item, idx) => (
            <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700 text-sm leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};