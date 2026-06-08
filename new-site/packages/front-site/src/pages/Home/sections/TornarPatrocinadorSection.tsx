import { Button, buttonVariants } from "@/components/ui/Button";
import iconMessage from "@/assets/img/Home/Icons/iconMessage.svg"
import fundoImagensPatrocinadores from "@/assets/img/Home/TornesePatrocinador/fundoImagensPatrocinadores.svg"

type PatrocinadoresSectionProps = {
  className?: string;
}

export default function TornarPatrocinadorSection(props: PatrocinadoresSectionProps){

    return(
        <section className={`bg-semcompMidDarkBlue ${props.className}`}>
            <div className="flex justify-between max-w-[80%] mx-auto">
                <div className="w-[35%]">
                    <h1 className="text-4xl font-extrabold mb-5 text-left z-20 relative text-semcompOffWhite font-extrabold">Torne-se um patrocinador da SEMCOMP XXIX</h1>
                    
                    <div className="w-[100%]">
                        <div className="flex gap-5 items-center mb-2">
                            <img src={`${iconMessage}`} alt="ícone de envio de contato" className="h-[20px]"/>
                            <h3 className="text-semcompOffWhite text-[18px]">Preencha e entraremos em contato!</h3>
                        </div>
                        <hr className="border-1" />
                    </div>

                    <div className="mt-4 gap-1 flex flex-col">
                        <div className="gap-3 flex flex-col">
                            <div className="w-[100%]">
                                <label htmlFor="contactName"></label>
                                <input 
                                    id="contactName"
                                    type="text"
                                    placeholder="Seu nome de contato..."
                                    className="w-[100%] p-2 bg-[#0F486D] border-semcompOffWhite border rounded-sm"
                                />
                            </div>
                            <div className="w-[100%]">
                                <label htmlFor="contactEmail"></label>
                                <input 
                                    id="contactEmail"
                                    type="text"
                                    placeholder="Seu e-mail de contato..."
                                    className="w-[100%] p-2 bg-[#0F486D] border-semcompOffWhite border rounded-sm"
                                />
                            </div>
                            <div className="w-[100%]">
                                <label htmlFor="company"></label>
                                <input 
                                    id="company"
                                    type="text"
                                    placeholder="Empresa que você representa..."
                                    className="w-[100%] p-2 bg-[#0F486D] border-semcompOffWhite border rounded-sm"
                                />
                            </div>
                            <div className="w-[100%]">
                                <label htmlFor="message"></label>
                                <textarea  
                                    id="message"
                                    rows={4} 
                                    placeholder="Sua mensagem..."
                                    className="w-[100%] p-2 bg-[#0F486D] border-semcompOffWhite border rounded-sm resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button 
                                className={`
                                    ${buttonVariants({ variant: "ghost", size: "lg" })}
                                    cursor-pointer bg-[#003050] w-[130px] h-[50px] -translate-x-[2px]
                                `}
                                // onClick={}
                                >
                                Limpar
                            </Button>

                            <Button 
                                className={`
                                    ${buttonVariants({ variant: "ghost", size: "lg" })}
                                    cursor-pointer bg-semcompOffWhite text-semcompMidDarkBlue font-extrabold w-[200px] h-[50px] translate-x-[2x]
                                `}
                                // onClick={}
                                >
                                Enviar Mensagem
                            </Button>
                        </div>
                    </div>

                </div>

                <div className="w-[50%] relative items-center flex justify-end">
                    <p className="absolute max-w-[450px] text-right bottom-[50px] right-0 p-4 bg-semcompMidLightBlue text-semcompLightBlue font-bold rounded-2xl">Conecte sua empresa a centenas de<br></br>estudantes de computação.</p>
                    <div className="flex h-[100%]">
                        <img src={`${fundoImagensPatrocinadores}`} alt="" />
                    </div>
                </div>
            </div>
        </section>
    );
}