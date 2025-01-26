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
            <div className="bg-gray-800 rounded-lg w-[30%] shadow-lg flex flex-col">
                <h2 className=" text-2xl m-4 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-400 flex items-center justify-center">EcoTrackBot</h2>
                <div className='text-white'>
                    New Chat
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg w-[78.75%] ml-[1.25%] shadow-lg">
                <div className="h-[70%] w-full bg-gray-800 rounded-lg shadow-lg flex flex-col overflow-y-auto">
                    {messages.map((message, index) => (
                        <React.Fragment key={index}>
                            {/* Input Message */}
                            {message.input?.length > 0 && (
                                <div
                                    className="flex ml-[40%] w-[50%] mr[10%] my-[2.5%] p-4 text-white break-words overflow-x-hidden bg-gray-600 rounded-lg"
                                    style={{
                                        wordBreak: "break-word",
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    {message.input}
                                </div>
                            )}
                            
                            {/* Output Message */}
                            {message.output?.length > 0 && (
                                <div
                                    className="flex justify-center w-[70%] m-[2.5%] text-white break-words overflow-x-hidden bg-gray-600 rounded-lg"
                                    style={{
                                        wordBreak: "break-word",
                                        overflowWrap: "break-word",
                                    }}
                                >
                                    {message.output}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div className='h-[30%] w-full bg-gray-800 rounded-lg shadow-lg flex flex-col'>
                    <textarea
                        value={inputText}
                        onChange={handleInputChange}
                        className="w-[95%] mx-[2.5%] h-24 p-4 bg-gray-700 text-white border border-gray-600 rounded-lg resize-none focus:outline-none"
                        placeholder="Type your message here..."
                        maxLength={maxTokens}
                    />
                    <div className="flex m-4 justify-between flex-row items-center mt-4 text-white text-sm">
                        <span>Characters: {tokenCount}/{maxTokens}</span>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            disabled={tokenCount === 0 || tokenCount > maxTokens}
                            onClick={handleSend}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
