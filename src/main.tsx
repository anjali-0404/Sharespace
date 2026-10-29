import {createRoot} from 'react-dom/client';import './index.css';import {Provider} from './store';import App from './App';
createRoot(document.getElementById('root')!).render(<Provider><App/></Provider>);
