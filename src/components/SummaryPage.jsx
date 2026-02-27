import React from 'react';

const SummaryPage = ({ projectData, updateProjectData, rooms, summaryMetrics }) => {
  return (
    <div className="print-page bg-white p-8 border border-gray-200 shadow-md">
      <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-1">
        <h1 className="text-xl font-bold">HRAI Residential Heat Loss and Heat Gain Calculations</h1>
        <div className="text-sm flex gap-2">
          <span>Page</span>
          <span className="border-b border-black px-4 font-bold">2</span>
          <span>of</span>
          <span className="border-b border-black px-4 font-bold">{rooms.length + 2}</span>
        </div>
      </div>

      {/* SECTION A */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs">
          <span>SECTION A</span>
          <span>PROJECT INFORMATION</span>
        </div>
        <div className="grid grid-cols-2 border-x border-b border-black text-[10px]">
          <div className="p-2 border-r border-black space-y-2">
            <div className="flex border-b border-gray-400">
              <span className="w-20 font-bold">Client:</span>
              <input
                className="flex-1 bg-transparent outline-none"
                value={projectData.clientName}
                onChange={(e) => updateProjectData('clientName', e.target.value)}
              />
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-20 font-bold">Address:</span>
              <input
                className="flex-1 bg-transparent outline-none"
                value={projectData.address}
                onChange={(e) => updateProjectData('address', e.target.value)}
              />
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-20 font-bold">City:</span>
              <input
                className="flex-1 bg-transparent outline-none"
                value={projectData.city}
                onChange={(e) => updateProjectData('city', e.target.value)}
              />
            </div>
          </div>
          <div className="p-2 space-y-2">
            <div className="flex border-b border-gray-400">
              <span className="w-24 font-bold">Designer:</span>
              <input
                className="flex-1 bg-transparent outline-none"
                value={projectData.designer}
                onChange={(e) => updateProjectData('designer', e.target.value)}
              />
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-24 font-bold">Date:</span>
              <input
                type="date"
                className="flex-1 bg-transparent outline-none"
                value={projectData.date}
                onChange={(e) => updateProjectData('date', e.target.value)}
              />
            </div>
            <div className="flex border-b border-gray-400">
              <span className="w-24 font-bold">Case #:</span>
              <span className="flex-1 uppercase">{projectData.ventilationSystem}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs">
          <span>SECTION B</span>
          <span>DESIGN CONDITIONS</span>
        </div>
        <div className="grid grid-cols-2 border-x border-b border-black text-[10px]">
          {/* Heat Loss Column */}
          <div className="border-r border-black">
            <div className="bg-gray-100 p-1 font-bold text-center border-b border-black">HEAT LOSS</div>
            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>Outdoor Design Temperature Heating (ODT)</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-red-600 font-bold text-right outline-none"
                    value={projectData.odtHeating}
                    onChange={(e) => updateProjectData('odtHeating', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°F / <span className="line-through">°C</span></span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Indoor Design Temperature (IDT)</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-red-600 font-bold text-right outline-none"
                    value={projectData.idtHeating}
                    onChange={(e) => updateProjectData('idtHeating', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°F / <span className="line-through">°C</span></span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Mean Soil Temperature</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-red-600 font-bold text-right outline-none"
                    value={projectData.meanSoilTemp}
                    onChange={(e) => updateProjectData('meanSoilTemp', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°F / <span className="line-through">°C</span></span>
                </div>
              </div>
            </div>
          </div>
          {/* Heat Gain Column */}
          <div>
            <div className="bg-gray-100 p-1 font-bold text-center border-b border-black">HEAT GAIN</div>
            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>Outdoor Design Temperature Cooling (ODT)</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-blue-600 font-bold text-right outline-none"
                    value={projectData.odtCooling}
                    onChange={(e) => updateProjectData('odtCooling', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°F / <span className="line-through">°C</span></span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Indoor Design Temperature (IDT)</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-blue-600 font-bold text-right outline-none"
                    value={projectData.idtCooling}
                    onChange={(e) => updateProjectData('idtCooling', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°F / <span className="line-through">°C</span></span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>North Latitude</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-blue-600 font-bold text-right outline-none"
                    value={projectData.northLatitude}
                    onChange={(e) => updateProjectData('northLatitude', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>Summer Mean Daily Temperature Range</span>
                <div>
                  <input
                    type="number"
                    className="w-10 border-b border-gray-300 text-blue-600 font-bold text-right outline-none"
                    value={projectData.summerRange}
                    onChange={(e) => updateProjectData('summerRange', parseFloat(e.target.value))}
                  />
                  <span className="ml-1">°F / <span className="line-through">°C</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sub-B info */}
        <div className="grid grid-cols-2 border-x border-b border-black text-[10px] p-1 gap-4">
          <div className="flex justify-between font-bold">
            <span>Building Volume (Vb)</span>
            <div>
              <input type="number" className="w-16 border-b border-black text-right outline-none" value={projectData.buildingVolume} onChange={e => updateProjectData('buildingVolume', e.target.value)}/>
              <span className="ml-1">ft³ / <span className="line-through">m³</span></span>
            </div>
          </div>
          <div className="flex justify-between font-bold">
            <span>Building Conditioned Area</span>
            <div>
              <input type="number" className="w-16 border-b border-black text-right outline-none" value={projectData.conditionedArea} onChange={e => updateProjectData('conditionedArea', e.target.value)}/>
              <span className="ml-1">ft² / <span className="line-through">m²</span></span>
            </div>
          </div>
        </div>
        <div className="border-x border-b border-black text-[10px] p-1 flex justify-between items-center">
          <span className="font-bold uppercase">HRV Apparent Sensible Effectiveness</span>
          <div className="flex items-center gap-2">
            <span>=</span>
            <input
              type="number"
              className="w-10 border border-blue-300 bg-blue-50 text-center font-bold outline-none"
              value={projectData.hrvEffectiveness}
              step="0.1"
              onChange={(e) => updateProjectData('hrvEffectiveness', parseFloat(e.target.value))}
            />
            <span className="text-gray-500 italic">(insert N/A if no HRV/ERV installed)</span>
          </div>
        </div>
        <div className="border-x border-b border-black grid grid-cols-3 text-[10px] text-center font-bold">
          <div className={`p-1 border-r border-black cursor-pointer ${projectData.ventilationSystem === 'Case #1' ? 'bg-gray-200' : ''}`} onClick={() => updateProjectData('ventilationSystem', 'Case #1')}>Case #1: Exhaust Only System</div>
          <div className={`p-1 border-r border-black cursor-pointer ${projectData.ventilationSystem === 'Case #2' ? 'bg-gray-200' : ''}`} onClick={() => updateProjectData('ventilationSystem', 'Case #2')}>Case #2: Direct Ducted System</div>
          <div className={`p-1 cursor-pointer ${projectData.ventilationSystem === 'Case #3' ? 'bg-gray-200' : ''}`} onClick={() => updateProjectData('ventilationSystem', 'Case #3')}>Case #3: Central Forced Air System</div>
        </div>
      </div>

      {/* SECTION C */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs uppercase">
          <span>SECTION C</span>
          <span>ROOM HEAT LOSS / HEAT GAIN SUMMARY</span>
        </div>
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-black p-1 w-1/12">Level</th>
              <th className="border border-black p-1 w-2/12">Room Name</th>
              <th className="border border-black p-1 w-2/12 text-red-600">Total Heat Loss<br/><span className="text-[8px] font-normal text-black">Calculated Section 16 (Btuh)</span></th>
              <th className="border border-black p-1 w-2/12 text-blue-600">Total Heat Gain<br/><span className="text-[8px] font-normal text-black">Calculated Section 17 (Btuh)</span></th>
              <th className="border border-black p-1 w-1/12">Level</th>
              <th className="border border-black p-1 w-2/12">Room Name</th>
              <th className="border border-black p-1 w-2/12 text-red-600">Total Heat Loss</th>
              <th className="border border-black p-1 w-2/12 text-blue-600">Total Heat Gain</th>
            </tr>
          </thead>
          <tbody>
            {/* Split rooms into two columns */}
            {[...Array(10)].map((_, i) => {
              const leftRoom = rooms[i];
              const rightRoom = rooms[i + 10];
              return (
                <tr key={i} className="text-center h-6">
                  <td className="border border-black p-1">{leftRoom?.level || ''}</td>
                  <td className="border border-black p-1 text-left">{leftRoom?.name || ''}</td>
                  <td className="border border-black p-1 text-red-600 font-bold">{leftRoom ? leftRoom.totalLoss.toLocaleString() : ''}</td>
                  <td className="border border-black p-1 text-blue-600 font-bold">{leftRoom ? leftRoom.totalGain.toLocaleString() : ''}</td>
                  <td className="border border-black p-1">{rightRoom?.level || ''}</td>
                  <td className="border border-black p-1 text-left">{rightRoom?.name || ''}</td>
                  <td className="border border-black p-1 text-red-600 font-bold">{rightRoom ? rightRoom.totalLoss.toLocaleString() : ''}</td>
                  <td className="border border-black p-1 text-blue-600 font-bold">{rightRoom ? rightRoom.totalGain.toLocaleString() : ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan="2" className="border border-black p-1 text-right text-xs uppercase">Sub Total</td>
              <td className="border border-black p-1 text-center bg-red-50 text-red-600">{summaryMetrics.subTotalLoss.toLocaleString()}</td>
              <td className="border border-black p-1 text-center bg-blue-50 text-blue-600">{summaryMetrics.subTotalGain.toLocaleString()}</td>
              <td colSpan="2" className="border border-black p-1 text-right text-xs uppercase bg-gray-50">SUB TOTAL</td>
              <td className="border border-black p-1 text-center bg-red-50 text-red-600">{summaryMetrics.subTotalLoss.toLocaleString()}</td>
              <td className="border border-black p-1 text-center bg-blue-50 text-blue-600">{summaryMetrics.subTotalGain.toLocaleString()}</td>
            </tr>
            <tr className="text-[8px] font-normal">
              <td colSpan="2" className="border-x border-black"></td>
              <td className="border border-black text-center">Section 18</td>
              <td className="border border-black text-center">Section 21</td>
              <td colSpan="2" className="border-x border-black bg-gray-50"></td>
              <td className="border border-black text-center">Section 18</td>
              <td className="border border-black text-center">Section 21</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* SECTION D */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs uppercase">
          <span>SECTION D</span>
          <span>BUILDING HEAT LOSS SUMMARY</span>
        </div>
        <div className="border-x border-b border-black text-[10px] space-y-0">
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1 pl-20">Building Sub Total Heat Loss</div>
            <div className="w-1/6 border-x border-black p-1 text-center">(Section 18)</div>
            <div className="w-1/6 p-1 text-right bg-red-50 text-red-600 font-bold">{summaryMetrics.subTotalLoss.toLocaleString()}</div>
            <div className="w-1/6 p-1 text-left ml-2">Btuh / <span className="line-through">W</span></div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1 pl-20">Central Forced Air Ventilation Heat Loss*</div>
            <div className="w-1/6 border-x border-black p-1 text-center">(Section 19)</div>
            <div className="w-1/6 p-1 text-right bg-red-50 text-red-600 font-bold">{summaryMetrics.ventilationLoss.toLocaleString()}</div>
            <div className="w-1/6 p-1 text-left ml-2">Btuh / <span className="line-through">W</span></div>
          </div>
          <div className="flex font-bold">
            <div className="w-1/2 p-1 pl-20 uppercase">Total Building Heat Loss</div>
            <div className="w-1/6 border-x border-black p-1 text-center">(Section 20)</div>
            <div className="w-1/6 p-1 text-right bg-red-100 text-red-600 font-bold">{summaryMetrics.totalLoss.toLocaleString()}</div>
            <div className="w-1/6 p-1 text-left ml-2">Btuh / <span className="line-through">W</span></div>
          </div>
        </div>
      </div>

      {/* SECTION E */}
      <div className="mb-4">
        <div className="bg-[#d9e2d5] p-1 px-2 font-bold flex justify-between border border-black text-xs uppercase">
          <span>SECTION E</span>
          <span>BUILDING HEAT GAIN SUMMARY</span>
        </div>
        <div className="border-x border-b border-black text-[10px] space-y-0">
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1 pl-20">Building Sub Total Heat Gain</div>
            <div className="w-1/6 border-x border-black p-1 text-center">(Section 21)</div>
            <div className="w-1/6 p-1 text-right bg-blue-50 text-blue-600 font-bold">{summaryMetrics.subTotalGain.toLocaleString()}</div>
            <div className="w-1/6 p-1 text-left ml-2">Btuh / <span className="line-through">W</span></div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1 pl-20">Central Forced Air Ventilation Heat Gain*</div>
            <div className="w-1/6 border-x border-black p-1 text-center">(Section 22)</div>
            <div className="w-1/6 p-1 text-right bg-blue-50 text-blue-600 font-bold">{summaryMetrics.ventilationGain.toLocaleString()}</div>
            <div className="w-1/6 p-1 text-left ml-2">Btuh / <span className="line-through">W</span></div>
          </div>
          <div className="flex font-bold">
            <div className="w-1/2 p-1 pl-20 uppercase">Total Building Heat Gain</div>
            <div className="w-1/6 border-x border-black p-1 text-center">(Section 23)</div>
            <div className="w-1/6 p-1 text-right bg-blue-100 text-blue-600 font-bold">{summaryMetrics.totalGain.toLocaleString()}</div>
            <div className="w-1/6 p-1 text-left ml-2">Btuh / <span className="line-through">W</span></div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="border border-black text-[10px] h-12">
        <div className="p-1 font-bold border-b border-black">Notes:</div>
        <div className="p-1"></div>
      </div>
    </div>
  );
};

export default SummaryPage;
