'use client'

import { hasCookie, deleteCookie, getCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import mqtt from 'mqtt'; 

const Dashboard = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([
        // {
        //     Total:30,
        //     Reading:10,
        //     Status:'online'
        // }
    ]); 

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
            client.subscribe('SRM/BEL/AS30M_001', function (err) {
                if (!err) {
                    console.log('Connected to MQTT broker');
                }
            })
        })

        client.on('message', function (topic, message) {
            setData(JSON.parse(message.toString()));
            console.log(data)
        })

        return () => {
            client.end(); 
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
        <div className="h-screen p-6 bg-gray-100 flex flex-col justify-center items-center">
            {loading ? (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-300 bg-opacity-50 z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="relative container w-full h-full mx-auto p-6 flex flex-col items-center justify-start">
                    <button className='absolute top-2 right-2 px-4 py-2 rounded-lg bg-blue-800 text-md text-white hover:cursor-pointer' onClick={handellogout}>Logout</button>
                    <h1 className="text-5xl font-semibold my-8">Dashboard</h1>
                    <h2 className='w-full text-2xl'>Welcome.! <b> {getCookie('USERNAME')}</b> </h2>
                    <div className="w-full my-6 bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full ">
                            <thead>
                                <tr className="bg-blue-800">
                                    <th className="px-4 py-3 text-white text-xl font-semibold">Status</th>
                                    <th className="px-4 py-3 text-white text-xl font-semibold">Range</th>
                                    <th className="px-4 py-3 text-white text-xl font-semibold">Height</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, index) => (
                                    <tr key={index} className="border-black">
                                        <td className="px-4 py-3 text-center text-md">{item.Status || 'Loading..!'}</td>
                                        <td className="px-4 py-3 text-center text-md">{item.Reading || 'Loading..!'}</td>
                                        <td className="px-4 py-3 text-center text-md">{item.Total || 'Loading..!'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
