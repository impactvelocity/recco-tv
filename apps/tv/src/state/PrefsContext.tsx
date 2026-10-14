import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {sceneFor} from '@recco/core-shared/scene';
import {storage, type Prefs} from '../lib/storage';
import {
  DEFAULT_THEME,
  THEMES,
  THEME_ORDER,
  type Theme,
  type ThemeKey,
} from '../theme';

/** How often Auto checks the clock, so the scene turns at 7:00 and 19:00. */
const SCENE_CHECK_MS = 60_000;

interface PrefsValue extends Prefs {
  /** The theme on screen: the saved one, or Auto's scene for now. */
  colors: Theme;
  /** False until saved prefs are read, so the first frame does not flash the wrong theme. */
  loaded: boolean;
  setPrefs: (change: Partial<Prefs>) => void;
  nextTheme: () => void;
}

const DEFAULTS: Prefs = {
  theme: DEFAULT_THEME,
  defaultView: 'inbox',
  hideWatched: false,
};

const PrefsContext = createContext<PrefsValue | null>(null);

export function usePrefs(): PrefsValue {
  const value = useContext(PrefsContext);
  if (!value) {
    throw new Error('usePrefs outside PrefsProvider');
  }
  return value;
}

/** The current theme's colours. */
export function useColors(): Theme {
  return usePrefs().colors;
}

export function PrefsProvider({children}: {children: React.ReactNode}) {
  const [prefs, setState] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const scene = useScene(prefs.theme === 'auto');

  useEffect(() => {
    storage.getPrefs().then((saved) => {
      const theme =
        saved.theme && THEME_ORDER.includes(saved.theme)
          ? saved.theme
          : DEFAULTS.theme;
      setState({...DEFAULTS, ...saved, theme});
      setLoaded(true);
    });
  }, []);

  const setPrefs = useCallback((change: Partial<Prefs>) => {
    setState((current) => {
      const next = {...current, ...change};
      storage.setPrefs(next);
      return next;
    });
  }, []);

  const nextTheme = useCallback(() => {
    setState((current) => {
      const next = {
        ...current,
        theme:
          THEME_ORDER[
            (THEME_ORDER.indexOf(current.theme) + 1) % THEME_ORDER.length
          ]!,
      };
      storage.setPrefs(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      ...prefs,
      colors: THEMES[prefs.theme === 'auto' ? scene : prefs.theme],
      loaded,
      setPrefs,
      nextTheme,
    }),
    [prefs, scene, loaded, setPrefs, nextTheme],
  );
  return (
    <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
  );
}

/** Auto's scene for the TV's local time. Re-renders only when the scene changes. */
function useScene(active: boolean): ThemeKey {
  const [scene, setScene] = useState<ThemeKey>(() => sceneFor(new Date()));
  useEffect(() => {
    if (!active) return;
    const check = () => setScene(sceneFor(new Date()));
    check();
    const timer = setInterval(check, SCENE_CHECK_MS);
    return () => clearInterval(timer);
  }, [active]);
  return scene;
}
