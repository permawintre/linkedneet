import React, { useState, useEffect } from "react";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService, auth } from '../firebase'
import { updateDoc, getDoc, doc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { ProfileCareerEditModal, ProfileCareerAddModal } from './ProfileEditModal';
import './ProfileCareerDetail.css'
import { Bars } from "react-loader-spinner";
import { useLocation } from "react-router-dom";

const ProfileCareerDetail = () => {
    const navigate = useNavigate(); //변수 할당시켜서 사용
    const onClickBtn = () => {
      navigate(-1); // 바로 이전 페이지로 이동, '/main' 등 직접 지정도 당연히 가능
    };
    const location = useLocation();
	  const [userData, setUserData] = useState(location.state.userData);
    const [isLoading, setLoading] = useState(true);

    // Profile Edit
    const [selectedJob, setSelectedJob] = useState(null);
    const [EditClicked, setEditClicked] = useState(false);
    const EditClick = (job) => {
      setEditClicked(true);
      setSelectedJob(job)
    };
    const EditModalClose = () => {
      setEditClicked(false);
      setSelectedJob(null)
    };

    const DeleteClick = async(job) => {
      const userDocRef = doc(dbService, 'users', auth.currentUser.uid);
      try {
          const updatedObject = { ...userData.career };

          // Delete the property with the specified key
          delete updatedObject[job];
          await updateDoc(userDocRef, {
            career: updatedObject
          })
          alert("성공적으로 삭제되었습니다");
          // if successfully edit, then refresh < 새로고침 > 
          window.location.reload();
      } catch (e) {
          console.log(e);
      }
    };

    // Profile Edit (Add)
    const [AddClicked, setAddClicked] = useState(false);
    
    const AddClick = () => {
      setAddClicked(true);
    };
    const AddModalClose = () => {
      setAddClicked(AddClicked => !AddClicked);
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
                setUserData(userData => ({...userData, ...userDoc.data()}));
            } else {
                console.log('User not found');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } 
          setLoading(false);
          
      };
      fetchUserData();
    }, []);

    

    // <FontAwesomeIcon icon={faPlus} size="2xl" style={{color: "#000000",}} /> //
    if (isLoading) {
      return (
        <div className="loadingContainer">
        <Bars
          type="ThreeDots"
          color="#00b22d"
          height={100}
          width={100}
        />
      </div>
      )
    } else {
  
    return (
      <div class="detail-background">
        <div class="detail-container">
          <div class="detail-overlay">
            <div class="detail-wrap">
              <div class="detail-contents">
                <span class="detail-add-profile">
                  <input type="button" class="edit-add-button" onClick={AddClick}></input>
                  {AddClicked && (
                    <ProfileCareerAddModal
                      user={null}
                      AddModalClose={AddModalClose}
                    />
                  )}
                </span>
                <div class="back-to-profile-button" onClick={onClickBtn}>
                  <FontAwesomeIcon icon={faArrowLeft} size="2xl" style={{color: "#000000",}} />
                </div>
                <h2 style={{margin: "0px 0px 10px 0px"}}><span className="highlight">경력</span> 수정하기</h2>
                {Object.keys(userData.career).map((job, index) => (
                  <div className="career-body">
                    <div className="career-index"/>
                    <div className="career-wrapper" key={index}>
                      <div className="career-title-">{job}</div>
                      <div className="career-content">
                        {userData.career[job].map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </div>
                    </div>
                    <span className="edit-profile">
                      <input type="button" class="career-delete-button" onClick={() => DeleteClick(job)}/>
                      <input type="button" class="career-edit-button" onClick={() => EditClick(job)}/>
                      {(selectedJob == job) && EditClicked && (
                        <ProfileCareerEditModal
                          user={null}
                          job={job}
                          EditModalClose={EditModalClose}
                        />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
}

export default ProfileCareerDetail;