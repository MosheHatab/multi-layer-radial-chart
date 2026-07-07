import { type CSSProperties, type JSX, type ReactNode, useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Moon, RefreshCw, Sun } from "lucide-react";

import { RadialChart, useCountUp } from "../src";
import type { RadialDatum, RingPattern } from "../src";

type ThemeMode = "dark" | "light";

interface Metric {
	readonly label: string;
	readonly value: number;
	readonly max: number;
	readonly color: string;
	readonly colorTo: string;
	readonly gradient: boolean;
	readonly pattern: RingPattern;
}

interface ThemeTokens {
	readonly page: string;
	readonly muted: string;
	readonly faint: string;
	readonly frame: string;
	readonly surface: string;
	readonly input: string;
	readonly chip: string;
	readonly chipActive: string;
	readonly dots: string;
	readonly codeBg: string;
	readonly codeText: string;
	readonly track: string;
}

const INITIAL_METRICS: Metric[] = [
	{
		label: "Move",
		value: 82,
		max: 100,
		color: "#fb2576",
		colorTo: "#8b5cf6",
		gradient: false,
		pattern: "solid",
	},
	{
		label: "Exercise",
		value: 45,
		max: 60,
		color: "#22d3ee",
		colorTo: "#3b82f6",
		gradient: false,
		pattern: "solid",
	},
	{
		label: "Stand",
		value: 58.31,
		max: 100,
		color: "#a3e635",
		colorTo: "#16a34a",
		gradient: false,
		pattern: "solid",
	},
];

const GRADIENT_ANGLE = 90;

const LAYOUT_PRESETS = [
	{ label: "Rings", maxSweepDegrees: 360, startAngle: -90 },
	{ label: "Gauge", maxSweepDegrees: 270, startAngle: 135 },
	{ label: "Semi", maxSweepDegrees: 180, startAngle: 180 },
];

const META_TAGS = ["React 19", "TypeScript", "Zero deps", "Pure SVG", "MIT"];

const THEMES: Record<ThemeMode, ThemeTokens> = {
	dark: {
		page: "bg-[#0b0b0f] text-stone-100",
		muted: "text-stone-400",
		faint: "text-stone-500",
		frame: "border-white/12",
		surface: "bg-white/[0.02]",
		input: "border-white/12 bg-white/[0.03] text-stone-100",
		chip: "border-white/12 text-stone-300 hover:border-white/40 hover:text-white",
		chipActive: "border-brand bg-brand/10 text-brand",
		dots: "text-white/[0.05]",
		codeBg: "bg-black/40",
		codeText: "text-stone-300",
		track: "rgba(245, 245, 244, 0.14)",
	},
	light: {
		page: "bg-[#f4f3ee] text-stone-900",
		muted: "text-stone-600",
		faint: "text-stone-500",
		frame: "border-stone-300",
		surface: "bg-white",
		input: "border-stone-300 bg-white text-stone-900",
		chip: "border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900",
		chipActive: "border-brand bg-brand/10 text-brand",
		dots: "text-black/[0.06]",
		codeBg: "bg-stone-900",
		codeText: "text-stone-300",
		track: "rgba(24, 24, 27, 0.16)",
	},
};

function withAlpha(hexColor: string, alpha: number): string {
	const normalized = hexColor.replace("#", "");
	const red = parseInt(normalized.slice(0, 2), 16);
	const green = parseInt(normalized.slice(2, 4), 16);
	const blue = parseInt(normalized.slice(4, 6), 16);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function randomValue(max: number): number {
	return Math.round(Math.random() * max);
}

function useCopy(): readonly [boolean, (text: string) => void] {
	const [copied, setCopied] = useState(false);
	const copy = (text: string): void => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				setCopied(true);
				window.setTimeout(() => setCopied(false), 1500);
			})
			.catch(() => {
				/* Clipboard API unavailable (e.g. insecure context) - ignore. */
			});
	};
	return [copied, copy] as const;
}

/** Tracks the user's `prefers-reduced-motion` setting (SSR-safe, with cleanup). */
function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = useState<boolean>(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return false;
		}
		return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	});
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return;
		}
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const handleChange = (event: MediaQueryListEvent): void => setReduced(event.matches);
		query.addEventListener("change", handleChange);
		return () => query.removeEventListener("change", handleChange);
	}, []);
	return reduced;
}

