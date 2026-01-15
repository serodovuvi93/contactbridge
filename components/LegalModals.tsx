import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               {icon}
             </div>
             <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-600 space-y-4 text-sm leading-relaxed">
          {children}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy" icon={<Shield size={24} />}>
    <h4 className="font-bold text-slate-800">1. Local Processing</h4>
    <p>ContactBridge Pro operates entirely on the client-side. When you upload a file, it is processed within your browser's memory using JavaScript. No files are ever sent to a remote server.</p>

    <h4 className="font-bold text-slate-800">2. Data Collection</h4>
    <p>We do not collect, store, or transmit your contact data. We do not use tracking cookies for advertising purposes.</p>

    <h4 className="font-bold text-slate-800">3. Security</h4>
    <p>Since your data never leaves your device, it is as secure as your own computer/phone. This architecture eliminates the risk of server-side data breaches.</p>
  </Modal>
);

export const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service" icon={<FileText size={24} />}>
    <h4 className="font-bold text-slate-800">1. Usage</h4>
    <p>By using ContactBridge Pro, you agree to use it for lawful purposes only. You must have the right to process the contact data you upload.</p>

    <h4 className="font-bold text-slate-800">2. Liability</h4>
    <p>The service is provided "as is". While we strive for accuracy, we are not liable for any data loss or corruption resulting from the conversion process. Please always keep a backup of your original files.</p>

    <h4 className="font-bold text-slate-800">3. Updates</h4>
    <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
  </Modal>
);