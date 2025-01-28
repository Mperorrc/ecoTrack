'use client';
import React, { useState } from 'react';

type PageProps = {};

const Page: React.FC<PageProps> = () => {
    return (
        <div className="bg-gray-900 h-[92vh] flex flex-row p-4">
            <div className="h-full w-[90%] ml-[5%]">
                <iframe
                    src="https://www.chatbase.co/chatbot-iframe/uTri2MLOiFDtepEHlXppT"
                    width="100%"
                    height={'100%'}
                    
                    // style="height: 100%; min-height: 700px"
                    // frameborder="0"
                ></iframe>
            </div>
        </div>
    );
};

export default Page;
