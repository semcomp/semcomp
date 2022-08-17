import React from 'react';

/**
 * @param {object} param
 *
 * @return {object}
 */
function RenderJSON({data}) {
  const jsonString = JSON.stringify(data, undefined, '\t');

  const lines = jsonString.split('\n');

  return (
    <div>
      {
        lines.map((line, index) => {
          const tabs = [];
          line = line.replace(/\t/g, () => {
            tabs.push(<span key={tabs.length} style={{width: 32, display: 'block'}} />);
            return '';
          });
          return <div key={index} className="flex">{tabs}{line}</div>;
        })
      }
    </div>
  );
}

export default RenderJSON;
