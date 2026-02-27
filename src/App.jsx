import React from 'react'
import Header from './components/Header'
import WorksheetTable from './components/WorksheetTable'
import { useWorksheet } from './hooks/useWorksheet'

function App() {
  const {
    projectData,
    designConditions,
    rooms,
    updateProjectData,
    updateRoom,
    locations,
    assemblies
  } = useWorksheet();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg p-8 print-page">
        <h1 className="text-2xl font-bold text-center border-b-2 border-black pb-2 mb-4">
          RESIDENTIAL HEAT LOSS & HEAT GAIN WORKSHEET
        </h1>

        <Header
          projectData={projectData}
          updateProjectData={updateProjectData}
          designConditions={designConditions}
          locations={locations}
        />

        {rooms.map(room => (
          <WorksheetTable
            key={room.id}
            room={room}
            designConditions={designConditions}
            assemblies={assemblies}
            updateRoom={updateRoom}
          />
        ))}

        <div className="mt-8 no-print flex justify-end">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Print Report (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
