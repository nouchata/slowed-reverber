export function debouncer(func: Function, wait: number, args?: Object) {
  let timeout: any;
  return () => {
    // basic debouncer here
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = undefined;
      func({ ...args });
    }, wait);
  };
}
