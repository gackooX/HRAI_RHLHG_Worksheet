import React from 'react';

const AssemblySelector = ({ currentId, assemblies, onSelect }) => {
  return (
    <select
      className="w-full bg-transparent outline-none text-[10px]"
      value={currentId}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select Assembly...</option>
      {assemblies.map(asm => (
        <option key={asm.id} value={asm.id}>
          {asm.description} (U={asm.uFactor})
        </option>
      ))}
    </select>
  );
};

export default AssemblySelector;
