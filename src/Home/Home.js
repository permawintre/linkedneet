import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn } from './supportFunctions'
import './Home.css'



import profile1Img from '../images/profile1Img.jpg'
import img1 from '../images/img1.jpg'
import img2 from '../images/img2.jpg'
import img3 from '../images/img3.jpg'
import img4 from '../images/img4.jpg'
import img5 from '../images/img5.jpg'
import img6 from '../images/img6.jpg'
const imgs = [img1, img2, img3, img4, img5, img6]
const userName = "홍길동"
const companyClass = 14
const moims = ['모임 a', '모임 b', '모임 c']
const postedAt = "2023-10-25 00:00:00"
const contents = "지난달 초 우리 학교의 상징과도 같은 거위들이 6마리나 태어났다. 그러나 탄생의 기쁨이 채 가시기도 전에 6마리 중 2마리가 각각실종 및 사망한 것으로 확인되었으며, 1마리는 목숨이 위험할 정도의 상처를 입어 생명과학과 허원도 교수가 보호 중이라는 소식이 대학생 커뮤니티 서비스 <에브리타임>(이하 에타) 등지에 퍼지기 시작했다. 한때 고양이, 너구리와 같은 동물들이 습격해 어린 거위들이 변을 당하게 되었다는 여론이 주를 이루며, 어린 거위를 물고 가는 동물을 봤다는 목격담이 퍼지기도 했으나 확실한 사실이 밝혀지지는 않았다. 이에 본지는 자세한 사건의 내막과 여러 낭설의 진위를 파악하기 위해평소 남다른 거위 사랑으로 유명한 허 교수를 인터뷰했다."
const numOfLikes = 26
const numOfComments = 2


function Posts() {

    return (
        <div className="post">
            <div className='paddingDiv'>
                <div className="postHeader">
                    <div className='profileImg'><img src={profile1Img} alt="profileImg"/></div>
                    <div className='postInfo'>
                        <div className="userName">{userName}</div>
                        <div className='inGroup'>{companyClass+'기'}{moims.map((moim, idx)=>(<span key={idx}>{', '}{moim}</span>))}</div>
                        <div className="postedWhen">{getDayMinuteCounter(postedAt)}</div>
                    </div>
                </div>
                <PostContents contents={contents} />
            </div>
            <PostPics imgs={imgs} />
            <div className='numOfLikesNComments'>
                {numOfLikes===0? <span></span> : <span>좋아요 {numOfLikes}개 </span>}
                {numOfComments===0? <span></span> : <span>댓글 {numOfComments}개</span>}
            </div>
            <hr></hr>
            <div className='postFooter'>
                <LikeBtn />
                <CommentBtn />
            </div>
        </div>
    )
}

export const Home = () => {

    return(
        <div className='home'>
            <Posts/>
            <Posts/>
        </div>
    )

}