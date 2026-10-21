export {translate} from './translate';
export type {TranslationKey} from './translate';

// Re-exported so bot code keeps importing language helpers from one place,
// even though they now live in shared/ for the Mini App to use too.
export {resolveLang, SUPPORTED_LANGUAGES} from '../../../shared/lang.tsx';
export type {Lang} from '../../../shared/lang.tsx';
