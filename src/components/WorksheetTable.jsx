import React from 'react';
import AssemblySelector from './AssemblySelector';

const WorksheetTable = ({ room, designConditions, assemblies, updateRoom }) => {
  const handleAssemblyChange = (index, libraryId) => {
    const newAssemblies = [...room.assemblies];
    const selectedLibAsm = assemblies.find(a => a.id === libraryId);
    newAssemblies[index] = {
      ...newAssemblies[index],
      libraryId,
      type: selectedLibAsm?.type || 'wall'
    };
    updateRoom(room.id, { assemblies: newAssemblies });
  };

  const handleAreaChange = (index, area) => {
    const newAssemblies = [...room.assemblies];
    newAssemblies[index] = { ...newAssemblies[index], area: parseFloat(area) || 0 };
    updateRoom(room.id, { assemblies: newAssemblies });
  };

  const handleDimensionChange = (key, value) => {
    const newDimensions = { ...room.dimensions, [key]: parseFloat(value) || 0 };
    updateRoom(room.id, { dimensions: newDimensions });
  };

  return (
    <div className="mb-8 border border-black">
      <div className="bg-gray-800 text-white p-1 px-2 font-bold flex justify-between items-center">
        <span>ROOM: {room.name.toUpperCase()}</span>
        <div className="flex gap-4 text-[10px]">
          <span>
            Perimeter:
            <input
              type="number"
              className="w-10 bg-transparent border-b border-white ml-1 text-center outline-none"
              value={room.dimensions.perimeter}
              onChange={(e) => handleDimensionChange('perimeter', e.target.value)}
            />'
          </span>
          <span>
            Height:
            <input
              type="number"
              className="w-10 bg-transparent border-b border-white ml-1 text-center outline-none"
              value={room.dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
            />'
          </span>
          <span className="font-bold">Gross Wall: {room.dimensions.perimeter * room.dimensions.height} sq.ft</span>
        </div>
      </div>

      <table className="w-full worksheet-table">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-1/12">Type</th>
            <th className="w-4/12">Assembly Description</th>
            <th className="w-1/12">Orientation</th>
            <th className="w-1/12">Area (sq.ft)</th>
            <th className="w-1/12">U-Factor</th>
            <th className="w-2/12 text-red-700">Heat Loss (BTU/h)</th>
            <th className="w-2/12 text-blue-700">Heat Gain (BTU/h)</th>
          </tr>
        </thead>
        <tbody>
          {room.assemblies.map((asm, index) => {
            const libAsm = assemblies.find(a => a.id === asm.libraryId);
            return (
              <tr key={asm.id}>
                <td className="text-center capitalize">{asm.type}</td>
                <td>
                  <AssemblySelector
                    currentId={asm.libraryId}
                    assemblies={assemblies.filter(a => a.type === asm.type || !asm.type)}
                    onSelect={(id) => handleAssemblyChange(index, id)}
                  />
                </td>
                <td className="text-center">{asm.orientation || '-'}</td>
                <td>
                  {asm.type === 'wall' ? (
                    <span className="block text-center bg-gray-50 italic">{asm.effectiveArea} (net)</span>
                  ) : (
                    <input
                      type="number"
                      className="w-full text-center bg-transparent outline-none border-b border-gray-200"
                      value={asm.area}
                      onChange={(e) => handleAreaChange(index, e.target.value)}
                    />
                  )}
                </td>
                <td className="text-center">{libAsm?.uFactor || '0.000'}</td>
                <td className="text-right loss-cell">{asm.loss}</td>
                <td className="text-right gain-cell">{asm.gain}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-50">
            <td colSpan="5" className="text-right uppercase px-2">Total Room Load:</td>
            <td className="text-right loss-cell text-sm">{room.totalLoss}</td>
            <td className="text-right gain-cell text-sm">{room.totalGain}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default WorksheetTable;
