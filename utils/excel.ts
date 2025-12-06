import * as XLSX from 'xlsx';
import { Participant, Winner, Prize } from '../types';

export const parseExcel = (file: File): Promise<Participant[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];

        // Map fields loosely to support various column headers
        const participants: Participant[] = json.map((row, index) => {
            const name = row['姓名'] || row['Name'] || row['name'] || 'Unknown';
            const phone = String(row['手机号'] || row['Phone'] || row['phone'] || row['Mobile'] || '');
            const department = row['部门'] || row['Department'] || row['dept'] || 'General';
            
            return {
                id: `${phone}-${index}`, // Unique key
                name,
                phone,
                department
            };
        }).filter(p => p.name !== 'Unknown' && p.phone); // Basic validation

        resolve(participants);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const exportWinners = (winners: Winner[], prizes: Prize[]) => {
  const data = winners.map(w => {
    const prize = prizes.find(p => p.id === w.prizeId);
    return {
      'Prize Category': prize?.name || 'Unknown',
      'Prize Item': prize?.item || 'Unknown',
      'Winner Name': w.participant.name,
      'Phone': w.participant.phone,
      'Department': w.participant.department,
      'Time': new Date(w.timestamp).toLocaleTimeString()
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Winners");
  XLSX.writeFile(wb, "Lottery_Winners.xlsx");
};
