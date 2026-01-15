import React, { useState, useEffect } from 'react';
import { ArrowRight, GripHorizontal, X } from 'lucide-react';
import { InternalContact, ColumnMapping, SUPPORTED_FIELDS } from '../types';

interface StepMappingProps {
  csvHeaders: string[];
  csvSample: Record<string, string>;
  onConfirm: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

export const StepMapping: React.FC<StepMappingProps> = ({ csvHeaders, csvSample, onConfirm, onBack }) => {
  const [mapping, setMapping] = useState<ColumnMapping>({} as any);
  const [draggingHeader, setDraggingHeader] = useState<string | null>(null);

  // Auto-mapping heuristic
  useEffect(() => {
    const initialMapping: any = {};
    SUPPORTED_FIELDS.forEach(field => {
      // Find a header that includes the key or label (case insensitive)
      const match = csvHeaders.find(h => 
        h.toLowerCase().includes((field.key as string).toLowerCase()) || 
        h.toLowerCase().includes(field.label.toLowerCase())
      );
      if (match) {
        initialMapping[field.key] = match;
      }
    });
    setMapping(initialMapping);
  }, [csvHeaders]);

  const handleDragStart = (e: React.DragEvent, header: string) => {
    e.dataTransfer.setData('text/plain', header);
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingHeader(header);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, fieldKey: keyof InternalContact) => {
    e.preventDefault();
    const header = e.dataTransfer.getData('text/plain');
    if (header) {
      setMapping(prev => ({ ...prev, [fieldKey]: header }));
    }
    setDraggingHeader(null);
  };

  const removeMapping = (fieldKey: keyof InternalContact) => {
    setMapping(prev => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const isFormValid = () => {
    return !!mapping['firstName'];
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Map Columns</h2>
           <p className="text-sm text-slate-500">Drag CSV columns from the right to the matching vCard fields on the left.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onBack}
            className="text-slate-600 font-medium px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Back
          </button>
          <button 
            disabled={!isFormValid()}
            onClick={() => onConfirm(mapping)}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm ${isFormValid() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
          >
            <span>Review & Convert</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex gap-6 overflow-hidden">
        
        {/* Left Column: Target Fields */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
            vCard Fields (Targets)
          </div>
          <div className="overflow-y-auto p-6 space-y-4">
            {SUPPORTED_FIELDS.map((field) => (
              <div 
                key={field.key as string} 
                className={`border-2 rounded-xl p-4 transition-all ${draggingHeader ? 'border-dashed border-blue-300 bg-blue-50' : 'border-slate-100'}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, field.key)}
              >
                <div className="flex items-start justify-between">
                  <div className="mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-800">{field.label}</span>
                      {field.required && <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded font-bold">REQ</span>}
                    </div>
                    <p className="text-xs text-slate-400">{field.description}</p>
                  </div>
                  
                  {mapping[field.key] ? (
                    <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm animate-in fade-in zoom-in duration-200">
                      <GripHorizontal size={14} className="mr-2 opacity-50" />
                      <span className="text-sm font-medium mr-2">{mapping[field.key]}</span>
                      <button 
                        onClick={() => removeMapping(field.key)} 
                        className="hover:bg-blue-200 p-0.5 rounded-full transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic border border-transparent px-3 py-1.5">
                      Drop header here
                    </div>
                  )}
                </div>

                {mapping[field.key] && (
                  <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex items-center">
                    <span className="font-semibold mr-2">Sample:</span> 
                    <span className="truncate">{csvSample[mapping[field.key]!] || <i className="text-slate-300">Empty</i>}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Source Headers */}
        <div className="w-1/3 bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900 font-semibold text-white">
            CSV Columns (Source)
          </div>
          <div className="p-4 overflow-y-auto flex-grow">
            <p className="text-xs text-slate-400 mb-4">Drag these tokens to the fields on the left.</p>
            <div className="flex flex-col gap-2">
              {csvHeaders.map(header => {
                const isMapped = Object.values(mapping).includes(header);
                return (
                  <div 
                    key={header}
                    draggable
                    onDragStart={(e) => handleDragStart(e, header)}
                    onDragEnd={() => setDraggingHeader(null)}
                    className={`
                      group flex items-center p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all select-none
                      ${isMapped 
                        ? 'bg-slate-700/50 border-slate-600 text-slate-400' 
                        : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <GripHorizontal size={16} className={`mr-2 ${isMapped ? 'text-slate-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium truncate">{header}</span>
                    {isMapped && <span className="ml-auto text-[10px] bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded">Mapped</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};