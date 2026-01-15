import React, { useState, useRef } from 'react';
import { InternalContact, VCardVersion, ConversionType } from '../types';
import { Download, CheckCircle, Smartphone, User, Phone, Mail, Globe, MapPin, ArrowLeft, QrCode, X } from 'lucide-react';
import { generateVCard } from '../services/generatorService';
import QRCode from 'react-qr-code';

interface StepPreviewProps {
  contacts: InternalContact[];
  conversionType: ConversionType;
  onDownload: (version: VCardVersion) => void;
  onBack: () => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({ contacts, conversionType, onDownload, onBack }) => {
  const [selectedVersion, setSelectedVersion] = useState<VCardVersion>(VCardVersion.V3_0);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const contact = contacts[previewIndex];

  // Helper to safely get initials
  const getInitials = (c: InternalContact) => {
    return ((c.firstName?.[0] || '') + (c.lastName?.[0] || '')).toUpperCase() || '?';
  };

  const isVcfExport = conversionType === ConversionType.CSV_TO_VCF;

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${contact.firstName}_${contact.lastName}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 relative">

      {/* Settings & Stats Column */}
      <div className="w-full md:w-1/3 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
             <CheckCircle size={20} className="text-green-500 mr-2" />
             Ready to Convert
           </h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b border-slate-100">
               <span className="text-slate-500">Total Contacts</span>
               <span className="font-semibold text-slate-900">{contacts.length.toLocaleString()}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-100">
               <span className="text-slate-500">Format</span>
               <span className="font-semibold text-slate-900">{isVcfExport ? 'CSV -> VCF' : 'VCF -> CSV'}</span>
             </div>
           </div>

           {isVcfExport && (
             <div className="mt-6">
               <label className="block text-sm font-medium text-slate-700 mb-2">vCard Version</label>
               <select
                 className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                 value={selectedVersion}
                 onChange={(e) => setSelectedVersion(e.target.value as VCardVersion)}
               >
                 <option value={VCardVersion.V2_1}>v2.1 (Legacy, Android Old)</option>
                 <option value={VCardVersion.V3_0}>v3.0 (iOS Standard, Recommended)</option>
                 <option value={VCardVersion.V4_0}>v4.0 (Modern RFC 6350)</option>
               </select>
               <p className="text-xs text-slate-500 mt-2">
                 Use <strong>v3.0</strong> for best results with iPhone and iCloud.
               </p>
             </div>
           )}

           <button
             onClick={() => onDownload(selectedVersion)}
             className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-md shadow-blue-200 transition-all flex items-center justify-center space-x-2"
           >
             <Download size={20} />
             <span>Download {isVcfExport ? '.VCF' : '.CSV'} File</span>
           </button>

           <button
             onClick={onBack}
             className="w-full mt-3 text-slate-500 hover:text-slate-800 py-2 text-sm font-medium flex items-center justify-center"
           >
             <ArrowLeft size={16} className="mr-1" /> Back to edit
           </button>
        </div>
      </div>

      {/* Preview Column */}
      <div className="w-full md:w-2/3">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-800">Live Preview</h3>
          <div className="flex space-x-2">
            <button
              disabled={previewIndex === 0}
              onClick={() => setPreviewIndex(i => i - 1)}
              className="px-3 py-1 text-xs border rounded bg-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs text-slate-500 py-1">
              {previewIndex + 1} / {contacts.length}
            </span>
            <button
               disabled={previewIndex === contacts.length - 1}
               onClick={() => setPreviewIndex(i => i + 1)}
               className="px-3 py-1 text-xs border rounded bg-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Mobile Preview Card */}
        <div className="bg-slate-800 rounded-[2.5rem] p-4 max-w-sm mx-auto shadow-2xl border-4 border-slate-900 relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-900 rounded-b-xl z-10"></div>

          <div className="bg-white rounded-[2rem] h-[500px] overflow-y-auto scrollbar-hide relative pt-12 pb-8 px-6">

            {/* QR Toggle Button */}
            <button
              onClick={() => setShowQR(true)}
              className="absolute top-12 right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors z-20"
              title="Show QR Code"
            >
              <QrCode size={20} />
            </button>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-3xl font-bold text-slate-500 mb-4 shadow-inner">
                {getInitials(contact)}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 text-center leading-tight">
                {contact.firstName} {contact.lastName}
              </h2>
              {(contact.organization || contact.jobTitle) && (
                <p className="text-sm text-slate-500 text-center mt-1">
                  {contact.jobTitle} {contact.jobTitle && contact.organization ? 'at' : ''} {contact.organization}
                </p>
              )}

              <div className="flex space-x-4 mt-6 w-full justify-center">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Phone size={18} fill="currentColor" />
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">call</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Mail size={18} />
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium">mail</span>
                </div>
              </div>

              <div className="w-full mt-8 space-y-4">
                {contact.mobilePhone && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">mobile</p>
                    <p className="text-slate-900 font-medium text-base">{contact.mobilePhone}</p>
                  </div>
                )}
                 {contact.workPhone && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">work</p>
                    <p className="text-slate-900 font-medium text-base">{contact.workPhone}</p>
                  </div>
                )}
                {contact.email && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">email</p>
                    <p className="text-slate-900 font-medium text-base">{contact.email}</p>
                  </div>
                )}
                {contact.address && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">address</p>
                    <p className="text-slate-900 font-medium text-base">{contact.address}</p>
                  </div>
                )}
                {contact.note && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">notes</p>
                    <p className="text-slate-900 text-sm whitespace-pre-wrap">{contact.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Source Code Preview (Mini) */}
            {isVcfExport && (
              <div className="mt-8 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">VCard Source Preview</p>
                <pre className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
                  {generateVCard(contact, selectedVersion)}
                </pre>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-4">Preview rendering may vary by device</p>
      </div>

      {/* QR Code Modal Overlay */}
      {showQR && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 rounded-xl flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Scan to Save</h3>
              <button onClick={() => setShowQR(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center mb-6 bg-white p-2" ref={qrRef}>
              <QRCode
                value={generateVCard(contact, selectedVersion)}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>

            <p className="text-center text-xs text-slate-500 mb-6">
              Point your camera app at this code to create a new contact instantly.
            </p>

            <button
              onClick={handleDownloadQR}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg flex items-center justify-center space-x-2"
            >
              <Download size={16} />
              <span>Download QR Image</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};