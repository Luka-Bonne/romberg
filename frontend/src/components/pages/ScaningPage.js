import React, { useState } from "react";

import { Camera } from "../Camera/Camera";
import { Graph, TwoGraphsView } from "../Graph/Graph";
import { MovementChart } from "../MovementChart/MovementChart"

import "./styles/ScaningPage.css";


export const ScaningPage = () => {
  const [results, setResults] = useState({
    json1: null,
    json2: null,
    status: "idle" // 'idle' | 'processing' | 'success' | 'error'
  });
  const [activeTab, setActiveTab] = useState("camera");

  const handleProcessingComplete = async (result) => {
    try {
      setResults({
        json1: null,
        json2: null,
        status: "processing"
      });

      const [res1, res2] = await Promise.all([
        fetch(`http://localhost:8000${result.json1}`),
        fetch(`http://localhost:8000${result.json2}`)
      ]);

      if (!res1.ok || !res2.ok) throw new Error("Ошибка загрузки данных");

      const [json1, json2] = await Promise.all([
        res1.json(),
        res2.json()
      ]);

      setResults({
        json1,
        json2,
        status: "success"
      });
      
      setActiveTab("graph");
      
    } catch (error) {
      console.error("Ошибка:", error);
      setResults({
        json1: null,
        json2: null,
        status: "error"
      });
    }
  };

  return (
    <div id="scaning-page">
      <div className="tabs">
        <button className={`tab-button ${activeTab === "camera" ? "active" : ""}`} 
        onClick={() => setActiveTab("camera")}>
          Камера
        </button>
        <button className={`tab-button ${activeTab === "graph" ? "active" : ""}`}
        onClick={() => setActiveTab("graph")} disabled={results.status !== "success"}>
          График {results.status === "success" && "✓"}
        </button>
      </div>

      <div className="content">
        {activeTab === "camera" ? (
          <Camera onProcessingComplete={handleProcessingComplete} />
        ) : (
          <div className="graphs-container">
            {results.status === "processing" && (
              <div className="loading-message">Обработка данных...</div>
            )}
            
            {results.status === "error" && (
              <div className="error-message">
                Ошибка загрузки графиков. Попробуйте снова.
                <button className="retry-button" onClick={() => setActiveTab("camera")}>
                  Вернуться к камере
                </button>
              </div>
            )}
            
            {results.status === "success" && (
              <TwoGraphsView data1={results.json1} data2={results.json2}
              number1={1} number2={2} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};