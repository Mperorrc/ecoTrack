import React, { useEffect, useState } from "react";
import BarChart from "../Charts/BarChart";

interface CircularCarouselProps {
  dataArray: any[];
}

const CircularCarousel: React.FC<CircularCarouselProps> = ({ dataArray }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const scrollSpeed = 2000;
    let interval: NodeJS.Timeout | undefined;

    if (!isHovered) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % dataArray.length);
      }, scrollSpeed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, dataArray.length]);

  return (
    <div
      className="relative h-[80%] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex items-center h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 46}vh)`,
        }}
      >
        {dataArray.map((data, index) => (
          <div
            key={index}
            className="carousel-item w-[40vh] h-[80%] flex-shrink-0 mx-[3vh] bg-gradient-to-b from-pink-900 to-slate-900 border border-black "
          >
            <BarChart
              ChartDatasets={data.datasets}
              chartLabels={data.labels}
              titleText={data.datasets[0].label}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircularCarousel;
