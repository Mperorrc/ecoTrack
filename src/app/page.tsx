"use client"
import { authModalState } from "@/atoms/authModalAtom";
import AuthModal from "@/components/Modals/AuthModal";
import Navbar from "@/components/Navbar/Navbar";
import { useRecoilValue } from "recoil";

export default function Home() {
  
  const authModal = useRecoilValue(authModalState);

  return (
    <div>
      <Navbar/>
      {authModal.isOpen && <AuthModal/>}
    </div>
  );
}
