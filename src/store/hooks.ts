import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './index';

/** Use these, never the plain react-redux hooks: they know the state shape. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
