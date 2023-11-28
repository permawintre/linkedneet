import React, { useState, useEffect } from "react"
import style from './ProjectCreate.module.css'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { dbService, auth, storage } from '../firebase.js';
import { addDoc, collection, getDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment'
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';


const BasicInfoForm = ({ nextStep, formData, setFormData, mainImage }) => {
  
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
      if (formData.recruitStartDate > formData.recruitEndDate
        || formData.runningStartDate > formData.runningEndDate) {
        alert('종료일은 시작일 이후여야 합니다!');
        return;
      }
      if (formData.recruitStartDate < currentDate) {
        alert('시작일은 오늘, 또는 이후 날짜여야 합니다!');
        return;
      }
      nextStep();
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className={style.formHeader}>
            <div className={style.formTitle}>소모임 만들기</div>
            <div className={style.stepBox}>
                <div className={`${style.step} ${style.stepHighlight}`}>1. 기본 정보</div>
                <div className={style.step}>2. 상세 정보</div>
                <div className={style.step}>3. 모집 양식</div>
                <div className={style.step}>4. 완료</div>
            </div>
        </div>
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
            <div className={style.formContent}>모임을 한 줄로 소개해주세요. (자세한 소개는 다음 단계에)</div>
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
                    selected={formData.recruitStartDate}
                    onChange={handleRecruitStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작일을 선택해주세요"
                    />
                </label>
                <label>
                    <div className={style.formContent}>마감일 *</div>
                    <DatePicker
                    selected={formData.recruitEndDate}
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
                      selected={formData.runningStartDate}
                      onChange={handleRunningStartDateChange}
                      dateFormat="yyyy-MM-dd"
                    placeholderText="시작일을 선택해주세요"
                    />
                </label>
                <label>
                    <div className={style.formContent}>종료일 *</div>
                    <DatePicker
                    selected={formData.runningEndDate}
                    onChange={handleRunningEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="종료일을 선택해주세요"
                    />
                </label>
            </div>
        </div>
        <div className={style.formFooter}>
            <button className={style.nextButton} type="submit">다음으로</button>
        </div>
      </form>
    );
};
const DetailedInfoForm = ({ prevStep, nextStep, formData, setFormData, mainImage, setMainImage }) => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.image || !formData.introduction || !formData.desiredCrew) {
          alert('필수항목을 입력해주세요!');
          return;
        }
        nextStep();
    };
    
      return (
        <form onSubmit={handleSubmit}>
          <div className={style.formHeader}>
              <div className={style.formTitle}>소모임 만들기</div>
              <div className={style.stepBox}>
                  <div className={style.step}>1. 기본 정보</div>
                  <div className={`${style.step} ${style.stepHighlight}`}>2. 상세 정보</div>
                  <div className={style.step}>3. 모집 양식</div>
                  <div className={style.step}>4. 완료</div>
              </div>
          </div>
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
                  <img
                    className={style.formImage}
                    src={URL.createObjectURL(mainImage)}
                    alt="대표 이미지 미리보기"
                  />
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
          <div className={style.formFooter}>
            <button className={style.prevButton} type="button" onClick={prevStep}>이전으로</button>
            <button className={style.nextButton} type="submit">다음으로</button>
          </div>
        </form>
      );
}
const RecruitmentForm = ({ prevStep, nextStep, formData, setFormData, mainImage }) => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        nextStep();
    };
    
      return (
        <form onSubmit={handleSubmit}>
          <div className={style.formHeader}>
              <div className={style.formTitle}>소모임 만들기</div>
              <div className={style.stepBox}>
                  <div className={style.step}>1. 기본 정보</div>
                  <div className={style.step}>2. 상세 정보</div>
                  <div className={`${style.step} ${style.stepHighlight}`}>3. 모집 양식</div>
                  <div className={style.step}>4. 완료</div>
              </div>
          </div>
          <div className={style.formBox}>
            <div className={style.formContent}>모임의 모집 방법과 모집 양식을 설정할 수 있습니다.</div>
            <div className={style.formContent}>* 모집 양식은 등록 이후 수정이 불가능합니다.</div>
          </div>
          <div className={style.formBox}>
            <div className={style.formTitle}>기본 입력 양식</div>
            <div className={style.formContent}>아래 기본 양식들은 모든 신청자들로부터 기본 입력받게 됩니다.</div>
            <div className={style.recruitBox}>이름</div>
            <div className={style.recruitBox}>이메일</div>
            <div className={style.recruitBox}>신청동기</div>
          </div>
          <div className={style.formBox}>
            <div className={style.formTitle}>추가 입력 양식</div>
            <div className={style.formContent}>기본 양식 외로 추가로 입력받고 싶은 양식을 추가하실 수 있습니다.</div>
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
          <div className={style.formFooter}>
            <button className={style.prevButton} type="button" onClick={prevStep}>이전으로</button>
            <button className={style.nextButton} type="submit">다음으로</button>
          </div>
        </form>
      );
}
const CompletionForm = ({ prevStep, formData, setFormData, mainImage }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  let [uid, setUid] = useState("")
  useEffect(() => {
    if(auth.currentUser) {
      setUid(auth.currentUser.uid)
    }
}, [])

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const updatedFormData = {
        ...formData,
        createdAt: moment().toDate(),
        'leaderId': uid,
      };

      // Save formData to Firebase Firestore
      const projectRef = await addDoc(collection(dbService, 'projects'), updatedFormData);
      const leaderDoc = await getDoc(doc(dbService, 'users', uid));
      const leaderData = leaderDoc.data();
      await addDoc(collection(dbService, 'projectMember'), {
        projectId: projectRef.id,
        userId: uid,
        userNickName: leaderData.nickname,
        userEmail: leaderData.email,
        createdAt: moment().toDate(),
      });

      window.alert('소모임이 생성되었습니다!');
      navigate('/project');

      console.log('폼 데이터가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Error during form submission: ', error);
    } finally {
      setIsSubmitting(false); // 예외가 발생하더라도 상태를 초기화하여 계속 진행되도록 함
    }
  };
    
      return (
        <form onSubmit={handleSubmit}>
          <div className={style.formHeader}>
              <div className={style.formTitle}>소모임 만들기</div>
              <div className={style.stepBox}>
                  <div className={style.step}>1. 기본 정보</div>
                  <div className={style.step}>2. 상세 정보</div>
                  <div className={style.step}>3. 모집 양식</div>
                  <div className={`${style.step} ${style.stepHighlight}`}>4. 완료</div>
              </div>
          </div>
          <div className={style.formBox}>
            <div className={style.formTitle}>모임 등록을 완료했습니다!</div>
            <div className={style.formContent}>빠진 내용이 없는지 미리보기를 통해 확인해보세요</div>
          </div>
          <div className={style.formFooter}>
            {isSubmitting ? (
              <div>
                <div>생성 중입니다...</div>
                <div>잠시만 기다려주세요.</div>
              </div>
            ) : (
              <>
                <button className={style.prevButton} type="button" onClick={prevStep}>
                  이전으로
                </button>
                <button className={style.nextButton} type="submit">
                  제출하기
                </button>
              </>
            )}
          </div>
        </form>
      )
}


