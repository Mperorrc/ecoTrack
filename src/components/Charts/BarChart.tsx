import React,{useEffect, useState} from 'react';
import { Bar } from 'react-chartjs-2';
import { 
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

type BarChartProps = {
    ChartDatasets : any[];
    chartLabels: String[];
    legendPosition?: String;
    titleText?: String;
};

const BarChart:React.FC<BarChartProps> = ({titleText,chartLabels,legendPosition,ChartDatasets}) => {
    const [chartData, setChartData] = useState<ChartData<"bar">>({
        labels: [], 
        datasets: [],
      });
    const [chartOptions,setChartOptions] = useState({});

    useEffect(() => {
        setChartData({
            labels: chartLabels,
            datasets: ChartDatasets
        });

        setChartOptions({
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: (titleText && titleText.length )? titleText : "",
                    color: 'white'
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false, 
                    },
                    ticks: {
                        color: 'white',
                    },
                    borderColor: 'white',
                },
                y: {
                    grid: {
                        display: false, 
                    },
                    ticks: {
                        color: 'white', 
                    },
                    borderColor: 'white',
                },
            },
        });
    }, [ChartDatasets,chartLabels,legendPosition,titleText])
    
    
    return(
        <div className='w-full h-full flex items-center justify-center'>
            <Bar className='w-full h-full' data={chartData} options={chartOptions}/>
        </div>
    )
}
export default BarChart;