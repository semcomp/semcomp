import React from "react"
import FotoSemcompMain from "../assets/img/semcomp/Semcomp28.jpg";

export default function TeamGrid({ data }: { data: Record<string, Record<string, string>> }) {
  const [currentDepartment, setCurrentDepartment] = React.useState(0);

  const entries = Object.entries(data);

  function changePictures(index: number) {
    setCurrentDepartment(index);
  }

  const firstRow = entries.slice(0, 4);
  const secondRow = entries.slice(4, 9);

  return (
    <div className="flex flex-col gap-4 items-center">
      {/* linha de 4 */}
      <div className="flex gap-32 justify-center">
        {firstRow.map(([department], index) => (
          <button
            key={index}
            className={`w-40 h-12 bg-semcompLightBlue rounded-md flex items-center justify-center hover:bg-sky-400 ${currentDepartment === index? "bg-sky-400 text-white": "bg-semcompLightBlue hover:bg-sky-500"}`}
            onClick={() => changePictures(index)}
          >
            {department}
          </button>
        ))}
      </div>

      {/* linha de 5 */}
      <div className="flex gap-32 justify-center">
        {secondRow.map(([department], index) => (
          <button
            key={index+4}
            className={`w-40 h-12 bg-semcompLightBlue rounded-md flex items-center justify-center hover:bg-sky-400 ${currentDepartment === index+4? "bg-sky-400 text-white": "bg-semcompLightBlue hover:bg-sky-500"}`}
            onClick={() => changePictures(index+4)}
          >
            {department}
          </button>
        ))}
      </div>

      <div key={currentDepartment} className="flex gap-32 justify-center pt-10 transition-all duration-500 transform animate-slide">
        {Object.entries(entries[currentDepartment][1]).map(([person, role]) => (
            <div key={person}>
              <img src={FotoSemcompMain} alt="" className="w-40 h-40"/>
              {person} <br/>
              {role}
            </div>
        ))}
      </div>

      <div>
        
      </div>
    </div>
  );
}