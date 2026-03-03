import React from 'react';
import { calculateComponentFactors } from '../utils/calculations';

const ComponentTable = ({ state, onUpdate }) => {
  const factors = calculateComponentFactors(state);
  const hl_dt = state.environmental.hl_idt - state.environmental.hl_odt;
  const hg_dt = state.environmental.hg_odt - state.environmental.hg_idt;

  const handleREffChange = (key, value) => {
    const effRValues = { ...state.compliance.effRValues, [key]: parseFloat(value) || 0 };
    onUpdate('compliance', { effRValues });
  };

  const handleSCChange = (key, value) => {
    const solarCorrection = { ...state.compliance.solarCorrection, [key]: parseFloat(value) || 0 };
    onUpdate('compliance', { solarCorrection });
  };

  const renderRow = (label, structure, rEff, hlFactor, sc, hgFactor, key) => {
    return (
      <tr className="border-b text-[10px]">
        <td className="p-2 border font-bold uppercase">{label}</td>
        <td className="p-2 border text-center font-bold text-green-700 uppercase w-16">{structure}</td>
        <td className="p-2 border text-center w-24">
            <input
              type="number" step="0.01"
              className="w-16 border rounded p-1 font-bold text-center text-red-600 bg-red-50"
              value={rEff}
              onChange={(e) => handleREffChange(key, e.target.value)}
            />
        </td>
        <td className="p-2 border text-center font-bold text-red-600 w-24">
            {hlFactor.toFixed(2)}
        </td>
        <td className="p-2 border text-center w-16">
            <input
              type="number" step="0.1"
              className="w-12 border rounded p-1 font-bold text-center text-gray-700"
              value={sc}
              onChange={(e) => handleSCChange(key, e.target.value)}
            />
        </td>
        <td className="p-2 border text-center font-bold text-blue-600 w-24">
          {typeof hgFactor === 'number' ? hgFactor.toFixed(2) : hgFactor}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white border-2 border-black rounded shadow-sm overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-black font-black text-center text-[10px] uppercase">
            <th className="p-2 border-r border-black text-left">COMPONENTS</th>
            <th className="p-2 border-r border-black w-16">
               <span className="text-[8px] rotate-180 [writing-mode:vertical-lr] inline-block">STRUCTURE</span>
            </th>
            <th className="border-r border-black w-24">
              <div className="p-1 border-b border-black">HL ΔT = {hl_dt}</div>
              <div className="p-1 text-[8px]">EFFECTIVE R-VALUE (COL 1)</div>
            </th>
            <th className="border-r border-black w-24">
              <div className="p-1 border-b border-black invisible">.</div>
              <div className="p-1 flex flex-col items-center">
                 <span className="border-b border-black w-10 leading-tight">HL ΔT</span>
                 <span className="leading-tight">R</span>
                 <span className="text-[8px] mt-1">COL 2</span>
              </div>
            </th>
            <th className="border-r border-black w-16">
              <div className="p-1 border-b border-black invisible">.</div>
              <div className="p-1 flex flex-col items-center justify-center">
                <span>SC</span>
                <span className="text-[8px]">COL 3</span>
              </div>
            </th>
            <th className="w-24">
              <div className="p-1 border-b border-black">HG ΔT = {hg_dt}</div>
              <div className="p-1 flex flex-col items-center justify-center">
                <span className="border-b border-black w-16 text-[8px]">(HGΔT + SC)</span>
                <span className="leading-tight">R</span>
                <span className="text-[8px] mt-1">COL 4</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-50 text-[10px] uppercase font-black">
             <td className="p-2 border">1. Gross Exposed Walls</td>
             <td className="p-2 border text-center text-green-700 w-16">AGW</td>
             <td colSpan="4" className="bg-gray-300 border"></td>
          </tr>

          {/* Windows (Row 2) */}
          {Object.entries(factors.windows.hgFactor).map(([dir, hgf], i) => (
            <tr key={dir} className="border-b text-[10px]">
              {i === 0 && <td rowSpan="6" className="p-2 border font-bold uppercase align-top">2. Windows, Glass Doors and Skylight</td>}
              <td className="p-2 border text-center font-bold text-green-700 uppercase w-16">{dir.replace('_', '/')}</td>
              <td className="p-2 border text-center w-24">
                {i === 0 ? (
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded border">
                    {factors.windows.rEff.toFixed(2)}
                  </span>
                ) : (
                  <span className="font-bold text-red-600 opacity-30">{factors.windows.rEff.toFixed(2)}</span>
                )}
              </td>
              <td className="p-2 border text-center font-bold text-red-600 w-24">
                {factors.windows.hlFactor.toFixed(2)}
              </td>
              <td className="p-2 border text-center w-16">
                {i === 0 ? (
                    <input
                        type="number" step="0.1"
                        className="w-12 border rounded p-1 font-bold text-center text-gray-700"
                        value={factors.windows.sc}
                        onChange={(e) => handleSCChange('windows', e.target.value)}
                    />
                ) : (
                    <span className="font-bold text-gray-400 opacity-30">{factors.windows.sc}</span>
                )}
              </td>
              <td className="p-2 border text-center font-bold text-blue-600 bg-blue-50 w-24">
                <span className="text-[8px] mr-1 opacity-50">THGM</span> {hgf.toFixed(2)}
              </td>
            </tr>
          ))}

          {renderRow('3. Exposed Doors', 'D', factors.doors.rEff, factors.doors.hlFactor, factors.doors.sc, factors.doors.hgFactor, 'doors')}

          {/* Net Exposed Walls (Row 4) */}
          <tr className="border-b text-[10px]">
            <td rowSpan="2" className="p-2 border font-bold uppercase align-top">4. Net Exposed Walls</td>
            <td className="p-2 border text-center font-bold text-green-700 uppercase w-16">BGW</td>
            <td className="p-2 border text-center w-24">
                <input
                  type="number" step="0.01"
                  className="w-16 border rounded p-1 font-bold text-center text-red-600 bg-red-50"
                  value={factors.bgw.rEff}
                  onChange={(e) => handleREffChange('bgw', e.target.value)}
                />
            </td>
            <td className="p-2 border text-center font-bold text-red-600 w-24">
                {factors.bgw.hlFactor.toFixed(2)}
            </td>
            <td className="p-2 border text-center w-16">
                <input
                  type="number" step="0.1"
                  className="w-12 border rounded p-1 font-bold text-center text-gray-700"
                  value={factors.bgw.sc}
                  onChange={(e) => handleSCChange('bgw', e.target.value)}
                />
            </td>
            <td className="p-2 border text-center font-bold text-blue-600 w-24">{factors.bgw.hgFactor.toFixed(2)}</td>
          </tr>
          <tr className="border-b text-[10px]">
            <td className="p-2 border text-center font-bold text-green-700 uppercase w-16">AGW</td>
            <td className="p-2 border text-center w-24">
                <input
                  type="number" step="0.01"
                  className="w-16 border rounded p-1 font-bold text-center text-red-600 bg-red-50"
                  value={factors.agw.rEff}
                  onChange={(e) => handleREffChange('agw', e.target.value)}
                />
            </td>
            <td className="p-2 border text-center font-bold text-red-600 w-24">
                {factors.agw.hlFactor.toFixed(2)}
            </td>
            <td className="p-2 border text-center w-16">
                <input
                  type="number" step="0.1"
                  className="w-12 border rounded p-1 font-bold text-center text-gray-700"
                  value={factors.agw.sc}
                  onChange={(e) => handleSCChange('agw', e.target.value)}
                />
            </td>
            <td className="p-2 border text-center font-bold text-blue-600 w-24">{factors.agw.hgFactor.toFixed(2)}</td>
          </tr>

          {renderRow('5. Header Areas', 'H', factors.header.rEff, factors.header.hlFactor, factors.header.sc, factors.header.hgFactor, 'header')}
          {renderRow('6. Exposed Ceilings', 'C', factors.ceiling.rEff, factors.ceiling.hlFactor, factors.ceiling.sc, factors.ceiling.hgFactor, 'ceiling')}
          {renderRow('7. Exposed Floors', 'EXF', factors.floor.rEff, factors.floor.hlFactor, factors.floor.sc, factors.floor.hgFactor, 'floor')}

          <tr className="border-b text-[10px]">
            <td className="p-2 border font-bold uppercase">8. Other</td>
            <td className="p-2 border text-center font-bold text-green-700 uppercase"></td>
            <td className="p-2 border text-center"></td>
            <td className="p-2 border text-center"></td>
            <td className="p-2 border text-center"></td>
            <td className="p-2 border text-center"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComponentTable;