interface SnippetConfig {
	metrics: readonly Metric[];
	size: number;
	gap: number;
	autoRingWidth: boolean;
	ringWidth: number;
	startAngle: number;
	maxSweepDegrees: number;
	rounded: boolean;
	clockwise: boolean;
	animate: boolean;
	animationDurationMs: number;
	showLegend: boolean;
	showTooltip: boolean;
	percentDecimals: number;
}

function buildSnippet(config: SnippetConfig): string {
	const dataLines = config.metrics
		.map((metric) => {
			const fields = [
				`label: ${JSON.stringify(metric.label)}`,
				`value: ${metric.value}`,
				`max: ${metric.max}`,
				`color: ${JSON.stringify(metric.color)}`,
			];
			if (metric.pattern === "dashed") {
				fields.push(`pattern: "dashed"`);
			}
			if (metric.gradient) {
				const stops = `[{ offset: 0, color: ${JSON.stringify(metric.color)} }, { offset: 1, color: ${JSON.stringify(metric.colorTo)} }]`;
				fields.push(`gradient: { type: "linear", angle: ${GRADIENT_ANGLE}, stops: ${stops} }`);
			}
			return `  { ${fields.join(", ")} },`;
		})
		.join("\n");

	const props = [
		`  data={data}`,
		`  size={${config.size}}`,
		`  gap={${config.gap}}`,
		config.autoRingWidth ? null : `  ringWidth={${config.ringWidth}}`,
		`  startAngle={${config.startAngle}}`,
		`  maxSweepDegrees={${config.maxSweepDegrees}}`,
		`  rounded={${config.rounded}}`,
		`  clockwise={${config.clockwise}}`,
		`  animate={${config.animate}}`,
		`  animationDurationMs={${config.animationDurationMs}}`,
		`  showLegend={${config.showLegend}}`,
		config.showLegend && config.percentDecimals > 0
			? `  percentDecimals={${config.percentDecimals}}`
			: null,
		`  showTooltip={${config.showTooltip}}`,
	].filter((line): line is string => line !== null);

	return `import { RadialChart } from "multi-layer-radial-chart";
import "multi-layer-radial-chart/styles.css";

const data = [
${dataLines}
];

<RadialChart
${props.join("\n")}
/>`;
}

