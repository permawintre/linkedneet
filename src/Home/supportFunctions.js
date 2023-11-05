import moment from 'moment'
import { useState } from 'react'
import arrow from '../images/arrow.png'
import filledStar from '../images/filledStar.png'
import emptyStar from '../images/emptyStar.png'
import comments from '../images/comments.png'

//몇시간전에 게시된건지 텍스트로 반환함
export const getDayMinuteCounter = (date) => {
    if (!date) {
      return ''
    }
  
    const today = moment()
    const postingDate = moment(date)
    const dayDiff = postingDate.diff(today, 'days')
    const hourDiff = postingDate.diff(today, 'hours')
    const minutesDiff = postingDate.diff(today, 'minutes')
    
    if (dayDiff === 0 && hourDiff === 0) { // 작성한지 1시간도 안지났을때
      const minutes = Math.ceil(-minutesDiff)
      return minutes + '분 전'	 // '분' 로 표시
    }
  
    if (dayDiff === 0 && hourDiff <= 24) { // 작성한지 1시간은 넘었지만 하루는 안지났을때, 
      const hour = Math.ceil(-hourDiff)
      return hour + '시간 전'		 // '시간'으로 표시
    }
  
    return -dayDiff + '일 전'		 // '일'로 표시
}

//게시글 짧으면 그냥 표시, 길면 더보기/접기 버튼 표시
export const PostContents = ({contents}) => {

  const [state,setState] = useState(true);

  const handler = () => {

    setState((e) => !e)
  }

  const contentsLength = JSON.parse(JSON.stringify({contents})).contents.length
  if(contentsLength<=220) {
    return(
      <div>{contents}</div>
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

//사진 여러장일때 슬라이더로
export const PostPics = ({imgs}) => {

  /* 리스너 설치하기 */
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

export const CommentBtn = () => {

  return(
    <div>
      <img src={comments} alt='comment' className='comment' />
    </div>
  )
}