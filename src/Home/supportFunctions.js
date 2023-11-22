import moment from 'moment'
import { useState, useEffect } from 'react'
import { doc, updateDoc,getDoc, addDoc, collection } from 'firebase/firestore'

import arrow from '../images/arrow.png'
import filledStar from '../images/filledStar.png'
import emptyStar from '../images/emptyStar.png'
import comments from '../images/comments.png'
import React from 'react'
import { dbService , auth } from '../firebase.js'



/**
 * 몇시간 전에 게시된건지 텍스트로 반환하는 함수입니다(moment.js 설치필요)
 * @param {string} "YYYY-mm-dd HH:MM:SS" 형식으로 날짜 입력
 * @returns 입력된 날짜와 현재 시각의 차이를 문자열로 리턴
 */
export const getDayMinuteCounter = (date) => {
    if (!date) {
      return ''
    }
  
    const today = moment()
    const postingDate = moment(date)
    const yearDiff = postingDate.diff(today, 'years')
    const monthDiff = postingDate.diff(today, 'months')
    const dayDiff = postingDate.diff(today, 'days')
    const hourDiff = postingDate.diff(today, 'hours')
    const minutesDiff = postingDate.diff(today, 'minutes')
    const secondsDiff = postingDate.diff(today, 'seconds')

    if (yearDiff === 0 && monthDiff === 0 && dayDiff === 0 && hourDiff === 0 && minutesDiff === 0) { // 작성한지 1분도 안지났을때
      const seconds = Math.ceil(-secondsDiff)
      return seconds + '초 전'	 // '초' 로 표시
    }
    
    if (yearDiff === 0 && monthDiff === 0 && dayDiff === 0 && hourDiff === 0 && minutesDiff <= 60) { // 작성한지 1시간도 안지났을때
      const minutes = Math.ceil(-minutesDiff)
      return minutes + '분 전'	 // '분'으로 표시
    }
  
    if (yearDiff === 0 && monthDiff === 0 && dayDiff === 0 && hourDiff <= 24) { // 작성한지 1시간은 넘었지만 하루는 안지났을때, 
      const hour = Math.ceil(-hourDiff)
      return hour + '시간 전'		 // '시간'으로 표시
    }
  
    if (yearDiff === 0 && monthDiff === 0 && dayDiff <= 30) { // 작성한지 하루는 넘었지만 한달은 안지났을때, 
      const day = Math.ceil(-dayDiff)
      return day + '일 전'		 // '일'로 표시
    }
  
    if (yearDiff === 0 && monthDiff <= 12) { // 작성한지 한달은 넘었지만 1년은 안지났을때, 
      const month = Math.ceil(-monthDiff)
      return month + '개월 전'		 // '달'로 표시
    }
  
    return -yearDiff + '년 전'		 // '년'으로 표시
}

/**
 * 게시글에 접기, 펼치기 기능을 달아 반환하는 함수형 컴포넌트입니다.
 * 1) 220자 이하일 때에는 그대로 출력
 * 2) 220자 이상일 때에는 3줄로 줄이고 더 보기 표시(default)
 * 2-1) 더 보기 누르면 전체 내용 표시되고 접기 버튼 표시
 * @param {string} 텍스트 input 
 * @returns className 'postContents'인 div로 둘러싸인 컴포넌트 반환
 */
export const PostContents = ({contents}) => {

  const validContents = typeof contents === 'string' ? contents : '';

  const [state,setState] = useState(true);

  const handler = () => {

    setState((e) => !e)
  }

  
  if(validContents.length<=220) {
    return(
      <div className='postContents'>{contents}</div>
    )
  }

  if(state) {
    return(
      <div className='postContents'>
          <div className="folded">{contents}</div>
          <div className="foldBtn" onClick={handler}>더 보기</div>
      </div>
    )
  }
  else {
    return(
      <div className='postContents'>
          <div className='unfolded'>{contents}</div>
          <div className="foldBtn" onClick={handler}>접기</div>
      </div>
    )
  }
}

/**
 * 함수형 컴포넌트로, 이미지 배열 넣으면 좌우 슬라이드 가능한 component로 반환합니다(550px * 550px)
 * @param {Array} 사진으로 구성된 배열 input 
 * @returns className 'postPic'인 div로 둘러싸인 컴포넌트 반환
 */
