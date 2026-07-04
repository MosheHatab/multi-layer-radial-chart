import { type JSX, type ReactNode, useMemo, useState } from "react";
import { Activity, ExternalLink, Moon, RefreshCw, Sun } from "lucide-react";

import { RadialChart } from "../src";
import type { RadialDatum, RingPattern } from "../src";

type ThemeMode = "dark" | "light";

interface Metric {
	readonly label: string;
	readonly value: number;
	readonly max: number;
	readonly color: string;
	readonly pattern: RingPattern;
}

interface ThemeTokens {
	readonly page: string;
	readonly card: string;
	readonly muted: string;
	readonly input: string;
	readonly chip: string;
	readonly chipActive: string;
	readonly divider: string;
}

const INITIAL_METRICS: Metric[] = [
	{ label: "Move", value: 82, max: 100, color: "#fb2576", pattern: "solid" },
	{ label: "Exercise", value: 45, max: 60, color: "#22d3ee", pattern: "solid" },
	{ label: "Stand", value: 9, max: 12, color: "#a3e635", pattern: "solid" },
];

const LAYOUT_PRESETS = [
	{ label: "Rings", maxSweepDegrees: 360, startAngle: -90 },
	{ label: "Gauge", maxSweepDegrees: 270, startAngle: 135 },
	{ label: "Semi", maxSweepDegrees: 180, startAngle: 180 },
];

