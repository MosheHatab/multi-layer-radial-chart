const PREFIX = "[radial-eslint]";
const DEFAULT_IGNORE = [0, 1, -1];

/**
 * Tests, Storybook stories and the demo relax the numeric rule
 * (mirrors the overrides in eslint.config.js). Uses forward slashes
 * for cross-platform path checks.
 */
function isRelaxedPath(context) {
	const raw = context.getFilename?.();
	if (!raw || raw === "<text>") {
		return false;
	}
	const posix = raw.replace(/\\/g, "/");
	if (posix.includes("/tests/") || posix.includes("/demo/")) {
		return true;
	}
	return /\.stories\.tsx?$/i.test(posix);
}

const noMagicNumbers = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"Disallow magic numbers in function logic. Style/JSX values, const declarations, enum/type positions, array indexes and default values are allowed.",
		},
		schema: [
			{
				type: "object",
				properties: {
					ignore: { type: "array", items: { type: "number" } },
				},
				additionalProperties: false,
			},
		],
		messages: {
			noMagicNumber: `${PREFIX} No magic number: {{value}}. Extract it to a named constant (e.g. in core/constants.ts).`,
		},
	},
	create(context) {
		if (isRelaxedPath(context)) {
			return {};
		}
		const options = context.options[0] || {};
		const ignore = new Set(options.ignore || DEFAULT_IGNORE);

		function isInsideStyleOrJsx(node) {
			let current = node.parent;
			while (current) {
				if (current.type === "JSXAttribute" || current.type === "JSXExpressionContainer") {
					return true;
				}
				if (current.type === "Property" || current.type === "ObjectExpression") {
					return true;
				}
				current = current.parent;
			}
			return false;
		}

		function isConstDeclaration(node) {
			// Allow `const X = 90` and `const X = -90` (unary-negated literal).
			const target = node.parent.type === "UnaryExpression" ? node.parent : node;
			const parent = target.parent;
			if (parent.type === "VariableDeclarator" && parent.init === target) {
				const declaration = parent.parent;
				if (declaration.type === "VariableDeclaration" && declaration.kind === "const") {
					return true;
				}
			}
			return false;
		}

		function isEnumOrType(node) {
			let current = node.parent;
			while (current) {
				if (
					current.type === "TSEnumMember" ||
					current.type === "TSTypeAnnotation" ||
					current.type === "TSLiteralType" ||
					current.type === "TSIndexedAccessType"
				) {
					return true;
				}
				current = current.parent;
			}
			return false;
		}

		function isArrayIndex(node) {
			const parent = node.parent;
			return parent.type === "MemberExpression" && parent.computed && parent.property === node;
		}

		function isDefaultValue(node) {
			const parent = node.parent;
			return parent.type === "AssignmentPattern" && parent.right === node;
		}

		function isUnaryNegative(node) {
			return node.parent.type === "UnaryExpression" && node.parent.operator === "-";
		}

		return {
			Literal(node) {
				if (typeof node.value !== "number") {
					return;
				}
				if (ignore.has(node.value)) {
					return;
				}
				if (isUnaryNegative(node) && ignore.has(-node.value)) {
					return;
				}
				if (isConstDeclaration(node)) {
					return;
				}
				if (isInsideStyleOrJsx(node)) {
					return;
				}
				if (isEnumOrType(node)) {
					return;
				}
				if (isArrayIndex(node)) {
					return;
				}
				if (isDefaultValue(node)) {
					return;
				}

				context.report({
					node,
					messageId: "noMagicNumber",
					data: { value: String(node.value) },
				});
			},
		};
	},
};

export default {
	rules: {
		"no-magic-numbers": noMagicNumbers,
	},
};
