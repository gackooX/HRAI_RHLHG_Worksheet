import React, { useState } from 'react';

const FoundationInsulationModal = ({ isOpen, onClose, onSave, initialConfig }) => {
  if (!isOpen) return null;

  const [constructionType, setConstructionType] = useState(initialConfig?.constructionType || 'Concrete');
  const [insulationType, setInsulationType] = useState(initialConfig?.insulationType || 'Interior Wall Insulation');
  const [bcinType, setBcinType] = useState(initialConfig?.bcinType || 'BCIN_3');
  const [insulationDepth, setInsulationDepth] = useState(initialConfig?.insulationDepth || 0);

  const constructionOptions = ['Concrete', 'Wood', 'Concrete & Wood'];
  const insulationOptions = [
    'Uninsulated',
    'Interior Wall Insulation',
    'Exterior Wall Insulation',
    'Combination Wall Insulation',
    'Interior Wall and Slab Insulation',
    'Exterior Wall and Slab Insulation',
    'Combination Wall and Slab Insulation'
  ];
  const bcinOptions = ['BCIN_1', 'BCIN_2', 'BCIN_3', 'BCIN_4'];

  const handleSave = () => {
    onSave({ constructionType, insulationType, bcinType, insulationDepth });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-800 border-2 border-gray-600 w-[800px] h-[600px] flex flex-col font-sans text-white shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center p-2 bg-gray-900 border-b border-gray-700">
          <h2 className="text-sm font-bold">Foundation Insulation Form</h2>
          <button onClick={onClose} className="hover:text-red-500 font-bold text-lg leading-none px-2">&times;</button>
        </div>

        {/* Body Grid */}
        <div className="flex-1 grid grid-cols-[1.5fr_1fr_2fr] gap-6 p-6 overflow-hidden">

          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col h-1/2">
              <h3 className="text-center font-bold text-xl mb-2">Construction</h3>
              <div className="border border-gray-600 flex-1 bg-gray-900 overflow-y-auto">
                {constructionOptions.map(opt => (
                  <div
                    key={opt}
                    className={`cursor-pointer px-2 py-1 ${constructionType === opt ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                    onClick={() => setConstructionType(opt)}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col h-1/2">
              <h3 className="text-center font-bold text-xl mb-2">Insulation</h3>
              <div className="border border-gray-600 flex-1 bg-gray-900 overflow-y-auto">
                {insulationOptions.map(opt => (
                  <div
                    key={opt}
                    className={`cursor-pointer px-2 py-1 ${insulationType === opt ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                    onClick={() => setInsulationType(opt)}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="flex flex-col pt-8 pb-4">
            <div className="border border-gray-600 flex-1 bg-gray-900 overflow-y-auto">
              {bcinOptions.map(opt => (
                <div
                  key={opt}
                  className={`cursor-pointer px-2 py-1 ${bcinType === opt ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                  onClick={() => setBcinType(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col pt-8 gap-8">
            <div className="flex items-center gap-4 font-bold text-lg">
              <span>Interior Wall Insulation (m)</span>
              <input
                type="number"
                value={insulationDepth}
                onChange={e => setInsulationDepth(parseFloat(e.target.value) || 0)}
                className="w-20 bg-gray-900 border border-gray-600 p-1 text-center outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col items-center">
              <button
                onClick={handleSave}
                className="border border-gray-500 hover:border-white bg-gray-900 hover:bg-gray-700 flex flex-col items-center justify-center p-4 shadow-lg transition-colors w-64"
              >
                <div className="w-32 h-24 bg-gray-600 relative border-4 border-gray-400 rounded-b mb-2">
                   <div className="absolute -left-4 -right-4 bottom-1/3 h-full bg-gray-800 -z-10 opacity-70"></div>
                   <div className="absolute text-white font-bold inset-0 flex items-center justify-center">{insulationDepth} m</div>
                </div>
                <span className="text-sm">Save Configuration and RSI Values</span>
              </button>
            </div>

            <div className="text-xs leading-relaxed text-gray-300 mt-auto">
              - concrete walls and floor<br/>
              - interior surface of wall insulated from top of wall to 0.6 m below grade<br/>
              - first storey brick veneer placed directly on basement's concrete walls
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-500 text-sm transition-colors shadow"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoundationInsulationModal;
