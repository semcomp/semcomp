import { useEffect, useState } from "react";

interface ObjectFlyProps {
  maxItems: number;
  direction: 'right' | 'left';
  image: string;
  filter?: string;
}

interface FlyObject {
  id: number;
  top: number;
  left: number;
  width: number;
}

function isValidPosition(newObject: FlyObject, existingObjects: FlyObject[]): boolean {
  for (const obj of existingObjects) {
    const distance = Math.sqrt(
      Math.pow(newObject.left - obj.left, 2) + Math.pow(newObject.top - obj.top, 2)
    );
    const minDistance = (newObject.width + obj.width) / 2;

    if (distance < minDistance) {
      return false;
    }
  }
  return true;
}

function generateRandomPosition(): FlyObject {
  const top = Math.random() * (window.innerHeight - 350);
  const left = Math.random() * window.innerWidth;
  const width = Math.random() * 150 + 100;
  return { id: Date.now(), top, left, width };
}

function initializeObjects(numObjects: number, setObjects: React.Dispatch<React.SetStateAction<FlyObject[]>>) {
  const initialObjects: FlyObject[] = [];
  while (initialObjects.length < numObjects) {
    const newObject = generateRandomPosition();
    if (isValidPosition(newObject, initialObjects)) {
      initialObjects.push(newObject);
    }
  }
  setObjects(initialObjects);
}

const ObjectFly: React.FC<ObjectFlyProps> = ({ maxItems, direction, image, filter }) => {
  const [objects, setObjects] = useState<FlyObject[]>([]);
  const [showObjects, setShowObjects] = useState<boolean>(true);
  const [resizeTimeout, setResizeTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeObjects(maxItems, setObjects);
    const intervalId = setInterval(() => {
      setObjects((prevObjects) =>
        prevObjects.map((obj) => {
          let newLeft = direction === 'right' ? obj.left + 1 : obj.left - 1;
          if (direction === 'right' && newLeft > window.innerWidth) {
            newLeft = -obj.width;
          } else if (direction === 'left' && newLeft < -obj.width) {
            newLeft = window.innerWidth;
          }
          return { ...obj, left: newLeft };
        })
      );
    }, 85);

    return () => clearInterval(intervalId);
  }, [direction, maxItems]);

  useEffect(() => {
    const handleResize = () => {
      setShowObjects(false);
      setObjects([]);

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      const timeout = setTimeout(() => {
        setShowObjects(true);
        initializeObjects(maxItems, setObjects);
      }, 500);

      setResizeTimeout(timeout);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [resizeTimeout, maxItems]);

  return (
    <div className="relative z-20">
      {showObjects && objects.map((obj) => (
        <div
          key={obj.id}
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
            filter: filter || "none",
          }}
        />
      ))}
    </div>
  );
};

export default ObjectFly;