const THEMES: Record<ThemeMode, ThemeTokens> = {
	dark: {
		page: "bg-slate-950 text-slate-100",
		card: "border-slate-800 bg-slate-900/60",
		muted: "text-slate-400",
		input: "border-slate-700 bg-slate-800 text-slate-100",
		chip: "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700",
		chipActive: "border-cyan-500 bg-cyan-500/15 text-cyan-300",
		divider: "border-slate-800",
	},
	light: {
		page: "bg-slate-50 text-slate-900",
		card: "border-slate-200 bg-white",
		muted: "text-slate-500",
		input: "border-slate-300 bg-white text-slate-900",
		chip: "border-slate-300 bg-white text-slate-600 hover:bg-slate-100",
		chipActive: "border-cyan-500 bg-cyan-500/10 text-cyan-700",
		divider: "border-slate-200",
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

	const tokens = THEMES[theme];
	const isFullCircle = maxSweepDegrees === 360;

	const data = useMemo<RadialDatum[]>(
		() =>
			metrics.map((metric) => ({
				label: metric.label,
				value: metric.value,
				max: metric.max,
				color: metric.color,
				trackColor: withAlpha(metric.color, theme === "dark" ? 0.16 : 0.12),
				pattern: metric.pattern,
			})),
		[metrics, theme],
	);

	const totalPercent = useMemo(() => {
		const sum = metrics.reduce((acc, metric) => acc + metric.value / metric.max, 0);
		return Math.round((sum / metrics.length) * 100);
	}, [metrics]);

	const setValue = (index: number, value: number): void => {
		setMetrics((current) =>
			current.map((metric, position) => (position === index ? { ...metric, value } : metric)),
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
		setMetrics((current) => current.map((metric) => ({ ...metric, value: randomValue(metric.max) })));
	};

	const applyPreset = (preset: (typeof LAYOUT_PRESETS)[number]): void => {
		setMaxSweepDegrees(preset.maxSweepDegrees);
		setStartAngle(preset.startAngle);
	};

	return (
		<div
			className={`min-h-screen transition-colors duration-300 ${tokens.page}`}
			style={{ colorScheme: theme }}
		>
			<div className="mx-auto max-w-5xl px-6 py-12">
				<header className="mb-10 flex flex-col gap-3">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-sm font-medium text-cyan-500">
							<Activity className="h-5 w-5" aria-hidden="true" />
							<span>multi-layer-radial-chart</span>
						</div>
						<ThemeToggle theme={theme} tokens={tokens} onChange={setTheme} />
					</div>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Animated activity rings for React
					</h1>
					<p className={`max-w-2xl ${tokens.muted}`}>
						A lightweight, dependency-free React 19 + TypeScript library rendering concentric
						progress rings with pure SVG. Every control below maps directly to a component prop.
					</p>
					<a
						className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors duration-200 ${tokens.chip}`}
						href="https://github.com/MosheHatab/multi-layer-radial-chart"
						target="_blank"
						rel="noreferrer"
					>
						<ExternalLink className="h-4 w-4" aria-hidden="true" />
						View on GitHub
					</a>
				</header>

				<main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
					<section
						className={`flex items-center justify-center rounded-2xl border p-8 ${tokens.card}`}
					>
						<RadialChart
							data={data}
							size={size}
							gap={gap}
							ringWidth={autoRingWidth ? undefined : ringWidth}
							startAngle={startAngle}
							maxSweepDegrees={maxSweepDegrees}
							rounded={rounded}
							clockwise={clockwise}
							animate={animate}
							animationDurationMs={animationDurationMs}
							showLegend={showLegend}
							showTooltip={showTooltip}
						>
							{isFullCircle ? (
								<div className="flex flex-col items-center">
									<span className="text-4xl font-bold">{totalPercent}%</span>
									<span className={`text-xs uppercase tracking-wide ${tokens.muted}`}>
										Average
									</span>
								</div>
							) : null}
						</RadialChart>
					</section>

					<aside className={`flex flex-col gap-5 rounded-2xl border p-6 ${tokens.card}`}>
						<Section title="Data" tokens={tokens} muted={tokens.muted}>
							<div className="mb-1 flex justify-end">
								<button
									type="button"
									onClick={shuffle}
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
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
												className="h-3 w-3 rounded-full"
												style={{ backgroundColor: metric.color }}
												aria-hidden="true"
											/>
											{metric.label}
										</span>
										<span className="flex items-center gap-2">
											<span className={`tabular-nums ${tokens.muted}`}>
												{metric.value}/{metric.max}
											</span>
											<button
												type="button"
												onClick={() => togglePattern(index)}
												aria-pressed={metric.pattern === "dashed"}
												className={`cursor-pointer rounded border px-1.5 py-0.5 text-[11px] transition-colors duration-200 ${
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
										className="cursor-pointer accent-cyan-500"
										aria-label={`${metric.label} value`}
									/>
								</div>
							))}
						</Section>

						<Divider className={tokens.divider} />

						<Section title="Layout" tokens={tokens} muted={tokens.muted}>
							<div className="flex gap-2">
								{LAYOUT_PRESETS.map((preset) => {
									const active = preset.maxSweepDegrees === maxSweepDegrees;
									return (
										<button
											type="button"
											key={preset.label}
											onClick={() => applyPreset(preset)}
											aria-pressed={active}
											className={`flex-1 cursor-pointer rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-200 ${
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

						<Divider className={tokens.divider} />

						<Section title="Behavior" tokens={tokens} muted={tokens.muted}>
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

						<Divider className={tokens.divider} />

						<Section title="Display" tokens={tokens} muted={tokens.muted}>
							<Toggle label="Show legend" checked={showLegend} onChange={setShowLegend} />
							<Toggle label="Show tooltip" checked={showTooltip} onChange={setShowTooltip} />
						</Section>
					</aside>
				</main>
			</div>
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
		<div className={`flex items-center gap-1 rounded-lg border p-1 ${tokens.card}`} role="group">
			{options.map((option) => {
				const active = option.value === theme;
				return (
					<button
						type="button"
						key={option.value}
						onClick={() => onChange(option.value)}
						aria-pressed={active}
						title={option.label}
						className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
							active ? "bg-cyan-500 text-slate-950" : `${tokens.muted} hover:text-cyan-500`
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
	readonly title: string;
	readonly tokens: ThemeTokens;
	readonly muted: string;
	readonly children: ReactNode;
}

function Section(props: SectionProps): JSX.Element {
	const { title, muted, children } = props;
	return (
		<div className="flex flex-col gap-3">
			<h3 className={`text-xs font-semibold uppercase tracking-wide ${muted}`}>{title}</h3>
			{children}
		</div>
	);
}

interface DividerProps {
	readonly className: string;
}

function Divider(props: DividerProps): JSX.Element {
	return <hr className={`border-t ${props.className}`} />;
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
				<span className="tabular-nums opacity-70">
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
				className="cursor-pointer accent-cyan-500 disabled:cursor-not-allowed"
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
				className="h-4 w-4 cursor-pointer accent-cyan-500"
			/>
		</label>
	);
}