export const PostPics = ({imgs}) => {

  /* 리스너 설치하기 */
  console.log({imgs})
  let [idx, setIdx] = useState(0); // 슬라이드 현재 번호
  let [moveX, setMoveX] = useState(0); // 슬라이드 위치 값
  const imgsLength = JSON.parse(JSON.stringify({imgs})).imgs.length

  function moveL() {
    if(idx === 0) console.log('cannot move')
    else {
      setIdx(idx-1)
      setMoveX(moveX+550)
    }
  }
  function moveR() {
    if(idx === imgsLength-1) console.log('cannot move')
    else {
      setIdx(idx+1)
      setMoveX(moveX-550)
    }
  }

  return(
    <div className='postPic'>
      <div className='imgContainer' style={{width: `${imgsLength*550}px`}}>
        {/** map 활용해서 배열안에있던 이미지 하나씩 표시 */}
        {imgs.map((img, idxs) => (<img src={img} alt="postPic" key={idxs} style={{transform : `translateX(${moveX}px)`}}/>))}
      </div>
      <div className='btnContainer'>
        {/** 더이상 넘길 곳 없으면 버튼 사라지도록 삼항연산자로 처리 */}
        {idx === 0?
          <div className='placeHolder'/>
          :
          <div className='prev' onClick={moveL}><img src={arrow} alt="prev" /></div>
        }
        {idx === imgsLength-1?
          <div className='placeHolder'/>
          :
          <div className='next' onClick={moveR}><img src={arrow} alt="next" /></div>
        }
        
      </div>
    </div>
  )
}

/**
 * state사용해서 버튼 눌린상태 / 눌리지 않은상태 체크
 * 반응형 애니메이션은 css로 구현
 * @returns 좋아요 버튼 렌더링
 */
 export const LikeBtn = (props) => {

  let [on, setOn] = useState(false)
  let [clicked, setClicked] = useState(false)
  const postId = props.postId
  const numOfLikes = props.numOfLikes
  const setNumOfLikes = props.setNumOfLikes
  const whoLikes = props.whoLikes
  const setWhoLikes = props.setWhoLikes
  let [uid, setUid] = useState("")

  useEffect(() => {
        if(auth.currentUser) {
          setUid(auth.currentUser.uid)
        }
  }, [])

  useEffect(() => {
    if(uid && whoLikes.includes(uid)){
      setOn(true)
    }
  }, [uid])

  useEffect(() => {
    if(uid && clicked){
      setOn(!on)
      setClicked(false)
      const postRef = doc(dbService, "posts", postId);
      if(on){
        setNumOfLikes(numOfLikes-1)
        let tmparr = whoLikes
        setWhoLikes(tmparr.filter(e => e !== uid))
        updateDoc( postRef, {
          "whoLikes": tmparr.filter(e => e !== uid)
        } )
      }
      else{
        setNumOfLikes(numOfLikes+1)
        let tmparr = whoLikes
        setWhoLikes(tmparr.concat(uid))
        updateDoc( postRef, {
          "whoLikes": tmparr.concat(uid)
        } )
      }
    }
  }, [clicked])

  const handler = () => {
    setClicked(!clicked)
  }

  if(on) {
    return(
      <div className='like on'>
        <img src={filledStar} alt='like' onClick={handler} className='forColoredImg'/>
      </div>
    )
  }
  else {
    return(
      <div className='like off'>
        <img src={emptyStar} alt='like' onClick={handler} />
      </div>
    )
  }
  
}

/**
 * 반응형 애니메이션은 css로 구현
 * @returns 댓글 버튼 렌더링
 */
export const CommentBtn = () => {

  return(
    <div>
      <img src={comments} alt='commentbtn' className='commentbtn' />
    </div>
  )
}

export const Comments= ({ userPic, userName, postedAt, contents})=> {
  console.log(postedAt);
  return (
    <div className="postComment">
        <img src={userPic} alt="Profile" className="commentUserPic" />
        <div className="commentDetails">
          <div className="commentHeader">
            <span className="commentUsername">{userName}</span>
            <span className="commentPosetedAt">{getDayMinuteCounter(postedAt)}</span>
          </div>
          <p className="commentContents">{contents}</p>
        </div>
    </div>
  );  
}

