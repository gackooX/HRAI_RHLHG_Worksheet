import React, { useState, useMemo } from 'react';
import library from '../data/library.json';

const LibraryPage = () => {
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const regions = useMemo(() => {
    const rgs = new Set(library.designConditions.locations.map(loc => loc.region));
    return ['ALL', ...Array.from(rgs).sort()];
  }, []);

  const filteredLocations = useMemo(() => {
    let locs = library.designConditions.locations;
    if (regionFilter !== 'ALL') {
      locs = locs.filter(loc => loc.region === regionFilter);
    }
    return locs;
  }, [regionFilter]);

  const paginatedLocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLocations.slice(start, start + itemsPerPage);
  }, [filteredLocations, currentPage]);

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

  const handleRegionChange = (e) => {
    setRegionFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12 bg-white min-h-screen border-x shadow-xl">
      <div className="text-center border-b-4 border-black pb-4">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Reference Library & Design Tables</h1>
        <p className="text-sm font-bold text-gray-500 mt-2 italic">HRAI / ASHRAE / CSA F280-12 STANDARDS DATA</p>
      </div>

      {/* 1. Design Conditions (Weather Data) */}
      <section>
        <div className="flex justify-between items-end mb-4 bg-gray-900 p-2">
          <h2 className="text-xl font-black uppercase text-white">Table A: Outdoor Design Conditions (Heating & Cooling)</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="region-filter" className="text-xs font-bold text-gray-400 uppercase">Region Filter:</label>
            <select
              id="region-filter"
              className="bg-white text-black text-xs font-bold p-1 rounded"
              value={regionFilter}
              onChange={handleRegionChange}
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border-2 border-black">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-[10px] font-black uppercase border-b-2 border-black text-center">
              <tr>
                <th className="p-2 border">Region</th>
                <th className="p-2 border">City</th>
                <th className="p-2 border">North Latitude</th>
                <th className="p-2 border">DHDBT (1%)</th>
                <th className="p-2 border">DCDBT (2.5%)</th>
                <th className="p-2 border">Summer Range</th>
                <th className="p-2 border">DG TEMP</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-medium text-center">
              {paginatedLocations.map((loc, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2 border font-bold bg-gray-50">{loc.region}</td>
                  <td className="p-2 border font-black text-left">{loc.city}</td>
                  <td className="p-2 border">{Math.round(loc.latitude)}&deg;N</td>
                  <td className="p-2 border text-red-600 font-bold">{loc.dhdbt}&deg;F</td>
                  <td className="p-2 border text-blue-600 font-bold">{loc.dcdbt}&deg;F</td>
                  <td className="p-2 border">{loc.summerRange}&deg;F</td>
                  <td className="p-2 border font-bold text-green-700">{loc.dgTemp}&deg;F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center items-center gap-4">
            <button
              className="px-4 py-1 border-2 border-black font-black text-xs uppercase disabled:opacity-30"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="text-xs font-black uppercase">Page {currentPage} of {totalPages} ({filteredLocations.length} cities)</span>
            <button
              className="px-4 py-1 border-2 border-black font-black text-xs uppercase disabled:opacity-30"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* 2. SOLAR Table */}
      <section>
        <h2 className="text-xl font-black uppercase bg-gray-900 text-white p-2 mb-4">Table B: Solar Radiation (Btu/h/ft&sup2;)</h2>
        <div className="overflow-x-auto border-2 border-black">
          <table className="w-full text-center border-collapse">
            <thead className="bg-gray-100 text-[10px] font-black uppercase border-b-2 border-black">
              <tr>
                <th className="p-2 border text-left">Latitude</th>
                <th className="p-2 border">N / Shaded</th>
                <th className="p-2 border">S</th>
                <th className="p-2 border">E / W</th>
                <th className="p-2 border">NE / NW</th>
                <th className="p-2 border">SE / SW</th>
                <th className="p-2 border">Horizontal</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-mono">
              {Object.entries(library.solarTable).map(([lat, data]) => (
                <tr key={lat} className="border-b hover:bg-gray-50">
                  <td className="p-2 border text-left font-black bg-gray-50">{lat}&deg;N</td>
                  <td className="p-2 border">{data.N_S?.imp}</td>
                  <td className="p-2 border">{data.S?.imp}</td>
                  <td className="p-2 border">{data.E_W?.imp}</td>
                  <td className="p-2 border">{data.NE_NW?.imp}</td>
                  <td className="p-2 border">{data.SE_SW?.imp}</td>
                  <td className="p-2 border">{data.H?.imp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 3. ISF Table */}
        <section>
          <h2 className="text-lg font-black uppercase bg-gray-900 text-white p-2 mb-4">Table C: Internal Shading Factors (ISF)</h2>
          <div className="border-2 border-black">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-[9px] font-black uppercase border-b-2 border-black">
                <tr>
                  <th className="p-2 border">Shading Type</th>
                  <th className="p-2 border text-center">Single</th>
                  <th className="p-2 border text-center">Double</th>
                  <th className="p-2 border text-center">Triple</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {Object.entries(library.isfTable).map(([type, vals]) => (
                  <tr key={type} className="border-b hover:bg-gray-50">
                    <td className="p-2 border font-bold uppercase">{type}</td>
                    <td className="p-2 border text-center font-mono">{vals.Single.toFixed(2)}</td>
                    <td className="p-2 border text-center font-mono">{vals.Double.toFixed(2)}</td>
                    <td className="p-2 border text-center font-mono">{vals.Triple.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Common Assembly U-Factors */}
        <section>
          <h2 className="text-lg font-black uppercase bg-gray-900 text-white p-2 mb-4">Table D: Assembly U-Factors / R-Values</h2>
          <div className="border-2 border-black">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-[9px] font-black uppercase border-b-2 border-black">
                <tr>
                  <th className="p-2 border">Assembly</th>
                  <th className="p-2 border text-center">U-Factor</th>
                  <th className="p-2 border text-center">R-Value</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                {library.assemblies.map((a, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2 border font-bold uppercase">{a.id}</td>
                    <td className="p-2 border text-center font-mono">{a.uFactor}</td>
                    <td className="p-2 border text-center font-mono">{(1/a.uFactor).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="pt-8 border-t-4 border-black text-center text-[10px] font-black uppercase">
        End of Reference Data &bull; Project: HRAI Digital Twin Implementation
      </div>
    </div>
  );
};

export default LibraryPage;
