import { useRef, useEffect } from "react";
/**
 * A useEffect-like wrapper that will not trigger on first render.
 * Use this if you want an effect to run when state variables change,
 * but NOT when they are initialized to default
 * @param {*} fn - Code to execute when inputs change
 * @param {*} inputs - an array of dependency values
 */
function useNotInitialRenderEffect(fn, inputs) {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) fn();
    else didMountRef.current = true;
  }, inputs);
}
export default useNotInitialRenderEffect;
