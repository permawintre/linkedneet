import React, { useState, useEffect } from 'react';

export const Approve = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const delay = 5000; // 5 seconds in milliseconds

        const timerId = setTimeout(() => {
            setIsLoading(false);
        }, delay);

        return () => {
            // Cleanup function to clear the timer if the component unmounts
            clearTimeout(timerId);
        };
    }, []); 

    return (
        <div>
            {isLoading ? (
                <h1>Loading...</h1>
            ) : (
                <h1>관리자의 승인이 필요합니다!</h1>
            )}
        </div>
    );
};
