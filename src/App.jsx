import { UIProvider } from './context/UIContext';
import TextPage from './pages/TextPage.jsx';

function App() {
  return (
    <UIProvider>
      <TextPage />
    </UIProvider>
  );
}

export default App;
