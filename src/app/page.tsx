"use client"
import { authModalState } from "@/atoms/authModalAtom";
import CircularCarousel from "@/components/Carousel/CircularCarousel";
import BarChart from "@/components/Charts/BarChart";
import PieChart from "@/components/Charts/PieChart";
import AuthModal from "@/components/Modals/AuthModal";
import { auth, firestore } from "@/firebase/firebase";
import { dataArray, monthlyData, monthlyChartLabels,monthlyChartDatasets,familyChartLabels, familyChartDatasets } from "@/utils/chartData";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { toast } from "react-toastify";
import { useRecoilValue, useSetRecoilState } from "recoil";

export default function Home() {
  
  const authModal = useRecoilValue(authModalState);
  const [user,loading] = useAuthState(auth);
  const setAuthModalstate = useSetRecoilState(authModalState);
  const router = useRouter();
  const [groupName,setGroupName] = useState<string>('');
  const [groupData,setGroupData] = useState([]);
  const [groupUsersFootprintData,setGroupUsersFootprintData] = useState<any[]>([]);
  const [monthlyBarChart,setMonthlyBarChart] = useState<any>();

  
  const [groupPieChartData,setGroupPieChartData] = useState<any>();
  
  const monthlyAverageChartLabels = ['Fuel', 'Electricity','Vehicular emissions', 'Public Transport', 'Air Travel']
  const [userCarbonMonthlyData, setUserCarbonMonthlyValue] = useState<any[]>([]);
  const [monthlyAveragePieChart,setMonthlyAveragePieChart] = useState<any>();
  const [carouselData,setCarouselData] = useState<any[]>([]);

  const fetchCarbonFootprintUserData = async () => {
    if (!user?.uid) {
      setUserCarbonMonthlyValue([]);
      return;
    }

    try {
      const querySnapshot = await getDocs(
        query(
          collection(firestore, "CARBON_FOOTPRINT_USER_DATA"),
          where("user_uid", "==", user.uid),
          orderBy("footprintDetails.year", "desc"),
          limit(10)
        )
      );
      if (querySnapshot?.docs?.length) {
        const carbonFootprintDocs = querySnapshot.docs;

        const monthMap = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };

        const sortedDocs = carbonFootprintDocs.sort((a, b) => {
          const monthA = a.data().footprintDetails?.month as keyof typeof monthMap;
          const monthB = b.data().footprintDetails?.month as keyof typeof monthMap;

          if (monthA && monthB && monthMap[monthA] && monthMap[monthB]) {
            const monthNumA = monthMap[monthA];
            const monthNumB = monthMap[monthB];
            return monthNumB - monthNumA; 
          }

          return 0; 
        });
        const sortedData = sortedDocs.map((doc) => doc.data())
        console.log(sortedData);
        setUserCarbonMonthlyValue(sortedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMonthlyUsagePieAndBarChart = () => {
    console.log("CHECKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK")
    if (userCarbonMonthlyData.length < 1) {
      setMonthlyAveragePieChart({});
      console.log((monthlyBarChart?.labels && monthlyBarChart?.datasets?.length)? monthlyBarChart.labels:  monthlyData.labels)
      console.log((monthlyBarChart?.datasets?.length)? monthlyBarChart.datasets:monthlyData.datasets)
      setMonthlyBarChart({});
      return;
    }
  
    console.log(userCarbonMonthlyData);
  
    // Calculate cumulative values for the pie chart
    const monthyFootprintValues = userCarbonMonthlyData.reduce(
      (acc, current) => {
        acc.electricityFootprint += current.electricityFootprint || 0;
        acc.fuelFootprint += current.fuelFootprint || 0;
        acc.airTravelFootprint += current.airTravelFootprint || 0;
        acc.publicTransportFootprint += current.publicTransportFootprint || 0;
        acc.vehicularFootprint += current.vehicularFootprint || 0;
        acc.totalValue += current.totalValue || 0;
        return acc;
      },
      {
        electricityFootprint: 0,
        fuelFootprint: 0,
        airTravelFootprint: 0,
        publicTransportFootprint: 0,
        vehicularFootprint: 0,
        totalValue: 0,
      }
    );
  
    if (!monthyFootprintValues?.totalValue) {
      setMonthlyAveragePieChart([]);
      console.log((monthlyBarChart?.labels && monthlyBarChart?.datasets?.length)? monthlyBarChart.labels:  monthlyData.labels)
      console.log((monthlyBarChart?.datasets?.length)? monthlyBarChart.datasets:monthlyData.datasets)
      setMonthlyBarChart({});
      return;
    }
  
    // Pie chart data
    const monthlyAveragedata = [
      {
        data: [
          monthyFootprintValues.electricityFootprint,
          monthyFootprintValues.fuelFootprint,
          monthyFootprintValues.vehicularFootprint,
          monthyFootprintValues.publicTransportFootprint,
          monthyFootprintValues.airTravelFootprint,
        ],
        backgroundColor: [
          '#FFB74D',
          '#BA68C8',
          '#5C6BC0',
          '#26C6DA',
          '#D81B60',
        ],
        borderColor: '#212121',
        borderWidth: 1,
      },
    ];
  
    // Set pie chart data
    setMonthlyAveragePieChart(monthlyAveragedata);
  
    // Bar chart data for monthly footprint values across months
    const months = userCarbonMonthlyData.map((_, index) => `${index} months before`);
    const monthlyFootprints = userCarbonMonthlyData.map((item) => item.totalValue);
  
    // Define a color palette for up to 10 months
    const colors = [
      "#FFB74D", "#BA68C8", "#5C6BC0", "#26C6DA", "#D81B60", "#FF5722", "#2196F3", "#4CAF50", "#9C27B0", "#FF9800"
    ];
  
    const barChartData = {
      labels: months, // months as x-axis labels
      datasets: [
        {
          label: "Total Carbon Footprint (in kgCO2)",
          data: monthlyFootprints, // monthly data values
          backgroundColor: colors.slice(0, months.length), // Color for each bar
          borderColor: "#212121",
          borderWidth: 1,
        },
      ],
    };
  
    // Set bar chart data
    console.log("BARCHART DATDA");
    console.log(barChartData);
    setMonthlyBarChart(barChartData);
  };

  const fetchGroupData = async()=>{
    if(!user?.uid){
      setGroupData([]);
      return;
    }

    try{
      const querySnapshot = await getDocs(
        query(
            collection(firestore, "users"),
            where("user_uid", "==", user.uid),
        )
      );

      const displayName = querySnapshot?.docs?.length ?  querySnapshot.docs[0]?.data()?.displayName : '';

      if(!displayName?.length){
        toast.error("Something went wrong. Please try again later!",{
          position:'top-center',
          autoClose:2000,
          theme:'dark',
        });
        setGroupData([]);
        return;
      }

      const groupQuerySnapshot = await getDocs(
        query(
          collection(firestore, "GROUP_DATA"),
          where("users", "array-contains", displayName)
        )
      );

      if(!groupQuerySnapshot?.docs?.length){
        setGroupData([]);
        return;
      }

      const groupUsers = groupQuerySnapshot.docs[0]?.data()?.users;

      if(!groupUsers?.length){
        setGroupData([]);
        return;
      }
      console.log(groupUsers)

      for (let groupUser of groupUsers) {  // Use 'for...of' to loop through array
        const userSnap = await getDocs(
          query(
            collection(firestore, "users"),
            where("displayName", "==", groupUser),
          )
        );

        if(!userSnap?.docs?.length || !userSnap.docs[0]?.data().displayName){
          continue;
        }

        const groupUserUid = userSnap.docs[0].data().user_uid;
        
        console.log(groupUser)
        const userQuerySnapshot = await getDocs(
          query(
            collection(firestore, "CARBON_FOOTPRINT_USER_DATA"),
            where("user_uid", "==", groupUserUid),
            orderBy("footprintDetails.year", "desc"),
            limit(10)
          )
        );
        
        console.log("hi 1");
        console.log(groupUserUid)
        if (userQuerySnapshot?.docs?.length) {
          const carbonFootprintDocs = userQuerySnapshot.docs;
          console.log("hi 2");
          const monthMap = {
            January: 1,
            February: 2,
            March: 3,
            April: 4,
            May: 5,
            June: 6,
            July: 7,
            August: 8,
            September: 9,
            October: 10,
            November: 11,
            December: 12,
          };
      
          const sortedDocs = carbonFootprintDocs.sort((a, b) => {
            const monthA = a.data().footprintDetails?.month as keyof typeof monthMap;
            const monthB = b.data().footprintDetails?.month as keyof typeof monthMap;
      
            if (monthA && monthB) {
              const monthNumA = monthMap[monthA];
              const monthNumB = monthMap[monthB];
              return monthNumB - monthNumA;
            }
      
            return 0;
          });
      
          const sortedData = sortedDocs.map((doc) => doc.data());
          console.log(sortedData);
          
          console.log(sortedData);
          let calculated_months = 0;
          const monthyFootprintValues = sortedData.reduce(
            (acc, current) => {
              acc.electricityFootprint += current.electricityFootprint || 0;
              acc.fuelFootprint += current.fuelFootprint || 0;
              acc.airTravelFootprint += current.airTravelFootprint || 0;
              acc.publicTransportFootprint += current.publicTransportFootprint || 0;
              acc.vehicularFootprint += current.vehicularFootprint || 0;
              acc.totalValue += current.totalValue || 0;
              calculated_months+=1;
              return acc;
            },
            { electricityFootprint: 0, fuelFootprint: 0, airTravelFootprint: 0, publicTransportFootprint: 0, vehicularFootprint: 0 , totalValue:0}
          );
          if(calculated_months==0) calculated_months+=1;
          const monthlyAveragedata = {
            electricityFootprint:monthyFootprintValues.electricityFootprint/calculated_months,
            fuelFootprint:monthyFootprintValues.fuelFootprint/calculated_months,
            vehicularFootprint:monthyFootprintValues.vehicularFootprint/calculated_months,
            publicTransportFootprint:monthyFootprintValues.publicTransportFootprint/calculated_months,
            airTravelFootprint:monthyFootprintValues.airTravelFootprint/calculated_months,
            totalValue:monthyFootprintValues.totalValue/calculated_months,
            userDisplayName:groupUser
          };

          setGroupUsersFootprintData((prevData) => [...prevData, monthlyAveragedata]);
          console.log(displayName)
          console.log(monthlyAveragedata);
        }
        else{
          setGroupUsersFootprintData([]);
        }
      }
    }
    catch(error){
      console.log("Couldn't load group data" + error)
    }
  }

  const getBarChartData = (monthlyAveragedataArray:any) => {
    console.log("HIIIIIIIII")
    const colors = [
      "#FFB74D", "#BA68C8", "#5C6BC0", "#26C6DA", "#D81B60", // Sample colors for 5 people
      "#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#33FFF5", 
      "#FF9F00", "#FF5757", "#C70039", "#900C3F", "#581845", 
      "#9C27B0", "#03A9F4" // Add more colors if needed for up to 16 people
    ];

    // Generate the dataset for each category
    const electricityData = monthlyAveragedataArray.map((data:any, index:any) => ({
      label: data.userDisplayName || `Person ${index + 1}`,
      data: [data.electricityFootprint],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    const fuelData = monthlyAveragedataArray.map((data:any, index:any) => ({
      label: data.userDisplayName || `Person ${index + 1}`,
      data: [data.fuelFootprint],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    const vehicularData = monthlyAveragedataArray.map((data:any, index:any) => ({
      label: data.userDisplayName || `Person ${index + 1}`,
      data: [data.vehicularFootprint],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    const publicTransportData = monthlyAveragedataArray.map((data:any, index:any) => ({
      label: data.userDisplayName || `Person ${index + 1}`,
      data: [data.publicTransportFootprint],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    const airTravelData = monthlyAveragedataArray.map((data:any, index:any) => ({
      label: data.userDisplayName || `Person ${index + 1}`,
      data: [data.airTravelFootprint],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    const totalData = monthlyAveragedataArray.map((data:any, index:any) => ({
      label: data.userDisplayName || `Person ${index + 1}`,
      data: [data.totalValue],
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1,
    }));

    // Final dataset to be returned for each category
    const barChartCarouselData =  [
      { labels: monthlyAveragedataArray.map((data:any) => data.userDisplayName || `Person ${data.index + 1}`), datasets: electricityData },
      { labels: monthlyAveragedataArray.map((data:any) => data.userDisplayName || `Person ${data.index + 1}`), datasets: fuelData },
      { labels: monthlyAveragedataArray.map((data:any) => data.userDisplayName || `Person ${data.index + 1}`), datasets: vehicularData },
      { labels: monthlyAveragedataArray.map((data:any) => data.userDisplayName || `Person ${data.index + 1}`), datasets: publicTransportData },
      { labels: monthlyAveragedataArray.map((data:any) => data.userDisplayName || `Person ${data.index + 1}`), datasets: airTravelData },
      { labels: monthlyAveragedataArray.map((data:any) => data.userDisplayName || `Person ${data.index + 1}`), datasets: totalData },
    ];
    console.log(barChartCarouselData)
    setCarouselData(barChartCarouselData);
    
    const pieData = {
      labels: monthlyAveragedataArray.map((data: any) => data.userDisplayName || `Person ${data.index + 1}`),
      datasets: [
        {
          data: monthlyAveragedataArray.map((data: any) => data.totalValue),
          backgroundColor: colors.slice(0, monthlyAveragedataArray.length), // Limit colors to the number of users
          borderColor: "#212121", // Dark theme border
          borderWidth: 1,
        },
      ],
    };
  
    // Set pie chart data
    console.log("Pie Chart Data:");
    console.log(pieData);
    setGroupPieChartData(pieData);

  };


  useEffect(() => {
    if(!user?.uid) setCarouselData([]), setGroupPieChartData({});
    
    const fetchData = async () => {
      await fetchCarbonFootprintUserData();
      await fetchGroupData();
    };
  
    fetchData();
  }, [user]);

  useEffect(() => {
    getMonthlyUsagePieAndBarChart();
  }, [userCarbonMonthlyData]);

  useEffect(() => {
    console.log("HIIIIIIIII")
    console.log(groupUsersFootprintData)
    if(!groupUsersFootprintData?.length) setCarouselData([]);
    else getBarChartData(groupUsersFootprintData);
  }, [groupUsersFootprintData]);

  const handleClick = ()=>{
    setAuthModalstate((prev) => ({...prev, isOpen: true}));
  }

  const handleCreateGroup = async () => {
    if (!user?.uid) {
      handleClick(); // Handle unauthenticated user
      return;
    }
  
    if (groupName?.length < 6) {
      toast.error("Group name must be at least 6 chracters long",{
        position:'top-center',
        autoClose:2000,
        theme:'dark',
      });
      return;
    }
  
    try {

      const querySnapshot = await getDocs(
          query(
              collection(firestore, "users"),
              where("user_uid", "==", user.uid),
          )
      );

      const displayName = querySnapshot?.docs?.length ?  querySnapshot.docs[0]?.data()?.displayName : '';
  
      if(!displayName?.length){
        toast.error("Something went wrong. Please try again later!",{
          position:'top-center',
          autoClose:2000,
          theme:'dark',
        });
        return;
      }

      const groupQuerySnapshot = await getDocs(
        query(
            collection(firestore, "GROUP_DATA"),
            where("groupName", "==", groupName),
        )
      );

      const groupNameCheck = groupQuerySnapshot?.docs?.length ?  groupQuerySnapshot.docs[0]?.data()?.groupName : '';

      if(groupNameCheck==groupName){
        toast.error("This group name is already taken",{
          position:'top-center',
          autoClose:2000,
          theme:'dark',
        });
        return;
      }

      const groupData = {
        groupName: groupName, 
        users: [displayName],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addDoc(collection(firestore, "GROUP_DATA"), groupData);
  
      toast.success("Group created succesfully",{
        position:'top-center',
        autoClose:2000,
        theme:'dark',
      });
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Something went wrong. Please try again later!",{
        position:'top-center',
        autoClose:2000,
        theme:'dark',
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!user?.uid) {
      handleClick(); // Handle unauthenticated user
      return;
    }

    if (groupName?.length < 6) {
      toast.error("Group name must be at least 6 characters long", {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark',
      });
      return;
    }

    try {
      // Fetch user's display name
      const querySnapshot = await getDocs(
        query(
          collection(firestore, "users"),
          where("user_uid", "==", user.uid)
        )
      );

      const displayName = querySnapshot?.docs?.length ? querySnapshot.docs[0]?.data()?.displayName : '';

      if (!displayName?.length) {
        toast.error("Something went wrong. Please try again later!", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
        return;
      }

      // Check if the group exists
      const groupQuerySnapshot = await getDocs(
        query(
          collection(firestore, "GROUP_DATA"),
          where("groupName", "==", groupName)
        )
      );

      const groupDoc = groupQuerySnapshot?.docs?.[0];
      const groupNameCheck = groupDoc?.data()?.groupName;
      const groupUsers = groupDoc?.data()?.users || [];

      if (groupNameCheck !== groupName) {
        toast.error("This group name does not exist", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
        return;
      }

      // Check if the user is already in the group
      if (groupUsers.includes(displayName)) {
        toast.error("You are already a member of this group", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
        return;
      }

      // Add the user to the group
      groupUsers.push(displayName);

      // Update the group document in Firestore
      const groupDocRef = doc(firestore, "GROUP_DATA", groupDoc.id);
      await updateDoc(groupDocRef, {
        users: groupUsers,
        updatedAt: new Date(), // Update the timestamp
      });

      toast.success("Successfully joined the group", {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark',
      });

    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Something went wrong. Please try again later!", {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark',
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.uid) {
      handleClick(); // Handle unauthenticated user
      return;
    }
  
    if (groupName?.length < 6) {
      toast.error("Group name must be at least 6 characters long", {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark',
      });
      return;
    }
  
    try {
      // Fetch user's display name
      const querySnapshot = await getDocs(
        query(
          collection(firestore, "users"),
          where("user_uid", "==", user.uid)
        )
      );
  
      const displayName = querySnapshot?.docs?.length ? querySnapshot.docs[0]?.data()?.displayName : '';
  
      if (!displayName?.length) {
        toast.error("Something went wrong. Please try again later!", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
        return;
      }
  
      // Check if the group exists
      const groupQuerySnapshot = await getDocs(
        query(
          collection(firestore, "GROUP_DATA"),
          where("groupName", "==", groupName)
        )
      );
  
      const groupDoc = groupQuerySnapshot?.docs?.[0];
      const groupNameCheck = groupDoc?.data()?.groupName;
      let groupUsers = groupDoc?.data()?.users || [];
  
      if (groupNameCheck !== groupName) {
        toast.error("This group name does not exist", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
        return;
      }
  
      // Check if the user is part of the group
      if (!groupUsers.includes(displayName)) {
        toast.error("You are not a member of this group", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
        return;
      }
  
      // Remove the user from the group
      groupUsers = groupUsers.filter((user:string) => user !== displayName);
  
      // Update the group document in Firestore
      const groupDocRef = doc(firestore, "GROUP_DATA", groupDoc.id);
  
      if (groupUsers.length === 0) {
        // If no users left, delete the group
        await deleteDoc(groupDocRef);
        toast.success("You have left the group. The group has been deleted because it had no members left.", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
      } else {
        // If there are still users, just update the group document
        await updateDoc(groupDocRef, {
          users: groupUsers,
          updatedAt: new Date(), // Update the timestamp
        });
        toast.success("You have successfully left the group", {
          position: 'top-center',
          autoClose: 2000,
          theme: 'dark',
        });
      }
  
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Something went wrong. Please try again later!", {
        position: 'top-center',
        autoClose: 2000,
        theme: 'dark',
      });
    }
  };


  const handleCommunitiesNavigation = ()=>{
    if(user?.uid){
        router.push("/Communities");
    }
    else{
        handleClick();
    }
  }

  

  return (
    <div>
      {/* <Navbar/> */}
      {authModal.isOpen && <AuthModal/>}
      <div className="text-white h-[92vh]  overflow-y-auto  font-bold scrollbar-thin scrollbar-thumb-rounded-lg scrollbar-thumb-scroll-thumb scrollbar-track-scroll-track">
        <div className="w-full mt-[40px] flex text-center items-center justify-center p-[2%] text-4xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-600 to-green-300 ">
          Track your carbon footprint better with EcoTrack
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center ">
            <div className="w-full p-[10px] flex items-center justify-center text-lg bg-clip-text text-transparent bg-gradient-to-b from-purple-400 via-pink-500 to-red-500">
              Monitor Your Monthly Carbon Footprint
            </div>
            <div className="w-[30%] flex flex-col items-center justify-center bg-gradient-to-b from-pink-900 to-slate-900 border border-black">
              {(user?.uid && !(monthlyBarChart?.labels && monthlyBarChart?.datasets?.length) )  && <div className="w-full h-full flex justify-center items-center text-red-500">
                No data to show
              </div>}
              <BarChart chartLabels={ (monthlyBarChart?.labels && monthlyBarChart?.datasets?.length)? monthlyBarChart.labels:  monthlyData.labels}  ChartDatasets={(monthlyBarChart?.datasets?.length)? monthlyBarChart.datasets:monthlyData.datasets} />
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
        <div className="w-[36%] h-[96%] p-[2%] flex flex-col text-center items-center justify-center text-3xl font-sans text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Gain valuable insights on<br />your group&apos;s footprint 
          {user?.uid && !carouselData?.length && (
            <span className="text-green-500 text-xl mt-2">
              Join a group now to collaborate and reduce your carbon footprint together!
            </span>
          )}
        </div>
          <div className="w-[60%] h-full flex items-center">
            <CircularCarousel dataArray={carouselData.length? carouselData : dataArray}/>
          </div>
        </div>
        <div className="w-[80%] ml-[10%] mt-[40px] h-4/5 flex flex-col mb-[30px]  bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-md ">
          <div className="flex h-[20%] justify-center items-center text-lg font-light font-serif w-full">
            Take the first step towards tracking and reducing your carbon emissions from fuel and travel. Together, we can work towards a carbon-neutral future.
          </div>
          <div className="w-full h-[80%] flex flex-row">
          <div className="w-1/2 h-full flex justify-center flex-col">
              {(user?.uid && !(groupPieChartData?.labels?.length ) )  && <div className="w-full h-full flex justify-center items-center text-red-500">
                No data to show
              </div>}
              <PieChart
                chartLabels={groupPieChartData?.labels?.length ?groupPieChartData.labels: familyChartLabels}
                ChartDatasets={groupPieChartData?.labels?.length ?groupPieChartData.datasets:familyChartDatasets}
                legendPosition="bottom"
                titleText="Your group's Carbon Footprint"
              />
            </div>
            <div className="w-1/2 h-full flex justify-center flex-col">
              {(user?.uid && !(userCarbonMonthlyData?.length ) )  && <div className="w-full h-full flex justify-center items-center text-red-500">
                No data to show
              </div>}
              <PieChart
                chartLabels={userCarbonMonthlyData?.length ? monthlyAverageChartLabels:monthlyChartLabels}
                ChartDatasets={userCarbonMonthlyData?.length && monthlyAveragePieChart?.length  ? monthlyAveragePieChart:monthlyChartDatasets}
                legendPosition="bottom"
                titleText={"Monthly Carbon Footprint"}
              />
            </div>
          </div>
        </div>
        <div className="w-[90%] ml-[5%] mt-[30px] flex text-center items-center p-[2%] text-4xl font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-600 to-green-300 ">
          Community Events
        </div>
        <div className="w-[80%] ml-[10%] mt-[10px] flex flex-col mb-[30px]  bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-md ">
          <div className="flex justify-center items-center text-lg font-light font-serif w-full">
          Join community events worldwide and earn karma points. Organize environmental clean-ups or awareness campaigns in your city and connect with participants here to make a positive impact and help create a better world.
          </div>
          <div>
            <div className="flex items-center justify-center cursor-pointer p-2 my-4 w-[200px] bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 "
              onClick={handleCommunitiesNavigation}
            >
              Discover Events
            </div>
          </div>
        </div>
        <div className="w-[80%] ml-[10%] mt-[10px] flex flex-col mb-[30px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex justify-center items-center text-lg font-light font-serif w-full">
            Collaborate and grow together: Create or join groups to achieve your goals with others!
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={groupName}
              name="groupName"
              maxLength={30}
              onChange={(e)=>{setGroupName(e.target.value)}}
              placeholder="Enter group name..."
              className="w-full p-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <button
              className="flex items-center justify-center p-2 w-[200px] bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={handleCreateGroup}
            >
              Create Group
            </button>
            <button
              className="flex items-center justify-center p-2 w-[200px] bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={handleJoinGroup}
            >
              Join Group
            </button>
            <button
              className="flex items-center justify-center p-2 w-[200px] bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={handleLeaveGroup}
            >
              Leave Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
