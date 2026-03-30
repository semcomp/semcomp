import {useState} from "react"
import EVENT from "@/lib/constants/SemcompBetaEvents";
import type { EventType } from "@/types/EventType";

export default function CronogramaPage() {

  const [selected, setSelected] = useState<EventType | null>(null);

  const tdClass = "font-semibold px-3 py-2 rounded-lg text-center border border-slate-400 border-collapse";
  const auxDivClass = "font-normal opacity-70";

  const rows: EventType[][] = [];
  let i = 0;
  
  // Define se a linha da tabela terá um evento ou mais na mesma linha
  // Provavelmente isso será mudado, dado que os dados atuais tão hardcodados
  while (i < EVENT.length) {
    if (EVENT[i].col === "left" && EVENT[i + 1]?.col === "right") {
      rows.push([EVENT[i], EVENT[i + 1]]);
      i += 2;
    } else {
      rows.push([EVENT[i]]);
      i++;
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">

      {/* Popup */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/30  backdrop-blur-xs flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-80 flex flex-col gap-2 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-lg">{selected.title}</h2>
            {selected.time && (
              <p className="text-sm opacity-70">{selected.time}</p>
            )}
            <p className="text-sm mt-1">
              {selected.description || "Sem descrição."}
            </p>
            <button
              className="mt-3 text-sm text-slate-500 hover:text-slate-800 self-end"
              onClick={() => setSelected(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <table className="w-200 h-150 text-sm border-separate border-spacing-y-2">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.length === 2 ? (
                row.map((ev, colIndex) => (
                  <td
                    key={colIndex}
                    className={`${tdClass} w-1/2`}
                    onClick={() => setSelected(ev)}
                  >
                    {ev.title}
                    {ev.time && <div className={auxDivClass}>{ev.time}</div>}
                  </td>
                ))
              ) : (
                <td
                  colSpan={2}
                  className={tdClass}
                  onClick={() => setSelected(row[0])}
                >
                  {row[0].title}
                  {row[0].time && <div className={auxDivClass}>{row[0].time}</div>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}