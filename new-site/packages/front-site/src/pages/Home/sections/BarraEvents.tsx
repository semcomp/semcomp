import iconPalestras from "@/assets/img/Home/IconsEvents/iconPalestras.svg"
import iconMinicursos from "@/assets/img/Home/IconsEvents/iconMinicursos.svg"
import iconConcursos from "@/assets/img/Home/IconsEvents/iconConcursos.svg"
import iconHackaton from "@/assets/img/Home/IconsEvents/iconHackaton.svg"
import iconGameNight from "@/assets/img/Home/IconsEvents/iconGameNight.svg"

export default function BarraEvents(){

    const ClassName_divEvent = "gap-2 flex flex-col w-30 justify-center";
    const ClassName_img = "h-20 mb-2";
    const ClassName_p = "text-center text-lg text-semcompLightBlue";

    return (
        <section className="bg-semcompMidDarkBlue flex justify-center">
            <div className="w-[80%] p-7 flex justify-around">
                <div className={ClassName_divEvent}>
                    <img className={ClassName_img} src={iconPalestras} alt="Ícone representando as Palestras" />
                    <p className={ClassName_p}>Palestras</p>
                </div>
                <div className={ClassName_divEvent}>
                    <img className={ClassName_img} src={iconMinicursos} alt="Ícone representando as Palestras" />
                    <p className={ClassName_p}>MiniCursos</p>
                </div>
                <div className={ClassName_divEvent}>
                    <img className={ClassName_img} src={iconConcursos} alt="Ícone representando as Palestras" />
                    <p className={ClassName_p}>Concursos</p>
                </div>
                <div className={ClassName_divEvent}>
                    <img className={ClassName_img} src={iconHackaton} alt="Ícone representando as Palestras" />
                    <p className={ClassName_p}>Hackatons</p>
                </div>
                <div className={ClassName_divEvent}>
                    <img className={ClassName_img} src={iconGameNight} alt="Ícone representando as Palestras" />
                    <p className={ClassName_p}>Game Nights</p>
                </div>
            </div>
        </section>
    );
};