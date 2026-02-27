import React, { useState } from 'react'
import Header from './components/Header'
import WorksheetTable from './components/WorksheetTable'
import SummaryPage from './components/SummaryPage'
import TitlePage from './components/TitlePage'
import { useWorksheet } from './hooks/useWorksheet'

function App() {
  const {
    projectData,
    rooms,
    summaryMetrics,
    updateProjectData,
    updateRoom,
    locations,
    assemblies
  } = useWorksheet();

  const [view, setView] = useState('summary'); // Default to summary for quick overview

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="no-print flex gap-4 justify-center mb-4 sticky top-4 z-50">
          <button
            onClick={() => setView('title')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'title' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            Title Page (Page 1)
          </button>
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'summary' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            Summary Page (Page 2)
          </button>
          <button
            onClick={() => setView('worksheet')}
            className={`px-4 py-2 rounded shadow-sm font-bold ${view === 'worksheet' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}`}
          >
            Room Worksheets (Page 3+)
          </button>
        </div>

        {view === 'title' && (
          <TitlePage projectData={projectData} />
        )}

        {view === 'worksheet' && (
          <div className="bg-white shadow-lg p-8 print-page">
            <h1 className="text-2xl font-bold text-center border-b-2 border-black pb-2 mb-4">
              RESIDENTIAL HEAT LOSS & HEAT GAIN WORKSHEET
            </h1>

            <Header
              projectData={projectData}
              updateProjectData={updateProjectData}
              designConditions={{ heating99: projectData.odtHeating, cooling25: projectData.odtCooling, coolingRange: projectData.summerRange }}
              locations={locations}
            />

            {rooms.map(room => (
              <WorksheetTable
                key={room.id}
                room={room}
                designConditions={{ heating99: projectData.odtHeating, cooling25: projectData.odtCooling, coolingRange: projectData.summerRange }}
                assemblies={assemblies}
                updateRoom={updateRoom}
              />
            ))}
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
                    <span className="border-b border-black px-4 font-bold">{idx + 3}</span>
                    <span>of</span>
                    <span className="border-b border-black px-4 font-bold">{rooms.length + 2}</span>
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
                  designConditions={{ heating99: projectData.odtHeating, cooling25: projectData.odtCooling, coolingRange: projectData.summerRange }}
                  assemblies={assemblies}
                  updateRoom={updateRoom}
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
