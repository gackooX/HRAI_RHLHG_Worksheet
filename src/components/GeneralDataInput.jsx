import React from 'react';

const GeneralDataInput = ({ projectData, updateProjectData, floorWiseSummary, summaryMetrics }) => {
  return (
    <div className="bg-white p-8 border border-gray-200 shadow-lg print-page">
      <h2 className="text-xl font-bold border-b-2 border-black pb-2 mb-6">GENERAL BUILDING DATA & LOGIC</h2>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h3 className="font-bold text-blue-800 uppercase text-sm tracking-wider">Foundation & Level Settings</h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded">
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="radio"
                name="foundation"
                checked={projectData.foundationType === 'BASEMENT'}
                onChange={() => updateProjectData('foundationType', 'BASEMENT')}
              />
              Basement
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold">
              <input
                type="radio"
                name="foundation"
                checked={projectData.foundationType === 'SLAB ON GRADE'}
                onChange={() => updateProjectData('foundationType', 'SLAB ON GRADE')}
              />
              Slab on Grade
            </label>
          </div>

          {projectData.foundationType === 'BASEMENT' && (
            <div className="flex justify-between items-center border-b pb-1">
              <span className="font-semibold">Basement Floor Height:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-16 border rounded p-1 text-right"
                  value={projectData.basementHeight}
                  onChange={(e) => updateProjectData('basementHeight', e.target.value)}
                />
                <span>ft</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-blue-800 uppercase text-sm tracking-wider">Air Leakage Multipliers</h3>
          <div className="grid grid-cols-1 gap-2 p-4 bg-red-50 border border-red-100 rounded">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-red-900">LRairh (Heating):</span>
              <input
                type="number"
                step="0.001"
                className="w-20 border border-red-200 rounded p-1 text-right font-bold text-red-700"
                value={projectData.lrAirHeating}
                onChange={(e) => updateProjectData('lrAirHeating', parseFloat(e.target.value))}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">LRairc (Cooling):</span>
              <input
                type="number"
                step="0.001"
                className="w-20 border border-blue-200 rounded p-1 text-right font-bold text-blue-700"
                value={projectData.lrAirCooling}
                onChange={(e) => updateProjectData('lrAirCooling', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-blue-800 uppercase text-sm tracking-wider mb-4">Floor-Wise Summary (Real-Time)</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-black p-2">Level</th>
              <th className="border border-black p-2">Accumulated Heat Loss (Btuh)</th>
              <th className="border border-black p-2">Accumulated Heat Gain (Btuh)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(floorWiseSummary).map(([lvl, data]) => (
              <tr key={lvl} className="text-center font-bold">
                <td className="border border-black p-2 bg-gray-50">{lvl}</td>
                <td className="border border-black p-2 text-red-600">{data.loss.toLocaleString()}</td>
                <td className="border border-black p-2 text-blue-600">{data.gain.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-extrabold uppercase">
              <td className="border border-black p-2 text-right">Building Totals:</td>
              <td className="border border-black p-2 text-red-700">{summaryMetrics.subTotalLoss.toLocaleString()}</td>
              <td className="border border-black p-2 text-blue-700">{summaryMetrics.subTotalGain.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-blue-50 p-4 border border-blue-200 rounded flex justify-between items-center">
        <div>
          <h3 className="font-bold text-blue-900">Total Building Volume (Vb)</h3>
          <p className="text-sm text-blue-700 italic">Automatically calculated from room areas and heights</p>
        </div>
        <div className="text-2xl font-black text-blue-900">
          {summaryMetrics.buildingVolume.toLocaleString()} <span className="text-sm">ft³</span>
        </div>
      </div>
    </div>
  );
};

export default GeneralDataInput;
