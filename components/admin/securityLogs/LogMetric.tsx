import React from 'react';
import { TrendingUp } from 'lucide-react';

const LogMetric = () => {
  const metrics = [
    {
      title: "Total Events Today",
      value: "156"
    },
    {
      title: "Failed Login Attempts",
      value: "2,000"
    },
    {
      title: "Permission Changes This Week",
      value: "2,000"
    },
    {
      title: "New Devices Logged In",
      value: "2,000"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-2xl py-8 px-4 border border-gray-100">
            <div className="mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-gray-800 text-sm font-medium mb-3">
              {metric.title}
            </h3>
            <p className="text-4xl font-bold text-gray-900">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogMetric;