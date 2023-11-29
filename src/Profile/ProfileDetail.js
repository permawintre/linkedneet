import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaFacebookSquare, FaInstagramSquare} from 'react-icons/fa';
import { IoGlobeOutline } from "react-icons/io5";
import { MdPhoneIphone, MdEmail, MdCalendarMonth } from 'react-icons/md'
import { ProfileEditModal, ProfileIntroEditModal } from './ProfileEditModal';
import { ProfileComment } from './ProfileComment';
import { ProfilePost } from './ProfilePost';
import { defaultData } from './defaultData'
import './ProfilePost.css';
import { Bars } from "react-loader-spinner";

const DefaultProfileImg = 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png'
const DefaultIntroImg = 'https://cdn.imweb.me/upload/S20191010288d21675b22f/e33c22faf15bc.jpg'

const ProfileHeader = ({userData, myProfile}) => {
  const bgImageStyle = {
      backgroundImage: `url(${userData.background_image})`
    };
  const website_url = 'https://' + userData.website;
  const facebook_url = 'https://www.facebook.com/' + userData.facebook;
  const insta_url = 'https://www.instagram.com/' + userData.instagram;

  // Profile Edit
  const [EditClicked, setEditClicked] = useState(false);
  const EditClick = () => {
    setEditClicked(true);
  };
  const EditModalClose = () => {
    setEditClicked(false);
  };

  const EditButton = () => {
    if (myProfile) {
      return <input type="button" className="edit-button" onClick={EditClick}/>;
    } else {
      return null;
    }
  };


  // Following Handle 
  /* TODO!
   * IsFollowed() 구현 => 이미 Follow 된 사람들에 한해서 Follow 비활성화
   * 자기 페이지 Follow 비활성화
   * Optimistic Following 구현 
   */

  const handleFollow = async () => {
    try {
      const currentUserID = auth.currentUser.uid;
      const otherUserID = userData.uid;

      const otherUserRef = doc(dbService, "users", otherUserID);
      await updateDoc(otherUserRef, {
        followers: arrayUnion(currentUserID),
      })
      
      const userRef = doc(dbService, "users", currentUserID);
      await updateDoc(userRef, {
        followings: arrayUnion(otherUserID),
      })

    } catch(error) {
      console.log(error);
    }
  }

  return (
    <div className="header-container">
        <div className="bg-image" style={bgImageStyle}>
        </div>
      <main>
        <div className="profile-header">
            <div className="header-left">
                <div className="header-left1">
                    <div className="nickname">{userData.nickname}</div>
                    <div className="info">니트컴퍼니 {userData.generation}기</div>
                </div>
                <div className="header-left2">
                  <Link to="/profile">
                    <span className="info">팔로워 {userData.followers.length}명</span>
                    <span className="info">팔로잉 {userData.followings.length}명</span>
                  </Link>
                </div>
                <div className="header-left3">
                  {myProfile ? (
                    <h3> </h3>
                  ) : (
                    <button onClick={handleFollow}>Follow</button>
                  )}
                </div>
            </div>
            <div className="header-mid">
              <img className="profile-image" src={userData.profile_image} alt=""/>
            </div>
            <div className="header-right">
                <div className="header-right1">
                    <a href={website_url} target="_blank" rel="noopener noreferrer">
                        <IoGlobeOutline size="30" style={{ color: 'black' }} title={website_url}/>
                    </a>
                    <a href={facebook_url} target="_blank" rel="noopener noreferrer">
                        <FaFacebookSquare size="30" style={{ color: '#4267b2' }} title={facebook_url}/>
                    </a>
                    <a href={insta_url} target="_blank" rel="noopener noreferrer">
                        <FaInstagramSquare size="30" style={{ color: '#d62976' }} title={insta_url}/>
                    </a>
                </div>
                <div className="header-right2">
                    <div className="email">
                        <MdEmail size="16"/>&nbsp;
                        {userData.email}
                    </div>
                    <div className="phone-number">
                        <MdPhoneIphone size="16"/>&nbsp;
                        {userData.tel}
                    </div>
                </div>
            </div>
            <div className="header-additional-right">
              <span className="edit-profile-header">
                {EditButton()}
                {myProfile && EditClicked && (
                  <ProfileEditModal
                    user={null}
                    EditModalClose={EditModalClose}
                  />
                )}
              </span>
            </div>
        </div>
      </main>
    </div>
  );
};

