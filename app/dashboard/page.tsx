'use client'

import { hasCookie, deleteCookie, getCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import mqtt from 'mqtt';

const Dashboard = () => {
    const TOPIC = "SRM/BEL/AS30M_001/#"
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(
        {
            Total: null,
            Reading: null,
            Status: null,
        }
    );

    const handellogout = () => {
        setLoading(true)
        deleteCookie('USERNAME')
        router.push('/')
    }

    useEffect(() => {
        const client = mqtt.connect('ws://reflow.online:9001', {
            username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
            password: process.env.NEXT_PUBLIC_MQTT_PASSWORD
        });

        client.on('connect', function () {
            client.subscribe(TOPIC, function (err) {
                if (!err) {
                    console.log('Connected to MQTT broker');
                }
            })
        })

        client.on("message", (receivedTopic, receivedMessage) => {
            try {
                const parsedMessage = JSON.parse(receivedMessage.toString());

                const endpoint = receivedTopic.split('/')
                const lastElement = endpoint[endpoint.length - 1];
                setData(prevData => {
                    return { ...prevData, [lastElement]: parsedMessage };
                });
            } catch (error) { }
        });

        return () => {
            client.end();
            console.log("Disconnected from MQTT broker");
        }
    }, []);

    useEffect(() => {
        const checkCookie = async () => {
            if (!hasCookie('USERNAME')) {
                router.push('/')
            }
            else {
                setLoading(false)
            }
        };
        checkCookie();
    }, [router]);

    return (
        <div className="h-screen p-1 sm:p-6 bg-gray-100 flex flex-col justify-center items-center">
            {loading ? (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-300 bg-opacity-50 z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="relative container w-full h-full mx-auto p-2 sm:p-6 flex flex-col items-center justify-start">
                    <button className='absolute top-2 right-2 px-2 py-1 sm:px-4 sm:py-2 rounded-lg bg-blue-800 text-sm sm:text-md text-white hover:cursor-pointer' onClick={handellogout}>Logout</button>
                    <h1 className="text-3xl sm:text-5xl font-semibold my-10 sm:my-8">Dashboard</h1>
                    <h2 className='w-full sm:w-[80%] text-xl sm:text-2xl'>Welcome.! <b> {getCookie('USERNAME')}</b> </h2>
                    <div className="w-full sm:w-[80%] my-3 sm:my-6 bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-800">
                                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-white  sm:text-xl font-semibold">Status</th>
                                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-white  sm:text-xl font-semibold">Range</th>
                                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-white  sm:text-xl font-semibold">Height</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-black">
                                    <td
                                        className="px-1 sm:px-4 py-2 sm:py-3 text-white text-center sm:text-xl font-semibold"
                                        style={{ color: data.Status === 'Online' ? 'green' : 'red' }}
                                    >
                                        {data.Status || "Loading..."}
                                    </td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-3 text-center sm: text-md">{data.Reading || 'Loading...'}</td>
                                    <td className="px-1 sm:px-4 py-2 sm:py-3 text-center sm: text-md">{data.Total || 'Loading...'}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
