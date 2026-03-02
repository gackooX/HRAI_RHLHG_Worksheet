import React, { useState } from 'react';
import WizardStep1 from './WizardStep1';
import WizardStep2 from './WizardStep2';

const WizardContainer = ({ room, projectState, onUpdate, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);

  const handleUpdate = (updates) => {
    onUpdate({ ...room, ...updates });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-blue-900">Room Wizard</h2>
        <div className="flex gap-1">
          <div className={`h-2 w-8 rounded ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-2 w-8 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      {step === 1 ? (
        <WizardStep1 room={room} projectState={projectState} updateRoom={handleUpdate} />
      ) : (
        <WizardStep2 room={room} updateRoom={handleUpdate} projectState={projectState} />
      )}

      <div className="mt-8 flex justify-between border-t pt-4">
        <button
          className="px-4 py-2 text-gray-600 font-bold hover:text-gray-900"
          onClick={step === 1 ? onCancel : () => setStep(1)}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all"
          onClick={step === 1 ? () => setStep(2) : onComplete}
        >
          {step === 1 ? 'Next Step' : 'Save Room'}
        </button>
      </div>
    </div>
  );
};

export default WizardContainer;
