import { useEffect, useState } from "react";

// aqui definimos as props que o componente vai receber. Nada demais, só umas coisinhas básicas que ele vai precisar
interface ObjectFlyProps {
  maxItems: number; // número máximo de objetos voadores 
  direction: 'right' | 'left'; // pra onde os objetos vão voar
  image: string; //
  filter?: string; // se quiser dar uma estilizada na imagem com um filtro (para se adaptar ao bg da página)
  speed?: number;  
  minSize?: number; //define o tamanho mínimo do objeto. Se não for passado, usa um valor padrão.
  maxSize?: number; // define o tamanho máximo do objeto. Se não for passado, usa um valor padrão.
}

// esse aqui é o formato de cada objeto voador. Basicamente onde ele está e o tamanho.
interface FlyObject {
  id: number; // cada objeto tem um id único
  top: number; // posição vertical
  left: number; // posição horizontal
  width: number; // o tamanho da largura do objeto
}

// verifica se a posição de um novo objeto é válida, ou seja, se ele não está colidindo com outros.
function isValidPosition(newObject: FlyObject, existingObjects: FlyObject[]): boolean {
  for (const obj of existingObjects) {
    const distance = Math.sqrt(
      Math.pow(newObject.left - obj.left, 2) + Math.pow(newObject.top - obj.top, 2)
    );
    const minDistance = (newObject.width + obj.width) / 2;

    if (distance < minDistance) {
      return false; // se tiver dentro do raio de colisão, não pode ser criado aqui
    }
  }
  return true; // assim a gente evita que as nuvens se colidam
}

// gera uma posição aleatória dentro dos limites da tela, respeitando minSize e maxSize
function generateRandomPosition(minSize: number, maxSize: number): FlyObject {
    const top = Math.random() * (window.innerHeight - 350); // jogando ele em algum lugar aleatório da tela
    const left = Math.random() * window.innerWidth;
    const width = Math.random() * (maxSize - minSize) + minSize; // cada objeto tem um tamanho aleatório entre o mínimo e o máximo
    return { id: Date.now(), top, left, width }; // retornando o novo objeto com um id único
  }
  

// inicializando todos os objetos de uma vez
function initializeObjects(numObjects: number, setObjects: React.Dispatch<React.SetStateAction<FlyObject[]>>, minSize: number, maxSize: number) {
  const initialObjects: FlyObject[] = [];
  
  const newObject = generateRandomPosition(minSize, maxSize);
  while (isValidPosition(newObject, initialObjects) && initialObjects.length < numObjects) { // vai rodar até ter o número de objetos que pedimos
    const newObject = generateRandomPosition(minSize, maxSize);
    if (isValidPosition(newObject, initialObjects)) {
      initialObjects.push(newObject); // se a posição for válida (sem bater em outros), adiciona na lista
    }
  }
  setObjects(initialObjects); // finalmente, atualizamos o estado com todos os objetos prontos pra voar.
}

const ObjectFly: React.FC<ObjectFlyProps> = ({ maxItems, direction, image, filter, speed, minSize = 20, maxSize = 250 }) => {
  const [objects, setObjects] = useState<FlyObject[]>([]); // o estado inicial vai guardar os objetos voadores
  const [showObjects, setShowObjects] = useState<boolean>(true); // controle pra esconder/mostrar os objetos na tela
  const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout | null>(null); // timeout para evitar redimensionar sem parar

  // velocidade padrão para 85ms 
  const movementSpeed = speed ? speed * 1000 : 85; // definindo a velocidade. Se não for passada, usa 85ms como padrão

  useEffect(() => {
    initializeObjects(maxItems, setObjects, minSize, maxSize); // inicializa os objetos quando o componente monta
    const intervalId = setInterval(() => {
      setObjects((prevObjects) =>
        prevObjects.map((obj) => {
          // vamos mover o objeto dependendo da direção. Se bater na borda, ele reaparece do outro lado.
          let newLeft = direction === 'right' ? obj.left + 1 : obj.left - 1;
          if (direction === 'right' && newLeft > window.innerWidth) {
            newLeft = -obj.width; // saiu da tela pela direita, volta pelo começo da esquerda
          } else if (direction === 'left' && newLeft < -obj.width) {
            newLeft = window.innerWidth; // saiu pela esquerda, volta pelo lado direito da tela
          }
          return { ...obj, left: newLeft}; // atualiza a posição do objeto
        })
      );
    }, movementSpeed); // velocidade do movimento, controlada pela prop ou padrão

    return () => clearInterval(intervalId); // limpando o intervalo quando o componente desmonta
  }, [direction, maxItems, movementSpeed, minSize, maxSize]);

  // Esse efeito aqui serve pra quando a tela é redimensionada, assim a altura das nuvens é ajustada
  useEffect(() => {
    const handleResize = () => {
      // console.log("1")
      setShowObjects(false); // esconder os objetos pra não ficarem bugados
      setObjects([]); // limpar os objetos
      // console.log("2")

      if (resizeTimeout) {
        clearTimeout(resizeTimeout); // limpa o timeout anterior se tiver
        // console.log("3")
      }
      // console.log("4")
      const timeout = setTimeout(() => {
        // console.log("5")
        setShowObjects(true); // volta a mostrar os objetos
        initializeObjects(maxItems, setObjects, minSize, maxSize); // reinicializa os objetos com a nova tela
      }, 500); // dá um tempinho pro resize antes de recriar os objetos
      
      // console.log("6")
      setResizeTimeout(timeout);
    };

    window.addEventListener("resize", handleResize); // adiciona o evento de redimensionamento da tela
    return () => {
      window.removeEventListener("resize", handleResize); // remove o evento quando o componente desmonta
      if (resizeTimeout) {
        clearTimeout(resizeTimeout); // garante que o timeout não vai ficar rodando pra sempre
      }
    };
  }, [resizeTimeout, maxItems, minSize, maxSize]);

  return (
    <div className="relative z-20">
      {showObjects && objects.map((obj, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            top: `${obj.top}px`,
            left: `${obj.left}px`,
            width: `${obj.width}px`,
            height: '200px',
            backgroundImage: `url(${image})`,
            backgroundPosition: 'center', 
            backgroundSize: 'contain', 
            backgroundRepeat: 'no-repeat', 
            filter: filter || "none", // aplica o filtro se tiver, senão deixa sem
          }}
        />
      ))}
    </div>
  );
};

export default ObjectFly;
