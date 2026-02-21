import React from 'react';

/**
 * @param {object} param
 *
 * @return {object}
 */
function RenderDate({date}) {
  const dateObject = new Date(date);

  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = dateObject.getDate().toString().padStart(2, '0');

  const hour = dateObject.getHours().toString().padStart(2, '0');
  const minute = dateObject.getMinutes().toString().padStart(2, '0');

  const dateString = `${dayOfMonth}/${month}, ${hour}h ${minute}m`;

  return <div>{dateString}</div>;
}

export default RenderDate;
