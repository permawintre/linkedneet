//Modal.js

import React, { useState, useRef, useEffect } from "react";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService, auth } from '../firebase'
import { updateDoc, getDoc, doc } from "firebase/firestore"
import { uploadBytes, getStorage, ref, getDownloadURL } from 'firebase/storage';

import './ProfileEditModal.css'
import './ProfileDetail.css';

// How to add button?

/* // Profile Edit
    const [profileEditClicked, setProfileEditClicked] = useState(false);
    const profileEditClick = () => {
      setProfileEditClicked(true);
    };
    const profileEditModalClose = () => {
      setProfileEditClicked(false);
    };
  <div className="edit-profile">
    <input type="button" class="profile-edit-button" onClick={profileEditClick}>
    </input>
    {profileEditClicked && (
      <ProfileEditModal
        user={null}
        profileEditModalClose={profileEditModalClose}
      />
    )}
  </div> */

const DefaultProfileImg = 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png'

const profileData = {
  nickname: '홍길동',
  followers: 500,
  following: 300,
  profile_image: 'https://images.pexels.com/photos/1804796/pexels-photo-1804796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  intro_image: 'https://cdn.imweb.me/upload/S20191010288d21675b22f/e33c22faf15bc.jpg',
  intro_title: '링크 혹은 이미지 경로',
  intro_content: `언제나 저를 이끈 건 ‘재미’입니다.\n늘 재미있는 일을 찾아다니죠.\n지금 저에게 가장 재미있는 일은 그림과 글쓰기, 그리고 영화랍니다.\n
  삶의 다양한 선택에서 늘 저를 이끌었던 건 ‘재미’였습니다.
제가 재미있는 일을 하며 먹고살 수 있다면, 그것이 바로 행복이 아닐까 싶습니다. 단순히, 즐거운 기분을 넘어서 좋은 성과와 보람이 가득한 재미를 느껴 보고 싶습니다.
이번 프로젝트는 제가 좋아하는 영화와 그림, 글을 통해 재미있어 보려고 했습니다.`,
  intro_keyword: ['글쓰기', '영화', '여행가'],
  career: {
    '교육공학자': ['교육공학 박사',
                  '교육 콘텐츠 개발 및 기획',
                  '수업 컨설턴트, 학습 컨설턴트 자격 보유'],
    '일러스트레이터': ['동화 [나뭇잎 날개] 삽화 및 표지 작업 (출간 예정)',
                    '도서 [어른이 되어 다시 만나는 철학] 삽화 및 표지 작업'],
    '작가': ['시네마에듀(가제) 출판 계약 및 출간 예정(2023년 8월)']
  },
  calendar_id: 1,
  background_image: 'https://images.pexels.com/photos/1731427/pexels-photo-1731427.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  contact_facebook: 'kakao.brandmedia',
  contact_insta: 'kakao.today',
  contact_email: 'user@example.com',
  contact_phone: '010-1234-5678',
  company_id: 13
};

