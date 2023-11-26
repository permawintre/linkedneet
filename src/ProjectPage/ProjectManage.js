import React, { useState, useEffect } from "react"
import style from './ProjectManage.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, getFirestore, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth } from '../firebase.js'
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

function formatDateKR(timestamp) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
const dateFormatChange = (timestamp) => {
  if (timestamp instanceof Timestamp) {
    return new Date(timestamp.seconds * 1000);
  }
  return timestamp;
};

const ProjectHeader = (project) => {
    const { projectId } = useParams();
    return (
        <div className={style.projectDetail}>
          <div className={style.projectBoxDetail}>
            <div className={style.projectBoxColumn}>
              <img src={project.image.imageUrl} alt={project.name} />
            </div>
            <div className={style.projectBoxColumn}>
              <div className={style.name}>{project.name}</div>
              <div className={style.comment}>
                <div>{project.shortDescription}</div>
              </div>
              <div className={style.info}>
                <div>
                  <FcAlarmClock />
                  <span className={style.infoTitle}>모집기간</span>
                  <span className={style.infoContent}>
                    {formatDateKR(project.recruitStartDate)} ~ {formatDateKR(project.recruitEndDate)}
                  </span>
                </div>
                <div>
                  <FcCalendar />
                  <span className={style.infoTitle}>운영기간</span>
                  <span className={style.infoContent}>
                    {formatDateKR(project.runningStartDate)} ~ {formatDateKR(project.runningEndDate)}
                  </span>
                </div>
                <div>
                  <FcCheckmark />
                  <span className={style.infoTitle}>분류</span>
                  <span className={style.infoContent}>{project.category}</span>
                </div>
                <div>
                  <FcGlobe />
                  <span className={style.infoTitle}>장소</span>
                  <span className={style.infoContent}>{project.type}</span>
                </div>
              </div>
              <div className={style.info}>
                <Link to={`/projectDetail/${projectId}`} style={{ color: 'gray' }}>
                    상세보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
}

const ApplySection = ({ project, applicants, handleApprove, handleReject }) => {
  const [selectedApplicants, setSelectedApplicants] = useState([]);

  const handleCheckboxChange = (applicantId) => {
    const isSelected = selectedApplicants.includes(applicantId);
    if (isSelected) {
      setSelectedApplicants((prevSelected) =>
        prevSelected.filter((id) => id !== applicantId)
      );
    } else {
      setSelectedApplicants((prevSelected) => [...prevSelected, applicantId]);
    }
  };

  const handleBulkAction = (action) => {
    selectedApplicants.forEach((applicantId) => {
      if (action === 'approve') {
        handleApprove(applicantId);
      } else if (action === 'reject') {
        handleReject(applicantId);
      }
    });
    setSelectedApplicants([]);
    window.alert('처리되었습니다');
    window.location.reload();
  };

  return (
    <div className={`${style.projectDetail} ${style.projectBody}`}>
      <div className={style.bodyTitle}>지원자 목록</div>
      <div className={style.bodyBox}>
        {applicants.map((applicant) => (
        <div className={style.applicantBox} key={applicant.id}>
          <div className={style.applicantButton}>
            <input
              type="checkbox"
              checked={selectedApplicants.includes(applicant.id)}
              onChange={() => handleCheckboxChange(applicant.id)}
            />
            선택하기
          </div>
          <div className={style.userInfo}>
            <div className={style.applicantName}>{applicant.userNickname}</div>
            <div className={style.applicantEmail}>{applicant.userEmail}</div>
          </div>
          <div className={style.formItem}>
            <div className={style.formTitle}>▶ 지원 동기</div>
            <div className={style.formAnswer}>{applicant.applyReason}</div>
          </div>
          {project.recruitForm.map((form, index) => (
            <div key={index} className={style.formItem}>
              <div className={style.formTitle}>▶ {form}</div>
              <div className={style.formAnswer}>{applicant.applyForm[index]}</div>
            </div>
          ))}
        </div>))}
      </div>
      <div className={style.bulkActionButton}>
        <button onClick={() => handleBulkAction('approve')}>승인하기</button>
        <button onClick={() => handleBulkAction('reject')}>거절하기</button>
      </div>
    </div>
  );
};

const MemberSection = ({ members }) => {
  console.log(members)
  return (
    <div className={`${style.projectDetail} ${style.projectBody}`}>
      <div className={style.bodyTitle}>멤버 목록</div>
      <div className={style.bodyBox}>
        {members.map((member) => (
        <div className={style.applicantBox} key={member.id}>
          <div className={style.userInfo}>
            <div className={style.applicantName}>{member.userNickName}</div>
            <div className={style.applicantEmail}>{member.userEmail}</div>
          </div>
          <div className={style.formItem}>
            <div className={style.formTitle}>▶ 가입 일자</div>
            <div className={style.formAnswer}>{formatDateKR(member.createdAt)}</div>
          </div>
        </div>))}
      </div>
    </div>
  );
};

const EditSection = ({ formData, setFormData }) => {
  console.log(formData)
  // (1) BasicInfo
    const handleCategoryClick = (category) => {
      setFormData({ ...formData, category: category });
    };
    const handleTypeClick = (type) => {
      setFormData({ ...formData, type: type });
    };

    const handleRecruitStartDateChange = (date) => {
        setFormData({ ...formData, recruitStartDate: date });
    };
    const handleRecruitEndDateChange = (date) => {
        setFormData({ ...formData, recruitEndDate: date });
    };
    const handleRunningStartDateChange = (date) => {
        setFormData({ ...formData, runningStartDate: date });
    };
    const handleRunningEndDateChange = (date) => {
        setFormData({ ...formData, runningEndDate: date });
    };

    // (2) DetailedInfo
    const [selectedImage, setSelectedImage] = useState(null);

    const storage = getStorage();
    const uploadAndReturnUrl = async (storageRef, file) => {
      try {
        await uploadBytes(storageRef, file);
  
        const imageUrl = await getDownloadURL(storageRef);
        return imageUrl;
      } catch (error) {
        console.error('Error uploading file: ', error);
        throw error;
      }
    };
    const uploadImage = async (image) => {
        const imgUrl = uuidv4();
        const imageRef = ref(storage, `project_images/${imgUrl}`);
        const imageUrl = await uploadAndReturnUrl(imageRef, image);
        setFormData({ ...formData, image: imageUrl });
    }
    const handleImageChange = async (e) => {
        const selectedImage = e.target.files[0];
        setSelectedImage(selectedImage)
        uploadImage(selectedImage)
    };

    const handleSubImagesChange = async (e) => {
      const selectedSubImages = Array.from(e.target.files);

      const subImagePromises = selectedSubImages.map(async (subImage) => {
        const subimgUrl = uuidv4();
        const subImageRef = ref(storage, `project_images/${subimgUrl}`);
        return await uploadAndReturnUrl(subImageRef, subImage);
      });

      const subimageUrls = await Promise.all(subImagePromises)

      setFormData((prevFormData) => {
        return { ...prevFormData, subImages: subimageUrls };
      });
    };
    const getFileNames = () => {
      return formData.subImages.map((file, index) => `추가 이미지 ${index + 1}: ${file.name}`).join('\n');
    };
    const handleIntroductionChange = (e) => {
        setFormData({ ...formData, introduction: e.target.value });
    };
    const handleDesiredCrewChange = (e) => {
        setFormData({ ...formData, desiredCrew: e.target.value });
    };
    const handlePreparationChange = (e) => {
        setFormData({ ...formData, preparation: e.target.value });
    };
    const handleLocationChange = (e) => {
      setFormData({ ...formData, location: e.target.value });
    };

    const handleTagsChange = (e) => {
      const enteredTags = e.target.value;
      setFormData({ ...formData, enteredTags });
    };
    const handleTagsKeyDown = (e) => {
      if (e.key === ' ' && formData.enteredTags.trim() !== '') {
        setFormData({
          ...formData,
          tags: [...formData.tags, formData.enteredTags.trim()],
          enteredTags: '',
        });
      }
    };
    const removeTag = (index) => {
      const newTags = [...formData.tags];
      newTags.splice(index, 1);
      setFormData({ ...formData, tags: newTags });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!formData.name || !formData.shortDescription
        || !formData.category || !formData.type
        || !formData.recruitStartDate || !formData.recruitEndDate
        || !formData.runningStartDate || !formData.runningEndDate) {
        alert('필수항목을 입력해주세요!');
        return;
      }
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      console.log(currentDate);
      if (formData.recruitStartDate > formData.recruitEndDate
        || formData.runningStartDate > formData.runningEndDate) {
        alert('종료일은 시작일 이후여야 합니다!');
        return;
      }
      if (formData.recruitStartDate < currentDate) {
        alert('시작일은 오늘, 또는 이후 날짜여야 합니다!');
        return;
      }
    };
  
    return (
      <div className={`${style.projectDetail} ${style.projectBody}`}>
      <form onSubmit={handleSubmit}>
        <div className="form-box">
          <label>
            <div className="form-title">모임명 *</div>
            <div className="form-content">모임명은 한글과 영문, 숫자만 입력 가능합니다.</div>
            <input
              type="text" name="name" value={formData.name}
              placeholder="모임명을 입력하세요"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </label>
        </div>
        <div className="form-box">
          <label>
            <div className="form-title">한 줄 소개 *</div>
            <div className="form-content">모임을 한 줄로 소개해주세요. (자세한 소개는 다음 단계에)</div>
            <input
              type="text" name="shortDescription" value={formData.shortDescription}
              placeholder="한 줄 소개를 입력하세요"
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </label>
        </div>
        <div className="form-box div-style">
            <div className="form-title">소모임 분류 *</div>
            <div className="form-button-3"
                onClick={() => handleCategoryClick('루틴')}
                style={{ backgroundColor: formData.category === '루틴' ? 'yellowgreen' : 'silver' }}
            >
                루틴
            </div>
            <div className="form-button-3"
                onClick={() => handleCategoryClick('관계')}
                style={{ backgroundColor: formData.category === '관계' ? 'yellowgreen' : 'silver' }}
            >
                관계
            </div>
            <div className="form-button-3"
                onClick={() => handleCategoryClick('경험')}
                style={{ backgroundColor: formData.category === '경험' ? 'yellowgreen' : 'silver' }}
            >
                경험
            </div>
        </div>
        <div className="form-box div-style">
            <div className="form-title">모임형태 *</div>
            <div className="form-button-3"
                onClick={() => handleTypeClick('온라인')}
                style={{ backgroundColor: formData.type === '온라인' ? 'yellowgreen' : 'silver' }}
            >
                온라인
            </div>
            <div className="form-button-3"
                onClick={() => handleTypeClick('오프라인')}
                style={{ backgroundColor: formData.type === '오프라인' ? 'yellowgreen' : 'silver' }}
            >
                오프라인
            </div>
            <div className="form-button-3"
                onClick={() => handleTypeClick('온오프라인')}
                style={{ backgroundColor: formData.type === '온오프라인' ? 'yellowgreen' : 'silver' }}
            >
                온오프라인
            </div>
        </div>
        <div className="form-box div-style">
            <div className="form-title">모집 기간</div>
            <div className="date-picker">
                <label>
                    <div className="form-content">시작일 *</div>
                    <DatePicker
                    selected={dateFormatChange(formData.recruitStartDate)}
                    onChange={handleRecruitStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작일을 선택해주세요"
                    />
                </label>
                <label>
                    <div className="form-content">마감일 *</div>
                    <DatePicker
                    selected={dateFormatChange(formData.recruitEndDate)}
                    onChange={handleRecruitEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="마감일을 선택해주세요"
                    />
                </label>
            </div>
        </div>
        <div className="form-box div-style">
            <div className="form-title">운영 기간</div>
            <div className="date-picker">
                <label>
                    <div className="form-content">시작일 *</div>
                    <DatePicker
                      selected={dateFormatChange(formData.runningStartDate)}
                      onChange={handleRunningStartDateChange}
                      dateFormat="yyyy-MM-dd"
                    placeholderText="시작일을 선택해주세요"
                    />
                </label>
                <label>
                    <div className="form-content">종료일 *</div>
                    <DatePicker
                    selected={dateFormatChange(formData.runningEndDate)}
                    onChange={handleRunningEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="종료일을 선택해주세요"
                    />
                </label>
            </div>
        </div>
        <div className="form-box">
            <label>
              <div className="form-title">대표 이미지 *</div>
              <div className="form-content">소모임을 설명할 수 있는 이미지를 첨부해주세요!</div>
              <div className="form-content">700 x 250 의 크기로 업로드하시면 가장 좋습니다. </div>
              <div className="form-image-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required // 필수 항목
                />
                {formData.image ? (
                  <img
                    className="form-image"
                    src={URL.createObjectURL(selectedImage)}
                    alt="대표 이미지 미리보기"
                  />
                ) : (
                  <div className="form-image">
                    <div>이미지 미리보기</div>
                    <div className="form-image-description">(이미지 로딩에는 시간이 소요될 수 있습니다)</div>
                  </div>
                )}
              </div>
            </label>
        </div>
        <div className="form-box">
          <label>
            <div className="form-title">추가 이미지</div>
            <div className="form-content">추가 이미지는 크기 제한이 없습니다. 자유롭게 추가 업로드 해주세요</div>
            <div className="form-image-box">
              <input
                type="file"
                accept="image/*"
                onChange={handleSubImagesChange}
                multiple  // 여러 파일 선택을 허용
              />
              {formData.subImages.length > 0 && (
                <div className="image-names">{getFileNames()}</div>
              )}
            </div>
          </label>
        </div>
        <div className="form-box">
          <label>
              <div className="form-title">소모임 소개 *</div>
              <div className="form-body">
                  <textarea
                      value={formData.introduction}
                      onChange={handleIntroductionChange}
                      placeholder="소모임 소개를 입력하세요"
                  />
              </div>
          </label>
        </div>
        <div className="form-box">
          <label>
              <div className="form-title">이런 크루를 원해요 *</div>
              <div className="form-body">
                  <textarea
                      value={formData.desiredCrew}
                      onChange={handleDesiredCrewChange}
                      placeholder="원하는 참가자 조건을 작성해주세요"
                  />
              </div>
          </label>
        </div>
        <div className="form-box">
          <label>
              <div className="form-title">준비물</div>
              <div className="form-body">
                  <textarea
                      value={formData.preparation}
                      onChange={handlePreparationChange}
                      placeholder="필요한 준비물을 작성해주세요"
                  />
              </div>
          </label>
        </div>
        <div className="form-box">
          <label>
              <div className="form-title">오시는 길</div>
              <div className="form-content">
                소모임 운영을 오프라인에서 진행할 경우 운영 장소의 주소를 입력해주세요.
              </div>
              <div className="form-body">
                  <textarea
                      value={formData.location}
                      onChange={handleLocationChange}
                      placeholder="오프라인 소모임의 운영 장소를 설명해주세요"
                  />
              </div>
          </label>
        </div>
        <div className="form-box">
          <label>
            <div className="form-title">태그</div>
            <div className="form-content">
              운영할 소모임을 설명할 수 있는 몇 개의 단어를 입력해주세요.
            </div>
            <div className="form-content">
              태그를 추가하고 싶다면 입력 후 스페이스바를 눌러주세요!
            </div>
            <div className="tag-input-container">
              <input
                type="text"
                value={formData.enteredTags}
                onChange={handleTagsChange}
                onKeyDown={handleTagsKeyDown}
                placeholder="태그를 입력하세요"
              />
              <div className="tag-list">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="tag">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(index)}>
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </label>
        </div>
        <div className="form-footer">
            <button className="next-button" type="submit">다음으로</button>
        </div>
      </form>
      </div>
    );
};

export const ProjectManage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [members, setMembers] = useState([]);

  const [activeSection, setActiveSection] = useState('applySection');
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleButtonClick = (elementId) => {
    scrollToElement(elementId);
    setActiveSection(elementId);
  };

  const db = getFirestore();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const applyCollection = collection(db, 'projectApply');
        const q = query(applyCollection, where('projectId', '==', projectId), where('status', '==', '승인전'));
        const querySnapshot = await getDocs(q);

        const applicantsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setApplicants(applicantsData);
      } catch (error) {
        console.error('지원자를 불러오는 동안 오류 발생:', error);
      }
    };

    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          const updatedProjectData = { ...projectData, id: projectDoc.id };
          setProject(updatedProjectData);
          // Fetch applicants when the project is loaded
          fetchApplicants();
        } else {
          console.log('프로젝트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('프로젝트를 가져오는 동안 오류 발생:', error);
      }
    };

    const fetchMembers = async () => {
      try {
        const applyCollection = collection(db, 'projectMember');
        const q = query(applyCollection, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);

        const membersData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setMembers(membersData);
      } catch (error) {
        console.error('멤버를 불러오는 동안 오류 발생:', error);
      }
    };

    fetchProject();
    fetchApplicants();
    fetchMembers();
  }, [db, projectId]);

  const handleApprove = async (applicantId) => {
    try {
      // Update the status to '승인후' in the projectApply collection
      await updateDoc(doc(db, 'projectApply', applicantId), {
        status: '승인후',
      });

      // Add the user to the projectMember collection
      const selectedApplicant = applicants.find((applicant) => applicant.id === applicantId);
      await addDoc(collection(db, 'projectMember'), {
        projectId: project.id,
        userId: selectedApplicant.userId,
        userNickName: selectedApplicant.userNickname,
        userEmail: selectedApplicant.userEmail,
        createdAt: moment().toDate(),
      });
    } catch (error) {
      console.error('승인 처리 중 오류 발생:', error);
    }
  };

  const handleReject = async (applicantId) => {
    try {
      // Update the status to '거절' in the projectApply collection
      await updateDoc(doc(db, 'projectApply', applicantId), {
        status: '거절',
      });
      window.alert('거절되었습니다');
      
    } catch (error) {
      console.error('거절 처리 중 오류 발생:', error);
    }
  };


  if (!project) {
    return <p>Loading...</p>;
  }
  console.log("Applicants", applicants)
  console.log("Members", members)

  return (
    <div className={style.body} style={{ overflowY: 'auto' }}>
      <div className={style.titleBox}>
        <div className={style.joinTitle}>
          소모임 관리하기
        </div>
      </div>
      {ProjectHeader(project)}
      <div className={style.Buttons}>
        <span
          className={`${style.buttonItem} ${style[activeSection === 'applySection' ? 'active' : '']}`}
          onClick={() => handleButtonClick('applySection')}
        >
          <span className={style.text}>지원자 관리</span>
        </span>
        <span
          className={`${style.buttonItem} ${style[activeSection === 'memberSection' ? 'active' : '']}`}
          onClick={() => handleButtonClick('memberSection')}
        >
          <span className={style.text}>멤버 관리</span>
        </span>
        <span
          className={`${style.buttonItem} ${style[activeSection === 'editSection' ? 'active' : '']}`}
          onClick={() => handleButtonClick('editSection')}
        >
          <span className={style.text}>소모임 수정</span>
        </span>
      </div>
      <div id="applySection">
        {activeSection === 'applySection' && (
          <>
            {applicants.length === 0 ? (
              <div className={`${style.projectDetail} ${style.projectBody}`}>
                지원자가 없습니다
              </div>
            ) : (
              <ApplySection
                project={project}
                applicants={applicants}
                handleApprove={handleApprove}
                handleReject={handleReject}
              />
            )}
          </>
        )}
      </div>
      <div id="memberSection">
        {activeSection === 'memberSection' && (
        <>
          {members.length === 0 ? (
            <div className={`${style.projectDetail} ${style.projectBody}`}>
              멤버가 없습니다
            </div>
          ) : (<MemberSection members={members}/>)}
        </>
        )}
      </div>
      <div id="editSection">
        {activeSection === 'editSection' && (
          <EditSection
            formData={project}
            setFormData={setProject}
          />
        )}
      </div>
    </div>
  );
};
