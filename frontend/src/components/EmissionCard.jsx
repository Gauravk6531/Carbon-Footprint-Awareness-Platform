import React from 'react';

const EmissionCard = ({ result }) => {
  if (!result) return null;

  const getCategory = (tonnes) => {
    if (tonnes < 2) return { label: '🟢 Low', color: 'text-green-600' };
    if (tonnes < 5) return { label: '🟡 Average', color: 'text-yellow-600' };
    if (tonnes < 10) return { label: '🟠 High', color: 'text-orange-600' };
    return { label: '🔴 Very High', color: 'text-red-600' };
  };

  const category = getCategory(result.annual_tonnes);

  return (
    <div className="card">
      <h3 className="text-sm text-gray-600 mb-2">Annual Carbon Footprint</h3>
      
      <div className="mb-6">
        <div className="text-4xl font-bold text-gray-900">
          {result.annual_tonnes.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600">tonnes CO₂e per year</div>
        <div className={`text-lg font-semibold mt-2 ${category.color}`}>
          {category.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div className="text-sm text-gray-600">Monthly</div>
          <div className="text-2xl font-bold text-gray-900">
            {result.monthly_kg.toFixed(0)}
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
          <div className="space-y-2">
            {Object.entries(result.sources).map(([source, amount]) => (
              <div key={source} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{source}</span>
                <span className="font-medium text-gray-900">
                  {(amount * 12 / 1000).toFixed(2)} t/year
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionCard;