export const ProjectCreate = () => {
    window.scrollTo(0, 0);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        shortDescription: '',
        category: '',
        type: '',
        recruitStartDate: null,
        recruitEndDate: null,
        runningStartDate: null,
        runningEndDate: null, // ~ (1)
        image: null,
        subImages: [],
        introduction: '',
        desiredCrew: '',
        preparation: '',
        location: '',
        tags: [], // ~ (2)
        recruitForm: [],
      });
    const [mainImage, setMainImage] = useState(null);
  
    const nextStep = () => {
      setStep(step + 1);
    };
  
    const prevStep = () => {
      setStep(step - 1);
    };
  
    switch (step) {
      case 1:
        return <div>
                    <BasicInfoForm
                        nextStep={nextStep}
                        formData={formData}
                        setFormData={setFormData}
                        mainImage={mainImage}
                    />
                </div>;
      case 2:
        return <div>
                    <DetailedInfoForm
                        nextStep={nextStep}
                        prevStep={prevStep}
                        formData={formData}
                        setFormData={setFormData}
                        mainImage={mainImage}
                        setMainImage={setMainImage}
                    />
                </div>;
      case 3:
        return <div>
                    <RecruitmentForm
                        nextStep={nextStep}
                        prevStep={prevStep}
                        formData={formData}
                        setFormData={setFormData}
                        mainImage={mainImage}
                    />
                </div>;
      case 4:
        return <div>
                    <CompletionForm
                        prevStep={prevStep}
                        formData={formData}
                        setFormData={setFormData}
                        mainImage={mainImage}
                    />
                </div>;
      default:
        return null;
    }
  };