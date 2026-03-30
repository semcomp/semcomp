import React from 'react';

/**
 * @param {object} param
 *
 * @return {object}
 */
function TableRowTruncated({value, maxWidth = '128px'}) {
  return (
    <div className="truncate" style={{maxWidth}}>{value}</div>
  );
}

export default TableRowTruncated;
