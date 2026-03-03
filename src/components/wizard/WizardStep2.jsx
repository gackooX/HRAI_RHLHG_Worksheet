import React, { useMemo } from 'react';
import library from '../../data/library.json';
import DimensionInput from '../DimensionInput';
import { calculateDetailedAreas, calculateComponentFactors, calculateRoomMetrics } from '../../utils/calculations';

const WizardStep2 = ({ room, updateRoom, projectState, onUpdateProject }) => {
  const isMetric = projectState.displayUnits === 'METRIC';

  const metrics = useMemo(() => calculateRoomMetrics(room, projectState), [room, projectState]);
  const areas = useMemo(() => calculateDetailedAreas(room, projectState), [room, projectState]);
  const factors = useMemo(() => calculateComponentFactors(projectState), [projectState]);

  const handleWindowChange = (dir, field, val) => {
    const current = room.windows[dir] || { area: 0, assemblyId: room.windowAssembly, shadingType: room.shadingType || 'No shades' };
    const updated = typeof current === 'object'
        ? { ...current, [field]: field === 'area' ? (parseFloat(val) || 0) : val }
        : { area: field === 'area' ? (parseFloat(val) || 0) : current, assemblyId: room.windowAssembly, shadingType: room.shadingType || 'No shades', [field]: val };

    const windows = { ...room.windows, [dir]: updated };
    updateRoom({ windows });
  };

  const wallAssemblies = library.assemblies.filter(a => a.type === 'wall');
  const windowAssemblies = library.assemblies.filter(a => a.type === 'window');
  const ceilingAssemblies = library.assemblies.filter(a => a.type === 'ceiling');
  const doorAssemblies = library.assemblies.filter(a => a.type === 'door');

  const Row = ({ label, struct, area, lossFactor, gainFactor, loss, gain, isHeader = false }) => (
    <tr className={`border-b border-gray-200 ${isHeader ? 'bg-gray-50 font-black text-[10px] uppercase' : 'text-xs'}`}>
      <td className="p-2 border-r font-bold">{label}</td>
      <td className="p-2 border-r text-center text-blue-600 font-bold">{struct}</td>
      <td className="p-2 border-r text-right font-mono bg-yellow-50">{area}</td>
      <td className="p-2 border-r text-right text-red-700 font-bold italic opacity-60">{lossFactor}</td>
      <td className="p-2 border-r text-right text-blue-700 font-bold italic opacity-60">{gainFactor}</td>
      <td className="p-2 border-r text-right font-black text-red-600">{loss}</td>
      <td className="p-2 text-right font-black text-blue-600">{gain}</td>
    </tr>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-gray-800 text-white p-3 rounded-t-lg">
        <h3 className="text-md font-black uppercase tracking-widest">HRAI Worksheet Digital Twin</h3>
        <div className="flex gap-4 text-[10px] font-bold">
            <div className="flex gap-1"><span>PE:</span> <span className="text-yellow-400">{room.perimeter}</span></div>
            <div className="flex gap-1"><span>H:</span> <span className="text-yellow-400">{room.height}</span></div>
            <div className="flex gap-1"><span>AF:</span> <span className="text-yellow-400">{room.floorArea}</span></div>
        </div>
      </div>

      <div className="overflow-x-auto border-x border-b border-gray-300 rounded-b-lg shadow-xl">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-[10px] uppercase font-black border-b-2 border-gray-800">
            <tr>
              <th className="p-2 border-r text-left w-48">Components</th>
              <th className="p-2 border-r text-center w-16">Struct</th>
              <th className="p-2 border-r text-right w-24">Area</th>
              <th className="p-2 border-r text-right w-20">HL Factor</th>
              <th className="p-2 border-r text-right w-20">HG Factor</th>
              <th className="p-2 border-r text-right w-24 text-red-700">Heat Loss</th>
              <th className="p-2 text-right w-24 text-blue-700">Heat Gain</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. GROSS EXPOSED WALLS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">1. Gross Exposed Walls</td>
            </tr>
            <Row
               label="Above Grade Wall" struct="AGW" area={areas.grossAGW.toFixed(1)}
               lossFactor="---" gainFactor="---" loss="---" gain="---"
            />
            {room.level === 'Basement' && (
                <Row
                  label="Below Grade Wall" struct="BGW" area={areas.grossBGW.toFixed(1)}
                  lossFactor="---" gainFactor="---" loss="---" gain="---"
                />
            )}

            {/* 2. WINDOWS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">2. Windows, Glass Doors & Skylight</td>
            </tr>
            {['N_S', 'S', 'E_W', 'NE_NW', 'SE_SW', 'H'].map(dir => {
               const data = room.windows[dir];
               const area = typeof data === 'object' ? data.area : (data || 0);
               if (area <= 0) return null;

               const assemblyId = (typeof data === 'object' && data.assemblyId) ? data.assemblyId : room.windowAssembly;
               const shadingType = (typeof data === 'object' && data.shadingType) ? data.shadingType : (room.shadingType || 'No shades');
               const windowAssembly = library.assemblies.find(a => a.id === assemblyId) || { uFactor: 0.32, shgc: 0.4, glazingType: 'Double' };
               const hg_dt = projectState.environmental.hg_odt - projectState.environmental.hg_idt;

               let shgc = windowAssembly.shgc;
               if (data.frameType && library.shgcTable[data.frameType]) {
                 shgc = library.shgcTable[data.frameType][data.isStorm ? 'Storm' : 'Regular'];
               }

               const isf = library.isfTable[shadingType]?.[windowAssembly.glazingType || 'Double'] || 1.0;
               const solarVal = library.solarTable[Math.min(Math.max(Math.round(projectState.environmental.hg_north_latitude), 40), 48).toString()][dir]?.imp || 0;
               const preciseThgm = ( (1/factors.windows.rEff) * hg_dt) + (shgc * solarVal * isf);

               return (
                <Row
                    key={dir} label={`Exposure: ${dir.replace('_', '/')}`} struct={dir}
                    area={area}
                    lossFactor={factors.windows.hlFactor.toFixed(3)}
                    gainFactor={preciseThgm.toFixed(3)}
                    loss={Math.round(area * factors.windows.hlFactor)}
                    gain={Math.round(area * preciseThgm)}
                />
               );
            })}
            <tr className="border-b border-gray-200 bg-blue-50">
                <td colSpan="2" className="p-2 border-r text-right font-black text-[10px] uppercase text-blue-900">Configure Windows</td>
                <td colSpan="5" className="p-2">
                    <div className="space-y-2">
                        {['N_S', 'S', 'E_W', 'NE_NW', 'SE_SW', 'H'].map(dir => {
                            const data = room.windows[dir] || { area: 0, assemblyId: room.windowAssembly, shadingType: room.shadingType || 'No shades', frameType: '', isStorm: false };
                            const area = typeof data === 'object' ? data.area : data;
                            const assemblyId = typeof data === 'object' ? data.assemblyId : room.windowAssembly;
                            const shadingType = typeof data === 'object' ? data.shadingType : (room.shadingType || 'No shades');
                            const frameType = typeof data === 'object' ? data.frameType : '';
                            const isStorm = typeof data === 'object' ? data.isStorm : false;

                            return (
                                <div key={dir} className="flex flex-col gap-1 border-b border-blue-100 pb-2 last:border-0">
                                    <div className="grid grid-cols-6 gap-2 items-center">
                                        <span className="text-[10px] font-black text-blue-800 w-12">{dir.replace('_', '/')}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[7px] font-bold uppercase text-gray-400">Area</span>
                                            <input
                                                type="number" className="w-full border rounded p-1 text-[10px] font-bold"
                                                value={area || ''}
                                                onChange={(e) => handleWindowChange(dir, 'area', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 flex flex-col">
                                            <span className="text-[7px] font-bold uppercase text-gray-400">Glazing System</span>
                                            <select
                                                className="w-full border rounded p-1 text-[9px] bg-white font-bold"
                                                value={assemblyId || ''}
                                                onChange={(e) => handleWindowChange(dir, 'assemblyId', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                {windowAssemblies.map(a => <option key={a.id} value={a.id}>{a.description}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2 flex flex-col">
                                            <span className="text-[7px] font-bold uppercase text-gray-400">Internal Shading</span>
                                            <select
                                                className="w-full border rounded p-1 text-[9px] bg-white font-bold"
                                                value={shadingType}
                                                onChange={(e) => handleWindowChange(dir, 'shadingType', e.target.value)}
                                            >
                                                {Object.keys(library.isfTable).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2 items-center ml-12">
                                        <div className="col-span-3 flex flex-col">
                                            <span className="text-[7px] font-bold uppercase text-gray-400">Frame Type (HRAI SHGC Table)</span>
                                            <select
                                                className="w-full border rounded p-1 text-[9px] bg-white font-bold"
                                                value={frameType || ''}
                                                onChange={(e) => handleWindowChange(dir, 'frameType', e.target.value)}
                                            >
                                                <option value="">Default from Assembly</option>
                                                {Object.keys(library.shgcTable).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-1 flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                checked={isStorm}
                                                onChange={(e) => handleWindowChange(dir, 'isStorm', e.target.checked)}
                                                className="w-3 h-3"
                                            />
                                            <span className="text-[8px] font-bold uppercase">Storm</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>
            </tr>

            {/* 3. EXPOSED DOORS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">3. Exposed Doors</td>
            </tr>
            <Row
               label="Main Entrance / Exterior" struct="D" area={room.doorArea || 0}
               lossFactor={factors.doors.hlFactor.toFixed(3)}
               gainFactor={factors.doors.hgFactor.toFixed(3)}
               loss={Math.round((room.doorArea || 0) * factors.doors.hlFactor)}
               gain={Math.round((room.doorArea || 0) * factors.doors.hgFactor)}
            />
            <tr className="border-b border-gray-200">
                <td className="p-2 border-r text-right font-bold italic text-gray-400">Door Area</td>
                <td colSpan="6" className="p-2">
                    <input
                        type="number" className="w-32 border rounded p-1 text-xs"
                        value={room.doorArea || 0}
                        onChange={(e) => updateRoom({ doorArea: parseFloat(e.target.value) || 0 })}
                    />
                </td>
            </tr>

            {/* 4. NET EXPOSED WALLS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">4. Net Exposed Walls</td>
            </tr>
            <Row
               label="Net AGW (Gross - Win - Door - Hdr)" struct="AGW" area={areas.netAGW.toFixed(1)}
               lossFactor={factors.agw.hlFactor.toFixed(3)}
               gainFactor={factors.agw.hgFactor.toFixed(3)}
               loss={Math.round(areas.netAGW * factors.agw.hlFactor)}
               gain={Math.round(areas.netAGW * factors.agw.hgFactor)}
            />
            {room.level === 'Basement' && (
                <Row
                   label="Net BGW (Sub-grade portion)" struct="BGW" area={areas.netBGW.toFixed(1)}
                   lossFactor={factors.bgw.hlFactor.toFixed(3)}
                   gainFactor={factors.bgw.hgFactor.toFixed(3)}
                   loss={Math.round(areas.netBGW * factors.bgw.hlFactor)}
                   gain={Math.round(areas.netBGW * factors.bgw.hgFactor)}
                />
            )}

            {/* 5. HEADER AREAS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">5. Header Areas</td>
            </tr>
            <Row
               label="Rim Joist / Headers" struct="H" area={areas.headerArea.toFixed(1)}
               lossFactor={factors.header.hlFactor.toFixed(3)}
               gainFactor={factors.header.hgFactor.toFixed(3)}
               loss={Math.round(areas.headerArea * factors.header.hlFactor)}
               gain={Math.round(areas.headerArea * factors.header.hgFactor)}
            />

            {/* 6. EXPOSED CEILINGS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">6. Exposed Ceilings</td>
            </tr>
            <Row
               label="Ceiling / Roof Assembly" struct="C" area={areas.floorArea.toFixed(1)}
               lossFactor={factors.ceiling.hlFactor.toFixed(3)}
               gainFactor={factors.ceiling.hgFactor.toFixed(3)}
               loss={Math.round(areas.floorArea * factors.ceiling.hlFactor)}
               gain={Math.round(areas.floorArea * factors.ceiling.hgFactor)}
            />

            {/* 7. EXPOSED FLOORS */}
            <tr className="bg-gray-50 font-bold text-[9px] uppercase border-b border-gray-300">
              <td colSpan="7" className="p-1 px-2">7. Exposed Floors</td>
            </tr>
            <Row
               label="Floor Over Unconditioned Space" struct="EXF"
               area={projectState.designMultipliers.includeExposedFloor ? areas.floorArea.toFixed(1) : "0.0"}
               lossFactor={factors.floor.hlFactor.toFixed(3)}
               gainFactor={factors.floor.hgFactor.toFixed(3)}
               loss={projectState.designMultipliers.includeExposedFloor ? Math.round(areas.floorArea * factors.floor.hlFactor) : 0}
               gain={projectState.designMultipliers.includeExposedFloor ? Math.round(areas.floorArea * factors.floor.hgFactor) : 0}
            />

            {/* TOTALS */}
            <tr className="bg-gray-900 text-white font-black text-sm uppercase">
                <td colSpan="5" className="p-3 text-right">Room Total Load (Conductive + Air Leakage + Duct Loss)</td>
                <td className="p-3 text-right bg-red-900">{metrics.totalRoomLoss}</td>
                <td className="p-3 text-right bg-blue-900">{metrics.totalRoomGain}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 border rounded-lg">
            <h4 className="text-xs font-black uppercase text-gray-500 mb-2">Room Settings</h4>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                    <input
                      type="checkbox" className="w-4 h-4"
                      checked={room.hasDuctLoss !== false}
                      onChange={(e) => updateRoom({ hasDuctLoss: e.target.checked })}
                    />
                    Apply Duct Loss ({projectState.designMultipliers.ductLossPercentage}%)
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Occupancy:</span>
                    <input
                        type="number" className="w-16 border rounded p-1 font-black text-center"
                        value={room.occupancy || 0}
                        onChange={(e) => updateRoom({ occupancy: parseInt(e.target.value) || 0 })}
                    />
                </div>
            </div>
        </div>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="text-[10px] font-black uppercase text-blue-800">Air Leakage (Sec 12)</div>
            <div className="flex gap-4 font-mono font-black text-blue-900">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] opacity-50">LOSS</span>
                    <span>{metrics.airLeakageLoss}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] opacity-50">GAIN</span>
                    <span>{metrics.airLeakageGain}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStep2;
