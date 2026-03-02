import React from 'react';
import DimensionInput from '../DimensionInput';

const WizardStep1 = ({ room, projectState, updateRoom }) => {
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

  return (
    <div className="space-y-4">
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
