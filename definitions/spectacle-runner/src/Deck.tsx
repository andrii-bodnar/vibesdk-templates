import {
	Slide,
	Heading,
	Text,
	UnorderedList,
	ListItem,
	CodePane,
	FlexBox,
	Box,
	Appear,
	Grid,
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
	Quote,
	Link,
	Notes,
	Markdown,
	Stepper
} from 'spectacle';

export default function Presentation() {
	return (
		<>
			{/* Slide 1: Hero Title */}
			<Slide backgroundColor="primary">
				<FlexBox height="100%" flexDirection="column" justifyContent="center">
					<Heading fontSize="80px" color="quaternary" margin="0 0 20px">
						Spectacle
					</Heading>
					<Text fontSize="48px" color="secondary" margin="0 0 40px">
						React-Based Presentation Library
					</Text>
					<Text fontSize="28px" color="quinary">
						Build interactive slides with code
					</Text>
				</FlexBox>
				<Notes>
					Welcome to this Spectacle demo! This presentation showcases the full
					capabilities of Spectacle for creating beautiful, interactive presentations.
				</Notes>
			</Slide>

			{/* Slide 2: Animated Feature List */}
			<Slide backgroundColor="quaternary">
				<Heading fontSize="h2" color="primary" margin="0 0 60px">
					Why Spectacle?
				</Heading>
				<UnorderedList color="secondary" fontSize="32px">
					<Appear>
						<ListItem>
							React components for building presentations
						</ListItem>
					</Appear>
					<Appear>
						<ListItem>
							Syntax-highlighted code with 20+ languages
						</ListItem>
					</Appear>
					<Appear>
						<ListItem>
							Progressive reveal with animations
						</ListItem>
					</Appear>
					<Appear>
						<ListItem>
							Fully customizable themes and layouts
						</ListItem>
					</Appear>
				</UnorderedList>
			</Slide>

			{/* Slide 3: Multi-Language Code Examples */}
			<Slide backgroundColor="tertiary">
				<Heading fontSize="h2" color="primary" margin="0 0 40px">
					Code Examples
				</Heading>
				<Grid
					gridTemplateColumns="1fr 1fr"
					gridColumnGap={20}
					gridRowGap={20}
				>
					<Box>
						<Text fontSize="24px" color="secondary" margin="0 0 10px">
							TypeScript
						</Text>
						<CodePane
							language="typescript"
							theme="dracula"
							showLineNumbers={false}
							fontSize={18}
						>
							{`function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("World");`}
						</CodePane>
					</Box>
					<Box>
						<Text fontSize="24px" color="secondary" margin="0 0 10px">
							Python
						</Text>
						<CodePane
							language="python"
							theme="nightOwl"
							showLineNumbers={false}
							fontSize={18}
						>
							{`def greet(name):
    return f"Hello, {name}!"

message = greet("World")`}
						</CodePane>
					</Box>
				</Grid>
			</Slide>

			{/* Slide 4: Layout Mastery */}
			<Slide backgroundColor="quaternary">
				<Heading fontSize="h2" color="primary" margin="0 0 40px">
					Flexible Layouts
				</Heading>
				<Grid
					gridTemplateColumns="1fr 1fr 1fr"
					gridColumnGap={20}
				>
					<Box
						padding="30px"
						backgroundColor="primary"
						borderRadius="8px"
					>
						<Heading fontSize="h3" color="quaternary">
							Column 1
						</Heading>
						<Text fontSize="20px" color="tertiary" margin="20px 0 0">
							Use Grid for multi-column layouts
						</Text>
					</Box>
					<Box
						padding="30px"
						backgroundColor="secondary"
						borderRadius="8px"
					>
						<Heading fontSize="h3" color="quaternary">
							Column 2
						</Heading>
						<Text fontSize="20px" color="tertiary" margin="20px 0 0">
							FlexBox for flexible spacing
						</Text>
					</Box>
					<Box
						padding="30px"
						backgroundColor="primary"
						borderRadius="8px"
					>
						<Heading fontSize="h3" color="quaternary">
							Column 3
						</Heading>
						<Text fontSize="20px" color="tertiary" margin="20px 0 0">
							Box for containers
						</Text>
					</Box>
				</Grid>
			</Slide>

			{/* Slide 5: Data Table */}
			<Slide backgroundColor="tertiary">
				<Heading fontSize="h2" color="primary" margin="0 0 40px">
					Data Tables
				</Heading>
				<Table>
					<TableHeader>
						<TableRow>
							<TableCell
								style={{
									backgroundColor: '#4a90e2',
									color: 'white',
									padding: '16px',
									fontSize: '24px',
									fontWeight: 'bold'
								}}
							>
								Feature
							</TableCell>
							<TableCell
								style={{
									backgroundColor: '#4a90e2',
									color: 'white',
									padding: '16px',
									fontSize: '24px',
									fontWeight: 'bold'
								}}
							>
								Supported
							</TableCell>
							<TableCell
								style={{
									backgroundColor: '#4a90e2',
									color: 'white',
									padding: '16px',
									fontSize: '24px',
									fontWeight: 'bold'
								}}
							>
								Details
							</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell style={{ padding: '12px', fontSize: '20px' }}>
								Animations
							</TableCell>
							<TableCell style={{ padding: '12px', fontSize: '20px' }}>
								✓
							</TableCell>
							<TableCell style={{ padding: '12px', fontSize: '20px' }}>
								Appear, Stepper, Transitions
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell
								style={{
									padding: '12px',
									fontSize: '20px',
									backgroundColor: '#f8f9fa'
								}}
							>
								Code Highlighting
							</TableCell>
							<TableCell
								style={{
									padding: '12px',
									fontSize: '20px',
									backgroundColor: '#f8f9fa'
								}}
							>
								✓
							</TableCell>
							<TableCell
								style={{
									padding: '12px',
									fontSize: '20px',
									backgroundColor: '#f8f9fa'
								}}
							>
								20+ languages, Prism themes
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell style={{ padding: '12px', fontSize: '20px' }}>
								Markdown
							</TableCell>
							<TableCell style={{ padding: '12px', fontSize: '20px' }}>
								✓
							</TableCell>
							<TableCell style={{ padding: '12px', fontSize: '20px' }}>
								Inline and slide sets
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</Slide>

			{/* Slide 6: Typography Hierarchy */}
			<Slide backgroundColor="quaternary">
				<Heading fontSize="72px" color="primary" margin="0 0 20px">
					Typography
				</Heading>
				<Heading fontSize="56px" color="secondary" margin="0 0 20px">
					Multiple Heading Sizes
				</Heading>
				<Heading fontSize="40px" color="primary" margin="0 0 20px">
					For Visual Hierarchy
				</Heading>
				<Text fontSize="28px" color="secondary" margin="0 0 30px">
					Body text with proper sizing and spacing
				</Text>
				<Quote fontSize="24px" color="quinary" borderLeft="4px solid #4a90e2">
					"Spectacle makes it easy to create beautiful presentations with React"
				</Quote>
				<FlexBox justifyContent="center" margin="40px 0 0">
					<Link
						href="https://commerce.nearform.com/open-source/spectacle"
						color="secondary"
						fontSize="24px"
					>
						Learn More →
					</Link>
				</FlexBox>
			</Slide>

			{/* Slide 7: Markdown Demo */}
			<Slide backgroundColor="tertiary">
				<Heading fontSize="h2" color="primary" margin="0 0 40px">
					Markdown Support
				</Heading>
				<Markdown
					fontSize="24px"
					color="secondary"
				>{`
Write slides in **Markdown** for simplicity:

- Use standard markdown syntax
- Create *emphasis* and **strong** text
- Add [links](https://example.com)
- Include \`inline code\`

Perfect for quick content creation!
				`}</Markdown>
			</Slide>

			{/* Slide 8: Interactive Stepper */}
			<Slide backgroundColor="quaternary">
				<FlexBox height="100%" flexDirection="column" justifyContent="center">
					<Heading fontSize="h2" color="primary" margin="0 0 60px">
						Interactive Content
					</Heading>
					<Stepper
						values={['Concept', 'Design', 'Build', 'Deploy']}
						render={({ step, value }) => (
							<Box>
								<Text fontSize="36px" color="secondary" margin="0 0 30px">
									Step {step + 1} of 4
								</Text>
								<Heading fontSize="64px" color="primary">
									{value}
								</Heading>
							</Box>
						)}
					/>
					<Text fontSize="24px" color="quinary" margin="60px 0 0">
						Press → to advance through steps
					</Text>
				</FlexBox>
			</Slide>

			{/* Slide 9: Thank You */}
			<Slide backgroundColor="primary">
				<FlexBox height="100%" flexDirection="column" justifyContent="center">
					<Heading fontSize="72px" color="quaternary" margin="0 0 40px">
						Thank You!
					</Heading>
					<Text fontSize="32px" color="tertiary" margin="0 0 60px">
						Start building amazing presentations
					</Text>
					<Link
						href="https://commerce.nearform.com/open-source/spectacle"
						fontSize="28px"
						color="secondary"
					>
						Spectacle Documentation →
					</Link>
				</FlexBox>
				<Notes>
					This concludes the Spectacle demo. Press Option/Alt + P to enter
					presenter mode and see these notes. Press Option/Alt + O for overview mode.
				</Notes>
			</Slide>
		</>
	);
}
