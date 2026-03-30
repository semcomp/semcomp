function downloadFile({ data, fileName, fileType }) {
  const blob = new Blob([data], { type: fileType })

  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}

export default function exportToCsv(data: any[], fileName: string = 'data') {
  if (!data || data.length === 0) {
    console.error("Não há dados para exportar.");
    return;
  }

  const processCell = (cellData: any): string => {
    if (typeof cellData === 'number') {
      return `"${cellData.toString().replace('.', ',')}"`;
    }

    if (typeof cellData === 'string') {
      const needsQuotes = cellData.includes(',') || cellData.includes('\n') || cellData.includes('"');
      
      if (needsQuotes) {
        const escapedCell = cellData.replace(/"/g, '""');
        return `"${escapedCell}"`;
      }
      
      return cellData;
    }

    if (cellData == null) {
      return ''; 
    }
    
    return cellData.toString();
  };

  const headers = Object.keys(data[0]).map(processCell).join(',');

  const dataCsv = data.map(row => 
    Object.values(row).map(processCell).join(',')
  );

  const csvData = ['\uFEFF' + headers, ...dataCsv].join('\n');

  downloadFile({
    data: [csvData],
    fileName: fileName + '.csv',
    fileType: 'text/csv;charset=utf-8;',
  });
}
