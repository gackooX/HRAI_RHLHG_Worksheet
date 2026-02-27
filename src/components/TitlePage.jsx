import React from 'react';

const TitlePage = ({ projectData }) => {
  return (
    <div className="print-page flex flex-col items-center justify-center bg-white p-16 border border-gray-200 shadow-lg min-h-[10.5in]">
      <div className="text-center space-y-8 max-w-2xl w-full">
        <div className="border-b-4 border-blue-900 pb-4">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
            RESIDENTIAL HEAT LOSS &<br />HEAT GAIN REPORT
          </h1>
          <p className="text-lg text-gray-600 mt-2 font-semibold">Based on HRAI / CSA F280-12 Standards</p>
        </div>

        <div className="grid grid-cols-1 gap-8 py-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Project Information</h2>
            <div className="space-y-3">
              <div className="flex border-b border-gray-200 pb-1">
                <span className="w-32 font-bold text-gray-700">Client Name:</span>
                <span className="text-gray-900">{projectData.clientName || '---'}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-1">
                <span className="w-32 font-bold text-gray-700">Service Address:</span>
                <span className="text-gray-900">{projectData.address || '---'}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-1">
                <span className="w-32 font-bold text-gray-700">City/Province:</span>
                <span className="text-gray-900">{projectData.city || '---'}</span>
              </div>
              <div className="flex border-b border-gray-200 pb-1">
                <span className="w-32 font-bold text-gray-700">Date:</span>
                <span className="text-gray-900">{projectData.date}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-left">
            <h2 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">Prepared By</h2>
            <div className="space-y-1">
              <p className="text-xl font-bold text-gray-900">{projectData.designer || 'Professional Designer'}</p>
              <p className="text-gray-600">Certified HRAI Designer</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex justify-around items-center opacity-50 grayscale">
            <div className="text-xs font-bold border-2 border-black p-2">HRAI MEMBER</div>
            <div className="text-xs font-bold border-2 border-black p-2 uppercase">CSA F280-12 COMPLIANT</div>
          </div>
          <p className="text-[10px] text-gray-400 mt-8 italic">
            This report provides a digital twin of the physical HRAI reporting requirements.
            All calculations are performed according to CSA F280-12 methodologies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TitlePage;
