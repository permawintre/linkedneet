import moment from 'moment'
import { useState } from 'react'
import arrow from '../images/arrow.png'
import filledStar from '../images/filledStar.png'
import emptyStar from '../images/emptyStar.png'
import comments from '../images/comments.png'

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

  const [state,setState] = useState(true);

  const handler = () => {

    setState((e) => !e)
  }

  const contentsLength = JSON.parse(JSON.stringify({contents})).contents.length
  if(contentsLength<=220) {
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
export const LikeBtn = () => {

  let [state, setState] = useState(false)

  const handler = () => {
    setState(!state)
  }

  if(state) {
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
      <img src={comments} alt='comment' className='comment' />
    </div>
  )
}