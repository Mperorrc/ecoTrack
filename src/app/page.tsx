"use client"
import { authModalState } from "@/atoms/authModalAtom";
import CircularCarousel from "@/components/Carousel/CircularCarousel";
import BarChart from "@/components/Charts/BarChart";
import AuthModal from "@/components/Modals/AuthModal";
import Navbar from "@/components/Navbar/Navbar";
import { useRecoilValue } from "recoil";

export default function Home() {
  
  const authModal = useRecoilValue(authModalState);
  const labels = ["Person 1", "Person 2", "Person 3", "Person 4"];

  const dataArray = [
    {
      labels: ["Person 1", "Person 2", "Person 3", "Person 4"],
      datasets: [
        {
          label: "Carbon Footprint (Jan)",
          data: [2.3, 1.5, 0.8, 1.0],
          backgroundColor: [
            "rgba(255, 0, 0, 0.5)",
            "rgba(255, 255, 0, 0.5)",
            "rgba(0, 255, 0, 0.5)",
            "rgba(255, 255, 0, 0.5)",
          ],
          borderColor: [
            "rgba(255, 0, 0, 1)",
            "rgba(255, 255, 0, 1)",
            "rgba(0, 255, 0, 1)",
            "rgba(255, 255, 0, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    {
      labels: ["City A", "City B", "City C", "City D"],
      datasets: [
        {
          label: "Average Temperature (°C)",
          data: [25.5, 18.2, 22.8, 20.1],
          backgroundColor: [
            "rgba(0, 0, 255, 0.5)",
            "rgba(0, 128, 255, 0.5)",
            "rgba(0, 255, 255, 0.5)",
            "rgba(135, 206, 235, 0.5)",
          ],
          borderColor: [
            "rgba(0, 0, 255, 1)",
            "rgba(0, 128, 255, 1)",
            "rgba(0, 255, 255, 1)",
            "rgba(135, 206, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    {
      labels: ["Product A", "Product B", "Product C", "Product D"],
      datasets: [
        {
          label: "Units Sold (in 1000s)",
          data: [40, 60, 30, 50],
          backgroundColor: [
            "rgba(0, 255, 0, 0.5)",
            "rgba(34, 139, 34, 0.5)",
            "rgba(144, 238, 144, 0.5)",
            "rgba(50, 205, 50, 0.5)",
          ],
          borderColor: [
            "rgba(0, 255, 0, 1)",
            "rgba(34, 139, 34, 1)",
            "rgba(144, 238, 144, 1)",
            "rgba(50, 205, 50, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    {
      labels: ["Region X", "Region Y", "Region Z", "Region W"],
      datasets: [
        {
          label: "Rainfall (mm)",
          data: [300, 450, 400, 500],
          backgroundColor: [
            "rgba(128, 0, 128, 0.5)",
            "rgba(138, 43, 226, 0.5)",
            "rgba(147, 112, 219, 0.5)",
            "rgba(153, 50, 204, 0.5)",
          ],
          borderColor: [
            "rgba(128, 0, 128, 1)",
            "rgba(138, 43, 226, 1)",
            "rgba(147, 112, 219, 1)",
            "rgba(153, 50, 204, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
  ];

  const monthlyData = {
    labels: ["Jan", "Feb", "March", "April", "May"],
    datasets: [
      {
        label: "Monthly Carbon Footprint (in tCO2)",
        data: [5, 1.5, 2, 4, 3],
        backgroundColor: [
          "green",
          "blue",
          "indigo",
          "maroon",
          "yellow",
        ],
        borderColor: [
          "rgba(128, 0, 128, 1)",
          "rgba(138, 43, 226, 1)",
          "rgba(147, 112, 219, 1)",
          "rgba(153, 50, 204, 1)",
          "rgba(158, 78, 196, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }
  
  return (
    <div>
      <Navbar/>
      {authModal.isOpen && <AuthModal/>}
      <div className="text-white h-[92vh]  overflow-y-auto  font-bold bg-[#121212] scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track">
        <div className="w-full mt-[40px] flex text-center items-center justify-center p-[2%] text-4xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-600 to-green-300 ">
          Track your carbon foorprint better with EcoTrack
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center ">
            <div className="w-full p-[10px] flex items-center justify-center text-lg bg-clip-text text-transparent bg-gradient-to-b from-purple-400 via-pink-500 to-red-500">
              Monitor Your Monthly Carbon Footprint
            </div>
            <div className="w-[30%] flex items-center justify-center bg-gradient-to-b from-pink-900 to-slate-900 border border-black">
              <BarChart chartLabels={monthlyData.labels} ChartDatasets={monthlyData.datasets} />
            </div>
          </div>
          <div className=" w-[70%] mt-[40px] flex flex-col justify-center items-center text-lg font-light font-serif bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-md ">
            Explore personalized tips to reduce your monthly consumption with our ecoTrack chatbot. Gain insights based on the habits of users like you, who are striving to improve their carbon footprint!
            <br/>
            <br/>
            By comparing your progress with others in your city, you'll discover effective strategies that are making a real impact and get inspired to take your own steps towards sustainability.
          </div>
        </div>
        <div className="h-2/5 w-full flex flex-row mt-3">
          <div className="w-[36%] h-[96%] p-[2%] flex text-center items-center justify-center text-3xl font-family: Verdana, sans-serif; text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Gain valuable insights on<br />your group&apos;s footprint
          </div>
          <div className="w-[60%] h-full flex items-center">
            <CircularCarousel dataArray={dataArray}/>
          </div>
        </div>
        <div className="w-1/2 h-2/5">
        </div>
      </div>
    </div>
  );
}
