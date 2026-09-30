import { createContext, useContext, useState } from "react";
import { TitleDialog } from "./TitleDialog";
const TitleDialogContext = createContext(() => {
});
function useOpenTitle() {
  return useContext(TitleDialogContext);
}
function TitleDialogProvider({ children }) {
  const [title, setTitle] = useState(null);
  return <TitleDialogContext.Provider value={setTitle}>
      {children}
      {title ? <TitleDialog title={title} onClose={() => setTitle(null)} /> : null}
    </TitleDialogContext.Provider>;
}
export {
  TitleDialogProvider,
  useOpenTitle
};
