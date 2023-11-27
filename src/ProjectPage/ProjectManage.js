import React, { useState, useEffect } from "react"
import style from './ProjectManage.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";
import { doc, getDoc, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth, dbService, storage } from '../firebase.js'
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

  const handleBulkAction = async (action) => {
    try {
      // Create an array of promises for each applicant action
      const actionPromises = selectedApplicants.map((applicantId) => {
        if (action === 'approve') {
          return handleApprove(applicantId);
        } else if (action === 'reject') {
          return handleReject(applicantId);
        }
        return null;
      });
  
      // Wait for all promises to complete
      await Promise.all(actionPromises);
  
      setSelectedApplicants([]);
      window.alert('처리되었습니다');
      window.location.reload();
    } catch (error) {
      console.error('처리 중 오류 발생:', error);
    }
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

const EditSection = ({ formData, setFormData, db, navigate }) => {
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
    const [mainImage, setMainImage] = useState(null);
    let isImageChanged = false;

    const uploadAndReturnUrl = async (storageRef, file) => {
      try {
        // Upload 'file' to Firebase Storage.
        await uploadBytes(storageRef, file);
        
        // Get download url of uploaded file.
        const imageUrl = await getDownloadURL(storageRef);
        return {imageUrl, fileName: file.name};
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
        const targetImage = e.target.files[0];
        setMainImage(targetImage);
        uploadImage(targetImage);
    };

    const handleSubImagesChange = async (e) => {
      const selectedSubImages = Array.from(e.target.files);
    
      const subImagePromises = selectedSubImages.map(async (subImage) => {
        const subimgUrl = uuidv4();
        const subImageRef = ref(storage, `project_images/${subimgUrl}`);
        return await uploadAndReturnUrl(subImageRef, subImage);
      });
    
      const newSubimageUrls = await Promise.all(subImagePromises);
    
      setFormData((prevFormData) => {
        return { ...prevFormData, subImages: [...prevFormData.subImages, ...newSubimageUrls] };
      });
    };
    const removeSubImage = (index) => {
      const newSubImages = [...formData.subImages];
      newSubImages.splice(index, 1);
      setFormData((prevFormData) => {
        return { ...prevFormData, subImages: newSubImages };
      });
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

    // (3) RecruitMent Info
    const [newInput, setNewInput] = useState('');

    const addInput = () => {
      if (newInput.trim() !== '') {
        setFormData({
          ...formData,
          recruitForm: [...formData.recruitForm, newInput.trim()],
        });
        setNewInput('');
      }
    };
  
    const removeInput = (index) => {
      const newRecruitForm = [...formData.recruitForm];
      newRecruitForm.splice(index, 1);
      setFormData({ ...formData, recruitForm: newRecruitForm });
    };

    // Submit for modification
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name || !formData.shortDescription
        || !formData.category || !formData.type
        || !formData.recruitStartDate || !formData.recruitEndDate
        || !formData.runningStartDate || !formData.runningEndDate
        || !formData.image || !formData.introduction || !formData.desiredCrew) {
        alert('필수항목을 입력해주세요!');
        return;
      }
      if (formData.recruitStartDate > formData.recruitEndDate
        || formData.runningStartDate > formData.runningEndDate) {
        alert('종료일은 시작일 이후여야 합니다!');
        return;
      }

      try {
        const projectDocRef = doc(db, 'projects', formData.id);
    
        const updatedFields = {
          name: formData.name,
          shortDescription: formData.shortDescription,
          category: formData.category,
          type: formData.type,
          recruitStartDate: formData.recruitStartDate,
          recruitEndDate: formData.recruitEndDate,
          runningStartDate: formData.runningStartDate,
          runningEndDate: formData.runningEndDate,
          image: formData.image,
          subImages: formData.subImages,
          introduction: formData.introduction,
          desiredCrew: formData.desiredCrew,
          preparation: formData.preparation,
          location: formData.location,
          tags: formData.tags,
          recruitForm: formData.recruitForm,
        };
    
        await updateDoc(projectDocRef, updatedFields);
    
        alert('소모임이 수정되었습니다!');
        navigate(`/projectDetail/${formData.id}`);
      } catch (error) {
        console.error('Error updating project:', error);
        alert('소모임 수정 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      }
    };
  
    return (
      <div className={`${style.projectDetail} ${style.projectBody}`}>
      <form onSubmit={handleSubmit}>
        <div className={style.formPage}>
          <div className={style.formBox}>
            <label>
              <div className={style.formTitle}>모임명 *</div>
              <div className={style.formContent}>모임명은 한글과 영문, 숫자만 입력 가능합니다.</div>
              <input
                type="text" name="name" value={formData.name}
                placeholder="모임명을 입력하세요"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>
          </div>
          <div className={style.formBox}>
            <label>
              <div className={style.formTitle}>한 줄 소개 *</div>
              <div className={style.formContent}>모임을 한 줄로 소개해주세요. (자세한 소개는 [소모임 소개]에서)</div>
              <input
                type="text" name="shortDescription" value={formData.shortDescription}
                placeholder="한 줄 소개를 입력하세요"
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </label>
          </div>
          <div className={`${style.formBox} ${style.divStyle}`}>
              <div className={style.formTitle}>소모임 분류 *</div>
              <div className={style.formButton3}
                  onClick={() => handleCategoryClick('루틴')}
                  style={{ backgroundColor: formData.category === '루틴' ? 'yellowgreen' : 'silver' }}
              >
                  루틴
              </div>
              <div className={style.formButton3}
                  onClick={() => handleCategoryClick('관계')}
                  style={{ backgroundColor: formData.category === '관계' ? 'yellowgreen' : 'silver' }}
              >
                  관계
              </div>
              <div className={style.formButton3}
                  onClick={() => handleCategoryClick('경험')}
                  style={{ backgroundColor: formData.category === '경험' ? 'yellowgreen' : 'silver' }}
              >
                  경험
              </div>
          </div>
          <div className={`${style.formBox} ${style.divStyle}`}>
              <div className={style.formTitle}>모임형태 *</div>
              <div className={style.formButton3}
                  onClick={() => handleTypeClick('온라인')}
                  style={{ backgroundColor: formData.type === '온라인' ? 'yellowgreen' : 'silver' }}
              >
                  온라인
              </div>
              <div className={style.formButton3}
                  onClick={() => handleTypeClick('오프라인')}
                  style={{ backgroundColor: formData.type === '오프라인' ? 'yellowgreen' : 'silver' }}
              >
                  오프라인
              </div>
              <div className={style.formButton3}
                  onClick={() => handleTypeClick('온오프라인')}
                  style={{ backgroundColor: formData.type === '온오프라인' ? 'yellowgreen' : 'silver' }}
              >
                  온오프라인
              </div>
          </div>
          <div className={`${style.formBox} ${style.divStyle}`}>
              <div className={style.formTitle}>모집 기간</div>
              <div className={style.datePicker}>
                  <label>
                      <div className={style.formContent}>시작일 *</div>
                      <DatePicker
                      selected={dateFormatChange(formData.recruitStartDate)}
                      onChange={handleRecruitStartDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="시작일을 선택해주세요"
                      />
                  </label>
                  <label>
                      <div className={style.formContent}>마감일 *</div>
                      <DatePicker
                      selected={dateFormatChange(formData.recruitEndDate)}
                      onChange={handleRecruitEndDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="마감일을 선택해주세요"
                      />
                  </label>
              </div>
          </div>
          <div className={`${style.formBox} ${style.divStyle}`}>
              <div className={style.formTitle}>운영 기간</div>
              <div className={style.datePicker}>
                  <label>
                      <div className={style.formContent}>시작일 *</div>
                      <DatePicker
                        selected={dateFormatChange(formData.runningStartDate)}
                        onChange={handleRunningStartDateChange}
                        dateFormat="yyyy-MM-dd"
                      placeholderText="시작일을 선택해주세요"
                      />
                  </label>
                  <label>
                      <div className={style.formContent}>종료일 *</div>
                      <DatePicker
                      selected={dateFormatChange(formData.runningEndDate)}
                      onChange={handleRunningEndDateChange}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="종료일을 선택해주세요"
                      />
                  </label>
              </div>
          </div>
        </div>
        <div className={style.formPage}>
          <div className={style.formBox}>
              <label>
                <div className={style.formTitle}>대표 이미지 *</div>
                <div className={style.formContent}>소모임을 설명할 수 있는 이미지를 첨부해주세요!</div>
                <div className={style.formContent}>700 x 250 의 크기로 업로드하시면 가장 좋습니다. </div>
                <div className={style.formImageBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {formData.image ? (
                    isImageChanged ? (
                      <img
                        className={style.formImage}
                        src={URL.createObjectURL(mainImage)}
                        alt="대표 이미지 미리보기"
                      />
                    ) : (
                      <img
                        className={style.formImage}
                        src={formData.image.imageUrl}
                        alt="대표 이미지 미리보기"
                      />
                    )
                  ) : (
                    <div className={style.formImage}>
                      <div>이미지 미리보기</div>
                      <div className={style.formImageDescription}>(이미지 로딩에는 시간이 소요될 수 있습니다)</div>
                    </div>
                  )}
                </div>
              </label>
          </div>
          <div className={style.formBox}>
              <label>
                <div className={style.formTitle}>추가 이미지</div>
                <div className={style.formContent}>추가 이미지는 크기 제한이 없습니다. 자유롭게 추가 업로드 해주세요.</div>
                <div className={style.formContent}>이미지 순서를 지정하고 싶다면, 한 장씩 순서대로 첨부해주세요.</div>
                <div className={style.formImageBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubImagesChange}
                    multiple  // 여러 파일 선택을 허용
                  />
                  {formData.subImages.length > 0 && (
                    <div className={style.imageNames}>
                      {formData.subImages.map((subImage, index) => (
                        <div key={index} className={style.subImageContainer}>
                          <button type="button" onClick={() => removeSubImage(index)}>
                            삭제
                          </button>
                          <span>{`추가 이미지 ${index + 1}: ${subImage.fileName}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </label>
          </div>
          <div className={style.formBox}>
            <label>
                <div className={style.formTitle}>소모임 소개 *</div>
                <div className={style.formBody}>
                    <textarea
                        value={formData.introduction}
                        onChange={handleIntroductionChange}
                        placeholder="소모임 소개를 입력하세요"
                    />
                </div>
            </label>
          </div>
          <div className={style.formBox}>
            <label>
                <div className={style.formTitle}>이런 크루를 원해요 *</div>
                <div className={style.formBody}>
                    <textarea
                        value={formData.desiredCrew}
                        onChange={handleDesiredCrewChange}
                        placeholder="원하는 참가자 조건을 작성해주세요"
                    />
                </div>
            </label>
          </div>
          <div className={style.formBox}>
            <label>
                <div className={style.formTitle}>준비물</div>
                <div className={style.formBody}>
                    <textarea
                        value={formData.preparation}
                        onChange={handlePreparationChange}
                        placeholder="필요한 준비물을 작성해주세요"
                    />
                </div>
            </label>
          </div>
          <div className={style.formBox}>
            <label>
                <div className={style.formTitle}>오시는 길</div>
                <div className={style.formContent}>
                  소모임 운영을 오프라인에서 진행할 경우 운영 장소의 주소를 입력해주세요.
                </div>
                <div className={style.formBody}>
                    <textarea
                        value={formData.location}
                        onChange={handleLocationChange}
                        placeholder="오프라인 소모임의 운영 장소를 설명해주세요"
                    />
                </div>
            </label>
          </div>
          <div className={style.formBox}>
            <label>
              <div className={style.formTitle}>태그</div>
              <div className={style.formContent}>
                운영할 소모임을 설명할 수 있는 몇 개의 단어를 입력해주세요.
              </div>
              <div className={style.formContent}>
                태그를 추가하고 싶다면 입력 후 스페이스바를 눌러주세요!
              </div>
              <div className={style.tagInputContainer}>
                <input
                  type="text"
                  value={formData.enteredTags}
                  onChange={handleTagsChange}
                  onKeyDown={handleTagsKeyDown}
                  placeholder="태그를 입력하세요"
                />
                <div className={style.tagList}>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className={style.tag}>
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
        </div>
        <div className={style.formPage}>
          <div className={style.formBox}>
            <div className={style.formTitle}>모집 양식</div>
            <div className={style.formContent}>기본 양식(이름, 이메일, 신청동기) 외로 추가로 입력받고 싶은 양식을 추가하실 수 있습니다.</div>
            <div className={style.formContent}>(예시) 모임 안내를 위해 연락처 or 카톡 아이디를 공유해주세요.</div>
            <div className={style.recruitFormContainer}>
              {formData.recruitForm.map((input, index) => (
                <div key={index} className={style.recruitFormBox}>
                  <div className={style.recruitBox}>{input}</div>
                  <div className={style.recruitButton} onClick={() => removeInput(index)}>
                    X
                  </div>
                </div>
              ))}
              <div className={style.recruitInputBox}>
                <input
                  type="text"
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value) }
                  placeholder="추가 입력 양식"
                />
                <button type="button" onClick={addInput}>
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={style.formFooter}>
            <button className={style.nextButton} type="submit">수정하기</button>
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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(dbService, 'projects', projectId));

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();
          if (projectData.leaderId !== auth.currentUser.uid) { // only leader could access
            navigate(`/projectDetail/${projectId}`);
          }
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

    const fetchApplicants = async () => {
      try {
        const applyCollection = collection(dbService, 'projectApply');
        const q = query(applyCollection, where('projectId', '==', projectId), where('status', '==', '승인전'));
        const querySnapshot = await getDocs(q);

        const applicantsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setApplicants(applicantsData);
      } catch (error) {
        console.error('지원자를 불러오는 동안 오류 발생:', error);
      }
    };

    const fetchMembers = async () => {
      try {
        const applyCollection = collection(dbService, 'projectMember');
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
  }, [projectId, navigate]);

  const handleApprove = async (applicantId) => {
    try {
      // Update the status to '승인후' in the projectApply collection
      await updateDoc(doc(dbService, 'projectApply', applicantId), {
        status: '승인후',
      });

      // Add the user to the projectMember collection
      const selectedApplicant = applicants.find((applicant) => applicant.id === applicantId);
      await addDoc(collection(dbService, 'projectMember'), {
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
      await updateDoc(doc(dbService, 'projectApply', applicantId), {
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
            db={dbService}
            navigate={navigate}
          />
        )}
      </div>
    </div>
  );
};
