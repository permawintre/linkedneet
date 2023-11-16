// 준비물, 소모임 위치 해야됨.
// 소모임 후기: 방명록 형태 가져오기
// 지원page 만들어야함.
// 리더탭은 리더 프로필과 연결되도록.
import React, { useState } from "react"
import style from './ProjectDetail.module.css'
import { FcAlarmClock, FcCalendar, FcCheckmark, FcGlobe } from "react-icons/fc";

const defaultImage = 'https://cdn.imweb.me/upload/S20191010288d21675b22f/e33c22faf15bc.jpg';
const defaultImage2 = 'https://images.freeimages.com/images/large-previews/c22/cat-1395746.jpg'
const defaultImage3 = 'https://www.posist.com/restaurant-times/wp-content/uploads/2023/07/How-To-Start-A-Coffee-Shop-Business-A-Complete-Guide.jpg'
const defaultImage4 = 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Chelonia_mydas_is_going_for_the_air_edit.jpg'

const getTagColor = (status) => {
    switch (status) {
        case '모집중': return 'tagRecruiting';
        case '진행중': return 'tagInProgress';
        case '진행완료': return 'tagCompleted';
    }
}

function formatDateKR(date) {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
function formatDate(date) {
    return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const ProjectHeader = (myProject) => {
    return (
        <div className={style.projectDetail}>
          <div className={style.projectBoxDetail}>
            <span className={`${style.tag} ${style[getTagColor(myProject.status)]}`}>{myProject.status}</span>
            <img src={myProject.image} alt={myProject.name} />
            <div className={`${style.name} ${style[getTagColor(myProject.status)]}`}>{myProject.name}</div>
            <div className={style.comment}>
              <div>{myProject.comment}</div>
            </div>
            <div className={style.info}>
              <div>
                <FcAlarmClock />
                <span className={style.infoTitle}>모집기간</span>
                <span className={style.infoContent}>
                  {formatDateKR(myProject.recruit_start_at)} ~ {formatDateKR(myProject.recruit_end_at)}
                </span>
              </div>
              <div>
                <FcCalendar />
                <span className={style.infoTitle}>운영기간</span>
                <span className={style.infoContent}>
                  {formatDateKR(myProject.run_start_at)} ~ {formatDateKR(myProject.run_end_at)}
                </span>
              </div>
              <div>
                <FcCheckmark />
                <span className={style.infoTitle}>분류</span>
                <span className={style.infoContent}>{myProject.type}</span>
              </div>
              <div>
                <FcGlobe />
                <span className={style.infoTitle}>장소</span>
                <span className={style.infoContent}>{myProject.form}</span>
              </div>
            </div>
          </div>
          <div className={style.projectBoxButtons}>
            {myProject.status === '모집중' ? (
              <span className={style.recruitButton}>소모임 지원하기</span>
            ) : (
              <span className={style.recruitButton}>모집기간이 아닙니다</span>
            )}
            <span className={style.shareButton}>공유하기</span>
          </div>
          <div className={style.projectBoxLeader}>
            <span className={style.leaderImage}>
              <img src={myProject.leader_image} alt={myProject.leader_name} />
            </span>
            <span className={style.leaderBody}>
              <div className={style.leaderName}>
                <span>{myProject.leader_name}</span>
                <span className={style.leaderCaption}>리더</span>
              </div>
              <div className={style.leaderComment}>{myProject.leader_comment}</div>
            </span>
          </div>
        </div>
      );
}

const ProjectBody = (myProject) => {
    return (
        <div className={`${style.projectDetail} ${style.projectBody}`}>
          <div className={style.bodyTitle}>소모임 소개</div>
          <div className={style.bodyContent}>{myProject.body}</div>
        </div>
      );
}

const ProjectInfo = (myProject) => {
    return (
        <div className={`${style.projectDetail} ${style.projectBody}`}>
          <div className={style.bodyTitle}>이런 멤버를 원해요</div>
          <div className={style.bodyContent}>{myProject.recruit_required}</div>
          <div className={style.bodyTitle}>준비물</div>
          <div className={style.bodyContent}>{myProject.preparation}</div>
          <div className={style.bodyTitle}>소모임 위치</div>
          <div className={style.bodyContent}>{myProject.location}</div>
        </div>
      );
}

const ProjectReview = (myProject) => {
    return (
        <div className={`${style.projectDetail} ${style.projectBody}`}>
          <div className={style.bodyTitle}>소모임 후기</div>
          <div className={style.bodyContent}>
            {myProject.reviews.map((review, index) => (
              <div className={style.review} key={index}>
                <span className={style.reviewUser}>{review.nickname}</span>
                <span className={style.reviewDate}>{formatDate(review.created_at)}</span>
                <div className={style.reviewContent}>{review.content}</div>
              </div>
            ))}
          </div>
        </div>
      );
}

export const ProjectDetail = () => {
    const myProject = {
        name: '느긋 느슨 그림그리기 크랍 11월',
        image: defaultImage4,
        comment: '한 달 동안 우리 함께 그림 루틴 만들어 볼까요?',
        type:'루틴',
        form:'온라인',
        status:'모집중',
        recruit_start_at: new Date('2023-10-28'),
        recruit_end_at: new Date('2023-11-05'),
        run_start_at: new Date('2023-11-06'),
        run_end_at: new Date('2023-11-30'),
        leader_name: '딩스',
        leader_comment: '니트컴퍼니 2기. 100일 동안 끄적끄적 그림을 그렸습니다. 현재도 끄적끄적 그려나가고 있습니다. 인스타그램 @xoxodingxx',
        leader_image: defaultImage3,
        body: `'느긋 느슨 그림그리기 크랍'은 꾸준한 창작 활동을 위해 그림 그리기 근육을 키우는 '그림 루틴'을 지키고, 창작자들의 '느슨한 연대'를 위한 커뮤니티 입니다.\n

*23년 8월부터 월 정기 커뮤니티 활동 중 입니다. :)

🍀모집요강👀🍀
🗓️ 모집 : 2023. 10. 28 (토) ~ 2023. 11. 05 (일)
⏰ 루틴일정 : 2023. 11. 06 (월) ~ 11. 30 (목)
-⏰ 오프라인 모임 일정: 멤버들과 협의 후 결정
👥 인원 : 15명
🎫 보증금 : 10,000원 (그림 인증 100% 달성 시 전액 환급)

🏠 온라인 모임 장소: 느느크랍 네이버 밴드
-🏠 오프라인 모임 장소: 서울 홍대입구 근처 or 그 외 협의

👜 준비물 : 오프라인 모임 시, 아이패드 등 그림 작업물 지참

✔️ 느느크랍은 카카오톡 오픈채팅방을 운영합니다. 승인 시 초대 드려요. :)
✔️✔️느느크랍 네이버밴드: https://band.us/n/a0a492L6aaTcx
        `,
        recruit_required: `함께 느슨하게 그림 루틴을 만들고 싶은 일반인/창작자`,
        preparation: `타블렛, 아이패드 등 디지털 드로잉 도구 (외 다른 도구도 가능)`,
        location: `이대역`,
        reviews: [
            {
                'nickname': '유저1',
                'content': `야외드로잉은 모여서 그리는 게 아니라 마음이 가는대로 뿔뿔히 흝어져 드로잉하는 방식이였습니다. 그게 조금 아쉬웠지만 야외에서 그리는 감각이 즐거웠습니다.
                후에 다같이 모여서 드로잉에 대해 얘기를 나누는 시간이 좋았습니다. 몇몇분과 저녁을 같이 먹고 한강 산책을 하고 헤어졌는데 좋은 시간이었어요.`,
                'created_at': new Date('2023-01-30'),
            },
            {
                'nickname': '유저2',
                'content': '다양한 사람들과 친해질 수 있습니다',
                'created_at': new Date('2023-02-28'),
            }
        ]
    }

    const [activeSection, setActiveSection] = useState('projectBodySection');
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

    return (
    <div className={style.body} style={{ overflowY: 'auto' }}>
        {ProjectHeader(myProject)}
        <div className={style.projectBoxButtons}>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectBodySection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectBodySection')}
            >
            <span className={style.text}>소모임 소개</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectInfoSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectInfoSection')}
            >
            <span className={style.text}>이런 멤버를 원해요</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectPreparationSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectPreparationSection')}
            >
            <span className={style.text}>준비물</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectLocationSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectLocationSection')}
            >
            <span className={style.text}>소모임 위치</span>
            </span>
            <span
            className={`${style.projectButton} ${style[activeSection === 'projectReviewSection' ? 'active' : '']}`}
            onClick={() => handleButtonClick('projectReviewSection')}
            >
            <span className={style.text}>소모임 후기</span>
            </span>
        </div>
        <div id="projectBodySection">
            {activeSection === 'projectBodySection' && ProjectBody(myProject)}
        </div>
        <div id="projectInfoSection">
            {activeSection === 'projectInfoSection' && ProjectInfo(myProject)}
        </div>
        <div id="projectReviewSection">
            {activeSection === 'projectReviewSection' && ProjectReview(myProject)}
        </div>
    </div>
    );
}