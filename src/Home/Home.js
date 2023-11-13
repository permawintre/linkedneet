import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn } from './supportFunctions'
import './Home.css'
import { db, auth } from '../firebase.js'
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    addDoc
} from "firebase/firestore"
import { useEffect, useState } from 'react'
import close from '../images/close.png'
import moment from 'moment'
import styled from 'styled-components'
import { getStorage, ref, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // 랜덤 식별자를 생성해주는 라이브러리




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
const postedAt = "2023-11-05 20:00:00"
const contents = "지난달 초 우리 학교의 상징과도 같은 거위들이 6마리나 태어났다. 그러나 탄생의 기쁨이 채 가시기도 전에 6마리 중 2마리가 각각실종 및 사망한 것으로 확인되었으며, 1마리는 목숨이 위험할 정도의 상처를 입어 생명과학과 허원도 교수가 보호 중이라는 소식이 대학생 커뮤니티 서비스 <에브리타임>(이하 에타) 등지에 퍼지기 시작했다. 한때 고양이, 너구리와 같은 동물들이 습격해 어린 거위들이 변을 당하게 되었다는 여론이 주를 이루며, 어린 거위를 물고 가는 동물을 봤다는 목격담이 퍼지기도 했으나 확실한 사실이 밝혀지지는 않았다. 이에 본지는 자세한 사건의 내막과 여러 낭설의 진위를 파악하기 위해평소 남다른 거위 사랑으로 유명한 허 교수를 인터뷰했다."
const numOfLikes = 26
const numOfComments = 2



function Post() {
    return (
        <div className="homePost">
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



function Posts() {
    const fetchposts = async () => {
        // ... try, catch 생략
        const q = query(
            collection(db, 'posts'),
            orderBy("postedAt", "desc", limit(3)),
        ) // 참조
        const postSnap = await getDocs(q) // 데이터 스냅 받아오기 - 비동기처리
        const data = postSnap.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))
        return data
    }
}



function DndBox(props) {

    const [isDragging, setIsDragging] = useState(false);
    
    // 부모 컴포넌트에서 내려준 contentImage state
    const contentImages = props.contentImages;
    const setContentImages = props.setContentImages;

    const readImage = (image) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = (e) => {
            
            setContentImages(contentImages => [...contentImages, String(e.target?.result)]);
        };
        
    };

    

    const onDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };
      const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      };
      const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files) {
          setIsDragging(true);
        }
      };
      const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files || e.target.files;
        for(let i=0;i<files.length;i++){
            readImage(files[i]);
        }
        setIsDragging(false);
      };
/*
      const onContentImageChange = (e) => {
        if (e.target.files) {
          readImage(e.target.files[0]);
          readImage(e.target.files[1]);
        }
        console.log(e.target.files)
      };
*/
      const StyledCpnt = styled.div`
        border: ${(props) => props.$isDragging ? '3px dotted #808080' : '3px solid #bbbbbb'}
      `

    return(
        <div>
        {contentImages.length > 0 &&
        <div>
            {contentImages.map((img) => 
                <img src={img} alt='preview' className='previewImg' />
            )}
        </div>
        }
        <StyledCpnt className='dndBox'
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
            //onChange={onContentImageChange}

            // styled components props
            $isDragging={isDragging}
        >
            <div>
                <img src={close} alt='add photos' className='addPhotos'/>
                <p>사진을 이곳에 올려주세요</p>
            </div>
        </StyledCpnt>
        </div>
    )
}

function Write() {

    const defaultValues = {
        contents: '',
        numOfComments: 0,
        numOfLikes: 0,
        postedAt: null
    }
    let [isOpen, setIsOpen] = useState(false)
    let [values, setValues] = useState(defaultValues)
    let [async, setAsync] = useState(false)
    let [contentImages, setContentImages] = useState([])
    let [uid, setUid] = useState("")
    



    useEffect(() => {
          if(auth.currentUser) {
            setUid(auth.currentUser.uid)
          }
    }, [])
    

    useEffect( () => {
        if(async) {
            
            addDoc(collection(db, "posts"), values)
            setAsync(false)
        }
        else {
            setValues(defaultValues)
            setContentImages([])
        }
        // 에러 임시로 없앰
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [async])

    const handleChange = (e) => {
        setValues({
          ...values,
          [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {

        const imgUrls = [...new Array(contentImages.length)].map(() => uuidv4())
        e.preventDefault();
        setValues({
            ...values,
            'postedAt': moment().toDate(),
            'userId': uid,
            'imgUrls': imgUrls
        })
        
        setIsOpen(false)

        const storage = getStorage();

        for(let i=0;i<contentImages.length;i++) {
            const fileRef = ref(storage, imgUrls[i]);
            uploadString(fileRef, contentImages[i], 'data_url');
        }

        setAsync(true)
        
    };


    return(
        <div className='homePost write'>
            <div className='postHeader'>
                <div className='profileImg'><img src={profile1Img} alt="profileImg"/></div>
                <div className='popModal' onClick={ () => setIsOpen(true) }>당신의 일상을 공유해주세요!</div>
            </div>
            {isOpen ?
                <div className='modalBG' onClick={ () => setIsOpen(false) }>
                <div onClick={ (e) => e.stopPropagation() }> {/** event 버블링 방지 */}
                    <div className='modalWrite'>
                        <div className='modalHeader'>
                            <div className='modalProfile'>
                                <div className='profileImg'><img src={profile1Img} alt="profileImg"/></div>
                                <div className="userName">{userName}</div>
                            </div>
                            <img src={close} alt='x' className='close' onClick={ () => setIsOpen(false) }/>
                        </div>
                        <form onSubmit={handleSubmit} className='modalForm'>
                            <textarea type='text' name='contents' value={values.contents} onChange={handleChange} placeholder='나누고 싶은 생각이 있으세요?'/>
                            <DndBox contentImages={ contentImages } setContentImages={ setContentImages } />
                            <button type='submit'>게시</button>
                        </form>
                    </div>
                </div>
                </div>
            :
                null
            }
            
        </div>
    )
}



export const Home = () => {

    return(
        <div className='home'>
            
            <Write/>
            <Post/>
            <Post/>
        </div>
    )

}