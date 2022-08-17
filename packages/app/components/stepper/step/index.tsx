/**
 * @param { Object } props
 * @param { number } props.index
 * @param { boolean } props.isActive
 * @param { () => void } [props.onClick]
 */
function Step({ index, isActive, onClick }) {
  return (
    <button className="step-component-root" onClick={onClick}>
      <p className={`index-ball ${isActive ? "isActive" : ""}`}>{index + 1}</p>
    </button>
  );
}

export default Step;
