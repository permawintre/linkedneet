import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { defaultData } from '../Profile/defaultData'
import { Write, Post } from '../Home/Home'
import { SearchUsers } from "./SearchUsers";

// import './Profile.css'

// UserProfile 컴포넌트는 각 사용자의 ID를 받아 해당 사용자의 데이터를 Firebase에서 가져옴.
const UserProfile = ({ uid, currentUserData }) => {
  const [profileData, setProfileData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [friendInfo, setFriendInfo] = useState('');

  useEffect(() => {
    // Fetch user data from Firebase
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(dbService, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const fetchedProfileData = userDoc.data();
          setProfileData(prevData => ({ ...prevData, ...fetchedProfileData }));
          // 프로필 사용자의 데이터가 로드되면 friendInfo 계산
          calculateFriendInfo(fetchedProfileData.followers, currentUserData.followings);
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
  
  const calculateFriendInfo = (profileFollowers, currentUserFollowing) => {
    // 현재 사용자의 팔로잉 중 프로필의 팔로워에 포함된 사람들 찾기
    const mutualFollowers = profileFollowers.filter(followerId => currentUserFollowing.includes(followerId));
    
    // Firebase에서 각 mutualFollower의 닉네임 가져오기
    const fetchNames = async () => {
      const names = await Promise.all(
        mutualFollowers.slice(0, 2).map(async (followerId) => {
          const docRef = doc(dbService, "users", followerId);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? docSnap.data().nickname : 'Unknown';
        })
      );

      // "홍길동님 외 3명이 팔로우합니다." 형태의 문자열 생성
      let infoText = '';
      if (names.length > 0) {
        infoText += names.join(', ') + '님';
        if (mutualFollowers.length > 2) {
          infoText += ` 외 ${mutualFollowers.length - 2}명이 팔로우합니다.`;
        } else {
          infoText += `이 팔로우합니다.`;
        }
      } else {
        infoText = ''
      }
      setFriendInfo(infoText);
    };

    fetchNames();
  };

  // firebase에서 data fetch되기 전까지 Loading... 띄우기
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const intro_title = profileData.intro_title;

  return (
    <div className="user-profile">
        <Link to={`/profiledetail?uid=${uid}`}>
          <img className="background-img" src={profileData.background_image}/>
          <img className="profile-img" src={profileData.profile_image} alt={profileData.nickname} />
        </Link>
        <div className="profile-info">
          <Link to={`/profiledetail?uid=${uid}`} className="profile-name">{profileData.nickname}</Link>
          <p className="profile-group">니트컴퍼니 {profileData.generation}기</p>
          <p className="profile-intro-title">{intro_title ? `"${intro_title}"` : ''}</p>
        <p className="profile-friend">{friendInfo || ''}</p> {/* friendInfo가 없을 경우 빈 문자열 */}
        </div>
    </div>
  );
};

const fetchUserUidsByKeyword = async (searchKeyword) => {
  const userUids = [];

  try {
    // Firestore에서 검색 쿼리 실행
    const q = query(collection(dbService, 'users'), where('nickname', '==', searchKeyword));
    const querySnapshot = await getDocs(q);

    // 각 문서에서 uid 추출
    querySnapshot.forEach((doc) => {
      userUids.push(doc.id);
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
  }

  return userUids;
};


const fetchPostsByContentQuery = async (searchQuery) => {
    const posts = [];
    try {
      // Firestore에서 모든 포스트를 가져옴
      const querySnapshot = await getDocs(collection(dbService, 'posts'));
  
      querySnapshot.forEach((doc) => {
        const postData = doc.data();
        // content 필드에 searchQuery가 포함되어 있는지 확인
        if (postData.content && postData.content.includes(searchQuery)) {
          posts.push({ id: doc.id, ...postData });
        }
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  
    return posts;
  };
  
  // 사용 예시
  const SearchPostsComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState([]);
  
    useEffect(() => {
      if (searchTerm) {
        fetchPostsByContentQuery(searchTerm).then(fetchedPosts => {
          setPosts(fetchedPosts);
        });
      }
    }, [searchTerm]);
  
    return (
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <div>
          {posts.map(post => (
            <div key={post.id}>
              <p>{post.content}</p>
              {/* 여기에 더 많은 포스트 정보를 표시할 수 있습니다. */}
            </div>
          ))}
        </div>
      </div>
    );
  };

const renderUsers = (userList, currentUserData) => {  
  // 유효한 userId만 필터링
  const validUsers = userList.filter(uid => uid);
  const slicedFollowers = validUsers.slice(0, 4)

  if (validUsers.length === 0) {
    return (
      <h1 className="profiles-row-center">유저 검색 결과가 없어요... T^T</h1>
    )
  }

  return  (
    <div className="profiles-row">
      { validUsers.map((uid, index) => (
        <UserProfile key={uid} uid={uid} currentUserData={currentUserData} />
      )) }
    </div>
  )
};

const renderProjects = (followingList, currentUserData) => {
  // 유효한 userId만 필터링
  const validFollowings = followingList.filter(uid => uid);

  if (validFollowings.length === 0) {
    return (<h1 className="profiles-row-center">소모임 검색 결과가 없어요... T^T</h1>)
  }

  const slicedFollowings = validFollowings.slice(0, 4)  
  return (
    <div className="profiles-row">
      { validFollowings.map((uid, index) => (
        <UserProfile key={uid} uid={uid} currentUserData={currentUserData}/>
      )) }
    </div>
  )
};

const renderNeetCompany = (followingList, currentUserData) => {
    // 유효한 userId만 필터링
    const validFollowings = followingList.filter(uid => uid);
  
    if (validFollowings.length === 0) {
      return (<h1 className="profiles-row-center">니트컴퍼니 검색 결과가 없어요... T^T</h1>)
    }
  
    const slicedFollowings = validFollowings.slice(0, 4)  
    return (
      <div className="profiles-row">
        { validFollowings.map((uid, index) => (
          <UserProfile key={uid} uid={uid} currentUserData={currentUserData}/>
        )) }
      </div>
    )
};
  
const renderPosts = (recommendList, currentUserData) => {
  // 유효한 userId만 필터링
  const validRecommends = recommendList.filter(uid => uid);
  const slicedFollowings = validRecommends.slice(0, 4) 
  
  if (validRecommends.length === 0) {
    return (<h1 className="profiles-row-center">포스트 검색 결과가 없어요... T^T</h1>)
  }
  
  return (
    <div className="profiles-row">
      { validRecommends.map((uid, index) => (
        <UserProfile key={uid} uid={uid} currentUserData={currentUserData}/>
      )) }
    </div>
  )
};

export const Search = () => {
  // profiledetail에 접속해 있는 user의 정보(currentUserData)를 firebase에서 fetch
  const [currentUserData, setCurrentUserData] = useState({ ...defaultData });
  const [currentUserDataLoaded, setCurrentUserDataLoaded] = useState(false);
  const [profileUserData, setProfileUserData] = useState({ ...defaultData });
  const [profileUserDataLoaded, setProfileUserDataLoaded] = useState(false);
  const [randomUserIds, setRandomUserIds] = useState([]);
  const [randomUserDataLoaded, setCurrentRandomDataLoaded] = useState(false);
  const [exists, setMyProfile] = useState(false);

  // For querystring 'uid'
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search_query = queryParams.get('q'); // uid가 없는 경우 현재 사용자의 uid 사용
  const uid = auth.currentUser.uid;


  const [userList, setUserList] = useState([]);

  useEffect(() => {
    fetchUserUidsByKeyword(search_query).then(fetchedUserList => {
      setUserList(fetchedUserList);
    });
  }, [search_query]);



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

    if (currentUserDataLoaded) {
      fetchProfileUserData();
    }
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

    if (currentUserDataLoaded) {
      fetchUserIds();
    }
  }, [currentUserDataLoaded, currentUserData]);

  
//   // firebase에서 모든 Data가 fetch되기 전까지 Loading... 띄우기
//   if (!currentUserDataLoaded || !randomUserDataLoaded || !profileUserDataLoaded) {
//     return <div>Loading...</div>;
//   }

  return (
    <div className="profile__body">
      <div className="friend-profiles">
        <div className="friend-texts">
            {/* <h2> <span className="highlight">{profileUserData.nickname}</span>님의 팔로워</h2> */}
            <h2> <span className="highlight">{search_query}</span> - 유저</h2>
        </div>
        <SearchUsers searchterm={search_query} currentUserData={currentUserData}></SearchUsers>
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          {exists ? (
              <h2> <span className="highlight">{search_query}</span> - 소모임</h2>
            ) : (
            //   <h2> <span className="highlight">{profileUserData.nickname}</span>님의 팔로잉</h2>
              <h2> <span className="highlight">{search_query}</span> - 소모임</h2>
              )}
        </div>
        {renderProjects(profileUserData.followings, currentUserData)}
      </div>
      <div className="friend-profiles">
        <div className="friend-texts">
          {exists ? (
              <h2> <span className="highlight">{search_query}</span> - 니트컴퍼니</h2>
            ) : (
            //   <h2> <span className="highlight">{profileUserData.nickname}</span>님의 팔로잉</h2>
              <h2> <span className="highlight">{search_query}</span> - 니트컴퍼니</h2>
              )}
        </div>
        {renderNeetCompany(profileUserData.followings, currentUserData)}
      </div>
      <div className="friend-profiles-last">
        <div className="friend-texts">
            {exists ? (
                <h2> <span className="highlight">{search_query}</span> - 포스트</h2>
                ) : (
                //   <h2> <span className="highlight">{profileUserData.nickname}</span>님의 팔로잉</h2>
                <h2> <span className="highlight">{search_query}</span> - 포스트</h2>
            )}
        </div>
        {renderPosts(randomUserIds, currentUserData)}
      </div>
    </div>
  );
};