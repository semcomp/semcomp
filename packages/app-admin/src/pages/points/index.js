import React, { useState } from 'react';

import Sidebar from '../../components/layout/sidebar';

// Colocar valores baseados no banco de dados

const houses = ['Fire Wall', 'Monte Carlo', 'Semanal', 'S28'];

/**
 * @return {object}
 */
export default function Points() {
  const [selectedHouse, setSelectedHouse] = useState(houses[0]);
  const [inputPoints, setInputPoints] = useState('');
  const [justification, setJustification] = useState('');
  const [points, setPoints] = useState({});
  const [history, setHistory] = useState([]);

  const handleAddPoints = () => {
    const parsed = parseInt(inputPoints);
    if (isNaN(parsed) || parsed <= 0 || !justification.trim()) return;

    setPoints((prev) => ({
      ...prev,
      [selectedHouse]: (prev[selectedHouse] || 0) + parsed,
    }));

    setHistory((prev) => [
      ...prev,
      {
        house: selectedHouse,
        points: parsed,
        justification: justification.trim(),
        timestamp: new Date().toLocaleString(),
      },
    ]);

    setInputPoints('');
    setJustification('');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <Sidebar/>
      {/* Inputs */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block font-semibold mb-1">Casa</label>
          <select
            className="border p-2 rounded"
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
          >
            {houses.map((house, idx) => (
              <option key={idx} value={house}>
                {house}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Pontos</label>
          <input
            type="number"
            className="border p-2 rounded w-24 text-center"
            value={inputPoints}
            onChange={(e) => setInputPoints(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block font-semibold mb-1">Justificativa</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Ex: Atividade cultural"
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddPoints}
        >
          Adicionar
        </button>
      </div>

      {/* Tabela de Pontuação */}
      <div>
        <h2 className="text-xl font-bold mb-2">Pontuação total por casa</h2>
        <table className="w-full border border-black text-center">
          <thead className="bg-gray-100">
            <tr>
              {houses.map((house, idx) => (
                <th key={idx} className="border p-2">
                  {house}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {houses.map((house, idx) => (
                <td key={idx} className="border p-2">
                  {points[house] || 0}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Histórico */}
      <div>
        <h2 className="text-xl font-bold mt-6 mb-2">Histórico de Pontuações</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">Nenhuma pontuação registrada ainda.</p>
        ) : (
          <ul className="space-y-2 list-disc list-inside">
            {history.map((entry, idx) => (
              <li key={idx} className="text-sm">
                <strong>{entry.house}</strong> recebeu <strong>{entry.points} ponto(s)</strong>{' '}
                – <em>{entry.justification}</em> <span className="text-gray-500">({entry.timestamp})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
