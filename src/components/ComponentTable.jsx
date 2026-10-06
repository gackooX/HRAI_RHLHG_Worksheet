import React from 'react';
import { calculateComponentFactors } from '../utils/calculations';

const ComponentTable = ({ state, onUpdate, readOnly = false }) => {
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
      <tr className={`border-b text-[10px] ${readOnly ? 'border-black' : 'border-gray-800'}`}>
        <td className="p-2 border-r font-bold uppercase flex justify-between items-center group">
          {isCustom && !readOnly ? (
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
          {isCustom && !readOnly && (
            <button
              onClick={() => removeCustomComponent(key)}
              className="opacity-0 group-hover:opacity-100 text-red-500 ml-2"
            >
              ✕
            </button>
          )}
        </td>
        <td className="p-2 border-r text-center font-bold text-green-700 uppercase w-16">
          {isCustom && !readOnly ? (
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
        <td className="p-2 border-r text-center w-24">
            {readOnly ? (
               <span className="font-bold text-red-700">{rEff.toFixed(2)}</span>
            ) : (
              <input
                type="number" step="0.01"
                className="w-16 border border-gray-700 rounded p-1 font-bold text-center text-red-600 bg-red-900/20"
                value={rEff}
                onChange={(e) => handleREffChange(key, e.target.value, isCustom)}
              />
            )}
        </td>
        <td className="p-2 border-r text-center font-bold text-red-600 w-24">
            {hlFactor.toFixed(2)}
        </td>
        <td className="p-2 border-r text-center w-16">
            {readOnly ? (
               <span className="font-bold">{sc}</span>
            ) : (
              <input
                type="number" step="0.1"
                className="w-12 border border-gray-700 rounded p-1 font-bold text-center text-gray-300 bg-gray-800"
                value={sc}
                onChange={(e) => handleSCChange(key, e.target.value, isCustom)}
              />
            )}
        </td>
        <td className="p-2 text-center font-bold text-blue-600 w-24">
          {typeof hgFactor === 'number' ? hgFactor.toFixed(2) : hgFactor}
        </td>
      </tr>
    );
  };

  return (
    <div className={`${readOnly ? 'bg-white text-black border-2 border-black' : 'bg-gray-900 border border-gray-700 shadow-2xl'} rounded-xl overflow-hidden`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className={`${readOnly ? 'bg-gray-100 border-b-2 border-black text-black' : 'bg-gray-800 border-b border-gray-700 text-gray-400'} font-black text-center text-[10px] uppercase`}>
            <th className={`p-4 border-r ${readOnly ? 'border-black' : 'border-gray-700'} text-left`}>ENGINEERING COMPONENTS</th>
            <th className="p-4 border-r border-gray-700 w-16">
               <span className="text-[8px] rotate-180 [writing-mode:vertical-lr] inline-block">STRUCTURE</span>
            </th>
            <th className="border-r border-gray-700 w-24">
              <div className="p-2 border-b border-gray-700 text-center font-black text-red-500">{hl_dt}</div>
              <div className="p-2 text-[8px]">EFF R (COL 1)</div>
            </th>
            <th className="border-r border-gray-700 w-24">
              <div className="p-2 border-b border-gray-700 text-center font-black text-red-400">{hl_dt}</div>
              <div className="p-2 flex flex-col items-center">
                 <span className="border-b border-gray-700 w-10 leading-tight">1 / R</span>
                 <span className="text-[8px] mt-1">COL 2</span>
              </div>
            </th>
            <th className="border-r border-gray-700 w-16">
              <div className="p-2 border-b border-gray-700 text-center font-black text-blue-500">{hg_dt}</div>
              <div className="p-2 flex flex-col items-center justify-center">
                <span>SC</span>
                <span className="text-[8px]">COL 3</span>
              </div>
            </th>
            <th className="w-24">
              <div className="p-2 border-b border-gray-700 text-center font-black text-blue-400">{hg_dt}</div>
              <div className="p-2 flex flex-col items-center justify-center">
                <span className="border-b border-gray-700 w-16 text-[8px]">FAC</span>
                <span className="text-[8px] mt-1">COL 4</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          <tr className={`${readOnly ? 'bg-gray-200 text-black border-b border-black' : 'bg-gray-800/30 text-gray-500'} text-[10px] uppercase font-black`}>
             <td className={`p-3 border-r ${readOnly ? 'border-black' : 'border-gray-800'}`}>1. Gross Walls</td>
             <td className={`p-3 border-r ${readOnly ? 'border-black' : 'border-gray-800'} text-center text-green-500 w-16`}>AGW</td>
             <td colSpan="4" className={readOnly ? '' : 'bg-gray-800/50'}></td>
          </tr>

          {renderRow('2. Exposed Doors', 'D', factors.doors.rEff, factors.doors.hlFactor, factors.doors.sc, factors.doors.hgFactor, 'doors')}

          {/* Net Exposed Walls (Row 3) */}
          {renderRow('3. Net AGW', 'AGW', factors.agw.rEff, factors.agw.hlFactor, factors.agw.sc, factors.agw.hgFactor, 'agw')}
          {renderRow('3. Net BGW', 'BGW', factors.bgw.rEff, factors.bgw.hlFactor, factors.bgw.sc, factors.bgw.hgFactor, 'bgw')}

          {renderRow('4. Header Areas', 'H', factors.header.rEff, factors.header.hlFactor, factors.header.sc, factors.header.hgFactor, 'header')}
          {renderRow('5. Exposed Ceilings', 'C', factors.ceiling.rEff, factors.ceiling.hlFactor, factors.ceiling.sc, factors.ceiling.hgFactor, 'ceiling')}

          {/* Windows (Row 6) */}
          {Object.entries(factors.windows.hgFactor).map(([dir, hgf], i) => (
            <tr key={dir} className={`text-[10px] ${readOnly ? 'border-b border-black' : 'hover:bg-gray-800/20 transition-colors'}`}>
              {i === 0 && <td rowSpan="6" className={`p-4 border-r ${readOnly ? 'border-black text-black' : 'border-gray-800 text-gray-300'} font-bold uppercase align-top`}>6. Windows, Glass Doors & Skylights</td>}
              <td className={`p-3 border-r ${readOnly ? 'border-black' : 'border-gray-800'} text-center font-black text-green-500 uppercase w-16`}>{dir.replace('_', '/')}</td>
              <td className={`p-3 border-r ${readOnly ? 'border-black' : 'border-gray-800'} text-center w-24`}>
                <span className={`font-bold ${readOnly ? 'text-red-700' : 'text-red-500'}`}>{factors.windows.rEff.toFixed(2)}</span>
              </td>
              <td className={`p-3 border-r ${readOnly ? 'border-black' : 'border-gray-800'} text-center font-bold ${readOnly ? 'text-red-700' : 'text-red-500'} w-24`}>
                {factors.windows.hlFactor.toFixed(2)}
              </td>
              <td className={`p-3 border-r ${readOnly ? 'border-black' : 'border-gray-800'} text-center w-16`}>
                {i === 0 && !readOnly ? (
                    <input
                        type="number" step="0.1"
                        className="w-12 border border-gray-700 rounded p-1 font-bold text-center text-gray-300 bg-gray-800"
                        value={factors.windows.sc}
                        onChange={(e) => handleSCChange('windows', e.target.value)}
                    />
                ) : (
                    <span className={`font-bold ${readOnly ? 'text-black' : 'text-gray-700'}`}>{factors.windows.sc}</span>
                )}
              </td>
              <td className={`p-3 text-center font-bold text-blue-500 ${readOnly ? '' : 'bg-blue-900/10'} w-24`}>
                {hgf.toFixed(2)}
              </td>
            </tr>
          ))}

          {renderRow('7. Exposed Floors', 'EXF', factors.floor.rEff, factors.floor.hlFactor, factors.floor.sc, factors.floor.hgFactor, 'floor')}

          {/* Custom Components */}
          {state.compliance.customComponents.map((comp, idx) => {
             const hlFactor = hl_dt / comp.rValue;
             const hgFactor = (hg_dt + comp.sc) / comp.rValue;
             return renderRow(comp.label, comp.structure, comp.rValue, hlFactor, comp.sc, hgFactor, idx, true);
          })}

          {!readOnly && (
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
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ComponentTable;
