import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { defaultData } from './defaultData'
import './Profile.css'

// UserProfile 컴포넌트는 각 사용자의 ID를 받아 해당 사용자의 데이터를 Firebase에서 가져옴.
const UserProfile = ({ uid }) => {
  const [profileData, setProfileData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from Firebase
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(dbService, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfileData(prevData => ({ ...prevData, ...userDoc.data() }));
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false); // Loading 끝
      }
    };

    fetchUserData();
  }, [uid]);
  

  // firebase에서 data fetch되기 전까지 Loading... 띄우기
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
        <Link to={`/profiledetail?uid=${uid}`}>
          <img className="background-img" src={profileData.background_image}/>
          <img className="profile-img" src={profileData.profile_image} alt={profileData.nickname} />
        </Link>
        <div className="profile-info">
          <Link to={`/profiledetail?uid=${uid}`} className="profile-name">{profileData.nickname}</Link>
          <p className="profile-group">니트컴퍼니 {profileData.generation}기</p>
          <p className="profile-friend">{profileData.friendInfo}</p>
        </div>
    </div>
  );
};

const renderFollowerProfiles = (followerList) => {  
  // 유효한 userId만 필터링
  const validFollowers = followerList.filter(uid => uid);
  const slicedFollowers = validFollowers.slice(0, 4)

  if (validFollowers.length === 0) {
    return (
      <h1 className="profiles-row-center">아직 팔로워가 없어요... T^T</h1>
    )
  }

  return  (
    <div className="profiles-row">
      { validFollowers.map((uid, index) => (
        <UserProfile key={uid} uid={uid} />
      )) }
    </div>
  )
};

const renderFollowingProfiles = (followingList) => {
  // 유효한 userId만 필터링
  const validFollowings = followingList.filter(uid => uid);

  if (validFollowings.length === 0) {
    return (<h1 className="profiles-row-center">아직 팔로잉이 없어요... T^T</h1>)
  }

  const slicedFollowings = validFollowings.slice(0, 4)  
  return (
    <div className="profiles-row">
      { validFollowings.map((uid, index) => (
        <UserProfile key={uid} uid={uid} />
      )) }
    </div>
  )
};

const renderRecommendProfiles = (recommendList) => {
  // 유효한 userId만 필터링
  const validRecommends = recommendList.filter(uid => uid);

  const slicedFollowings = validRecommends.slice(0, 4) 
  return (
    <div className="profiles-row">
      { validRecommends.map((uid, index) => (
        <UserProfile key={uid} uid={uid} />
      )) }
    </div>
  )
};

export const Profile = () => {
  // profiledetail에 접속해 있는 user의 정보(currentUserData)를 firebase에서 fetch
  const [currentUserData, setCurrentUserData] = useState({ ...defaultData });
  const [currentUserDataLoaded, setCurrentUserDataLoaded] = useState(false);
  const [profileUserData, setProfileUserData] = useState({ ...defaultData });
  const [profileUserDataLoaded, setProfileUserDataLoaded] = useState(false);
  const [randomUserIds, setRandomUserIds] = useState([]);
  const [randomUserDataLoaded, setCurrentRandomDataLoaded] = useState(false);
  const [myProfile, setMyProfile] = useState(false);

  // For querystring 'uid'
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid') || auth.currentUser.uid; // uid가 없는 경우 현재 사용자의 uid 사용

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

  // profile에 정보를 띄울 user의 정보(profileUserData)를 firebase에서 fetch
  useEffect(() => {
    const fetchProfileUserData = async () => {
      try {
        // uid가 현재 사용자의 uid와 같거나, uid가 없는 경우
        if (!uid || uid === auth.currentUser.uid) {
          setProfileUserData(currentUserData);
          setMyProfile(true);
        } else {
          // uid가 다른 경우 별도로 fetch
          const profileUserDocRef = doc(dbService, 'users', uid);
          const profileUserDoc = await getDoc(profileUserDocRef);

          if (profileUserDoc.exists()) {
            setProfileUserData(prevData => ({ ...prevData, ...profileUserDoc.data() }));
          } else {
            console.log('User not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setProfileUserDataLoaded(true);
      }
    };

    fetchProfileUserData();
  }, [uid, currentUserData]);

  useEffect(() => {  // Random User IDs Fetch
    const fetchUserIds = async () => {
      const usersCollectionRef = collection(dbService, 'users');
      const data = await getDocs(usersCollectionRef);

      // 모든 사용자의 ID를 배열로 변환
      const allUserIds = data.docs.map(doc => doc.id);

      // 현재 로그인한 사용자의 ID 제외
      const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

      // 현재 사용자, 그의 팔로워, 팔로잉을 제외한 사용자 ID만 필터링합니다.
      const filteredUserIds = allUserIds.filter(id => 
        id !== auth.currentUser.uid &&
        !currentUserData.followers.includes(id) &&
        !currentUserData.followings.includes(id)
      );

      // 랜덤하게 사용자 ID 선택 (여기서는 6개를 선택)
      const selectedUserIds = filteredUserIds.sort(() => 0.5 - Math.random()).slice(0, 6);

      setRandomUserIds(selectedUserIds);

      setCurrentRandomDataLoaded(true);
    };

    fetchUserIds();
  }, [currentUserDataLoaded, currentUserData]);

  
  // firebase에서 모든 Data가 fetch되기 전까지 Loading... 띄우기
  if (!currentUserDataLoaded || !randomUserDataLoaded || !profileUserDataLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile__body">
      <div className="friend-profiles">
        <div className="friend-texts">
          {myProfile ? (
            <h2>팔로워 친구들의 프로필을 구경해보세요!</h2>
          ): (
            <h2> <span className="highlight">{profileUserData.nickname}</span>님의 팔로워</h2>
          )}
        </div>
        {renderFollowerProfiles(profileUserData.followers)}
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          {myProfile ? (
            <h2>팔로잉 친구들의 프로필을 구경해보세요!</h2>
          ): (
            <h2> <span className="highlight">{profileUserData.nickname}</span>님의 팔로잉</h2>
          )}
        </div>
        {renderFollowingProfiles(profileUserData.followings)}
      </div>
      <div className="friend-profiles-last">
        <div className="friend-texts">
          <h2>더 많은 친구를 찾아보세요!</h2>
        </div>
        {renderRecommendProfiles(randomUserIds)}
      </div>
    </div>
  );
};