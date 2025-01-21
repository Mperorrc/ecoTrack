"use client"
import Head from "next/head";
import "./globals.css";
import { RecoilRoot } from "recoil";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Head>
            <title>
              EcoTrack
            </title>
            <meta name="viewport" content=" width-device-width, initial-scale-1"/>
            <link rel="icon" href="/favicon.png" />
            <meta name="description" content="Track you carbon footprint" />
        </Head>
      <html lang="en">
        <body className=" bg-[#121212]">
          <ToastContainer />
          <RecoilRoot>
            <Navbar/>
            {children}
          </RecoilRoot>
        </body>
      </html>
    </>
  );
}
