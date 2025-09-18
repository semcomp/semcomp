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
  let headers = Object.keys(data[0]);

  let dataCsv = data.reduce((acc, row) => {
    acc.push(Object.values(row).map(value =>
      typeof value === 'number' ? `"${value.toString().replace('.', ',')}"` : value
    ).join(','));
    return acc;
  }, [])

  downloadFile({
    data: [headers, ...dataCsv].join('\n'),
    fileName: fileName + '.csv',
    fileType: 'text/csv', 
  })
}
