import React from 'react';
import './Graph.css'; // Импорт CSS файла
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts';

const KEYPOINT_DICT = {
  0: 'нос', 1: 'левый глаз', 2: 'правый глаз', 3: 'левое ухо', 4: 'правое ухо',
  5: 'левое плечо', 6: 'правое плечо', 7: 'левый локоть', 8: 'правый локоть',
  9: 'левое запястье', 10: 'правое запястье', 11: 'левое бедро', 12: 'правое бедро',
  13: 'левое колено', 14: 'правое колено', 15: 'левая лодыжка', 16: 'правая лодыжка'
};

const COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
];

function prepareSegments(data) {
  if (!data) return [];
  
  return Object.entries(data).map(([edge, [xs, ys]], index) => {
    const [p1, p2] = edge.split(',').map(Number);
    const length = Math.min(xs.length, ys.length);
    const points = [];

    for (let i = 0; i < length; i++) {
      points.push({ x: xs[i], y: ys[i] });
    }

    const segmentPoints = points.length >= 2
      ? [points[0], points[points.length - 1]]
      : points;

    return {
      id: edge,
      name: `${KEYPOINT_DICT[p1]} - ${KEYPOINT_DICT[p2]}`,
      data: segmentPoints,
      color: COLORS[index % COLORS.length],
    };
  });
}

function calculateMidlineData(data) {
  // Находим данные для плеч (5,6) и бедер (11,12)
  const shoulders = data['5,6'] || [[], []];
  const hips = data['11,12'] || [[], []];
  
  if (shoulders[0].length === 0 || hips[0].length === 0) {
    return null;
  }

  // Вычисляем средние точки для плеч и бедер
  const minLength = Math.min(
    shoulders[0].length, 
    hips[0].length,
    shoulders[1].length,
    hips[1].length
  );
  
  const midline = [[], []];
  const angles = [];
  const displacements = [];
  
  // Первая точка для расчета угла
  const x1_first = (shoulders[0][0] + shoulders[0][1]) / 2;
  const y1_first = (shoulders[1][0] + shoulders[1][1]) / 2;
  const x2_first = (hips[0][0] + hips[0][1]) / 2;
  const y2_first = (hips[1][0] + hips[1][1]) / 2;
  
  const theta_first = Math.atan2(y2_first - y1_first, x2_first - x1_first) * (180 / Math.PI);
  
  for (let i = 0; i < minLength; i += 2) {
    // Средняя точка плеч
    const shoulderMidX = (shoulders[0][i] + shoulders[0][i+1]) / 2;
    const shoulderMidY = (shoulders[1][i] + shoulders[1][i+1]) / 2;
    
    // Средняя точка бедер
    const hipMidX = (hips[0][i] + hips[0][i+1]) / 2;
    const hipMidY = (hips[1][i] + hips[1][i+1]) / 2;
    
    midline[0].push(shoulderMidX, hipMidX);
    midline[1].push(shoulderMidY, hipMidY);
    
    // Расчет угла для текущего отрезка
    const theta_new = Math.atan2(hipMidY - shoulderMidY, hipMidX - shoulderMidX) * (180 / Math.PI);
    angles.push(theta_new - theta_first);
    
    // Смещение по X
    const currentMidX = (shoulderMidX + hipMidX) / 2;
    const firstMidX = (x1_first + x2_first) / 2;
    displacements.push(currentMidX - firstMidX);
  }
  
  const maxAngle = Math.max(...angles.map(Math.abs)).toFixed(2);
  const avgAngle = (angles.reduce((a, b) => a + b, 0) / angles.length).toFixed(2);
  
  const leftDisplacement = Math.max(...displacements.filter(d => d > 0)).toFixed(2);
  const rightDisplacement = Math.abs(Math.min(...displacements.filter(d => d < 0))).toFixed(2);
  
  return {
    midline,
    maxAngle,
    avgAngle,
    leftDisplacement,
    rightDisplacement
  };
}