export const CommentsWindow = ({comments, numOfComments, updateComments}) => {
  console.log("Initial comments: ", comments);
  const [state,setState] = useState(true);
  const [commentsWithUserInfo, setCommentsWithUserInfo] = useState(comments);

  useEffect(() => {
    const fetchUserInfos = async () => {
      const updatedComments = [];
      for (const comment of comments) {
        console.log("Comment userId:", comment.userId);
        const userRef = doc(dbService, 'users', comment.userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          console.log("User data: ", userSnap.data());
          updatedComments.push({
            ...comment,
            userPic: userSnap.data().profile_image,
            userName: userSnap.data().nickname,
          });
        }
      }
      setCommentsWithUserInfo(updatedComments);
      console.log("Updated comments with user info: ", updatedComments);
    };

    fetchUserInfos();
  }, [comments]);



  const handler = () => {

    setState(!state);
  }
  const renderComments = () => {
    return commentsWithUserInfo.map((comment, index) => {
      console.log("Rendering comment: ", comment);
      return(
        <Comments
          key={index}
          userPic={comment.userPic}
          userName={comment.userName}
          postedAt={comment.postedAt}
          contents={comment.contents}
        />
      );
    }) 
  };
  return (
    <div className='commentsWindow'>
      {state ? (
        <div className='numOfComments' onClick={handler}>
          {numOfComments === 0 ? <span></span> : <span>댓글 {numOfComments}개 모두 보기</span>}
        </div>
      ) : (
        <div>
          <div className='unfolded'>
            {renderComments()}
          </div>
          <div className="commentfoldBtn" onClick={handler}>접기</div>
        </div>
      )}
    </div>
  );
}

export const WriteCommentContainer = ({ userProfileImage, postId, userId, addNewComment })=> {
  console.log(userId)
  const [commentInput, setCommentInput] = useState('');
  

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (commentInput.trim() === '') {
          alert('댓글을 입력하세요.');
          return;
      }

      try {
          // Firebase에 댓글 추가
          const newComment = await addDoc(collection(dbService, 'comments'), {
              postId: postId,       // 현재 게시글의 ID
              userId: userId,       // 현재 로그인한 사용자의 ID
              contents: commentInput, // 댓글 내용
              postedAt: moment().unix()*1000   // 현재 시간
          });

          const newCommentData = {
            postId: postId,       // 현재 게시글의 ID
            userId: userId,       // 현재 로그인한 사용자의 ID
            contents: commentInput, // 댓글 내용
            postedAt: moment().unix()*1000  //
        };
  
          addNewComment(newCommentData); // 댓글 목록 업데이트
  
          setCommentInput(''); // 입력 필드 초기화
      } catch (error) {
          console.error('Error adding comment: ', error);
      }
  };

  return (
      <div className='writecommentcontainer'>
          <form onSubmit={handleSubmit} className='writeComment'>
              <img src={userProfileImage} alt="프로필"/>
              <input
                  type="text"
                  placeholder="댓글을 남겨 주세요"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
              />
              <button type="submit">보내기</button>
          </form>
      </div>
  );
}





export const PlusBtn = () => {

  let [activeClass, setActiveClass] = useState("")

  const toggleActive = () => {
    setActiveClass(activeClass === '' ? 'active' : '');
  };

  return (
    <div className={`plusSign ${activeClass}`} onClick={toggleActive}>
      +
    </div>
  )
  
}

export const WritePost = ({profile})  =>{
  const [showPopup, setShowPopup] = useState(false);

  const handlePostClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div className="write-post" onClick={handlePostClick}>
        <img src={profile} alt="profile-img" className="profile-img1"/>
        <input type="text" placeholder="당신의 일상을 공유해주세요!" readOnly />
      </div>
      
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <img src={profile} alt="profile-img" className="profile-img2"/>
              <h5 className="modal-title">홍길동</h5>
              <button onClick={closePopup}>닫기</button>
            </div>
            <div className="modal-body">
              <textarea id="textArea" placeholder="나누고 싶은 생각이 있으세요?" />
            </div>
            <div className="modal-footer">
              <button onClick={closePopup}>업데이트</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}