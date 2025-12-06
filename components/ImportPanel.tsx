import React, { useState } from 'react';
import { Upload, Trash2, Users, AlertCircle } from 'lucide-react';
import { Participant } from '../types';
import { parseExcel } from '../utils/excel';

interface Props {
  participants: Participant[];
  onImport: (data: Participant[]) => void;
  onClear: () => void;
}

export const ImportPanel: React.FC<Props> = ({ participants, onImport, onClear }) => {
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcel(file);
      if (data.length === 0) {
        setError('No valid data found in Excel. Please check columns: Name, Phone, Department');
        return;
      }
      onImport(data);
    } catch (err) {
      console.error(err);
      setError('Failed to parse Excel file.');
    } finally {
        // Reset input
        e.target.value = '';
    }
  };

  const confirmClear = () => {
    if (window.confirm('Are you sure you want to clear all participant data? This cannot be undone.')) {
      onClear();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
          <Users className="w-6 h-6" /> Participant Data
        </h2>
        <div className="text-white/70">
          Total: <span className="font-bold text-white text-xl">{participants.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-white/30 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-10 h-10 text-yellow-400 mb-3" />
          <p className="font-medium text-white">Click to Upload Excel</p>
          <p className="text-sm text-white/50 mt-1">Columns: Name, Phone, Department</p>
        </div>

        {/* Actions & Preview */}
        <div className="flex flex-col gap-4">
           <button 
             onClick={confirmClear}
             className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-semibold transition-all"
             disabled={participants.length === 0}
           >
             <Trash2 className="w-5 h-5" /> Clear Data
           </button>
           
           {error && (
             <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded text-sm flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> {error}
             </div>
           )}
        </div>
      </div>

      {/* Preview Table */}
      {participants.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/10 text-yellow-400">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {participants.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="p-3 font-medium text-white">{p.name}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">{p.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {participants.length > 5 && (
            <div className="bg-white/5 p-2 text-center text-xs text-white/50">
              ...and {participants.length - 5} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};
