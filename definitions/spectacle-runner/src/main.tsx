import React from 'react';
import ReactDOM from 'react-dom/client';
import { Deck } from 'spectacle';
import Presentation from './Deck';
import { theme } from './theme';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ErrorBoundary>
			<Deck theme={theme} template={() => null}>
				<Presentation />
			</Deck>
		</ErrorBoundary>
	</React.StrictMode>
);