function getDiagnosis(maxAngle, avgAngle, leftDisplacement, rightDisplacement) {
  const dif = parseFloat(leftDisplacement) - parseFloat(rightDisplacement);
  const absDif = Math.abs(dif);
  
  let severity = '';
  let asymmetry = '';
  let direction = '';
  
  if (absDif < 4) {
    severity = 'Нарушения равновесия нет';
    asymmetry = 'Асимметрии нет';
  } else if (absDif < 10) {
    severity = 'Незначительные нарушения равновесия';
    asymmetry = 'Незначительная асимметрия';
  } else {
    severity = 'Сильные нарушения равновесия';
    asymmetry = 'Умеренная асимметрия';
  }
  
  if (dif < 0) {
    direction = 'вправо';
  } else if (dif > 0) {
    direction = 'влево';
  }
  
  return `${severity}, ${asymmetry} ${direction}`;
}

export const Graph = ({ data, number }) => {
  const segments = prepareSegments(data);
  const midlineData = calculateMidlineData(data);
  
  let diagnosis = '';
  let midlineInfo = null;
  
  if (midlineData) {
    diagnosis = getDiagnosis(
      midlineData.maxAngle,
      midlineData.avgAngle,
      midlineData.leftDisplacement,
      midlineData.rightDisplacement
    );
    
    midlineInfo = {
      maxAngle: midlineData.maxAngle,
      avgAngle: midlineData.avgAngle,
      leftDisplacement: midlineData.leftDisplacement,
      rightDisplacement: midlineData.rightDisplacement
    };
  }

  return (
    <div className="graph-container">
      <div className="legend-panel">
        <h3 className="legend-title">Видео №{number}</h3>
        
        {diagnosis && (
          <div className="diagnosis-box">
            <h4 className="section-title">Диагноз:</h4>
            <p>{diagnosis}</p>
          </div>
        )}
        
        {midlineInfo && (
          <div style={{ margin: '10px' }}>
            <h4 className="section-title">Средняя линия:</h4>
            <ul className="legend-list">
              <li className="legend-item">
                <span className="legend-detail">Макс. угол отклонения: {midlineInfo.maxAngle}°</span>
              </li>
              <li className="legend-item">
                <span className="legend-detail">Средний угол: {midlineInfo.avgAngle}°</span>
              </li>
              <li className="legend-item">
                <span className="legend-detail">Смещение влево: {midlineInfo.leftDisplacement} px</span>
              </li>
              <li className="legend-item">
                <span className="legend-detail">Смещение вправо: {midlineInfo.rightDisplacement} px</span>
              </li>
            </ul>
          </div>
        )}
        
        <div style={{ margin: '10px', display: 'flex', flexDirection: 'column' }}>
          <h4 className="section-title">Сегменты тела:</h4>
          <ul className="legend-list-1">
            {segments.map(segment => (
              <li key={segment.id} className="legend-item-1">
                <div className="color-marker" style={{ backgroundColor: segment.color }} />
                <span>{segment.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="X" />
            <YAxis type="number" dataKey="y" name="Y" reversed />
            <Tooltip />

            {segments.map(segment => (
              <Scatter
                key={segment.id}
                name={segment.name}
                data={segment.data}
                fill={segment.color}
                line
                stroke={segment.color}
                strokeWidth={2}
              />
            ))}

            {midlineData && (
              <Scatter
                name={`Средняя линия (max угол: ${midlineData.maxAngle}°)`}
                data={midlineData.midline[0].map((x, i) => ({ x, y: midlineData.midline[1][i] }))}
                fill="#8884d8"
                line
                stroke="#8884d8"
                strokeWidth={3}
              />
            )}

            <ReferenceLine x={0} stroke="#ccc" />
            <ReferenceLine y={0} stroke="#ccc" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


export const TwoGraphsView = ({ data1, data2, number1, number2 }) => {
  return (
    <div className="two-graphs-container">
      <Graph data={data1} number={number1} />
      <Graph data={data2} number={number2} />
    </div>
  );
};