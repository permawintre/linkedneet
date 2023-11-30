
import React, { useState, useEffect } from 'react';
import { Bars } from "react-loader-spinner";

export const Main = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const delay = 1000; // 1 seconds in milliseconds

        const timerId = setTimeout(() => {
            setIsLoading(false);
        }, delay);

        return () => {
            // Cleanup function to clear the timer if the component unmounts
            clearTimeout(timerId);
        };
    }, []); 

    return(
        <div>
        {isLoading ? (
            <div className="loadingContainer">
                <Bars
                type="ThreeDots"
                color="#00b22d"
                height={100}
                width={100}
                />
            </div>
        ) : (
            <div className='mainPage'></div>
        )}
        </div>
    )
}