import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Пример данных — замените на реальные данные
const dataSets = [
  {
    name: "нос - левый глаз",
    color: "#ff0000",
    points: [
      { x: 230, y: 150 },
      { x: 235, y: 148 },
      { x: 240, y: 147 },
    ],
  },
  {
    name: "нос - правый глаз",
    color: "#ffa500",
    points: [
      { x: 240, y: 150 },
      { x: 245, y: 148 },
      { x: 250, y: 147 },
    ],
  },
  // Добавьте другие траектории здесь
];

// Преобразуем все точки в один плоский массив с ключами для Recharts
const allPoints = {};
dataSets.forEach((set, index) => {
  set.points.forEach((point, i) => {
    if (!allPoints[i]) allPoints[i] = { index: i };
    allPoints[i][`line${index}`] = point.y;
    allPoints[i][`x${index}`] = point.x;
  });
});

export const MovementChart = () => {
  return (
    <LineChart
      width={800}
      height={500}
      data={Object.values(allPoints)}
      margin={{ top: 20, right: 100, left: 20, bottom: 20 }}
    >
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="x0" name="X" type="number" />
      <YAxis type="number" reversed={true} />
      <Tooltip />
      <Legend />
      {dataSets.map((set, idx) => (
        <Line
          key={idx}
          type="monotone"
          dataKey={`line${idx}`}
          name={set.name}
          stroke={set.color}
          dot={false}
        />
      ))}
    </LineChart>
  );
};