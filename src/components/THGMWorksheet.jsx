import React from 'react';
import library from '../data/library.json';
import { calculateComponentFactors } from '../utils/calculations';

const THGMWorksheet = ({ state }) => {
  const factors = calculateComponentFactors(state);
  const hg_dt = state.environmental.hg_odt - state.environmental.hg_idt;
  const latitude = state.environmental.hg_north_latitude;
  const rEff = factors.windows.rEff;

  // Directions for the table
  const directions = [
    { id: 'N_S', label: 'North & Shaded' },
    { id: 'S', label: 'South' },
    { id: 'E_W', label: 'East / West' },
    { id: 'NE_NW', label: 'Northeast / Northwest' },
    { id: 'SE_SW', label: 'Southeast / Southwest' },
    { id: 'H', label: 'Horizontal' }
  ];

  // Default window for the "Picking" part - use the first one or a default
  const defaultWindow = library.assemblies.find(a => a.type === 'window') || { uFactor: 0.28, shgc: 0.4, glazingType: 'Double' };
  const isfDefault = 1.0;

  return (
    <div className="bg-white p-8 border-2 border-black max-w-[8.5in] mx-auto font-sans text-[10px] print:mx-0 print:border-0 print:p-0">
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

      {/* THGM Calculation Table */}
      <div className="mb-8">
        <h2 className="bg-gray-100 border-x border-t border-black p-1 text-center font-black uppercase border-b">THGM Calculation Table</h2>
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="border-b border-black bg-gray-50">
              <th className="border-r border-black p-1 w-1/4"></th>
              {directions.map(d => (
                <th key={d.id} className="border-r border-black p-1 text-[8px] uppercase">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">North Latitude</td>
              <td colSpan="6" className="p-1 text-center font-bold">{latitude}&deg;</td>
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">HG&Delta;T</td>
              <td colSpan="6" className="p-1 text-center font-bold">{hg_dt}&deg;F / {((hg_dt * 5)/9).toFixed(1)}&deg;C</td>
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">Effective R-value</td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{rEff.toFixed(2)}</td>
              ))}
            </tr>
            <tr className="border-b border-black h-12">
              <td className="border-r border-black p-1 font-bold flex flex-col items-center justify-center">
                <span>#1</span>
                <span className="border-t border-black px-2 mt-1 italic">HG&Delta;T / R</span>
              </td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{(hg_dt / rEff).toFixed(3)}</td>
              ))}
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">#2 SHGC</td>
              {directions.map(d => (
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{defaultWindow.shgc.toFixed(2)}</td>
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
                <td key={d.id} className="border-r border-black p-1 text-center font-mono">{isfDefault.toFixed(2)}</td>
              ))}
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold uppercase">#5 (#2) &times; (#3) &times; (#4)</td>
              {directions.map(d => {
                const latKey = Math.min(Math.max(Math.round(latitude), 40), 48).toString();
                const solar = library.solarTable[latKey][d.id]?.imp || 0;
                const result = defaultWindow.shgc * solar * isfDefault;
                return <td key={d.id} className="border-r border-black p-1 text-center font-mono">{result.toFixed(3)}</td>;
              })}
            </tr>
            <tr className="bg-gray-100 font-black">
              <td className="border-r border-black p-2 font-black uppercase text-[11px]">#6 THGM = (#1) + (#5)</td>
              {directions.map(d => {
                const latKey = Math.min(Math.max(Math.round(latitude), 40), 48).toString();
                const solar = library.solarTable[latKey][d.id]?.imp || 0;
                const part1 = hg_dt / rEff;
                const part5 = defaultWindow.shgc * solar * isfDefault;
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

      {/* ISF Table */}
      <div>
        <h2 className="bg-gray-100 border-x border-t border-black p-1 text-center font-black uppercase border-b">ISF = Internal Shading Factors</h2>
        <table className="w-full border-collapse border border-black text-[8px]">
          <thead>
            <tr className="bg-gray-50 border-b border-black">
              <th rowSpan="2" className="border-r border-black p-1 w-1/3 font-black uppercase">Type of interior shading</th>
              <th colSpan="4" className="border-r border-black p-1 uppercase font-black">Type of glazing systems</th>
            </tr>
            <tr className="bg-gray-50 border-b border-black">
              <th className="border-r border-black p-1 uppercase">Single</th>
              <th className="border-r border-black p-1 uppercase">Double</th>
              <th className="border-r border-black p-1 uppercase">Triple</th>
              <th className="border-r border-black p-1 uppercase">Heat Mirror</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(library.isfTable).map(([shading, values]) => (
              <tr key={shading} className="border-b border-black">
                <td className="border-r border-black p-1 font-bold uppercase bg-gray-50">{shading}</td>
                <td className="border-r border-black p-1 text-center font-mono">{values.Single.toFixed(2)}</td>
                <td className="border-r border-black p-1 text-center font-mono">{values.Double.toFixed(2)}</td>
                <td className="border-r border-black p-1 text-center font-mono">{values.Triple.toFixed(2)}</td>
                <td className="border-r border-black p-1 text-center font-mono">{values['Heat Mirror']?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 border-t-2 border-black flex justify-between text-[8px] font-bold uppercase italic no-print">
        <span>Residential Heat Loss and Heat Gain Calculations &bull; 2018</span>
        <span>&copy;HRAI</span>
        <span>215</span>
      </div>
    </div>
  );
};

export default THGMWorksheet;
