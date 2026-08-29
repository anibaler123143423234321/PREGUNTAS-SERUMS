import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onSelectOption,
  onNext,
  onPrev,
  onFlag,
  isEnabled = true
}) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();

      // Options 1-4 or A-D
      if (['1', 'A'].includes(key) && onSelectOption) {
        e.preventDefault();
        onSelectOption('A');
      } else if (['2', 'B'].includes(key) && onSelectOption) {
        e.preventDefault();
        onSelectOption('B');
      } else if (['3', 'C'].includes(key) && onSelectOption) {
        e.preventDefault();
        onSelectOption('C');
      } else if (['4', 'D'].includes(key) && onSelectOption) {
        e.preventDefault();
        onSelectOption('D');
      } else if (['5', 'E'].includes(key) && onSelectOption) {
        e.preventDefault();
        onSelectOption('E');
      } else if (key === 'F' && onFlag) {
        e.preventDefault();
        onFlag();
      } else if ((key === 'ARROWRIGHT' || key === 'N') && onNext) {
        e.preventDefault();
        onNext();
      } else if ((key === 'ARROWLEFT' || key === 'P') && onPrev) {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectOption, onNext, onPrev, onFlag, isEnabled]);
}