export function App(): JSX.Element {
	const [metrics, setMetrics] = useState<Metric[]>(INITIAL_METRICS);
	const [theme, setTheme] = useState<ThemeMode>("dark");

	const [size, setSize] = useState(320);
	const [gap, setGap] = useState(6);
	const [autoRingWidth, setAutoRingWidth] = useState(true);
	const [ringWidth, setRingWidth] = useState(24);
	const [startAngle, setStartAngle] = useState(-90);
	const [maxSweepDegrees, setMaxSweepDegrees] = useState(360);

	const [rounded, setRounded] = useState(true);
	const [clockwise, setClockwise] = useState(true);
	const [animate, setAnimate] = useState(true);
	const [animationDurationMs, setAnimationDurationMs] = useState(900);

	const [showLegend, setShowLegend] = useState(true);
	const [showTooltip, setShowTooltip] = useState(true);
	const [percentDecimals, setPercentDecimals] = useState(0);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [eventMessage, setEventMessage] = useState<string | null>(null);

	const tokens = THEMES[theme];
	const isFullCircle = maxSweepDegrees === 360;
	const prefersReducedMotion = usePrefersReducedMotion();
	const effectiveAnimate = animate && !prefersReducedMotion;

	const snippet = useMemo(
		() =>
			buildSnippet({
				metrics,
				size,
				gap,
				autoRingWidth,
				ringWidth,
				startAngle,
				maxSweepDegrees,
				rounded,
				clockwise,
				animate,
				animationDurationMs,
				showLegend,
				showTooltip,
				percentDecimals,
			}),
		[
			metrics,
			size,
			gap,
			autoRingWidth,
			ringWidth,
			startAngle,
			maxSweepDegrees,
			rounded,
			clockwise,
			animate,
			animationDurationMs,
			showLegend,
			showTooltip,
			percentDecimals,
		],
	);

	const data = useMemo<RadialDatum[]>(
		() =>
			metrics.map((metric) => ({
				label: metric.label,
				value: metric.value,
				max: metric.max,
				color: metric.color,
				trackColor: withAlpha(metric.color, theme === "dark" ? 0.16 : 0.12),
				pattern: metric.pattern,
				gradient: metric.gradient
					? {
							type: "linear",
							angle: GRADIENT_ANGLE,
							stops: [
								{ offset: 0, color: metric.color },
								{ offset: 1, color: metric.colorTo },
							],
						}
					: undefined,
			})),
		[metrics, theme],
	);

	const totalPercent = useMemo(() => {
		const sum = metrics.reduce((acc, metric) => acc + metric.value / metric.max, 0);
		return Math.round((sum / metrics.length) * 100);
	}, [metrics]);

	const animatedPercent = useCountUp(totalPercent, {
		durationMs: animationDurationMs,
		animate: effectiveAnimate,
	});

	const setValue = (index: number, value: number): void => {
		setMetrics((current) =>
			current.map((metric, position) => (position === index ? { ...metric, value } : metric)),
		);
	};

	const setColor = (index: number, color: string): void => {
		setMetrics((current) =>
			current.map((metric, position) => (position === index ? { ...metric, color } : metric)),
		);
	};

	const setColorTo = (index: number, colorTo: string): void => {
		setMetrics((current) =>
			current.map((metric, position) => (position === index ? { ...metric, colorTo } : metric)),
		);
	};

	const toggleGradient = (index: number): void => {
		setMetrics((current) =>
			current.map((metric, position) =>
				position === index ? { ...metric, gradient: !metric.gradient } : metric,
			),
		);
	};

	const togglePattern = (index: number): void => {
		setMetrics((current) =>
			current.map((metric, position) =>
				position === index
					? { ...metric, pattern: metric.pattern === "dashed" ? "solid" : "dashed" }
					: metric,
			),
		);
	};

	const shuffle = (): void => {
		setMetrics((current) =>
			current.map((metric) => ({ ...metric, value: randomValue(metric.max) })),
		);
	};

	const applyPreset = (preset: (typeof LAYOUT_PRESETS)[number]): void => {
		setMaxSweepDegrees(preset.maxSweepDegrees);
		setStartAngle(preset.startAngle);
	};

	const pageStyle = {
		colorScheme: theme,
		"--slider-track": tokens.track,
	} as CSSProperties;

	return (
		<div
			className={`min-h-screen transition-colors duration-300 motion-reduce:transition-none ${tokens.page}`}
			style={pageStyle}
		>
			<div className="mx-auto max-w-5xl px-6 py-10 sm:py-16 2xl:max-w-7xl">
				<header className="mb-12">
					<div className="mb-10 flex items-center justify-between gap-4">
						<div className="flex items-center gap-2.5">
							<span className="h-3.5 w-3.5 bg-brand" aria-hidden="true" />
							<span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${tokens.muted}`}>
								multi-layer-radial-chart
							</span>
						</div>
						<ThemeToggle theme={theme} tokens={tokens} onChange={setTheme} />
					</div>

					<h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
						Radial charts,
						<br />
						<span className="text-brand">engineered</span> in pure SVG.
					</h1>

					<p className={`mt-6 max-w-xl text-base leading-relaxed ${tokens.muted}`}>
						A lightweight, dependency-free React 19 + TypeScript library rendering concentric
						progress rings. Every control below maps directly to a component prop.
					</p>

					<div
						className={`mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-widest ${tokens.faint}`}
					>
						{META_TAGS.map((tag, index) => (
							<span key={tag} className="flex items-center gap-3">
								{index > 0 ? <span aria-hidden="true">/</span> : null}
								{tag}
							</span>
						))}
					</div>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
						<InstallCommand tokens={tokens} />
						<a
							className={`inline-flex w-fit items-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200 ${tokens.chip}`}
							href="https://github.com/MosheHatab/multi-layer-radial-chart"
							target="_blank"
							rel="noreferrer"
						>
							<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
							GitHub
						</a>
					</div>
				</header>

				<main
					className={`grid border ${tokens.frame} lg:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_720px]`}
				>
					<section className="relative flex min-h-[24rem] items-center justify-center overflow-hidden p-8">
						<div
							aria-hidden="true"
							className={`pointer-events-none absolute inset-0 ${tokens.dots}`}
							style={{
								backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
								backgroundSize: "18px 18px",
							}}
						/>
						<span
							className={`absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.2em] ${tokens.faint}`}
						>
							Live preview
						</span>
						<div className="relative">
							<RadialChart
								data={data}
								size={size}
								gap={gap}
								ringWidth={autoRingWidth ? undefined : ringWidth}
								startAngle={startAngle}
								maxSweepDegrees={maxSweepDegrees}
								rounded={rounded}
								clockwise={clockwise}
								animate={effectiveAnimate}
								animationDurationMs={animationDurationMs}
								showLegend={showLegend}
								percentDecimals={percentDecimals}
								showTooltip={showTooltip}
								onSegmentClick={(datum, index) => {
									setSelectedIndex(index);
									setEventMessage(`Clicked ${datum.label} — ${datum.value}/${datum.max}`);
								}}
								onSegmentHover={(datum, index) => {
									setHoveredIndex(index);
									setEventMessage(`Hovering ${datum.label} — ${datum.value}/${datum.max}`);
								}}
								onSegmentLeave={(datum) => {
									setHoveredIndex(null);
									setEventMessage(`Left ${datum.label}`);
								}}
							>
								{isFullCircle ? (
									<div className="flex flex-col items-center">
										<span className="font-mono text-4xl font-semibold tabular-nums">
											{animatedPercent}%
										</span>
										<span
											className={`font-mono text-[10px] uppercase tracking-[0.2em] ${tokens.faint}`}
										>
											Average
										</span>
									</div>
								) : null}
							</RadialChart>
							<p
								className={`mt-4 text-center font-mono text-[11px] uppercase tracking-wider ${
									eventMessage ? "text-brand" : tokens.faint
								}`}
								aria-live="polite"
							>
								{eventMessage ?? "Hover or click a ring to fire events"}
							</p>
						</div>
					</section>

					<aside
						className={`border-t lg:border-l lg:border-t-0 2xl:grid 2xl:grid-cols-2 2xl:content-start ${tokens.frame}`}
					>
						<Section index="01" title="Data" tokens={tokens} withDivider={false}>
							<div className="mb-1 flex items-center justify-between gap-2">
								<span className={`font-mono text-[10px] uppercase tracking-wider ${tokens.faint}`}>
									Click a ring to select · <br />
									hover to highlight
								</span>
								<button
									type="button"
									onClick={shuffle}
									className="inline-flex cursor-pointer items-center gap-1.5 bg-brand px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
								>
									<RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
									Randomize
								</button>
							</div>
							{metrics.map((metric, index) => (
								<div className="flex flex-col gap-1.5" key={metric.label}>
									<div className="flex items-center justify-between text-sm">
										<span className="flex items-center gap-2">
											<span
												className={`inline-flex h-5 w-5 items-center justify-center border ${tokens.frame}`}
											>
												<input
													type="color"
													value={metric.color}
													onChange={(event) => setColor(index, event.target.value)}
													className="swatch h-full w-full"
													aria-label={`${metric.label} color`}
													title="Ring color"
												/>
											</span>
											{metric.gradient ? (
												<span
													className={`inline-flex h-5 w-5 items-center justify-center border ${tokens.frame}`}
												>
													<input
														type="color"
														value={metric.colorTo}
														onChange={(event) => setColorTo(index, event.target.value)}
														className="swatch h-full w-full"
														aria-label={`${metric.label} gradient end color`}
														title="Gradient end color"
													/>
												</span>
											) : null}
											<span
												className={
													selectedIndex === index
														? "font-semibold text-brand"
														: hoveredIndex === index
															? "text-brand underline decoration-brand underline-offset-4"
															: undefined
												}
											>
												{metric.label}
											</span>
										</span>
										<span className="flex items-center gap-2">
											<span className={`font-mono tabular-nums ${tokens.muted}`}>
												{metric.value}/{metric.max}
											</span>
											<button
												type="button"
												onClick={() => toggleGradient(index)}
												aria-pressed={metric.gradient}
												className={`cursor-pointer border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 ${
													metric.gradient ? tokens.chipActive : tokens.chip
												}`}
											>
												Grad
											</button>
											<button
												type="button"
												onClick={() => togglePattern(index)}
												aria-pressed={metric.pattern === "dashed"}
												className={`cursor-pointer border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200 ${
													metric.pattern === "dashed" ? tokens.chipActive : tokens.chip
												}`}
											>
												Dashed
											</button>
										</span>
									</div>
									<input
										type="range"
										min={0}
										max={metric.max}
										value={metric.value}
										onChange={(event) => setValue(index, Number(event.target.value))}
										className="slider"
										aria-label={`${metric.label} value`}
									/>
								</div>
							))}
						</Section>

						<Section
							index="02"
							title="Layout"
							tokens={tokens}
							className={`2xl:border-t-0 2xl:border-l ${tokens.frame}`}
						>
							<div className="flex gap-2">
								{LAYOUT_PRESETS.map((preset) => {
									const active = preset.maxSweepDegrees === maxSweepDegrees;
									return (
										<button
											type="button"
											key={preset.label}
											onClick={() => applyPreset(preset)}
											aria-pressed={active}
											className={`flex-1 cursor-pointer border px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 ${
												active ? tokens.chipActive : tokens.chip
											}`}
										>
											{preset.label}
										</button>
									);
								})}
							</div>
							<RangeControl
								label="Size"
								value={size}
								min={140}
								max={480}
								step={10}
								suffix="px"
								onChange={setSize}
							/>
							<RangeControl
								label="Gap"
								value={gap}
								min={0}
								max={32}
								suffix="px"
								onChange={setGap}
							/>
							<div className="flex flex-col gap-1.5">
								<Toggle
									label="Auto ring width"
									checked={autoRingWidth}
									onChange={setAutoRingWidth}
								/>
								<RangeControl
									label="Ring width"
									value={ringWidth}
									min={4}
									max={60}
									suffix="px"
									disabled={autoRingWidth}
									onChange={setRingWidth}
								/>
							</div>
							<RangeControl
								label="Start angle"
								value={startAngle}
								min={-180}
								max={180}
								suffix="°"
								onChange={setStartAngle}
							/>
							<RangeControl
								label="Max sweep"
								value={maxSweepDegrees}
								min={90}
								max={360}
								step={10}
								suffix="°"
								onChange={setMaxSweepDegrees}
							/>
						</Section>

						<Section index="03" title="Behavior" tokens={tokens}>
							<Toggle label="Rounded caps" checked={rounded} onChange={setRounded} />
							<Toggle label="Clockwise" checked={clockwise} onChange={setClockwise} />
							<Toggle label="Animate" checked={animate} onChange={setAnimate} />
							<RangeControl
								label="Animation duration"
								value={animationDurationMs}
								min={0}
								max={2000}
								step={50}
								suffix="ms"
								disabled={!animate}
								onChange={setAnimationDurationMs}
							/>
						</Section>

						<Section
							index="04"
							title="Display"
							tokens={tokens}
							className={`2xl:border-l ${tokens.frame}`}
						>
							<Toggle label="Show legend" checked={showLegend} onChange={setShowLegend} />
							<RangeControl
								label="Legend decimals"
								value={percentDecimals}
								min={0}
								max={4}
								suffix="dp"
								disabled={!showLegend}
								onChange={setPercentDecimals}
							/>
							<Toggle label="Show tooltip" checked={showTooltip} onChange={setShowTooltip} />
						</Section>
					</aside>
				</main>

				<CodePanel code={snippet} tokens={tokens} />
			</div>
		</div>
	);
}

interface InstallCommandProps {
	readonly tokens: ThemeTokens;
}

function InstallCommand(props: InstallCommandProps): JSX.Element {
	const { tokens } = props;
	const [copied, copy] = useCopy();
	const command = "npm i multi-layer-radial-chart";
	return (
		<div
			className={`flex items-center gap-3 border px-4 py-2.5 font-mono text-sm ${tokens.frame} ${tokens.surface}`}
		>
			<span className="text-brand" aria-hidden="true">
				$
			</span>
			<code className="flex-1">{command}</code>
			<button
				type="button"
				onClick={() => copy(command)}
				aria-label="Copy install command"
				className={`cursor-pointer transition-colors duration-200 ${copied ? "text-brand" : `${tokens.faint} hover:text-brand`}`}
			>
				{copied ? (
					<Check className="h-4 w-4" aria-hidden="true" />
				) : (
					<Copy className="h-4 w-4" aria-hidden="true" />
				)}
			</button>
		</div>
	);
}

interface CodePanelProps {
	readonly code: string;
	readonly tokens: ThemeTokens;
}

function CodePanel(props: CodePanelProps): JSX.Element {
	const { code, tokens } = props;
	const [copied, copy] = useCopy();
	return (
		<div className={`mt-6 border ${tokens.frame}`}>
			<div className={`flex items-center justify-between border-b px-4 py-2.5 ${tokens.frame}`}>
				<span className={`font-mono text-[11px] uppercase tracking-[0.18em] ${tokens.faint}`}>
					App.tsx
				</span>
				<button
					type="button"
					onClick={() => copy(code)}
					className={`inline-flex cursor-pointer items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 ${copied ? "text-brand" : `${tokens.muted} hover:text-brand`}`}
				>
					{copied ? (
						<Check className="h-3.5 w-3.5" aria-hidden="true" />
					) : (
						<Copy className="h-3.5 w-3.5" aria-hidden="true" />
					)}
					{copied ? "Copied" : "Copy"}
				</button>
			</div>
			<pre
				className={`overflow-x-auto p-4 font-mono text-[12px] leading-relaxed ${tokens.codeBg} ${tokens.codeText}`}
			>
				<code>{code}</code>
			</pre>
		</div>
	);
}

interface ThemeToggleProps {
	readonly theme: ThemeMode;
	readonly tokens: ThemeTokens;
	readonly onChange: (theme: ThemeMode) => void;
}

function ThemeToggle(props: ThemeToggleProps): JSX.Element {
	const { theme, tokens, onChange } = props;
	const options: ReadonlyArray<{ value: ThemeMode; icon: ReactNode; label: string }> = [
		{ value: "light", icon: <Sun className="h-4 w-4" aria-hidden="true" />, label: "Light" },
		{ value: "dark", icon: <Moon className="h-4 w-4" aria-hidden="true" />, label: "Dark" },
	];
	return (
		<div className={`flex items-center border ${tokens.frame}`} role="group">
			{options.map((option) => {
				const active = option.value === theme;
				return (
					<button
						type="button"
						key={option.value}
						onClick={() => onChange(option.value)}
						aria-pressed={active}
						title={option.label}
						className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand ${
							active ? "bg-brand text-white" : `${tokens.muted} hover:text-brand`
						}`}
					>
						{option.icon}
						{option.label}
					</button>
				);
			})}
		</div>
	);
}

