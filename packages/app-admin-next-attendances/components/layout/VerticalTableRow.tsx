/**
 * @param {object} param
 *
 * @return {object}
 */
function VerticalTableRow({name, value}) {
  return (
    <div className="border-b">
      <strong>{name}</strong>
      <p>{value}</p>
    </div>
  );
}

export default VerticalTableRow;
