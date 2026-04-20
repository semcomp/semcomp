import useWindowDimensions from "@/hooks/useWindowDimensions"
import type { ReactElement } from "react"
import { useTheme } from "@/contexts/useTheme"
import hogwarts from "../../assets/img/profilePics/hogwarts.jpg"
import hogwartsLogo from "../../assets/img/profilePics/hogwartsLogo.png"
import ContatoSection from "../Home/sections/ContatoSection"

/*
lembrar de:
mexer no router
mexer no segcontrol para ser generico
adicionar a pasta com as imagens de fundo de div
lembrar de adicionar o "Desenvolvido por codelab no footer"
pq o light mode do footer ta esquisito?
*/


export default function Profile(){
    let { width } = useWindowDimensions()
    const { isDarkMode } = useTheme();
    const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
    const headerBgWithOpacity = isDarkMode ? "bg-semcompDarkBlue/80" : "bg-semcompMidLight/80";
    const shadowClass = isDarkMode 
        ? "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompDarkBlue/100%)]" 
        : "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompMidLight/100%)]";
        
    let retorno: ReactElement | null
    retorno = null
    
    if(width >= 1280){
        retorno = (
            <div>
                <div 
                    className={`h-[calc(90vh-70px)] w-full bg-cover bg-center ${shadowClass} flex flex-row justify-center items-center gap-7 font-poppins`}
                    style={{ backgroundImage: `url(${hogwarts})`, boxShadow: isDarkMode ? 'inset 0 -160px 60px -40px rgba(11, 38, 57, 0.8)' : 'inset 0 -180px 40px -40px rgba(53, 123, 163, 0.6)' }}
                >
                    <div className={`h-[80%] w-[25%] bg-gray-300 flex flex-col justify-end rounded-sm overflow-hidden`}>
                        
                        <div className={`h-[88%] w-full bg-semcompOffWhite`}>
                            {/* card qrcode */}
                        </div>
                    </div>

                    <div className={`h-[80%] w-[25%] ${headerBgWithOpacity} flex flex-col rounded-sm overflow-hidden text-semcompOffWhite pt-12 pr-10 pl-10`}>
                        <h1 className="text-center text-3xl font-bold pb-4">Overflow</h1>
                        <p className="text-center text-md pb-2">O Overflow é o principal concurso da nossa semana! E sua casa é...</p>
                        <div className="h-[50%] bg-cover bg-center absolute inset-0"
                            style={{ backgroundImage: `url(${hogwarts})`}}
                        >
                            <img className="h-[80%]" src={`${hogwartsLogo}`} alt="" />
                        </div>
                    </div>
                </div>
                <div>

                </div>
                <ContatoSection />
            </div>
        )       
    }

    return retorno;
}
    
