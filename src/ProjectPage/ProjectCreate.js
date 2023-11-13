// npm install react-datepicker
// naver map?
// 임시저장 버튼

import React, { useState } from "react"
import './Project.css'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BasicInfoForm = ({ nextStep }) => {
    const [formData, setFormData] = useState({
      projectName: '',
      shortDescription: '',
      projectCategory: '',
      projectType: '',
      openChatRoom: '',
      recruitStartDate: null,
      recruitEndDate: null,
      runningStartDate: null,
      runningEndDate: null,
    });
  
    const handleCategoryClick = (category) => {
      setFormData({ ...formData, projectCategory: category });
    };
  
    const handleTypeClick = (type) => {
      setFormData({ ...formData, projectType: type });
    };
  
    const handleChatRoomClick = (chatRoom) => {
      setFormData({ ...formData, openChatRoom: chatRoom });
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
      // if (!formData.projectName || !formData.shortDescription
      //   || !formData.projectCategory || !formData.projectType
      //   || !formData.openChatRoom
      //   || !formData.recruitStartDate || !formData.recruitEndDate
      //   || !formData.runningStartDate || !formData.runningEndDate) {
      //   alert('필수항목을 채워주세요!');
      //   return;
      // }
      nextStep();
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-header">
            <div className="form-title">소모임 만들기</div>
            <div className="step-box">
                <div className="step step-highlight">1. 기본 정보</div>
                <div className="step">2. 상세 정보</div>
                <div className="step">3. 모집 양식</div>
                <div className="step">4. 완료</div>
            </div>
        </div>
        <div className="form-box">
          <label>
            <div className="form-title">모임명 *</div>
            <div className="form-content">모임명은 한글과 영문, 숫자만 입력 가능합니다.</div>
            <input
              type="text" name="projectName" value={formData.projectName}
              placeholder="모임명을 입력하세요"
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
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
                style={{ backgroundColor: formData.projectCategory === '루틴' ? 'yellowgreen' : 'silver' }}
            >
                루틴
            </div>
            <div className="form-button-3"
                onClick={() => handleCategoryClick('관계')}
                style={{ backgroundColor: formData.projectCategory === '관계' ? 'yellowgreen' : 'silver' }}
            >
                관계
            </div>
            <div className="form-button-3"
                onClick={() => handleCategoryClick('경험')}
                style={{ backgroundColor: formData.projectCategory === '경험' ? 'yellowgreen' : 'silver' }}
            >
                경험
            </div>
        </div>
        <div className="form-box div-style">
            <div className="form-title">모임형태 *</div>
            <div className="form-button-3"
                onClick={() => handleTypeClick('온라인')}
                style={{ backgroundColor: formData.projectType === '온라인' ? 'yellowgreen' : 'silver' }}
            >
                온라인
            </div>
            <div className="form-button-3"
                onClick={() => handleTypeClick('오프라인')}
                style={{ backgroundColor: formData.projectType === '오프라인' ? 'yellowgreen' : 'silver' }}
            >
                오프라인
            </div>
            <div className="form-button-3"
                onClick={() => handleTypeClick('온오프라인')}
                style={{ backgroundColor: formData.projectType === '온오프라인' ? 'yellowgreen' : 'silver' }}
            >
                온오프라인
            </div>
        </div>
        <div className="form-box div-style">
            <div className="form-title">오픈채팅방 *</div>
            <div className="form-button-2"
                onClick={() => handleChatRoomClick('개설함')}
                style={{ backgroundColor: formData.openChatRoom === '개설함' ? 'yellowgreen' : 'silver' }}
            >
                개설함
            </div>
            <div className="form-button-2"
                onClick={() => handleChatRoomClick('개설 안 함')}
                style={{ backgroundColor: formData.openChatRoom === '개설 안 함' ? 'yellowgreen' : 'silver' }}
            >
                개설 안 함
            </div>
        </div>
        <div className="form-box div-style">
            <div className="form-title">모집 기간</div>
            <div className="date-picker">
                <label>
                    <div className="form-content">시작일 *</div>
                    <DatePicker
                    selected={formData.recruitStartDate}
                    onChange={handleRecruitStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작일을 선택해주세요"
                    />
                </label>
                <label>
                    <div className="form-content">마감일 *</div>
                    <DatePicker
                    selected={formData.recruitEndDate}
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
                    selected={formData.runningStartDate}
                    onChange={handleRunningStartDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="시작일을 선택해주세요"
                    />
                </label>
                <label>
                    <div className="form-content">종료일 *</div>
                    <DatePicker
                    selected={formData.runningEndDate}
                    onChange={handleRunningEndDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="종료일을 선택해주세요"
                    />
                </label>
            </div>
        </div>
        <div className="form-footer">
            <button className="next-button" type="submit">다음으로</button>
        </div>
      </form>
    );
};
const DetailedInfoForm = ({ prevStep, nextStep }) => {
    const [formData, setFormData] = useState({
        image: null,
        sub_images: [],
        introduction: '',
        desiredCrew: '',
        preparation: '',
        location: '',
        tags: [],
      });
    
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setFormData({ ...formData, image: selectedImage });
    };
    const handleSubImagesChange = (e) => {
      const selectedSubImages = Array.from(e.target.files);
      setFormData({ ...formData, sub_images: selectedSubImages });
    };
    const getFileNames = () => {
      return formData.sub_images.map((file, index) => `추가 이미지 ${index + 1}: ${file.name}`).join('\n');
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
        nextStep();
    };
    
      return (
        <form onSubmit={handleSubmit}>
          <div className="form-header">
              <div className="form-title">소모임 만들기</div>
              <div className="step-box">
                  <div className="step">1. 기본 정보</div>
                  <div className="step step-highlight">2. 상세 정보</div>
                  <div className="step">3. 모집 양식</div>
                  <div className="step">4. 완료</div>
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
                    src={URL.createObjectURL(formData.image)}
                    alt="대표 이미지 미리보기"
                  />
                ) : (
                  <div className="form-image">이미지 미리보기</div>
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
                {formData.sub_images.length > 0 && (
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
            <button className="prev-button" type="button" onClick={prevStep}>이전으로</button>
            <button className="next-button" type="submit">다음으로</button>
          </div>
        </form>
      );
}
const RecruitmentForm = ({ prevStep, nextStep }) => {
    const [formData, setFormData] = useState({
        recruit_form: [],
        newInput: '',
    });

    const addInput = () => {
      if (formData.newInput.trim() !== '') {
        setFormData({
          ...formData,
          recruit_form: [...formData.recruit_form, formData.newInput.trim()],
          newInput: '', // 입력 후 초기화
        });
      }
    };
  
    const removeInput = (index) => {
      const newRecruitForm = [...formData.recruit_form];
      newRecruitForm.splice(index, 1);
      setFormData({ ...formData, recruit_form: newRecruitForm });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        nextStep();
    };
    
      return (
        <form onSubmit={handleSubmit}>
          <div className="form-header">
              <div className="form-title">소모임 만들기</div>
              <div className="step-box">
                  <div className="step">1. 기본 정보</div>
                  <div className="step">2. 상세 정보</div>
                  <div className="step step-highlight">3. 모집 양식</div>
                  <div className="step">4. 완료</div>
              </div>
          </div>
          <div className="form-box">
            <div className="form-content">모임의 모집 방법과 모집 양식을 설정할 수 있습니다.</div>
            <div className="form-content">* 모집 양식은 등록 이후 수정이 불가능합니다.</div>
          </div>
          <div className="form-box">
            <div className="form-title">기본 입력 양식</div>
            <div className="form-content">아래 기본 양식들은 모든 신청자들로부터 기본 입력받게 됩니다.</div>
            <div className="recruit-box">이름</div>
            <div className="recruit-box">이메일</div>
            <div className="recruit-box">신청동기</div>
          </div>
          <div className="form-box">
            <div className="form-title">추가 입력 양식</div>
            <div className="form-content">기본 양식 외로 추가로 입력받고 싶은 양식을 추가하실 수 있습니다.</div>
            <div className="form-content">(예시) 모임 안내를 위해 연락처 or 카톡 아이디를 공유해주세요.</div>
            <div className="recruit-form-container">
              {formData.recruit_form.map((input, index) => (
                <div key={index} className="recruit-form-box">
                  <div className="recruit-box">{input}</div>
                  <div className="recruit-button" onClick={() => removeInput(index)}>
                    X
                  </div>
                </div>
              ))}
              <div className="recruit-input-box">
                <input
                  type="text"
                  value={formData.newInput}
                  onChange={(e) => setFormData({ ...formData, newInput: e.target.value })}
                  placeholder="추가 입력 양식"
                />
                <button type="button" onClick={addInput}>
                  추가
                </button>
              </div>
            </div>
          </div>
          <div className="form-footer">
            <button className="prev-button" type="button" onClick={prevStep}>이전으로</button>
            <button className="next-button" type="submit">다음으로</button>
          </div>
        </form>
      );
}
const CompletionForm = ({ prevStep }) => {

    const handleSubmit = (e) => {
        e.preventDefault();
        prevStep();
    };
    
      return (
        <form onSubmit={handleSubmit}>
          <div className="form-header">
              <div className="form-title">소모임 만들기</div>
              <div className="step-box">
                  <div className="step">1. 기본 정보</div>
                  <div className="step">2. 상세 정보</div>
                  <div className="step">3. 모집 양식</div>
                  <div className="step step-highlight">4. 완료</div>
              </div>
          </div>
          <div className="form-box">
            <div className="form-title">모임 등록을 완료했습니다!</div>
            <div className="form-content">빠진 내용이 없는지 미리보기를 통해 확인해보세요</div>
          </div>
          <div className="form-footer">
            <button className="prev-button" type="button" onClick={prevStep}>이전으로</button>
            <button className="next-button" type="submit">제출하기</button>
          </div>
        </form>
      )
}


export const ProjectCreate = () => {
    const [step, setStep] = useState(1);
  
    const nextStep = () => {
      setStep(step + 1);
    };
  
    const prevStep = () => {
      setStep(step - 1);
    };
  
    switch (step) {
      case 1:
        return <div className="body"><BasicInfoForm nextStep={nextStep} /></div>;
      case 2:
        return <div className="body"><DetailedInfoForm nextStep={nextStep} prevStep={prevStep} /></div>;
      case 3:
        return <div className="body"><RecruitmentForm nextStep={nextStep} prevStep={prevStep} /></div>;
      case 4:
        return <div className="body"><CompletionForm prevStep={prevStep} /></div>;
      default:
        return null;
    }
  };