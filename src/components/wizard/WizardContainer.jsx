import React, { useState } from 'react';
import WizardStep1 from './WizardStep1';
import WizardStep2 from './WizardStep2';

const WizardContainer = ({ room, projectState, onUpdate, onComplete, onCancel, onUpdateProject }) => {
  const [step, setStep] = useState(1);

  const handleUpdate = (updates) => {
    onUpdate({ ...room, ...updates });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] flex flex-col overflow-hidden">
      {/* Full Page Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-8 py-4 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Engineering Room Wizard</h2>
          <div className="flex gap-4 mt-1">
             <span className="text-[10px] font-black text-blue-500 uppercase">{room.name || 'Unnamed Room'}</span>
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{room.level}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex gap-2">
             <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-700'}`} />
             <div className={`h-1.5 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-700'}`} />
           </div>

           <button
             onClick={onCancel}
             className="text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-widest"
           >
             Close Wizard
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl">
          {step === 1 ? (
            <WizardStep1
              room={room}
              projectState={projectState}
              updateRoom={handleUpdate}
              onUpdateProject={onUpdateProject}
            />
          ) : (
            <WizardStep2
              room={room}
              updateRoom={handleUpdate}
              projectState={projectState}
              onUpdateProject={onUpdateProject}
            />
          )}
        </div>
      </div>

      {/* Full Page Footer Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-8 py-4 flex justify-between items-center shrink-0">
        <button
          className={`px-8 py-3 font-black rounded-lg uppercase tracking-widest text-[10px] transition-all ${step === 1 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          onClick={() => step === 2 && setStep(1)}
          disabled={step === 1}
        >
          Previous Step
        </button>

        <div className="flex gap-4">
           {step === 2 && (
             <button
              className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-black rounded-lg uppercase tracking-widest text-[10px] shadow-lg transition-transform hover:scale-105 active:scale-95"
              onClick={onComplete}
             >
               Commit Calculation
             </button>
           )}
           {step === 1 && (
             <button
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg uppercase tracking-widest text-[10px] shadow-lg transition-transform hover:scale-105 active:scale-95"
              onClick={() => setStep(2)}
             >
               Next: Exposure Matrix
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default WizardContainer;
