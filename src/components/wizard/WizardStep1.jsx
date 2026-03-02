import React from 'react';
import DimensionInput from '../DimensionInput';

const WizardStep1 = ({ room, projectState, updateRoom, onUpdateProject }) => {
  const { foundationType, numStoreys } = projectState.foundation;

  const getLevelOptions = () => {
    const options = [];
    if (foundationType === 'Basement') {
      options.push('Basement');
      if (numStoreys >= 1) options.push('Level 1 (Ground)');
      if (numStoreys >= 2) options.push('Level 2');
      if (numStoreys >= 3) options.push('Level 3');
    } else {
      if (numStoreys >= 1) options.push('Level 1 (Ground)');
      if (numStoreys >= 2) options.push('Level 2');
      if (numStoreys >= 3) options.push('Level 3');
    }
    return options;
  };

  const isMetric = projectState.displayUnits === 'METRIC';

  const updateGlobalDesign = (updates) => {
    // This is a placeholder since the actual update function is likely in WizardContainer
    // For now we'll assume the parent handles state updates via some prop if needed,
    // but usually these components receive the full state and an updateRoom function.
    // If we need to update global state, we'd need a different prop.
    // Assuming updateProjectState is available or provided.
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg space-y-4">
        <h3 className="text-md font-black uppercase text-blue-900 border-b border-blue-200 pb-2">Global Design Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DimensionInput
            id="bsmt-bg-height" label="Basement Below Grade Ht" type="length" isMetric={isMetric}
            value={projectState.foundation.basementBelowGradeHeight || 0}
            onChange={(v) => onUpdateProject('foundation', { basementBelowGradeHeight: v })}
          />
          <DimensionInput
            id="header-height" label="Header Height" type="length" isMetric={isMetric}
            value={projectState.designMultipliers.header_height || 0}
            onChange={(v) => onUpdateProject('designMultipliers', { header_height: v })}
          />
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-gray-500">Duct Loss (%)</label>
            <div className="flex gap-2">
               <input
                 type="checkbox" className="w-4 h-4"
                 checked={projectState.designMultipliers.includeDuctLoss}
                 onChange={(e) => onUpdateProject('designMultipliers', { includeDuctLoss: e.target.checked })}
               />
               <input
                 type="number" className="w-full border p-1 rounded text-sm"
                 value={projectState.designMultipliers.ductLossPercentage}
                 onChange={(e) => onUpdateProject('designMultipliers', { ductLossPercentage: parseInt(e.target.value) || 0 })}
               />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-gray-500">Exposed Floor</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
               <input
                 type="checkbox" className="w-4 h-4"
                 checked={projectState.designMultipliers.includeExposedFloor}
                 onChange={(e) => onUpdateProject('designMultipliers', { includeExposedFloor: e.target.checked })}
               />
               Include Factor
            </label>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold">Step 1: Room Dimensions</h3>
      <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  );
};

export default WizardStep1;
