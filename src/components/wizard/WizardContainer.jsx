import React, { useState } from 'react';
import WizardStep1 from './WizardStep1';
import WizardStep2 from './WizardStep2';

const WizardContainer = ({ room, projectState, onUpdate, onComplete, onCancel, onUpdateProject }) => {
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
           <button
             onClick={onCancel}
             className="text-gray-500 hover:text-white font-black uppercase text-[10px] tracking-widest"
           >
             Close Wizard
           </button>
        </div>
      </div>

      {/* Main Content Area - Continuous Scroll */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-2xl space-y-12">
            <WizardStep1
              room={room}
              projectState={projectState}
              updateRoom={handleUpdate}
              onUpdateProject={onUpdateProject}
            />

            <div className="border-t border-gray-800 pt-12">
              <WizardStep2
                room={room}
                updateRoom={handleUpdate}
                projectState={projectState}
                onUpdateProject={onUpdateProject}
              />
            </div>
        </div>
      </div>

      {/* Full Page Footer Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-8 py-4 flex justify-end items-center shrink-0">
         <button
          className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-black rounded-lg uppercase tracking-widest text-[10px] shadow-lg transition-transform hover:scale-105 active:scale-95"
          onClick={onComplete}
         >
           Commit Calculation
         </button>
      </div>
    </div>
  );
};

export default WizardContainer;
