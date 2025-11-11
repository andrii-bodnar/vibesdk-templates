import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class SimpleErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Presentation Error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						height: '100vh',
						fontFamily: 'sans-serif',
						flexDirection: 'column',
						gap: '20px',
						backgroundColor: '#f8f9fa',
					}}
				>
					<h1 style={{ fontSize: '2rem', margin: 0 }}>Presentation Error</h1>
					<p style={{ color: '#666', maxWidth: '600px', textAlign: 'center' }}>
						{this.state.error?.message || 'Something went wrong'}
					</p>
					<button
						onClick={() => window.location.reload()}
						style={{
							padding: '12px 24px',
							fontSize: '1rem',
							backgroundColor: '#4a90e2',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Reload Presentation
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
