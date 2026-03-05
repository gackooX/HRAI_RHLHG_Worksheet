import React from 'react';
import { calculateComponentFactors } from '../utils/calculations';

const ComponentTable = ({ state, onUpdate }) => {
  const factors = calculateComponentFactors(state);
  const hl_dt = state.environmental.hl_idt - state.environmental.hl_odt;
  const hg_dt = state.environmental.hg_odt - state.environmental.hg_idt;

  const handleREffChange = (key, value, isCustom = false) => {
    if (isCustom) {
      const customComponents = state.compliance.customComponents.map((c, i) =>
        i === key ? { ...c, rValue: parseFloat(value) || 0 } : c
      );
      onUpdate('compliance', { customComponents });
    } else {
      const effRValues = { ...state.compliance.effRValues, [key]: parseFloat(value) || 0 };
      onUpdate('compliance', { effRValues });
    }
  };

  const handleSCChange = (key, value, isCustom = false) => {
    if (isCustom) {
       const customComponents = state.compliance.customComponents.map((c, i) =>
        i === key ? { ...c, sc: parseFloat(value) || 0 } : c
      );
      onUpdate('compliance', { customComponents });
    } else {
      const solarCorrection = { ...state.compliance.solarCorrection, [key]: parseFloat(value) || 0 };
      onUpdate('compliance', { solarCorrection });
    }
  };

  const addCustomComponent = () => {
    const newComp = {
      label: 'New Component',
      structure: 'X',
      rValue: 10,
      sc: 0
    };
    onUpdate('compliance', { customComponents: [...state.compliance.customComponents, newComp] });
  };

  const removeCustomComponent = (index) => {
     onUpdate('compliance', { customComponents: state.compliance.customComponents.filter((_, i) => i !== index) });
  };

  const renderRow = (label, structure, rEff, hlFactor, sc, hgFactor, key, isCustom = false) => {
    return (
      <tr className="border-b text-[10px]">
        <td className="p-2 border font-bold uppercase flex justify-between items-center group">
          {isCustom ? (
            <input
              className="bg-transparent border-none p-0 w-full focus:ring-0 uppercase font-black"
              value={label}
              onChange={(e) => {
                 const customComponents = state.compliance.customComponents.map((c, i) =>
                   i === key ? { ...c, label: e.target.value } : c
                 );
                 onUpdate('compliance', { customComponents });
              }}
            />
          ) : label}
          {isCustom && (
            <button
              onClick={() => removeCustomComponent(key)}
              className="opacity-0 group-hover:opacity-100 text-red-500 ml-2"
            >
              ✕
            </button>
          )}
        </td>
        <td className="p-2 border text-center font-bold text-green-700 uppercase w-16">
          {isCustom ? (
             <input
              className="bg-transparent border-none p-0 w-full text-center focus:ring-0 uppercase font-black"
              value={structure}
              maxLength={3}
              onChange={(e) => {
                 const customComponents = state.compliance.customComponents.map((c, i) =>
                   i === key ? { ...c, structure: e.target.value } : c
                 );
                 onUpdate('compliance', { customComponents });
              }}
            />
          ) : structure}
        </td>
        <td className="p-2 border text-center w-24">
            <input
              type="number" step="0.01"
              className="w-16 border rounded p-1 font-bold text-center text-red-600 bg-red-900/20"
              value={rEff}
              onChange={(e) => handleREffChange(key, e.target.value, isCustom)}
            />
        </td>
        <td className="p-2 border text-center font-bold text-red-600 w-24">
            {hlFactor.toFixed(2)}
        </td>
        <td className="p-2 border text-center w-16">
            <input
              type="number" step="0.1"
              className="w-12 border rounded p-1 font-bold text-center text-gray-300 bg-gray-800"
              value={sc}
              onChange={(e) => handleSCChange(key, e.target.value, isCustom)}
            />
        </td>
        <td className="p-2 border text-center font-bold text-blue-600 w-24">
          {typeof hgFactor === 'number' ? hgFactor.toFixed(2) : hgFactor}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-800 border-b border-gray-700 font-black text-center text-[10px] uppercase text-gray-400">
            <th className="p-4 border-r border-gray-700 text-left">ENGINEERING COMPONENTS</th>
            <th className="p-4 border-r border-gray-700 w-16">
               <span className="text-[8px] rotate-180 [writing-mode:vertical-lr] inline-block">STRUCTURE</span>
            </th>
            <th className="border-r border-gray-700 w-24">
              <div className="p-2 border-b border-gray-700 text-left">HL ΔT = {hl_dt}</div>
              <div className="p-2 text-[8px]">EFF R (COL 1)</div>
            </th>
            <th className="border-r border-gray-700 w-24">
              <div className="p-2 border-b border-gray-700 text-left">HL ΔT = {hl_dt}</div>
              <div className="p-2 flex flex-col items-center">
                 <span className="border-b border-gray-700 w-10 leading-tight">HL ΔT / R</span>
                 <span className="text-[8px] mt-1">COL 2</span>
              </div>
            </th>
            <th className="border-r border-gray-700 w-16">
              <div className="p-2 border-b border-gray-700 text-left">HG ΔT = {hg_dt}</div>
              <div className="p-2 flex flex-col items-center justify-center">
                <span>SC</span>
                <span className="text-[8px]">COL 3</span>
              </div>
            </th>
            <th className="w-24">
              <div className="p-2 border-b border-gray-700 text-left">HG ΔT = {hg_dt}</div>
              <div className="p-2 flex flex-col items-center justify-center">
                <span className="border-b border-gray-700 w-16 text-[8px]">(HGΔT + SC) / R</span>
                <span className="text-[8px] mt-1">COL 4</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          <tr className="bg-gray-800/30 text-[10px] uppercase font-black text-gray-500">
             <td className="p-3 border-r border-gray-800">1. Gross Exposed Walls</td>
             <td className="p-3 border-r border-gray-800 text-center text-green-500 w-16">AGW</td>
             <td colSpan="4" className="bg-gray-800/50"></td>
          </tr>

          {/* Windows (Row 2) */}
          {Object.entries(factors.windows.hgFactor).map(([dir, hgf], i) => (
            <tr key={dir} className="text-[10px] hover:bg-gray-800/20 transition-colors">
              {i === 0 && <td rowSpan="6" className="p-4 border-r border-gray-800 font-bold uppercase align-top text-gray-300">2. Windows & Skylights</td>}
              <td className="p-3 border-r border-gray-800 text-center font-black text-green-500 uppercase w-16">{dir.replace('_', '/')}</td>
              <td className="p-3 border-r border-gray-800 text-center w-24">
                <span className="font-bold text-red-500">{factors.windows.rEff.toFixed(2)}</span>
              </td>
              <td className="p-3 border-r border-gray-800 text-center font-bold text-red-500 w-24">
                {factors.windows.hlFactor.toFixed(2)}
              </td>
              <td className="p-3 border-r border-gray-800 text-center w-16">
                {i === 0 ? (
                    <input
                        type="number" step="0.1"
                        className="w-12 border border-gray-700 rounded p-1 font-bold text-center text-gray-300 bg-gray-800"
                        value={factors.windows.sc}
                        onChange={(e) => handleSCChange('windows', e.target.value)}
                    />
                ) : (
                    <span className="font-bold text-gray-700">{factors.windows.sc}</span>
                )}
              </td>
              <td className="p-3 text-center font-bold text-blue-500 bg-blue-900/10 w-24">
                {hgf.toFixed(2)}
              </td>
            </tr>
          ))}

          {renderRow('3. Exposed Doors', 'D', factors.doors.rEff, factors.doors.hlFactor, factors.doors.sc, factors.doors.hgFactor, 'doors')}

          {/* Net Exposed Walls (Row 4) */}
          {renderRow('4a. Net BGW', 'BGW', factors.bgw.rEff, factors.bgw.hlFactor, factors.bgw.sc, factors.bgw.hgFactor, 'bgw')}
          {renderRow('4b. Net AGW', 'AGW', factors.agw.rEff, factors.agw.hlFactor, factors.agw.sc, factors.agw.hgFactor, 'agw')}

          {renderRow('5. Header Areas', 'H', factors.header.rEff, factors.header.hlFactor, factors.header.sc, factors.header.hgFactor, 'header')}
          {renderRow('6. Exposed Ceilings', 'C', factors.ceiling.rEff, factors.ceiling.hlFactor, factors.ceiling.sc, factors.ceiling.hgFactor, 'ceiling')}
          {renderRow('7. Exposed Floors', 'EXF', factors.floor.rEff, factors.floor.hlFactor, factors.floor.sc, factors.floor.hgFactor, 'floor')}

          {/* Custom Components */}
          {state.compliance.customComponents.map((comp, idx) => {
             const hlFactor = hl_dt / comp.rValue;
             const hgFactor = (hg_dt + comp.sc) / comp.rValue;
             return renderRow(comp.label, comp.structure, comp.rValue, hlFactor, comp.sc, hgFactor, idx, true);
          })}

          <tr className="bg-gray-800/30">
            <td colSpan="6" className="p-2 text-center">
              <button
                onClick={addCustomComponent}
                className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-400 tracking-widest"
              >
                + Add Custom Component Entry
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComponentTable;
