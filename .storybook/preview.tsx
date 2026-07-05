import type { Preview } from "@storybook/react-vite";
import React from "react";

const PAPER = "#f4f3ee";
const INK = "#0b0b0f";
// Storybook stores the selected background *option key* (not the hex) in globals.
const PAPER_KEY = "paper";
const INK_KEY = "ink";

interface StageColors {
	readonly text: string;
	readonly frame: string;
	readonly dots: string;
	readonly faint: string;
}

function stageColors(isLight: boolean): StageColors {
	return isLight
		? { text: "#18181b", frame: "rgba(0,0,0,0.14)", dots: "rgba(0,0,0,0.06)", faint: "#78716c" }
		: {
				text: "#f5f5f4",
				frame: "rgba(255,255,255,0.14)",
				dots: "rgba(255,255,255,0.05)",
				faint: "#a1a1aa",
			};
}

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			options: {
				[INK_KEY]: { name: "Ink", value: INK },
				[PAPER_KEY]: { name: "Paper", value: PAPER },
			},
		},
	},
	initialGlobals: {
		backgrounds: { value: INK_KEY },
	},
	decorators: [
		(Story, context) => {
			const isLight = context.globals.backgrounds?.value === PAPER_KEY;
			const colors = stageColors(isLight);
			return (
				<div
					style={{
						fontFamily: "var(--font-sans)",
						color: colors.text,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: 32,
					}}
				>
					<div
						style={{
							position: "relative",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							minWidth: 340,
							minHeight: 340,
							padding: "56px 64px",
							border: `1px solid ${colors.frame}`,
						}}
					>
						<div
							aria-hidden="true"
							style={{
								position: "absolute",
								inset: 0,
								pointerEvents: "none",
								backgroundImage: `radial-gradient(${colors.dots} 1px, transparent 1px)`,
								backgroundSize: "18px 18px",
							}}
						/>
						<span
							style={{
								position: "absolute",
								top: 12,
								left: 16,
								fontFamily: "var(--font-mono)",
								fontSize: 10,
								letterSpacing: "0.2em",
								textTransform: "uppercase",
								color: colors.faint,
							}}
						>
							Live preview
						</span>
						<div style={{ position: "relative" }}>
							<Story />
						</div>
					</div>
				</div>
			);
		},
	],
};

export default preview;
