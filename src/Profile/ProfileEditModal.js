//Modal.js

import React, { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { dbService, auth } from '../firebase'
import { updateDoc, getDoc, doc } from "firebase/firestore"
import { uploadBytes, getStorage, ref, getDownloadURL } from 'firebase/storage';

import './ProfileEditModal.css'
import './ProfileDetail.css';
import { defaultData } from './defaultData';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

function DateParser(yourDate) {
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset*60*1000))
  return yourDate.toISOString().split('T')[0]
}

const ProfileEditModal = ({EditModalClose}) => {
      // user Table Attribute (need to add more)
    const [userObj, setUserObj] = useState ({
      nickname: "",
      profile_image: "",
      website: "",
      instagram:"",
      facebook:"",
      tel:"",
      email:"",
    });

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
                  profile_image: getDownloadURL(ref(userDoc, `${auth.currentUser.uid}/profile_images/${userDoc.profile_image}`))
                });
            } else {
                console.log('User not found');
            }

          } catch (error) {
            console.error('Error fetching user data:', error);
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

    const closeClick = () => {
        return EditModalClose?.(); // profileEditModalClose을 실행!
    };
    
    // Profile 사진 
    const [Image, setImage] = useState(userObj.profile_image);
    const [ImageChanged, setImageChanged] = useState(false);
    const fileInput = useRef(null);
    
    const onProfileImgChange = (e) => {
      if (e.target.files[0]){
        setImage(e.target.files[0]);
        setImageChanged(true);
        setUserObj({  ...userObj, profile_image: [e.target.files[0], e.target.files[0].name]});
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
    // User Click Submit => Then Create a new data and store to "users" table.
    // See Query and Update for below. This is only about "CREATING" new data.
    const onSubmit = async(event) => {
      event.preventDefault();
      const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
      try {
          if (ImageChanged && (userObj.intro_image !== undefined || userObj.intro_image !== null)){
            const storage = getStorage();
            const img = userObj.profile_image[0]
            const imgName = userObj.profile_image[1]
            const imageRef = ref(storage, `${auth.currentUser.uid}/profile_images/${imgName}`);
            const imageUrlPromise = await uploadAndReturnUrl(imageRef, img);
            await updateDoc(userDocRef, {
              profile_image: imageUrlPromise
            })
          }
          // update DB using user input 
          await updateDoc(userDocRef, {
              nickname: userObj.nickname,
              website: userObj.website,
              instagram: userObj.instagram,
              facebook: userObj.facebook,
              tel: userObj.tel,
              email: userObj.email,
          })
          
          alert("성공적으로 저장되었습니다");
          // if successfully edit, then refresh < 새로고침 > 
          window.location.reload();
      } catch (e) {
          console.log(e);
      }
        //setUserObj(null);
    };
    // const q = query(collection(db, "users"), where("uid", "==", "etc"))로 쿼리
    // https://velog.io/@khy226/Firestore-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0 참고
    
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
                    <img class="profile-image" src={Image || userObj.profile_image} alt=""/>
                    <div class="image-edit-button">✏️ 변경하기</div>
                  </label>
                  
                  <input id="file-search" type='file' 
                      style={{display: "none",
                              cursor: "pointer"}}
                      accept='image/jpg, image/png, image/jpeg' 
                      name='profile_image'
                      onChange={onProfileImgChange}
                      ref={fileInput}/>
                </div>
              </div>
              <div class="edit-contents">
                <h3>닉네임</h3>
                  <input type="text" class="edit-section" name="nickname" placeholder="이름" value = {userObj.nickname || ""} onChange={onChange}></input> 
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
  const [userObj, setUserObj] = useState ({
    intro_image: "",
    intro_content: "",
    intro_title: ""
  });
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
                intro_image: getDownloadURL(ref(userDoc, `${auth.currentUser.uid}/profile_intro_images/${userDoc.intro_image}`))
              });
          } else {
              console.log('User not found');
          }
        
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }, []);

  const closeClick = () => {
      return EditModalClose?.(); // profileEditModalClose을 실행!
  };

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

  
  // Profile 사진 
  const [Image, setImage] = useState(userObj.intro_image);
  const [ImageChanged, setImageChanged] = useState(false);
  const fileInput = useRef(null);

  const onIntroImgChange = (e) => {
    if (e.target.files[0]){
      setImage(e.target.files[0]);
      setImageChanged(true);
      setUserObj({  ...userObj, intro_image: [e.target.files[0], e.target.files[0].name]});
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

  const onSubmit = async(event) => {
    event.preventDefault();
    const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
    try {
        const storage = getStorage();
        if (ImageChanged && (userObj.intro_image !== undefined || userObj.intro_image !== null)){
          const img = userObj.intro_image[0]
          const imgName = userObj.intro_image[1]
          const imageRef = ref(storage, `${auth.currentUser.uid}/profile_intro_images/${imgName}`);
          const imageUrlPromise = await uploadAndReturnUrl(imageRef, img);
          
          // update DB using user input 
          await updateDoc(userDocRef, {
            intro_image: imageUrlPromise,
            intro_content: userObj.intro_content,
            intro_title: userObj.intro_title,
          })
        }
        else {
          await updateDoc(userDocRef, {
            intro_content: userObj.intro_content,
            intro_title: userObj.intro_title,
          })
        }
        
        alert("성공적으로 저장되었습니다");
        // if successfully edit, then refresh < 새로고침 > 
        window.location.reload();
    } catch (e) {
        console.log(e);
    }
      //setUserObj(null);
  };

  return (
      <div class="edit-overlay">
        <form onSubmit={onSubmit} id="modal">
          <div class="edit-modal-wrap">
            <h1>🚀 비행사 소개</h1>
            <hr style={{border: "solid 1px black"}}/>
            <div class="edit-contents">
              <h4>본인을 한 줄로 소개해주세요!</h4>
                <input type="text" class="intro-edit-section" name="intro_title" placeholder="한 줄 소개" value = {userObj.intro_title || ""} onChange={onChange}></input> 
              <div class="edit-profile-intro-image">
                <h4>멋진 모습을 보여주세요!</h4>
                <label for="file-search">
                  <img class="profile-intro-image" src={Image || userObj.intro_image} alt=""/>
                  <div class="image-edit-button">✏️ 변경하기</div>
                </label>
                <input id="file-search" type='file' 
                    style={{display: "none",
                            cursor: "pointer"}}
                    accept='image/jpg, image/png, image/jpeg' 
                    name='intro_image'
                    onChange={onIntroImgChange}
                    ref={fileInput}/>
              </div>
              <h4 style={{margin: "2px"}}>본인을 자유롭게 표현해주세요!</h4>
                <textarea class="intro-detail-edit-section" name="intro_content" placeholder="" value = {userObj.intro_content || ""} onChange={onChange}/>
            </div>
            <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <button class="edit-save-button" type="submit" form="modal">저장하기</button>
          </div>
        </form>
      </div>
  );
};


const ProfileCareerEditModal = ({job, EditModalClose}) => {
  const closeClick = () => {
      return EditModalClose?.(); // profileEditModalClose을 실행!
  };

  const [userObj, setUserObj] = useState({ ...defaultData });
  const [nextId, setNextId] = useState(1);
  const [details, setDetails] = useState([]);
  const [FromDate, setFromDate] = useState(false);
  const [ToDate, setToDate] = useState(false);

  const fetchCareer = (userDoc) => {
    const newList = Object.entries(userDoc.career[job]["detail_list"]).map(([idx, value]) => ({
      id: idx,
      name: value
    }));

    setDetails((prevDetails) => {
      // Check if the elements are already present in the state
      const existingIds = prevDetails.map((detail) => detail.id);
      const newElements = newList.filter((detail) => !existingIds.includes(detail.id));
  
      // If there are new elements, update the state
      if (newElements.length > 0) {
        return [...prevDetails, ...newElements];
      } else {
        return prevDetails;
      }
    });
    setFromDate(userDoc.career[job]["from"]);
    setToDate(userDoc.career[job]["to"]);
    
    setNextId((prevNextId) => prevNextId + Object.entries(userDoc.career[job]["detail_list"]).length);
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
          let userDocRef;
          // get [one and only one] docReference using key
          userDocRef = doc(dbService, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          // If the document exists, setUserData with the document data
          if (userDoc.exists()) {
              flushSync(() => {
                setUserObj(userObj => ({...userObj, ...userDoc.data()}))
              })
              
              fetchCareer(userDoc.data());
          } else {
              console.log('User not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } 
    };
    fetchUserData();
  }, []);


  // states for DB
  const [Job, setJob] = useState(job);


  const [inputText, setInputText] = useState('');
  const handleChange = (e) => {
    setInputText(e.target.value);
  }
  
  const handleClick = () => {
    const newList = details.concat({
        id: nextId,
        name: inputText
    });
    setNextId(nextId + 1);
    setDetails(newList);
    setInputText('');
  }

  const handleDelete = id => {
      const newList = details.filter(detail => detail.id !== id);
      setDetails(newList);
  };

  const detailList = details.map((detail) => 
    <div key={detail.id}>
      <li class="career-detail-text">{detail.name}<button class="career-delete" onClick={() => handleDelete(detail.id)}/> </li>
    </div>
  );

  const onToChange = (e) => {
    const value = e.target.value;
    setToDate(value)
  };
  const onFromChange = (e) => {
    const value = e.target.value;
    setFromDate(value)
  };

  const onJobChange = (e) => {
    const value = e.target.value;
    setJob(value)
  };

  const onSubmit = async(event) => {
    event.preventDefault();
    const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
    try {
        if (job !== Job) {
          setUserObj((prevDictionary) => {
            // Create a new dictionary without the key to delete
            const newDictionary = { ...prevDictionary };
            delete newDictionary[job];
            return newDictionary;
          });
        }
        await updateDoc(userDocRef, {
          career: {
            ...userObj.career,
            [Job]: {
              "from": DateParser(FromDate),
              "to": DateParser(ToDate), 
              "detail_list": Object.values(details).map(item => item.name)
            }
          }
        })
        alert("성공적으로 저장되었습니다");
        // if successfully edit, then refresh < 새로고침 > 
        window.location.replace('/profiledetail')
    } catch (e) {
        console.log(e);
    }
      //setUserObj(null);
  };

  return (
      <div class="edit-overlay">
        <form onSubmit={onSubmit}>
          <div class="edit-modal-wrap">
            <h1>✏️ 경력 수정하기</h1>
            <hr style={{border: "solid 1px black"}}/>
            <div class="edit-contents">
              <h4>경력</h4>
                <input type="text" class="career-edit-section" name="job" placeholder="경력" value = {Job || ""} onChange={onJobChange}/>
            <h4>시작 기간</h4>
              <DatePicker className="career-edit-section" dateFormat="yyyy/MM" selected = {new Date(FromDate) || ""} onChange={date => setFromDate(date)} shouldCloseOnSelect/> 
            <h4>종료 기간</h4>
              <DatePicker className="career-edit-section" dateFormat="yyyy/MM" selected = {new Date(ToDate) || ""} onChange={date => setToDate(date)} shouldCloseOnSelect/>
            <h4 style={{margin: "2px"}}>세부사항</h4>
                {detailList}
                <input 
                  class="career-detail-edit-section"
                  value={inputText}
                  onChange={handleChange}
                />
                <button class="career-add" type="button" onClick={handleClick}/>
            </div>
            <span class="edit-back-button" onClick={closeClick}>돌아가기</span> <button class="edit-save-button" type="submit" form="modal" onClick={onSubmit}>저장하기</button>
          </div>
        </form>
      </div>
  );
};

const ProfileCareerAddModal = ({AddModalClose}) => {
  const AddcloseClick = () => {
      return AddModalClose?.(); // profileEditModalClose을 실행!
  };

  const [userObj, setUserObj] = useState({ ...defaultData });
  const [nextId, setNextId] = useState(1);
  const [details, setDetails] = useState([]);
  const [FromDate, setFromDate] = useState(false);
  const [ToDate, setToDate] = useState(false);

  // states for DB
  const [Job, setJob] = useState("");
  
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
          } else {
              console.log('User not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } 
    };
    fetchUserData();
  }, []);


  const [inputText, setInputText] = useState('');
  const handleChange = (e) => {
    setInputText(e.target.value);
  }
  
  const handleClick = () => {
    const newList = details.concat({
        id: nextId,
        name: inputText
    });
    setNextId(nextId + 1);
    setDetails(newList);
    setInputText('');
  }

  const handleDelete = id => {
      const newList = details.filter(detail => detail.id !== id);
      setDetails(newList);
  };

  const detailList = details.map((detail) => 
    <div key={detail.id}>
      <li class="career-detail-text">{detail.name}<button class="career-delete" onClick={() => handleDelete(detail.id)}/> </li>
    </div>
  );
  const onToChange = (e) => {
    const value = e.target.value;
    setToDate(value)
  };
  const onFromChange = (e) => {
    const value = e.target.value;
    setFromDate(value)
  };
  const onJobChange = (e) => {
    const value = e.target.value;
    setJob(value)
  };

  const onSubmit = async(event) => {
    event.preventDefault();
    const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
    try {
        await updateDoc(userDocRef, {
          career: {
            ...userObj.career,
            [Job]: {
              "from": DateParser(FromDate),
              "to": DateParser(ToDate), 
              "detail_list": Object.values(details).map(item => item.name)
            }
          }
        })
        alert("성공적으로 저장되었습니다");
        // if successfully edit, then refresh < 새로고침 > 
        window.location.replace('/profiledetail')
    } catch (e) {
        console.log(e);
    }
      //setUserObj(null);
  };

  return (
      <div class="edit-overlay">
        <div class="edit-modal-wrap">
          <h1>➕ 경력 추가하기</h1>
          <hr style={{border: "solid 1px black"}}/>
          <div class="edit-contents">
            <h4>경력</h4>
              <input type="text" class="career-edit-section" name="job" placeholder="경력" value = {Job || ""} onChange={onJobChange}/>
            <h4>시작 기간</h4>
              <DatePicker className="career-edit-section" dateFormat="yyyy/MM" selected = {new Date(FromDate) || ""} onChange={date => setFromDate(date)} shouldCloseOnSelect/> 
            <h4>종료 기간</h4>
              <DatePicker className="career-edit-section" dateFormat="yyyy/MM" selected = {new Date(ToDate) || ""} onChange={date => setToDate(date)} shouldCloseOnSelect/>
            <h4 style={{margin: "2px"}}>세부사항</h4>
              {detailList}
              <input 
                class="career-detail-edit-section"
                value={inputText}
                onChange={handleChange}
              />
              <button class="career-add" onClick={handleClick}/>
          </div>
          <span class="edit-back-button" onClick={AddcloseClick}>돌아가기</span> <button class="edit-save-button" type="submit" form="modal" onClick={onSubmit}>저장하기</button>
        </div>
      </div>
  );
};

export {ProfileEditModal, ProfileIntroEditModal, ProfileCareerEditModal, ProfileCareerAddModal};