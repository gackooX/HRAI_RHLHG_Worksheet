import React from 'react';
import AssemblySelector from './AssemblySelector';

const WorksheetTable = ({ room, projectData, assemblies, updateRoom }) => {
  const handleDimensionChange = (key, value) => {
    const newDimensions = { ...room.dimensions, [key]: parseFloat(value) || 0 };
    updateRoom(room.id, { dimensions: newDimensions });
  };

  const handleOtherLoadChange = (key, value) => {
    const newOtherLoads = { ...room.otherLoads, [key]: parseFloat(value) || 0 };
    updateRoom(room.id, { otherLoads: newOtherLoads });
  };

  return (
    <div className="border border-black mb-8 text-[10px]">
      {/* Header Info Block */}
      <div className="grid grid-cols-6 border-b border-black font-bold uppercase">
        <div className="col-span-3 p-1 flex justify-between bg-gray-100">
          <span>HL ΔT = {projectData.idtHeating - projectData.odtHeating}</span>
          <span>HG ΔT = {projectData.odtCooling - projectData.idtCooling}</span>
        </div>
        <div className="p-1 border-x border-black flex flex-col items-center">
          <span>LVL</span>
          <span className="text-blue-700">{room.levelIndex}</span>
        </div>
        <div className="p-1 border-r border-black flex flex-col items-center">
          <span>RM</span>
          <span className="text-blue-700">{room.name}</span>
        </div>
        <div className="p-1 flex flex-col items-center bg-gray-50">
          <span>PAGE</span>
          <span>3 of 8</span>
        </div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold text-center bg-gray-50">
        <div className="col-span-3 border-r border-black p-1">COMPONENTS</div>
        <div className="border-r border-black p-1">EFFECTIVE R-VALUE</div>
        <div className="border-r border-black p-1">U-FACTOR</div>
        <div className="border-r border-black p-1">SC / SHGC</div>
        <div className="border-r border-black p-1">AREA (AF/AW)</div>
        <div className="border-r border-black p-1 text-red-600">HEAT LOSS</div>
        <div className="col-span-2 p-1 text-blue-600">HEAT GAIN</div>
      </div>

      {/* Simplified Sections for Display Fidelity */}
      <div className="bg-gray-100 p-1 font-bold border-b border-black">1. GROSS EXPOSED WALLS</div>
      <div className="grid grid-cols-10 border-b border-black h-6 items-center">
        <div className="col-span-3 px-1 border-r border-black flex justify-between">
          <span>Gross Wall Area</span>
          <span>AGW</span>
        </div>
        <div className="border-r border-black h-full"></div>
        <div className="border-r border-black h-full"></div>
        <div className="border-r border-black h-full"></div>
        <div className="border-r border-black h-full text-center">{room.grossWallArea}</div>
        <div className="border-r border-black h-full"></div>
        <div className="col-span-2 h-full"></div>
      </div>

      <div className="bg-gray-100 p-1 font-bold border-b border-black uppercase">2. Windows, Glass Doors and Skylights</div>
      {room.assemblies.filter(a => a.type === 'window').map(asm => (
        <div key={asm.id} className="grid grid-cols-10 border-b border-black h-6 items-center">
          <div className="col-span-3 px-1 border-r border-black italic">{asm.description} ({asm.orientation})</div>
          <div className="border-r border-black h-full text-center">{(1/0.28).toFixed(2)}</div>
          <div className="border-r border-black h-full text-center">0.280</div>
          <div className="border-r border-black h-full text-center">0.40</div>
          <div className="border-r border-black h-full text-center">{asm.area}</div>
          <div className="border-r border-black h-full text-center text-red-600">{asm.loss}</div>
          <div className="col-span-2 h-full text-center text-blue-600">{asm.gain}</div>
        </div>
      ))}

      <div className="bg-gray-100 p-1 font-bold border-b border-black uppercase">4. Net Exposed Walls</div>
      <div className="grid grid-cols-10 border-b border-black h-6 items-center">
        <div className="col-span-3 px-1 border-r border-black">NET WALL AREA (AGW)</div>
        <div className="border-r border-black h-full text-center">22.2</div>
        <div className="border-r border-black h-full text-center">0.045</div>
        <div className="border-r border-black h-full"></div>
        <div className="border-r border-black h-full text-center font-bold">{room.netWallArea}</div>
        <div className="border-r border-black h-full text-center text-red-600">{room.assemblies.find(a => a.type === 'wall')?.loss || 0}</div>
        <div className="col-span-2 h-full text-center text-blue-600">{room.assemblies.find(a => a.type === 'wall')?.gain || 0}</div>
      </div>

      {/* Room Calculation Blocks */}
      <div className="grid grid-cols-10 border-b border-black font-bold uppercase">
        <div className="col-span-6 border-r border-black p-1 text-right">10. Total Conductive</div>
        <div className="border-r border-black p-1 text-center bg-gray-50">AF: {room.dimensions.floorArea}</div>
        <div className="border-r border-black p-1 text-center text-red-600">{room.totalConductiveLoss}</div>
        <div className="col-span-2 p-1 text-center text-blue-600">{room.totalConductiveGain}</div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold uppercase">
        <div className="col-span-6 border-r border-black p-1 text-right">11. Air Leakage (Multiplier Loss: {projectData.lrAirHeating})</div>
        <div className="border-r border-black p-1 text-center bg-gray-50">H: {room.dimensions.height}</div>
        <div className="border-r border-black p-1 text-center text-red-600">{room.airLeakageLoss}</div>
        <div className="col-span-2 p-1 text-center text-blue-600">{room.airLeakageGain}</div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold uppercase">
        <div className="col-span-6 border-r border-black p-1 text-right">13. Internal Heat Gain</div>
        <div className="border-r border-black h-full"></div>
        <div className="border-r border-black h-full"></div>
        <div className="col-span-2 p-1 text-center text-blue-600">{room.otherLoads?.internalGain}</div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold uppercase bg-gray-200">
        <div className="col-span-8 border-r border-black p-1 text-right">14. Net Loads (10+11+12+13)</div>
        <div className="border-r border-black p-1 text-center text-red-600">{room.netLoadsLoss}</div>
        <div className="col-span-2 p-1 text-center text-blue-600">{room.netLoadsGain}</div>
      </div>

      <div className="grid grid-cols-10 font-black uppercase text-xs h-8 items-center bg-gray-300">
        <div className="col-span-8 border-r border-black p-1 text-right">16/17. Total Room Load (Btuh)</div>
        <div className="border-r border-black p-1 text-center text-red-800 text-sm">{room.totalRoomLoss}</div>
        <div className="col-span-2 p-1 text-center text-blue-800 text-sm">{room.totalRoomGain}</div>
      </div>

      {/* Dynamic Controls (No-Print) */}
      <div className="no-print p-4 bg-gray-50 space-y-2 border-t border-black">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[8px] font-bold">Floor Area (AF)</label>
            <input type="number" className="w-full border p-1" value={room.dimensions.floorArea} onChange={e => handleDimensionChange('floorArea', e.target.value)}/>
          </div>
          <div>
            <label className="block text-[8px] font-bold">Room Height (H)</label>
            <input type="number" className="w-full border p-1" value={room.dimensions.height} onChange={e => handleDimensionChange('height', e.target.value)}/>
          </div>
          <div>
            <label className="block text-[8px] font-bold">Internal Gain (Sec 13)</label>
            <input type="number" className="w-full border p-1" value={room.otherLoads.internalGain} onChange={e => handleOtherLoadChange('internalGain', e.target.value)}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetTable;
