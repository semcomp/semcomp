import { ReactElement, useEffect, useRef, useState } from "react";

const Record = ({ className, isPhone }): ReactElement => {

    const [state, setState] = useState(false); 
    const audioRef = useRef<HTMLAudioElement>()

    const startMusic = (e) => {
        if(state == false){
        }else{
        }

        setState(!state);
        console.log(state);
    
    }

    const music_box_not_mobile = "border-solid border-2 w-[300px] h-[300px] bg-[#fbfbfb] flex items-center justify-center flex-col flex-wrap shadow-[0_15px_0_0_#171214] rounded-[10px] mb-[20px]";
    const music_box_mobile = "border-solid border-2 w-[250px] h-[250px] bg-[#fbfbfb] flex items-center justify-center flex-col shadow-[0_15px_0_0_#171214] rounded-[10px] mb-[20px]";
    const cd_not_mobile = "h-[230px] bg-[#ffff] bg-center w-[230px] border-[5px] border-solid border-[#0000] bg-cover rounded-[50%] bg-no-repeat bg-[url(../assets/logo.svg)] left-[30px] top-[30px]";
    const cd_mobile = "h-[200px] w-[200px] bg-[#ffff] bg-center border-[5px] border-solid border-[#0000] object-fill rounded-[50%] bg-no-repeat bg-[url(../assets/logo.svg)]";

    return (
        <div className={className}>
            <div className={isPhone ? music_box_mobile : music_box_not_mobile }>
                <div className={(isPhone ? cd_mobile : cd_not_mobile)  + (!state ? " " : " play")}>
                </div>
                
                <div className="w-full flex flex-row items-end justify-end">
                    <div className="button round">
                        <a className={isPhone ? "mr-3 mb-[3px]": "mr-2"}></a>
                    </div>
                    <div className="button" onClick={startMusic}>
                        <a className={isPhone ? "mr-3 mb-[3px]": "mr-5"}></a>
                    </div>
                </div>
            </div>

        </div>
    );
};

// w-7 h-7 bg-[#181312] shadow-[0_3px_0_0_#838383] rounded-[5px] 

export default Record;
