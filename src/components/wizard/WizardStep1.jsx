import React from 'react';
import DimensionInput from '../DimensionInput';

const WizardStep1 = ({ room, projectState, updateRoom, onUpdateProject }) => {
  const { foundationType, numStoreys } = projectState.foundation;

  const getLevelOptions = () => {
    const options = [];
    if (foundationType === 'Basement') {
      // Basement scenario: 1 storey with basement has 2 levels
      options.push('Level 1 (Basement)');
      options.push('Level 2 (Main)');
      if (numStoreys >= 2) options.push('Level 3 (Second)');
    } else {
      options.push('Level 1 (Ground)');
      if (numStoreys >= 1) options.push('Level 2 (Second)');
      if (numStoreys >= 2) options.push('Level 3 (Third)');
    }
    return options;
  };

  const isMetric = projectState.displayUnits === 'METRIC';


  const isLevel1 = room.level?.includes('Level 1');
  const isBasement = foundationType === 'Basement' && isLevel1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold uppercase text-gray-400">Step 1: Room Dimensions</h3>
        {isLevel1 && (
           <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg flex items-center gap-6">
              <div>
                <label className="text-blue-400">Foundation Loss (Watts)</label>
                <input
                  type="number"
                  className="w-32 bg-gray-800 border-gray-700 text-white font-black"
                  value={room.foundationLossWatts || 0}
                  onChange={(e) => updateRoom({ foundationLossWatts: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-gray-500 uppercase">Converted Loss</div>
                <div className="text-xl font-black text-white">
                  {Math.round((room.foundationLossWatts || 0) * 3.412)} <span className="text-[10px] font-normal text-gray-400 uppercase">BTU/H</span>
                </div>
              </div>
           </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label htmlFor="room-name" className="block text-sm font-medium">Room Name (Max 8 chars)</label>
          <input
            id="room-name"
            type="text"
            maxLength={8}
            className="w-full border p-2 rounded"
            value={room.name || ''}
            onChange={(e) => updateRoom({ name: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="level" className="block text-sm font-medium">Building Level</label>
          <select
            id="level"
            className="w-full border p-2 rounded bg-white"
            value={room.level || (foundationType === 'Basement' ? 'Basement' : 'Level 1 (Ground)')}
            onChange={(e) => updateRoom({ level: e.target.value })}
          >
            {getLevelOptions().map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <DimensionInput
          id="perimeter" label="Perimeter (PE)" type="length" isMetric={isMetric}
          value={room.perimeter || 0} onChange={(v) => updateRoom({ perimeter: v })}
        />
        <DimensionInput
          id="floor-area" label="Floor Area (AF)" type="area" isMetric={isMetric}
          value={room.floorArea || 0} onChange={(v) => updateRoom({ floorArea: v })}
        />
        <DimensionInput
          id="height" label="Height (H)" type="length" isMetric={isMetric}
          value={room.height || 0} onChange={(v) => updateRoom({ height: v })}
        />
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Volume (VB)
          </label>
          <div className="h-9 px-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 flex items-center shadow-inner cursor-not-allowed">
            {((room.floorArea || 0) * (room.height || state.foundation.floorHeights[room.level] || 8)).toFixed(1)} {isMetric ? 'm³' : 'ft³'}
          </div>
        </div>
        {isBasement && (
          <DimensionInput
            id="bg-height" label="Wall Below Grade Height (ft)" type="length" isMetric={isMetric}
            value={room.wallBelowGradeHeight !== undefined ? room.wallBelowGradeHeight : projectState.foundation.basementBelowGradeHeight}
            onChange={(v) => updateRoom({ wallBelowGradeHeight: v })}
          />
        )}
      </div>
    </div>
  );
};

export default WizardStep1;
