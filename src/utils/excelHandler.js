import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportDashboardData = (experiments) => {
  if (!experiments || experiments.length === 0) return;
  
  const data = experiments.map(exp => ({
    "ID": exp.test_number,
    "Name": exp.test_name,
    "Status": exp.status,
    "Type": exp.test_type,
    "Category": exp.test_category,
    "Start Date": exp.actual_start_date ? new Date(exp.actual_start_date).toLocaleDateString() : '-',
    "Result": exp.outcome || 'Pending'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Experiments");
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {type: "application/octet-stream"});
  saveAs(blob, `CRO_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};