// WAI-ARIA Radio-Group-Pattern: Pfeiltasten (+ Pos1/Ende) bewegen Fokus UND
// Auswahl gemeinsam (roving tabindex), wie beim nativen <input type="radio">.
const NAV_KEYS = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];

export function handleRadioGroupKeydown(
  event: KeyboardEvent,
  ids: string[],
  currentId: string,
  domIdPrefix: string,
  onSelect: (id: string) => void
): void {
  if (!NAV_KEYS.includes(event.key)) return;
  event.preventDefault();

  const currentIndex = ids.indexOf(currentId);
  let nextIndex: number;

  if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = ids.length - 1;
  } else {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    nextIndex = (currentIndex + step + ids.length) % ids.length;
  }

  const nextId = ids[nextIndex];
  onSelect(nextId);
  requestAnimationFrame(() => {
    document.getElementById(`${domIdPrefix}-${nextId}`)?.focus();
  });
}