const ProfileIntro = ({userData, myProfile}) => {
  // Profile Intro Edit
  const [EditClicked, setEditClicked] = useState(false);
  const EditClick = () => {
    setEditClicked(true);
  };
  const EditModalClose = () => {
    setEditClicked(false);
  };

  const EditButton = () => {
    if (myProfile) {
      return <input type="button" className="edit-button" onClick={EditClick}/>;
    } else {
      return null;
    }
  };
  
  const [IntroTitle, setIntroTitle] = useState(`안녕하세요. 니트컴퍼니 ${userData.generation}기 ${userData.nickname}입니다.`);
  const [IntroImage, setIntroImage] = useState(DefaultIntroImg);
  const [IntroContent, setIntroContent] = useState(`안녕하세요. 니트컴퍼니 ${userData.generation}기 ${userData.nickname}입니다.`);
  useEffect(() => {
    if (("intro_title" in userData)) {
      if (userData.intro_title !== "" && userData.intro_title !== null) {
        setIntroTitle(userData.intro_title);
      }
    }
    if (("intro_image" in userData)) {
      setIntroImage(userData.intro_image);
    }
    if (("intro_content" in userData && userData.intro_title.length !== 0)) {
      setIntroContent(userData.intro_content);
    }
  })


  return (
    <div className="container">
      <main>
        <h2>나를 <span className="highlight">소개</span>합니다</h2>
        <div className="intro-title">{IntroTitle}</div>
        <div className="body1">
            <img className="intro-image" src={IntroImage}></img>
            <div className="intro">
              <div className="intro-content">
                {IntroContent}
              </div>
              <div className="edit-profile-intro">
                {EditButton()}
                {myProfile && EditClicked && (
                  <ProfileIntroEditModal
                    user={null}
                    EditModalClose={EditModalClose}
                  />
                )}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

const ProfileCareer = ({userData, myProfile}) => {

  return (
    <div className="career-container">
      <main>
        <h2 style={{margin: "0px 0px 10px 0px"}}>나는 이런 <span className="highlight">경험</span>을 했어요</h2>
        {Object.keys(userData.career).map((job, index) => (
          <div className="career-body" key={index}>
            <div className="career-index"/>
            <div className="career-wrapper" key={index}>
              <div className="career-title-">{job}</div>
              <div className="career-content">
                {userData.career[job].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </div>
            </div>
          </div>
        ))}
        <span className="edit-profile-career" style={{margin: "-10px"}}>
          {myProfile && (
            <Link to="/profiledetail/career" state={{userData: userData}}>
              <input type="button" className="edit-button" style={{margin: "-5px 10px"}}></input>
            </Link>
          )}
        </span>
      </main>
    </div>
  );
};

const ProfileDetail = () => {
  const introRef = useRef(null);
  const careerRef = useRef(null);
  const postRef = useRef(null);
  const commentRef = useRef(null);

  // For querystring 'uid'
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const uid = queryParams.get('uid') || auth.currentUser.uid; // uid가 없는 경우 현재 사용자의 uid 사용

  const [currentUserData, setCurrentUserData] = useState({ ...defaultData });
  const [profileUserData, setProfileUserData] = useState({ ...defaultData });
  const [currentUserDataLoaded, setCurrentUserDataLoaded] = useState(false);
  const [profileUserDataLoaded, setProfileUserDataLoaded] = useState(false);
  const [myProfile, setMyProfile] = useState(false);

  // profiledetail에 접속해 있는 user의 정보(currentUserData)를 firebase에서 fetch
  useEffect( () => {
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



// profiledetail에 정보를 띄울 user의 정보(profileUserData)를 firebase에서 fetch
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

  // firebase에서 모든 data가 fetch되기 전까지 Loading... 띄우기
  if (!currentUserDataLoaded || !profileUserDataLoaded) {
    return (
    <div className="loadingContainer">
      <Bars
        type="ThreeDots"
        color="#00b22d"
        height={100}
        width={100}
      />
    </div>);
  }

  const scrollToRef = (ref) => {
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth' });
      }
  };

  return (
    <div className='ProfileDetail'>
    <div style={{overflowY: 'auto'}}>
        <div><ProfileHeader userData={profileUserData} myProfile={myProfile}/></div>
        <div className="buttons">
          <span onClick={() => scrollToRef(introRef)}>소개</span>
          <span onClick={() => scrollToRef(careerRef)}>경험</span>
          <span onClick={() => scrollToRef(postRef)}>게시글</span>
          <span onClick={() => scrollToRef(commentRef)}>방명록</span>
        </div>
        <div ref={introRef}><ProfileIntro userData={profileUserData} myProfile={myProfile}/></div>
        <div ref={careerRef}><ProfileCareer userData={profileUserData} myProfile={myProfile}/></div>
        <div ref={postRef}><ProfilePost userData={profileUserData} myProfile={myProfile} profileUid={uid}/></div>
        <div ref={commentRef}><ProfileComment currentUserData={currentUserData} myProfile={myProfile} profileUid={uid}/></div>
    </div>
    </div>
  )
}

export default ProfileDetail;