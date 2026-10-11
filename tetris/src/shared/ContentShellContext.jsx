import { createContext, useContext } from "react";

const ContentShellContext = createContext({ paused: false });

export function ContentShellProvider({ paused, preferences = {}, children }) {
  return <ContentShellContext.Provider value={{ paused, preferences }}>{children}</ContentShellContext.Provider>;
}

export function useContentShell() {
  return useContext(ContentShellContext);
}
