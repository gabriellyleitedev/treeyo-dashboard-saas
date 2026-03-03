import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileDock from './MobileDock';


const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className="flex-1 transition-all duration-500 flex flex-col h-screen p-0 relative">

        <div className="
          flex-1 bg-[#1a1a1a] 
          rounded-none border-none
          xl:rounded-[2.5rem] xl:border xl:border-white/5 xl:shadow-2xl
          overflow-y-auto overflow-x-hidden custom-scrollbar
        ">

          <div className="px-0 md:px-10 h-full pb-28 md:pb-6">
            <Outlet context={{ isCollapsed }} />
          </div>
        </div>
        <MobileDock />
      </main>
    </div>
  );
};

export default Layout;