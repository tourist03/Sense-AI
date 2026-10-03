import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@fontsource-variable/geist/wght.css';
import '../src/index.css';
import '../src/news-scrapper/theme-toggle.css';
import '../src/news-scrapper/ui-polish.css';
import { LanguageProvider } from '../src/news-scrapper/translation/LanguageProvider.jsx';
import { SamparkAuthProvider } from '../src/sampark/auth/SamparkAuthContext.jsx';
import { applySamparkTheme, readSamparkTheme } from '../src/sampark/theme.js';
import SamparkApp from '../src/sampark/SamparkApp.jsx';
import { installDemoTransport, resetDemo } from './transport.js';
import './demo.css';

installDemoTransport();
applySamparkTheme(readSamparkTheme());

class DemoErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <section className="public-demo-recovery" role="alert"><h1>This demo view could not open.</h1><p>Your browser-local saves are preserved.</p><button onClick={() => { window.location.hash='/all-news'; window.location.reload(); }}>Return to the sample briefing</button></section> : this.props.children;
  }
}

function Demo() {
  return <>
    <aside className="public-demo-banner" aria-label="Portfolio demo information" data-no-translate>
      <div><strong>Sense.AI <span>PORTFOLIO DEMO</span></strong><p>Fictional sample data · Browser-local changes · No live AI or private services</p></div>
      <nav aria-label="Demo links"><a href="#/all-news">Try report editing</a><button onClick={() => { resetDemo(); window.location.reload(); }} type="button">Reset demo</button><a href="https://github.com/tourist03/Sense-AI" target="_blank" rel="noopener noreferrer">Source ↗</a><a href="https://tourist03.github.io/portfolio/">Vineet’s portfolio ↗</a></nav>
    </aside>
    <DemoErrorBoundary><LanguageProvider><SamparkAuthProvider><HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><SamparkApp /></HashRouter></SamparkAuthProvider></LanguageProvider></DemoErrorBoundary>
    <footer className="public-demo-footer">Designed and engineered by Vineet Singh. This independent portfolio demonstration contains no internal news, user activity or service credentials. Sample AI text is prewritten; the full app requires the Python backend.</footer>
  </>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><Demo /></React.StrictMode>);
