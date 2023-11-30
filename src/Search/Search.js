import React, { useState, useEffect } from "react"
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { dbService, auth } from '../firebase';
import { useLocation } from "react-router-dom"
import { defaultData } from '../Profile/defaultData'
import { SearchUsers } from "./SearchUsers";
import { SearchPosts } from "./SearchPosts"
import { SearchProjects } from "./SearchProjects"
import './Search.css'

export const Search = () => {
  // profiledetail에 접속해 있는 user의 정보(currentUserData)를 firebase에서 fetch
  const [currentUserData, setCurrentUserData] = useState({ ...defaultData });
  const [currentUserDataLoaded, setCurrentUserDataLoaded] = useState(false);

  // For querystring 'uid'
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search_query = queryParams.get('q'); // uid가 없는 경우 현재 사용자의 uid 사용

  useEffect( () => { // Current User Data Fetch
    const fetchCurrentUserData = async () => {
      try {
        const currentUserDocRef = doc(dbService, 'users', auth.currentUser.uid);
        const currentUserDoc = await getDoc(currentUserDocRef);

        if (currentUserDoc.exists()) {
          setCurrentUserData(prevData => ({ ...prevData, ...currentUserDoc.data() }));
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setCurrentUserDataLoaded(true);
      }
    };

    fetchCurrentUserData()
  }, []);
  
  // firebase에서 currentUserData가 fetch되기 전까지 Loading... 띄우기
  if (!currentUserDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="search__body">
      <div className="friend-profiles">
        <div className="friend-texts">
            <h2> <span className="highlight">{search_query}</span> - 유저</h2>
        </div>
        <SearchUsers searchterm={search_query} currentUserData={currentUserData}></SearchUsers>
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          <h2> <span className="highlight">{search_query}</span> - 소모임</h2>
        </div>
        <SearchProjects searchterm={search_query}></SearchProjects> 
      </div>
      <div className="friend-profiles-last">
        <div className="friend-texts">
          <h2> <span className="highlight">{search_query}</span> - 포스트</h2>
        </div>
        <SearchPosts searchterm={search_query} currentUserData={currentUserData}></SearchPosts>
      </div>
    </div>
  );
};