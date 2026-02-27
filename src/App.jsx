import React, { useState } from 'react'
import Header from './components/Header'
import WorksheetTable from './components/WorksheetTable'
import SummaryPage from './components/SummaryPage'
import TitlePage from './components/TitlePage'
import GeneralDataInput from './components/GeneralDataInput'
import { useWorksheet } from './hooks/useWorksheet'
import { PlusCircle } from 'lucide-react'

function App() {
  const {
    projectData,
    rooms,
    summaryMetrics,
    floorWiseSummary,
    updateProjectData,
    updateRoom,
    addRoom,
    removeRoom,
    locations,
    assemblies
  } = useWorksheet();

  const [view, setView] = useState('general');

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex gap-4">
      {/* Sidebar Converter (No-Print) */}
      <div className="no-print w-64 bg-white p-4 border rounded shadow-sm h-fit sticky top-4 space-y-4">
        <h3 className="font-bold border-b pb-1 text-sm uppercase">Quick Converter</h3>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-gray-500">Global Display Unit</label>
          <select
            className="w-full border p-2 rounded font-bold bg-blue-50"
            value={projectData.displayUnits}
            onChange={(e) => updateProjectData('displayUnits', e.target.value)}
          >
            <option value="IMPERIAL">Imperial (Btuh, ft, F)</option>
            <option value="METRIC">Metric (W, m, C)</option>
          </select>
        </div>
        <div className="text-[10px] text-gray-400 italic">
          Logic consistently processes data in Imperial. Converter affects display labels and scaling.
        </div>

        <button
          onClick={addRoom}
          className="w-full bg-blue-600 text-white p-2 rounded flex items-center justify-center gap-2 font-bold hover:bg-blue-700 transition"
        >
          <PlusCircle size={16} /> Add New Room
        </button>
      </div>

      <div className="flex-1 max-w-5xl space-y-8">
        <div className="no-print flex gap-4 justify-center mb-4 sticky top-4 z-50">
          <button
            onClick={() => setView('title')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'title' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            Title Page (1)
          </button>
          <button
            onClick={() => setView('general')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'general' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            General Data (2)
          </button>
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'summary' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            Summary Page (3)
          </button>
          <button
            onClick={() => setView('worksheet')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'worksheet' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            Worksheets (4+)
          </button>
        </div>

        {view === 'title' && (
          <TitlePage projectData={projectData} />
        )}

        {view === 'general' && (
          <GeneralDataInput
            projectData={projectData}
            updateProjectData={updateProjectData}
            floorWiseSummary={floorWiseSummary}
            summaryMetrics={summaryMetrics}
          />
        )}

        {view === 'worksheet' && (
          <div className="bg-white shadow-lg p-8 print-page">
            <h1 className="text-2xl font-bold text-center border-b-2 border-black pb-2 mb-4 uppercase">
              Room Heat Loss & Heat Gain Worksheet
            </h1>

            <Header
              projectData={projectData}
              updateProjectData={updateProjectData}
              designConditions={{ heating99: projectData.odtHeating, cooling25: projectData.odtCooling, coolingRange: projectData.summerRange }}
              locations={locations}
            />

            {rooms.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded text-gray-400">
                No rooms added yet. Click "Add New Room" in the sidebar.
              </div>
            ) : (
              rooms.map((room, idx) => (
                <WorksheetTable
                  key={room.id}
                  room={room}
                  roomIndex={idx}
                  totalRooms={rooms.length}
                  projectData={projectData}
                  assemblies={assemblies}
                  updateRoom={updateRoom}
                  removeRoom={removeRoom}
                />
              ))
            )}
          </div>
        )}

        {view === 'summary' && (
          <SummaryPage
            projectData={projectData}
            updateProjectData={updateProjectData}
            rooms={rooms}
            summaryMetrics={summaryMetrics}
          />
        )}

        {/* Combined View for Printing */}
        <div className="hidden print:block space-y-0">
          <TitlePage projectData={projectData} />
          <div className="page-break" />

          <GeneralDataInput
            projectData={projectData}
            updateProjectData={updateProjectData}
            floorWiseSummary={floorWiseSummary}
            summaryMetrics={summaryMetrics}
          />
          <div className="page-break" />

          <SummaryPage
            projectData={projectData}
            updateProjectData={updateProjectData}
            rooms={rooms}
            summaryMetrics={summaryMetrics}
          />
          <div className="page-break" />

          {rooms.map((room, idx) => (
            <React.Fragment key={room.id}>
              <div className="print-page bg-white p-8">
                <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-1">
                  <h1 className="text-xl font-bold">HRAI Residential Room Heat Loss/Gain</h1>
                  <div className="text-sm flex gap-2">
                    <span>Page</span>
                    <span className="border-b border-black px-4 font-bold">{idx + 4}</span>
                    <span>of</span>
                    <span className="border-b border-black px-4 font-bold">{rooms.length + 3}</span>
                  </div>
                </div>

                <Header
                  projectData={projectData}
                  updateProjectData={updateProjectData}
                  designConditions={{ heating99: projectData.odtHeating, cooling25: projectData.odtCooling, coolingRange: projectData.summerRange }}
                  locations={locations}
                />

                <WorksheetTable
                  room={room}
                  roomIndex={idx}
                  totalRooms={rooms.length}
                  projectData={projectData}
                  assemblies={assemblies}
                  updateRoom={updateRoom}
                  removeRoom={removeRoom}
                />
              </div>
              {idx < rooms.length - 1 && <div className="page-break" />}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-8 no-print flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition font-bold"
          >
            Generate Complete PDF Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
