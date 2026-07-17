import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Home from './pages/Home';
import DocsIntroduction from './pages/DocsIntroduction';
import DocsArchitecture from './pages/DocsArchitecture';
import DocsUsage from './pages/DocsUsage';
import DocsManualSetup from './pages/DocsManualSetup';
import Playground from './pages/Playground';
import Showcase from './pages/Showcase';
import LoaderDetail from './pages/LoaderDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="docs/introduction" element={<DocsIntroduction />} />
        <Route path="docs/architecture" element={<DocsArchitecture />} />
        <Route path="docs/usage" element={<DocsUsage />} />
        <Route path="docs/manual-setup" element={<DocsManualSetup />} />
        <Route path="playground" element={<Playground />} />
        <Route path="showcase" element={<Showcase />} />
        <Route path="loaders/:slug" element={<LoaderDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
