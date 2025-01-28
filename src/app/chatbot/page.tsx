'use client';
import React, { useState } from 'react';

type PageProps = {};

const Page: React.FC<PageProps> = () => {
    const [inputText, setInputText] = useState('');
    const [tokenCount, setTokenCount] = useState(0);
    const [messages,setMessages] = useState<{
        input:string,
        output:string,
    }[]>([]);


    const maxTokens = 2000;

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setInputText(text);
        setTokenCount(Math.min(maxTokens, text.length));
    };
    
    const handleSend = async () => {
        if (inputText.length === 0 || inputText.length > maxTokens) return;
        console.log("here1");
        try{
            const res = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ inputText }),
            });
            console.log("here2");
            const resData = await res.json();
            console.log(resData);
            const output = resData.output
    
            setMessages((prev) => [
                ...prev,
                { input: inputText, output: output },
            ]);
            setInputText(""); 
        }
        catch(error){
            console.log("Couldn't retrieve message");
        }
    };

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
