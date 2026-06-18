

const FOOTPRINT_CATEGORIES = [
  { max: 2, label: 'Low', emoji: '🟢', description: 'Below average carbon footprint' },
  { max: 5, label: 'Average', emoji: '🟡', description: 'Typical carbon footprint range' },
  { max: 10, label: 'High', emoji: '🟠', description: 'Above average carbon footprint' },
  { max: Infinity, label: 'Very High', emoji: '🔴', description: 'Significantly high carbon footprint' },
];

const getCategory = (tonnes) => {
  const match = FOOTPRINT_CATEGORIES.find((c) => tonnes < c.max);
  return match || FOOTPRINT_CATEGORIES[FOOTPRINT_CATEGORIES.length - 1];
};

const EmissionCard = ({ result }) => {
  if (!result) return null;

  const category = getCategory(result.annual_tonnes);

  return (
    <article className="gc-card" aria-labelledby="emission-card-title">
      <h3 id="emission-card-title" className="text-sm text-gray-600 mb-2">
        Annual Carbon Footprint
      </h3>

      <div className="mb-6">
        <div className="text-4xl font-bold text-gray-900" aria-label={`${(Number(result.annual_tonnes) || 0).toFixed(1)} tonnes CO2 equivalent per year`}>
          {(Number(result.annual_tonnes) || 0).toFixed(1)}
        </div>
        <div className="text-sm text-gray-600">tonnes CO₂e per year</div>
        <div className={`text-lg font-semibold mt-2 ${category.label === 'Low' ? 'text-green-600' : category.label === 'Average' ? 'text-yellow-600' : category.label === 'High' ? 'text-orange-600' : 'text-red-600'}`}>
          <span aria-hidden="true">{category.emoji}</span>
          <span>{category.label}</span>
          <span className="sr-only"> — {category.description}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div className="text-sm text-gray-600">Monthly</div>
          <div className="text-2xl font-bold text-gray-900">
            {(Number(result.monthly_kg) || 0).toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">kg CO₂e</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Confidence</div>
          <div className="text-lg font-semibold text-green-600">
            {result.confidence || 'High'}
          </div>
        </div>
      </div>

      {result.sources && Object.keys(result.sources).length > 0 && (
        <div className="border-t mt-4 pt-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Breakdown</h4>
          <ul className="space-y-2" aria-label="Emission sources breakdown">
            {Object.entries(result.sources).map(([source, amount]) => (
              <li key={source} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{source}</span>
                <span className="font-medium text-gray-900">
                  {((Number(amount) || 0) * 12 / 1000).toFixed(2)} t/year
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
};

export default EmissionCard;
