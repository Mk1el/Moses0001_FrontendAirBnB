// src/components/DashboardWidget.tsx
import React from "react";

interface WidgetItem {
  title: string;
  value: string | number;
  color?: string;
}

interface DashboardWidgetProps {
  items: WidgetItem[];
  className?: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ items, className }) => {
  return (
    <section className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 ${className}`}>
      {items.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <span className="text-gray-500 text-sm">{card.title}</span>
          <span className={`text-3xl font-bold mt-2 ${card.color || "text-gray-700"}`}>
            {card.value}
          </span>
        </div>
      ))}
    </section>
  );
};

export default DashboardWidget;