interface SectionProps {
	readonly index: string;
	readonly title: string;
	readonly tokens: ThemeTokens;
	readonly withDivider?: boolean;
	readonly className?: string;
	readonly children: ReactNode;
}

function Section(props: SectionProps): JSX.Element {
	const { index, title, tokens, withDivider = true, className = "", children } = props;
	return (
		<div
			className={`flex flex-col gap-3 p-6 ${withDivider ? `border-t ${tokens.frame}` : ""} ${className}`}
		>
			<h3 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">
				<span className="text-brand">{index}</span>
				<span className={tokens.faint}>/</span>
				<span>{title}</span>
			</h3>
			{children}
		</div>
	);
}

interface RangeControlProps {
	readonly label: string;
	readonly value: number;
	readonly min: number;
	readonly max: number;
	readonly step?: number;
	readonly suffix?: string;
	readonly disabled?: boolean;
	readonly onChange: (value: number) => void;
}

function RangeControl(props: RangeControlProps): JSX.Element {
	const { label, value, min, max, step = 1, suffix = "", disabled = false, onChange } = props;
	return (
		<label className={`flex flex-col gap-1.5 text-sm ${disabled ? "opacity-40" : ""}`}>
			<span className="flex items-center justify-between">
				{label}
				<span className="font-mono tabular-nums opacity-70">
					{value}
					{suffix}
				</span>
			</span>
			<input
				aria-label={label}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				disabled={disabled}
				onChange={(event) => onChange(Number(event.target.value))}
				className="slider"
			/>
		</label>
	);
}

interface ToggleProps {
	readonly label: string;
	readonly checked: boolean;
	readonly onChange: (checked: boolean) => void;
}

function Toggle(props: ToggleProps): JSX.Element {
	const { label, checked, onChange } = props;
	return (
		<label className="flex cursor-pointer items-center justify-between text-sm">
			<span>{label}</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="h-4 w-4 cursor-pointer accent-[var(--color-brand)]"
			/>
		</label>
	);
}