const ProfileEditModal = ({EditModalClose}) => {
      // user Table Attribute (need to add more)
    const [userObj, setUserObj] = useState ({
      nickname: "",
      profile_img: "",
      website: "",
      instagram:"",
      facebook:"",
      tel:"",
      email:"",
    });

    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      const fetchUserData = async () => {
        try {
            let userDocRef;
            // get [one and only one] docReference using key
            userDocRef = doc(dbService, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            // If the document exists, setUserData with the document data
            if (userDoc.exists()) {
                setUserObj(userObj => ({...userObj, ...userDoc.data()}));
                await updateDoc(userDoc, {
                  profile_img: getDownloadURL(ref(userDoc, `profile_images/${userDoc.profile_img}`))
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
      fetchUserData();
    }, []);


    const uploadAndReturnUrl = async (storageRef, file) => {
      try {
        // Upload 'file' to Firebase Storage.
        await uploadBytes(storageRef, file);
        // Get download url of uploaded file.
        const imageUrl = await getDownloadURL(storageRef);
        return imageUrl;
      } catch (error) {
        console.error('Error uploading file: ', error);
        throw error;
      }
    };

    // User Input {OnChange}
    const onChange = (e) => {
      const { name, value } = e.target;
      setUserObj((prevUserObj) => ({
        ...prevUserObj,
        [name]: value,
      }));
    };

    // User Click Submit => Then Create a new data and store to "users" table.
    // See Query and Update for below. This is only about "CREATING" new data.
    const onSubmit = async(event) => {
      event.preventDefault();
      const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
      try {
          const storage = getStorage();
          const img = userObj.profile_img[0]
          const imgName = userObj.profile_img[1]
          const imageRef = ref(storage, `profile_images/${imgName}`);
          const imageUrlPromise = await uploadAndReturnUrl(imageRef, img);
          
          // update DB using user input 
          const res = await updateDoc(userDocRef, {
              nickname: userObj.nickname,
              profile_img: imageUrlPromise,
              website: userObj.website,
              instagram: userObj.instagram,
              facebook: userObj.facebook,
              tel: userObj.tel,
              email: userObj.email,
          })
          
          alert("성공적으로 저장 되었습니다");
          // if successfully edit, then refresh < 새로고침 > 
          window.location.reload();
      } catch (e) {
          console.log(e);
      }
        //setUserObj(null);
    };
    // const q = query(collection(db, "users"), where("uid", "==", "etc"))로 쿼리
    // https://velog.io/@khy226/Firestore-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0 참고

    const closeClick = () => {
        return EditModalClose?.(); // profileEditModalClose을 실행!
    };

    // Profile 사진 
    const [Image, setImage] = useState(userObj.profile_img);
    const fileInput = useRef(null);

    const onProfileImgChange = (e) => {
      if (e.target.files[0]){
        setImage(e.target.files[0])
        setUserObj({  ...userObj, profile_img: [e.target.files[0], e.target.files[0].name]});
      }
      // 업로드 취소할 시
      else {
        return
      }
      
      //화면에 프로필 사진 표시
      const reader = new FileReader();
      reader.onload = () => {
          if(reader.readyState === 2){
              setImage(reader.result)
          }
      }
      reader.readAsDataURL(e.target.files[0])
    }
        
    return (
        <div class="edit-overlay">
          <form onSubmit={onSubmit}>
            <hr className="body__partition"></hr>
            <div class="edit-modal-wrap">
              <h1>프로필</h1>
              <hr style={{border: "solid 1px black"}}/>
              <div class="edit-profile-image">
                <h3>프로필 사진</h3>
                <div class="image-edit-button-wrapper">
                  <label for="file-search">
                    <img class="profile-image" src={userObj.profile_img}/>
                    <div class="image-edit-button">✏️ 변경하기</div>
                  </label>
                  
                  <input id="file-search" type='file' 
                      style={{display: "none",
                              cursor: "pointer"}}
                      accept='image/jpg, image/png, image/jpeg' 
                      name='profile_img'
                      onChange={onProfileImgChange}
                      ref={fileInput}/>
                </div>
              </div>
              <div class="edit-contents">
                <h3>닉네임</h3>
                  <input type="text" class="edit-section" name="nickname" placeholder="이선생" value = {userObj.nickname || ""} onChange={onChange}></input> 
                <h3>개인 웹사이트</h3>
                  <input type="button" class="edit-link-icon"></input>
                  <input type="url" class="edit-section" name="website" placeholder="개인 웹사이트 URL" value = {userObj.website || ""} onChange={onChange}></input>
                <h3>SNS</h3>
                  <input type = "button" class="edit-link-icon"></input>
                  <input type="url" class="edit-section" name="instagram" placeholder="Instagram URL" value = {userObj.instagram || ""} onChange={onChange}></input><br></br>
                  <input type = "button" class="edit-link-icon"></input>
                  <input type="url" class="edit-section" name="facebook" placeholder="Facebook URL" value = {userObj.facebook || "" } onChange={onChange}></input>
                <div>
                <h3>연락처</h3>
                  <input type="text" class="edit-section" name="tel" placeholder="전화번호" value = {userObj.tel || ""} onChange={onChange}></input><br></br>
                  <input type="text" class="edit-section" name="email" placeholder="이메일 주소" value = {userObj.email || ""} onChange={onChange}></input>
                </div>
                <span class="edit-back-button" onClick={closeClick}>돌아가기</span><button class="edit-save-button" type="submit">저장하기</button> 
              </div>
            </div>
            <hr className="body__partition"></hr>
          </form>
        </div>
    );
};

const ProfileIntroEditModal = ({EditModalClose}) => {
  const closeClick = () => {
      return EditModalClose?.(); // profileEditModalClose을 실행!
  };

  // Profile 사진 
  const [Image, setImage] = useState("https://images.pexels.com/photos/1804796/pexels-photo-1804796.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260");
  const fileInput = useRef(null);

  const onProfileImgChange = (e) => {
    if (e.target.files[0]){
      setImage(e.target.files[0])
    }
    // 업로드 취소할 시
    else {
      return
    }

    //화면에 프로필 사진 표시
    const reader = new FileReader();
    reader.onload = () => {
        if(reader.readyState === 2){
            setImage(reader.result)
        }
    }
    reader.readAsDataURL(e.target.files[0])
  }

  return (
      <div class="edit-overlay">
        <div class="edit-modal-wrap">
          <h1>🚀 비행사 소개</h1>
          <hr style={{border: "solid 1px black"}}/>
          <div class="edit-contents">
            <h4>본인을 한 줄로 소개해주세요!</h4>
              <input type="text" class="intro-edit-section" placeholder="안녕하세요. 재미있는 일이라면 무엇이든 함께해요, 이선생입니다."></input> 
            <div class="edit-profile-intro-image">
              <h4>멋진 모습을 보여주세요!</h4>
              <label for="file-search">
                <img class="profile-intro-image" src={Image}  alt="Profile Photo"/>
                <div class="image-edit-button">✏️ 변경하기</div>
              </label>
              <input id="file-search" type='file' 
                  style={{display: "none",
                          cursor: "pointer"}}
                  accept='image/jpg, image/png, image/jpeg' 
                  name='profile_img'
                  onChange={onProfileImgChange}
                  ref={fileInput}/>
            </div>
            <h4 style={{margin: "2px"}}>본인을 자유롭게 표현해주세요!</h4>
              <textarea class="intro-detail-edit-section" placeholder=""/>
          </div>
          <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <span class="edit-save-button" onClick={closeClick}>저장하기</span> 
        </div>
      </div>
  );
};


const ProfileCareerEditModal = ({EditModalClose}) => {
  const closeClick = () => {
      return EditModalClose?.(); // profileEditModalClose을 실행!
  };

  return (
      <div class="edit-overlay">
        <div class="edit-modal-wrap">
          <h1>✏️ 경력 수정하기</h1>
          <hr style={{border: "solid 1px black"}}/>
          <div class="edit-contents">
            <h4>본인을 한 줄로 소개해주세요!</h4>
              <input type="text" class="intro-edit-section" placeholder="안녕하세요. 재미있는 일이라면 무엇이든 함께해요, 이선생입니다."></input> 
            <h4 style={{margin: "2px"}}>본인을 자유롭게 표현해주세요!</h4>
              <textarea class="intro-detail-edit-section" placeholder=""/>
          </div>
          <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <span class="edit-save-button" onClick={closeClick}>저장하기</span> 
        </div>
      </div>
  );
};

const ProfileCareerAddModal = ({AddModalClose}) => {
  const AddcloseClick = () => {
      return AddModalClose?.(); // profileEditModalClose을 실행!
  };

  return (
      <div class="edit-overlay">
        <div class="edit-modal-wrap">
          <h1>➕ 경력 추가하기</h1>
          <hr style={{border: "solid 1px black"}}/>
          <div class="edit-contents">
            <h4>본인을 한 줄로 소개해주세요!</h4>
              <input type="text" class="intro-edit-section" placeholder="안녕하세요. 재미있는 일이라면 무엇이든 함께해요, 이선생입니다."></input> 
            <h4 style={{margin: "2px"}}>본인을 자유롭게 표현해주세요!</h4>
              <textarea class="intro-detail-edit-section" placeholder=""/>
          </div>
          <span class="edit-back-button" onClick={AddcloseClick}>돌아가기</span> <span class="edit-save-button" onClick={AddcloseClick}>저장하기</span> 
        </div>
      </div>
  );
};

export {ProfileEditModal, ProfileIntroEditModal, ProfileCareerEditModal, ProfileCareerAddModal};