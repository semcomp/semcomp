import React, { useState } from 'react';

import Sidebar from '../../components/layout/sidebar';

// Colocar valores baseados no banco de dados
const items = [
  'Arroz (5 kg)',
  'Feijão (1 kg)',
  'Sardinha (125 g)',
  'Atum (170 g)',
  'Sal (1 kg)',
  'Molho de tomate (300 g)',
  'Macarrão (500 g)',
  'Óleo (500 mL)',
  'Milho (170 g)',
  'Ervilha (170 g)',
  'Café (500 g)',
  'Leite (1 L)',
  'Leite condensado (395 g)',
  'Leite em pó (400 g)',
  'Biscoito água e sal (350 g)',
  'Biscoito recheado (120 g)',
  'Açúcar (1 kg)',
  'Achocolatado em pó (400 g)',
  'Aveia (200 g)',
  'Milho de pipoca (500 g)',
  'Farinha de trigo (1 kg)',
  'Farinha de mandioca (1 kg)',
  'Suco em pó / gelatina',
  'Fubá (1 kg)',
  'Pasta de dente (70 g)',
  'Escova de dente (1 unidade)',
  'Absorvente íntimo (1 unidade)',
  'Sabonete (1 unidade)',
  'Papel higiênico',
  'Shampoo / condicionador (1 unidade)',
  'Fio dental (1 unidade)',
  'Fralda (1 unidade)',
];

const houses = ['Fire Wall', 'Monte Carlo', 'Semanal', 'S28'];

/**
 * @return {object}
 */
export default function Donations() {
  const [selectedHouse, setSelectedHouse] = useState(houses[0]);
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const [inputQuantity, setInputQuantity] = useState('');
  const [quantities, setQuantities] = useState({});

  /**
   * Adiciona a quantidade inserida ao item e casa selecionados.
   */
  const handleAddDonation = () => {
    const quantity = parseInt(inputQuantity);
    if (isNaN(quantity) || quantity <= 0) return;

    setQuantities((prev) => ({
      ...prev,
      [selectedItem]: {
        ...prev[selectedItem],
        [selectedHouse]: (prev[selectedItem]?.[selectedHouse] || 0) + quantity,
      },
    }));

    setInputQuantity('');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <Sidebar />
      {/* Controle de doação */}
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
          <label className="block font-semibold mb-1">Item</label>
          <select
            className="border p-2 rounded w-56"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            {items.map((item, idx) => (
              <option key={idx} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Quantidade doada</label>
          <input
            type="number"
            className="border p-2 rounded w-24 text-center"
            value={inputQuantity}
            onChange={(e) => setInputQuantity(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddDonation}
        >
          Adicionar
        </button>
      </div>

      {/* Tabela de quantidades doadas */}
      <div>
        <h2 className="text-xl font-bold mb-2">Quantidade doada por item e casa</h2>
        <table className="w-full border border-black text-center text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Item</th>
              {houses.map((house, idx) => (
                <th key={idx} className="border p-2">
                  {house}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item}>
                <td className="border p-2 text-left">{item}</td>
                {houses.map((house, idx) => (
                  <td key={idx} className="border p-2">
                    {quantities[item]?.[house] || 0}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
