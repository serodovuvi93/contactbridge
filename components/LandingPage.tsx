import React, { useEffect } from 'react';
import {
  FileText, Scissors, ShieldCheck, Zap, Smartphone,
  Download, ChevronDown, ChevronUp, ArrowRightLeft, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type PageType = 'home' | 'csv-to-vcf' | 'vcf-to-csv' | 'splitter';

interface LandingPageProps {
  pageType: PageType;
  onStartConvert: () => void;
  onStartSplit: () => void;
  toolComponent?: React.ReactNode;
}

const SAMPLE_CSV = `First Name,Last Name,Organization,Job Title,Mobile Phone,Email,Address\nJohn,Doe,Example Inc,Manager,555-0101,john@example.com,"123 Main St, New York, NY"`;
const SAMPLE_VCF = `BEGIN:VCARD\nVERSION:3.0\nFN:Jane Smith\nN:Smith;Jane;;;\nORG:Tech Corp\nTITLE:Developer\nTEL;TYPE=CELL:555-0102\nEMAIL:jane@tech.com\nADR;TYPE=HOME:;;456 Oak Ave;San Francisco;CA;94101;USA\nEND:VCARD`;

interface FaqItem {
  q: string;
  a: string;
}

interface HowToStep {
  title: string;
  desc: string;
}

interface PageContent {
  title: string;
  metaTitle: string;
  subtitle: string;
  faq: FaqItem[];
  howTo?: HowToStep[];
}

const CONTENT: Record<PageType, PageContent> = {
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
    howTo: [
      { title: "Upload CSV", desc: "Drag and drop your Excel or CSV file containing contacts." },
      { title: "Map Fields", desc: "Match your CSV columns (Name, Phone, etc.) to vCard fields." },
      { title: "Download VCF", desc: "Get your compatible .vcf file ready for iPhone or Android." }
    ],
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
    howTo: [
      { title: "Upload VCF", desc: "Select your vCard (.vcf) file. We support large files." },
      { title: "Preview Data", desc: "Check the extracted contacts in the preview table." },
      { title: "Download CSV", desc: "Save as a CSV file compatible with Excel and Google Sheets." }
    ],
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
    howTo: [
      { title: "Upload VCF", desc: "Choose the large vCard file you want to split." },
      { title: "Configure Split", desc: "Choose to split by number of files or contacts per file." },
      { title: "Download Zip", desc: "Download a ZIP archive containing your split VCF files." }
    ],
    faq: [
      { q: "Why do I need to split VCF files?", a: "Some services (like older Android phones or Google Contacts) have limits on file size or number of contacts per import. Splitting solves this." },
      { q: "Can I choose how many files to create?", a: "Yes. You can split by a fixed number of contacts per file (e.g., 500) or into a specific number of files (e.g., 5 parts)." },
      { q: "Is data lost during splitting?", a: "No. All contact details are preserved exactly as they are in the original file." }
    ]
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ pageType, onStartConvert, onStartSplit, toolComponent }) => {
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

      {/* Hero Section & Tool Interface */}
      <div className="text-center space-y-6 pt-10 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
          {currentContent.title}
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {currentContent.subtitle}
        </p>

        {/* If Tool Component is provided, render it here. Otherwise show Start Buttons */}
        {toolComponent ? (
          <div className="max-w-4xl mx-auto mt-8">
            {toolComponent}
          </div>
        ) : (
          pageType !== 'home' && (
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
          )
        )}
      </div>

      {/* How To Section (Only for Tools) */}
      {currentContent.howTo && (
        <div className="max-w-4xl mx-auto px-4">
           <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">How It Works</h2>
           <div className="grid md:grid-cols-3 gap-8">
             {currentContent.howTo.map((step, idx) => (
               <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.desc}</p>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Tool Cards (Only show on home) */}
      {pageType === 'home' && (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">

          {/* CSV to VCF */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border transition-all group relative overflow-hidden border-slate-200 hover:border-blue-300`}>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <FileText size={28} />
              </div>
              <h3 onClick={() => navigate('/csv-to-vcf/')} className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors">CSV to vCard</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Convert Excel/CSV to .vcf files for iOS & Android.
              </p>
              <button onClick={() => navigate('/csv-to-vcf/')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors mb-4">
                Open Tool
              </button>
              <button
                onClick={() => downloadSample(SAMPLE_CSV, 'sample_contacts.csv', 'text/csv')}
                className="flex items-center text-xs text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Download size={12} className="mr-1" /> Sample CSV
              </button>
            </div>
          </div>

          {/* VCF to CSV */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border transition-all group relative overflow-hidden border-slate-200 hover:border-purple-300`}>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <ArrowRightLeft size={28} />
              </div>
              <h3 onClick={() => navigate('/vcf-to-csv/')} className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-purple-600 transition-colors">vCard to CSV</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Extract contacts to Excel/CSV format.
              </p>
              <button onClick={() => navigate('/vcf-to-csv/')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors mb-4">
                Open Tool
              </button>
              <button
                onClick={() => downloadSample(SAMPLE_VCF, 'sample_contact.vcf', 'text/vcard')}
                className="flex items-center text-xs text-slate-400 hover:text-purple-600 transition-colors"
              >
                <Download size={12} className="mr-1" /> Sample VCF
              </button>
            </div>
          </div>

          {/* VCF Splitter */}
          <div className={`bg-white rounded-2xl p-8 shadow-sm border transition-all group relative overflow-hidden border-slate-200 hover:border-orange-300`}>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Scissors size={28} />
              </div>
              <h3 onClick={() => navigate('/splitter/')} className="text-xl font-bold text-slate-900 mb-2 cursor-pointer hover:text-orange-600 transition-colors">VCF Splitter</h3>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Divide massive VCF files into smaller chunks.
              </p>
              <button onClick={() => navigate('/splitter/')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg transition-colors mb-4">
                Open Tool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Why ContactBridge Pro?</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Privacy First</h3>
              <p className="text-slate-600 leading-relaxed">
                Your data never leaves your device. All processing happens in your browser memory, ensuring your contacts remain 100% private.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Lightning Fast</h3>
              <p className="text-slate-600 leading-relaxed">
                Optimized parsing algorithms handle thousands of contacts in seconds. No waiting for server uploads or queues.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Cross-Platform</h3>
              <p className="text-slate-600 leading-relaxed">
                Full support for vCard 3.0 and 4.0 standards ensures compatibility with iOS, Android, Outlook, and Google Contacts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {currentContent.faq.map((item, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center p-4 text-left font-medium text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{item.q}</span>
                {openFaq === idx ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-slate-600 bg-slate-50 border-t border-slate-100 text-sm leading-relaxed">
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