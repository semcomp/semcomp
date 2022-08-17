import React from 'react';

/**
 * @param {object} param
 *
 * @return {object}
 */
function TableExpandedRow({height = '16rem', children}) {
  return (
    <tr className="w-full relative" style={{height}}>
      <td className="w-full h-full absolute overflow-auto" style={{height}}>{children}</td>
    </tr>
  );
}

export default TableExpandedRow;
