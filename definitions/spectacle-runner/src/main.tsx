import React from 'react';
import ReactDOM from 'react-dom/client';
import { Deck } from 'spectacle';
import Presentation from './Deck';
import { theme } from './theme';
import './index.css';
import { SimpleErrorBoundary } from './components/SimpleErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<SimpleErrorBoundary>
			<Deck theme={theme} template={() => null}>
				<Presentation />
			</Deck>
		</SimpleErrorBoundary>
	</React.StrictMode>
);
