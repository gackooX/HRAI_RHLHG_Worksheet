import React from 'react';
import AssemblySelector from './AssemblySelector';
import { Trash2 } from 'lucide-react';
import { convertPower } from '../utils/unitConverter';

const WorksheetTable = ({ room, roomIndex, totalRooms, projectData, assemblies, updateRoom, removeRoom }) => {
  const isMetric = projectData.displayUnits === 'METRIC';

  const formatPower = (val) => isMetric ? Math.round(convertPower(val)).toLocaleString() : val.toLocaleString();

  const handleDimensionChange = (key, value) => {
    const newDimensions = { ...room.dimensions, [key]: parseFloat(value) || 0 };
    updateRoom(room.id, { dimensions: newDimensions });
  };

  const handleOtherLoadChange = (key, value) => {
    const newOtherLoads = { ...room.otherLoads, [key]: parseFloat(value) || 0 };
    updateRoom(room.id, { otherLoads: newOtherLoads });
  };

  const updateAssembly = (asmId, libraryId) => {
    const newAssemblies = room.assemblies.map(asm =>
      asm.id === asmId ? { ...asm, libraryId } : asm
    );
    updateRoom(room.id, { assemblies: newAssemblies });
  };

  const handleOrientationChange = (asmId, orientation) => {
    const newAssemblies = room.assemblies.map(asm =>
      asm.id === asmId ? { ...asm, orientation } : asm
    );
    updateRoom(room.id, { assemblies: newAssemblies });
  };

  const handleAreaChange = (asmId, area) => {
    const newAssemblies = room.assemblies.map(asm =>
      asm.id === asmId ? { ...asm, area: parseFloat(area) || 0 } : asm
    );
    updateRoom(room.id, { assemblies: newAssemblies });
  };

  return (
    <div className="border border-black mb-8 text-[10px] page-break-after">
      {/* Header Info Block */}
      <div className="grid grid-cols-6 border-b border-black font-bold uppercase">
        <div className="col-span-3 p-1 flex justify-between bg-gray-100">
          <span>HL ΔT = {projectData.idtHeating - projectData.odtHeating}</span>
          <span>HG ΔT = {projectData.odtCooling - projectData.idtCooling}</span>
        </div>
        <div className="p-1 border-x border-black flex flex-col items-center">
          <span>LVL</span>
          <select
            className="text-blue-700 bg-transparent outline-none no-print font-bold text-center appearance-none"
            value={room.levelIndex}
            onChange={(e) => updateRoom(room.id, { levelIndex: parseInt(e.target.value) })}
          >
            <option value={1}>{projectData.foundationType === 'BASEMENT' ? 'Basement' : 'Level 1'}</option>
            <option value={2}>{projectData.foundationType === 'BASEMENT' ? 'Level 1' : 'Level 2'}</option>
            <option value={3}>{projectData.foundationType === 'BASEMENT' ? 'Level 2' : 'Level 3'}</option>
            <option value={4}>{projectData.foundationType === 'BASEMENT' ? 'Level 3' : 'Level 4'}</option>
          </select>
          <span className="text-blue-700 hidden print:block">{room.level}</span>
        </div>
        <div className="p-1 border-r border-black flex flex-col items-center">
          <span>RM</span>
          <span className="text-blue-700">{room.name}</span>
        </div>
        <div className="p-1 flex flex-col items-center bg-gray-50">
          <span>PAGE</span>
          <span>{roomIndex + 3} of {totalRooms + 2}</span>
        </div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold text-center bg-gray-50">
        <div className="col-span-3 border-r border-black p-1">COMPONENTS</div>
        <div className="border-r border-black p-1">EFFECTIVE R-VALUE</div>
        <div className="border-r border-black p-1">U-FACTOR</div>
        <div className="border-r border-black p-1">SC / SHGC</div>
        <div className="border-r border-black p-1">AREA (AF/AW)</div>
        <div className="border-r border-black p-1 text-red-600">HEAT LOSS ({isMetric ? 'W' : 'Btuh'})</div>
        <div className="col-span-2 p-1 text-blue-600">HEAT GAIN ({isMetric ? 'W' : 'Btuh'})</div>
      </div>

      {/* GROSS EXPOSED WALLS */}
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

      {/* Windows Section */}
      <div className="bg-gray-100 p-1 font-bold border-b border-black uppercase">2. Windows, Glass Doors and Skylights</div>
      {room.assemblies.filter(a => a.type === 'window').map(asm => (
        <div key={asm.id} className="grid grid-cols-10 border-b border-black min-h-6 items-center">
          <div className="col-span-3 px-1 border-r border-black flex flex-col">
            <AssemblySelector
              currentId={asm.libraryId}
              assemblies={assemblies.filter(a => a.type === 'window')}
              onSelect={(val) => updateAssembly(asm.id, val)}
            />
            <select
              className="text-[8px] bg-transparent outline-none no-print"
              value={asm.orientation}
              onChange={(e) => handleOrientationChange(asm.id, e.target.value)}
            >
              {['North', 'NorthEast', 'East', 'SouthEast', 'South', 'SouthWest', 'West', 'NorthWest'].map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="border-r border-black h-full text-center">{asm.rValue}</div>
          <div className="border-r border-black h-full text-center">{asm.uFactor}</div>
          <div className="border-r border-black h-full text-center">{asm.shgc}</div>
          <div className="border-r border-black h-full text-center">
            <input
              type="number"
              className="w-full bg-transparent text-center outline-none"
              value={asm.area}
              onChange={(e) => handleAreaChange(asm.id, e.target.value)}
            />
          </div>
          <div className="border-r border-black h-full text-center text-red-600 font-bold">{formatPower(asm.loss)}</div>
          <div className="col-span-2 h-full text-center text-blue-600 font-bold">{formatPower(asm.gain)}</div>
        </div>
      ))}

      {/* Net Walls Section */}
      <div className="bg-gray-100 p-1 font-bold border-b border-black uppercase">4. Net Exposed Walls</div>
      {room.assemblies.filter(a => a.type === 'wall').map(asm => (
        <div key={asm.id} className="grid grid-cols-10 border-b border-black min-h-6 items-center">
          <div className="col-span-3 px-1 border-r border-black">
             <AssemblySelector
              currentId={asm.libraryId}
              assemblies={assemblies.filter(a => a.type === 'wall')}
              onSelect={(val) => updateAssembly(asm.id, val)}
            />
          </div>
          <div className="border-r border-black h-full text-center">{asm.rValue}</div>
          <div className="border-r border-black h-full text-center">{asm.uFactor}</div>
          <div className="border-r border-black h-full"></div>
          <div className="border-r border-black h-full text-center font-bold">{room.netWallArea}</div>
          <div className="border-r border-black h-full text-center text-red-600 font-bold">{formatPower(asm.loss)}</div>
          <div className="col-span-2 h-full text-center text-blue-600 font-bold">{formatPower(asm.gain)}</div>
        </div>
      ))}

      {/* Room Calculation Blocks */}
      <div className="grid grid-cols-10 border-b border-black font-bold uppercase">
        <div className="col-span-6 border-r border-black p-1 text-right">10. Total Conductive</div>
        <div className="border-r border-black p-1 text-center bg-gray-50">AF: {room.dimensions.floorArea}</div>
        <div className="border-r border-black p-1 text-center text-red-600 font-bold">{formatPower(room.totalConductiveLoss)}</div>
        <div className="col-span-2 p-1 text-center text-blue-600 font-bold">{formatPower(room.totalConductiveGain)}</div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold uppercase">
        <div className="col-span-6 border-r border-black p-1 text-right">11. Air Leakage (Multiplier Loss: {projectData.lrAirHeating})</div>
        <div className="border-r border-black p-1 text-center bg-gray-50">H: {room.dimensions.height}</div>
        <div className="border-r border-black p-1 text-center text-red-600 font-bold">{formatPower(room.airLeakageLoss)}</div>
        <div className="col-span-2 p-1 text-center text-blue-600 font-bold">{formatPower(room.airLeakageGain)}</div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold uppercase">
        <div className="col-span-6 border-r border-black p-1 text-right">13. Internal Heat Gain</div>
        <div className="border-r border-black h-full"></div>
        <div className="border-r border-black h-full"></div>
        <div className="col-span-2 p-1 text-center text-blue-600 font-bold">{formatPower(room.otherLoads?.internalGain)}</div>
      </div>

      <div className="grid grid-cols-10 border-b border-black font-bold uppercase bg-gray-200">
        <div className="col-span-8 border-r border-black p-1 text-right">14. Net Loads (10+11+12+13)</div>
        <div className="border-r border-black p-1 text-center text-red-600 font-bold">{formatPower(room.netLoadsLoss)}</div>
        <div className="col-span-2 p-1 text-center text-blue-600 font-bold">{formatPower(room.netLoadsGain)}</div>
      </div>

      <div className="grid grid-cols-10 font-black uppercase text-xs h-8 items-center bg-gray-300">
        <div className="col-span-8 border-r border-black p-1 text-right">16/17. Total Room Load</div>
        <div className="border-r border-black p-1 text-center text-red-800 text-sm font-bold">{formatPower(room.totalRoomLoss)}</div>
        <div className="col-span-2 p-1 text-center text-blue-800 text-sm font-bold">{formatPower(room.totalRoomGain)}</div>
      </div>

      {/* Dynamic Controls (No-Print) */}
      <div className="no-print p-4 bg-gray-50 space-y-2 border-t border-black flex justify-between items-end">
        <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
          <div>
            <label className="block text-[8px] font-bold">Room Name</label>
            <input type="text" className="w-full border p-1" value={room.name} onChange={e => updateRoom(room.id, { name: e.target.value })}/>
          </div>
          <div>
            <label className="block text-[8px] font-bold">Perimeter (P)</label>
            <input type="number" className="w-full border p-1" value={room.dimensions.perimeter} onChange={e => handleDimensionChange('perimeter', e.target.value)}/>
          </div>
          <div>
            <label className="block text-[8px] font-bold">Floor Area (AF)</label>
            <input type="number" className="w-full border p-1" value={room.dimensions.floorArea} onChange={e => handleDimensionChange('floorArea', e.target.value)}/>
          </div>
          <div>
            <label className="block text-[8px] font-bold">Room Height (H)</label>
            <input type="number" className="w-full border p-1" value={room.dimensions.height} onChange={e => handleDimensionChange('height', e.target.value)}/>
          </div>
        </div>
        <button
          onClick={() => removeRoom(room.id)}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 text-xs"
        >
          <Trash2 size={14} /> Remove Room
        </button>
      </div>
    </div>
  );
};

export default WorksheetTable;
