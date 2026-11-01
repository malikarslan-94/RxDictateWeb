import { useDispatch, useSelector, useStore } from 'react-redux';

import type { AppDispatch, AppStore, RootState } from './index';

/** Use these, never the plain react-redux hooks: they know the state shape. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
/** For reading the latest state inside a callback, not for rendering. */
export const useAppStore = useStore.withTypes<AppStore>();
