// Tailwind CSS Dynamic Class Name Test Fixtures (TW05)

// Violation: String interpolation constructs partial class names, breaking Tailwind scanner
export function DynamicClassInterpolationViolation({ color }) {
  return <div className={`text-${color}-500 p-4`}>Dynamic text color</div>;
}

// Safe Counterpart: Static class map allowing complete utility strings for scanner discovery
const COLOR_MAP = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500"
};

export function SafeStaticClassMap({ color }) {
  const colorClass = COLOR_MAP[color] || "text-gray-500";
  return <div className={`${colorClass} p-4`}>Static text color</div>;
}

