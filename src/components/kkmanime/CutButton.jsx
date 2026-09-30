/**
 * "Cut" button for search inputs: a ninja star that appears once there is text,
 * spins in, and on click spins away while it clears the field.
 * It stays mounted (visibility is animated in CSS) so the spin-out is actually seen.
 */
function CutButton({ visible, onCut, className = "" }) {
  return <button
    type="button"
    className={`cut-btn${visible ? " show" : ""}${className ? ` ${className}` : ""}`}
    aria-label="Clear search"
    title="Cut"
    tabIndex={visible ? 0 : -1}
    aria-hidden={visible ? undefined : "true"}
    onClick={onCut}
  >
      <img src="/decor/shuriken-icon.webp" alt="" width="22" height="22" decoding="async" draggable="false" />
    </button>;
}

/** Katana used as the search icon in the top bar. */
function KatanaIcon({ size = 26 }) {
  return <img
    className="katana-icon"
    src="/decor/katana-icon.webp"
    alt=""
    width={size}
    height={size}
    decoding="async"
    draggable="false"
    aria-hidden="true"
  />;
}

export {
  CutButton,
  KatanaIcon
};
