import { useDispatch, useSelector } from "react-redux";

/**
 * @typedef {import("@/store/store").AppDispatch} AppDispatch
 * @typedef {import("@/store/store").RootState} RootState
 */

/** @type {() => AppDispatch} */
export const useAppDispatch = useDispatch;

/** @type {import("react-redux").TypedUseSelectorHook<RootState>} */
export const useAppSelector = useSelector;
