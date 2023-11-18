import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom"
import { dbService, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { FaFacebookSquare, FaInstagramSquare} from 'react-icons/fa';
import { IoGlobeOutline } from "react-icons/io5";
import { MdPhoneIphone, MdEmail, MdCalendarMonth } from 'react-icons/md'
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ProfileEditModal, ProfileIntroEditModal } from './ProfileEditModal';
import { defaultData } from './defaultData'
import './ProfileDetail.css';

const DefaultProfileImg = 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png'

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

  return (
    <div className="header-container">
        <div className="bg-image" style={bgImageStyle}>
        </div>
      <main>
        <div className="profile-header">
            <div className="header-left">
                <div className="header-left1">
                    <span className="nickname">{userData.nickname}</span>
                    <span className="info">니트컴퍼니 {userData.generation}기</span>
                </div>
                <div className="header-left2">
                    <Link to="/profile">
                      <span className="info">팔로워 {userData.followers}명</span>
                      <span className="info">팔로잉 {userData.following}명</span>
                    </Link>
                </div>
                <div className="header-left3">
                    <button>Follow</button>
                </div>
            </div>
            <div className="header-mid">
              <img className="profile-image" src={userData.profile_img || DefaultProfileImg} alt=""/>
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
                    <div className="phone-number">
                        <MdPhoneIphone size="16"/>&nbsp;
                        {userData.tel}
                    </div>
                    <div className="email">
                        <MdEmail size="16"/>&nbsp;
                        {userData.email}
                    </div>
                    <span className="calendar">
                        <MdCalendarMonth size="16"/>&nbsp;
                        비행일정 확인하기
                    </span>
                    <span className="edit-profile">
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

  return (
    <div className="container">
      <main>
        <h2>나를 <span className="highlight">소개</span>합니다</h2>
        <div className="body1">
            <img className="intro-image" src={userData.intro_image}></img>
            <div className="intro">
              <div className="intro-content">
                {userData.intro_content}
              </div>
              <span className="intro-keywords">
                  {userData.intro_keyword.map((keyword, index) => (
                      <span key={index} className="keyword">{`#${keyword}`}</span>
                  ))}
              </span>
              <span className="edit-profile">
                {EditButton()}
                {myProfile && EditClicked && (
                  <ProfileIntroEditModal
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
        <span className="edit-profile" style={{margin: "-10px"}}>
          {myProfile && (
            <Link to="/profiledetail/career">
              <input type="button" className="edit-button" style={{margin: "-5px 10px"}}></input>
            </Link>
          )}
        </span>
      </main>
    </div>
  );
};

const ProfilePost = ({userData, myProfile}) => {
  // example posts
  const posts = [
    { id: 1, content: 'Post 1' },
    { id: 2, content: 'Post 2' },
    { id: 3, content: 'Post 3' },
    { id: 4, content: 'Post 4' },
    { id: 5, content: 'Post 5' },
    { id: 6, content: 'Post 6' },
    { id: 7, content: 'Post 7' },
    { id: 8, content: 'Post 8' },
    { id: 9, content: 'Post 9' }
  ];
  const firstThreePosts = posts.slice(0, 3);

  return (
    <div className="container">
      <main>
        <h2>게시글</h2>
        <div className="post">
          {firstThreePosts.map(post => (
            <span key={post.id}>{post.content}</span>
        ))}
        </div>
      </main>
    </div>
  );
};

const ProfileComment = ({userData, myProfile}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleInputChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (newMessage.trim() !== '') {
      const currentTime = new Date();
      const relativeTime = formatDistanceToNow(currentTime, { addSuffix: true, locale: ko });
      const message = { text: newMessage, user: userData.nickname, time: currentTime.toLocaleString(), relativeTime: relativeTime, userProfile: userData.profile_image };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="container">
      <main>
      <h2>방명록</h2>
      <div className='profile-comment'>
        <img src={userData.profile_image} alt="프로필"/>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="방명록을 남겨주세요!"
          />
          <button type="submit">전송</button>
        </form>
      </div>
      <div>
        {messages.map((message, index) => (
          <div key={index} className='message'>
            <img src={message.userProfile} alt="프로필"/>
            <div className='message-box'>
              <div className='message-header'>
                <h3>{message.user}</h3>
                <p className='time' data-tooltip={message.time}>{message.relativeTime}</p>
              </div>
              <p className='text'>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
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
  const uid = queryParams.get('uid');

  const [currentUserData, setCurrentUserData] = useState({ ...defaultData });
  const [profileUserData, setProfileUserData] = useState({ ...defaultData });
  const [isLoading, setIsLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(false);

  // profiledetail에 정보를 띄울 user의 정보(profileUserData)를 firebase에서 fetch
  useEffect(() => {
    const fetchProfileUserData = async () => {
      try {
        let profileUserDocRef;
        // if querystring 'uid' exists, get 'uid' user's data
        if (uid) { profileUserDocRef = doc(dbService, 'users', uid); }
        // else, get current user's data
        else { 
          profileUserDocRef = doc(dbService, 'users', auth.currentUser.uid); 
          setMyProfile(true);
        }
        const profileUserDoc = await getDoc(profileUserDocRef);

        if (profileUserDoc.exists()) {
          setProfileUserData(prevData => ({ ...prevData, ...profileUserDoc.data() }));
          await updateDoc(profileUserDoc, {
            profile_img: getDownloadURL(ref(profileUserDoc, `profile_images/${profileUserDoc.profile_img}`))
          });
        } else {
          console.log('User not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false); // Loading 끝
      }
    };

    fetchProfileUserData();
  }, [uid]);

  // firebase에서 모든 data가 fetch되기 전까지 Loading... 띄우기
  if (isLoading) {
    return <div>Loading...</div>;
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
        <div ref={postRef}><ProfilePost userData={profileUserData} myProfile={myProfile}/></div>
        <div ref={commentRef}><ProfileComment userData={currentUserData} myProfile={myProfile}/></div>
    </div>
    </div>
  )
}

export default ProfileDetail;