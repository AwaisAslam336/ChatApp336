import React from "react";
import BasicTabs from "../components/BasicTabs";

function LandingPage() {
  return (
    <div className="flex flex-row h-100 bg-slate-200 p-[5%] flex-wrap sm:justify-center md:justify-center">
      <div className="grow flex flex-col self-center">
        <h1 className="text-blue-500 font-sans text-[2rem] font-bold self-center">
          Chat App
        </h1>
        <p className="text-black font-sans text-[1rem] font-medium self-center">
          Chat with your friends in real time
        </p>
      </div>
      <div className="bg-white mt-2 rounded-md h-[100vh]">
        <BasicTabs />
      </div>
    </div>
  );
}

export default LandingPage;
