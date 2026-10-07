import React from 'react';
import library from '../data/library.json';
import { calculateComponentFactors, lookupGlazingData } from '../utils/calculations';

const THGMWorksheet = ({ state, onUpdateProject }) => {
  const factors = calculateComponentFactors(state);
  const hg_dt = state.environmental.hg_odt - state.environmental.hg_idt;
  const latitude = state.environmental.hg_north_latitude;

  // Directions for the table
  const directions = [
    { id: 'N_S', label: 'North & Shaded' },
    { id: 'S', label: 'South' },
    { id: 'E_W', label: 'East / West' },
    { id: 'NE_NW', label: 'Northeast / Northwest' },
    { id: 'SE_SW', label: 'Southeast / Southwest' },
    { id: 'H', label: 'Horizontal' }
  ];

  const globalConfig = state.globalWindowConfig || {
    type: 'Double', frame: 'Operable-Aluminum', spacer: 'Insulating', coating: 'Clear', gapGas: '1/4 Air', hasStorm: false, shadingType: 'No shades'
  };

  const updateGlobalConfig = (field, val) => {
    onUpdateProject('globalWindowConfig', { ...globalConfig, [field]: val });
  };

  const lookup = lookupGlazingData(globalConfig);
  const isf = library.isfTable[globalConfig.shadingType || 'No shades']?.[globalConfig.type || 'Double'] || 1.0;

  return (
    <div className="bg-white p-8 border-2 border-black max-w-[8.5in] mx-auto font-sans text-[10px] print:mx-0 print:border-0 print:p-0 text-black">
      <div className="text-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-lg font-black uppercase">Transparent Assembly Heat Gain Multiplier (THGM) Worksheet</h1>
      </div>

      <div className="mb-6 text-center">
        <div className="text-sm font-black mb-2 uppercase">Transparent Assembly Heat Gain Multiplier (THGM)</div>
        <div className="text-lg font-black italic">
          THGM = <span className="inline-block border-b border-black px-2">HG&Delta;T</span> + (SHGC &times; SOLAR &times; ISF)
          <br />
          <span className="text-sm ml-12">R</span>
        </div>
      </div>

      {/* Global Window Configuration Selector */}
      <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg no-print">
        <h3 className="text-sm font-black uppercase text-blue-900 mb-4 flex items-center gap-2">
           <span className="bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span>
           Global Specification Engine
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-blue-700">Glazing Type</label>
              <select
                className="w-full bg-white border-blue-200 text-black font-black"
                value={globalConfig.type}
                onChange={(e) => updateGlobalConfig('type', e.target.value)}
              >
                <option>Single</option>
                <option>Double</option>
                <option>Triple</option>
              </select>
            </div>
            <div>
              <label className="text-blue-700">Interior Shading (ISF)</label>
              <select
                className="w-full bg-white border-blue-200 text-black font-black"
                value={globalConfig.shadingType}
                onChange={(e) => updateGlobalConfig('shadingType', e.target.value)}
              >
                {Object.keys(library.isfTable).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-blue-700">Frame Material</label>
              <select
                className="w-full bg-white border-blue-200 text-black font-black"
                value={globalConfig.frame}
                onChange={(e) => updateGlobalConfig('frame', e.target.value)}
              >
                {Object.keys(library.glazingRValueTable[globalConfig.type] || {}).map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            {globalConfig.type === 'Single' && (
               <div>
                  <label className="text-blue-700">Storm Window</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox" checked={globalConfig.hasStorm}
                      onChange={(e) => updateGlobalConfig('hasStorm', e.target.checked)}
                    />
                    <span className="text-[10px] font-bold uppercase">Included</span>
                  </div>
               </div>
            )}
            {globalConfig.type !== 'Single' && (
              <div>
                <label className="text-blue-700">Spacer Type</label>
                <select
                  className="w-full bg-white border-blue-200 text-black font-black"
                  value={globalConfig.spacer}
                  onChange={(e) => updateGlobalConfig('spacer', e.target.value)}
                >
                  <option>Metal</option>
                  <option>Insulating</option>
                </select>
              </div>
            )}
          </div>

          {globalConfig.type !== 'Single' && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-700">Low-E Coating</label>
                  <select
                    className="w-full bg-white border-blue-200 text-black font-black"
                    value={globalConfig.coating}
                    onChange={(e) => updateGlobalConfig('coating', e.target.value)}
                  >
                    <option>Clear</option>
                    <option>Low-E</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-blue-700">Gap & Gas Fill</label>
                  <select
                    className="w-full bg-white border-blue-200 text-black font-black"
                    value={globalConfig.gapGas}
                    onChange={(e) => updateGlobalConfig('gapGas', e.target.value)}
                  >
                    {Object.keys((library.glazingRValueTable[globalConfig.type]?.[globalConfig.frame]?.[globalConfig.spacer]?.[globalConfig.coating]) || {}).map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-blue-200 flex flex-wrap gap-8">
           <div>
              <div className="text-[8px] font-black text-blue-400 uppercase">Effective R-Value</div>
              <div className="text-xl font-black text-blue-900">{factors.windows.rEff.toFixed(2)}</div>
           </div>
           <div>
              <div className="text-[8px] font-black text-blue-400 uppercase">Solar Heat Gain (SHGC)</div>
              <div className="text-xl font-black text-green-700">{lookup.shgc.toFixed(3)}</div>
           </div>
           <div>
              <div className="text-[8px] font-black text-blue-400 uppercase">Shading Factor (ISF)</div>
              <div className="text-xl font-black text-indigo-700">{isf.toFixed(2)}</div>
           </div>
           <div className="ml-auto text-right">
              <div className="text-[8px] font-black text-blue-400 uppercase">Project Latitude</div>
              <div className="text-xl font-black text-gray-900">{latitude}&deg;N</div>
           </div>
        </div>
      </div>

      {/* THGM Calculation Table */}
      <div className="mb-8">
        <h2 className="bg-gray-100 border-x border-t border-black p-1 text-center font-black uppercase border-b">THGM Calculation Table</h2>
        <table className="w-full border-collapse border border-black table-fixed">
          <thead>
            <tr className="border-b border-black bg-gray-50">
              <th className="border-r border-black p-1 w-1/4"></th>
              {directions.map(d => (
                <th key={d.id} className="border-r border-black p-1 text-[8px] uppercase w-24">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">Effective R-value</td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{factors.windows.rEff.toFixed(2)}</td>
              ))}
            </tr>
            <tr className="border-b border-black h-12">
              <td className="border-r border-black p-1 font-bold flex flex-col items-center justify-center">
                <span>#1</span>
                <span className="border-t border-black px-2 mt-1 italic">HG&Delta;T / R</span>
              </td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{(hg_dt / factors.windows.rEff).toFixed(3)}</td>
              ))}
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">#2 SHGC</td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{lookup.shgc.toFixed(3)}</td>
              ))}
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">#3 SOLAR</td>
              {directions.map(d => {
                const latKey = Math.min(Math.max(Math.round(latitude), 40), 48).toString();
                const solar = library.solarTable[latKey][d.id]?.imp || 0;
                return <td key={d.id} className="border-r border-black p-1 text-center font-mono">{solar}</td>;
              })}
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">#4 ISF</td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{isf.toFixed(2)}</td>
              ))}
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">#5 (#2) &times; (#3) &times; (#4)</td>
              {directions.map(d => {
                const latKey = Math.min(Math.max(Math.round(latitude), 40), 48).toString();
                const solar = library.solarTable[latKey][d.id]?.imp || 0;
                const result = lookup.shgc * solar * isf;
                return <td key={d.id} className="border-r border-black p-1 text-center font-mono">{result.toFixed(3)}</td>;
              })}
            </tr>
            <tr className="bg-gray-100 font-black">
              <td className="border-r border-black p-2 font-black uppercase text-[11px]">#6 THGM = (#1) + (#5)</td>
              {directions.map(d => {
                const latKey = Math.min(Math.max(Math.round(latitude), 40), 48).toString();
                const solar = library.solarTable[latKey][d.id]?.imp || 0;
                const part1 = hg_dt / factors.windows.rEff;
                const part5 = lookup.shgc * solar * isf;
                const thgm = part1 + part5;
                return <td key={d.id} className="border-r border-black p-1 text-center font-black text-blue-800 text-[11px] font-mono">{thgm.toFixed(3)}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* SOLAR Table */}
      <div className="mb-8">
        <h2 className="bg-gray-100 border-x border-t border-black p-1 text-center font-black uppercase border-b">SOLAR = Estimated Solar Radiation</h2>
        <table className="w-full border-collapse border border-black text-[7px]">
          <thead>
            <tr className="bg-gray-50 border-b border-black">
              <th rowSpan="2" className="border-r border-black p-1 w-12 font-black uppercase">Latitude</th>
              {directions.map(d => (
                <th key={d.id} colSpan="2" className="border-r border-black p-1 uppercase font-black">{d.label}</th>
              ))}
            </tr>
            <tr className="bg-gray-50 border-b border-black">
              {directions.map(d => (
                <React.Fragment key={d.id}>
                  <th className="border-r border-black p-1 font-normal italic">Imperial<br/>Btu/h/ft&sup2;</th>
                  <th className="border-r border-black p-1 font-normal italic">Metric<br/>W/m&sup2;</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(library.solarTable).map(([lat, data]) => (
              <tr key={lat} className={`border-b border-black ${Math.round(latitude) === parseInt(lat) ? 'bg-yellow-50 font-bold' : ''}`}>
                <td className="border-r border-black p-1 text-center font-bold bg-gray-50">{lat === '48' ? '48 to 82' : lat}</td>
                {directions.map(d => (
                  <React.Fragment key={d.id}>
                    <td className="border-r border-black p-1 text-center">{data[d.id]?.imp}</td>
                    <td className="border-r border-black p-1 text-center">{data[d.id]?.met}</td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-black flex justify-between text-[8px] font-bold uppercase italic no-print text-gray-600">
        <span>Residential Heat Loss and Heat Gain Calculations &bull; 2018</span>
        <span>&copy;HRAI</span>
        <span>215</span>
      </div>
    </div>
  );
};

export default THGMWorksheet;
