import React from "react"
import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn, PlusBtn, CommentsWindow, WriteCommentContainer, addNewComment } from './supportFunctions'
import './Home.css'
import { initializeApp } from 'firebase/app';
import { dbService , auth } from '../firebase.js'
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    addDoc,
    startAfter,
    doc,
    getDoc,
    where
} from "firebase/firestore"
import { useEffect, useState } from 'react'
import close from '../images/close.png'
import moment from 'moment'
import styled from 'styled-components'
import { getStorage, ref, uploadString, listAll, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // 랜덤 식별자를 생성해주는 라이브러리
import { storage } from '../firebase.js';



import profile1Img from '../images/profile1Img.jpg'

const user = auth.currentUser;
const userName = "홍길동"
const companyClass = 14
const moims = ['모임 a', '모임 b', '모임 c']


function Post(props) {
    const userId = props.userId;
    const postId = props.postId
    const postedAt = props.postedAt
    const [comments, setComments] = useState([]);
    const [numOfLikes, setNumOfLikes] = useState(props.numOfLikes);
    const [whoLikes, setWhoLikes] = useState(props.whoLikes);
    const [imgUrls, setImgUrls] = useState([])
    const contents = props.contents
    const [postUserInfo, setPostUserInfo] = useState({ profileImage: '', nickname: '' });

    const addNewComment = (newComment) => {
        setComments(prevComments => [...prevComments, newComment]);
    };

    useEffect(() => {
        const fetchPostUserInfo = async () => {
            try {
                if (userId) {
                    const userRef = doc(dbService, 'users', userId);
                    const userSnap = await getDoc(userRef);
    
                    if (userSnap.exists()) {
                        setPostUserInfo({
                            profileImage: userSnap.data().profile_image,
                            nickname: userSnap.data().nickname,
                            generation: userSnap.data().generation

                        });
                    } else {
                        console.log("User not found!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };
        fetchPostUserInfo();
    }, [userId]);

    useEffect(() => {
        setImgUrls([])
        console.log(props.imgUrls.length)
        for(let i=0;i<props.imgUrls.length;i++){
            (async () => {
                await getDownloadURL(ref(storage, props.imgUrls[i]))
                    .then((downloadUrl) => {
                        setImgUrls(prev => [...prev, downloadUrl])
                    })
            })()
        }
    },[])

    useEffect(() => {
        const fetchComments = async () => {
            if (postId) { // postId가 유효한 경우에만 쿼리 실행
                const q = query(collection(dbService, 'comments'), where('postId', '==', postId));
                const querySnapshot = await getDocs(q);
                const commentsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComments(commentsData); // 상태 업데이트
            }
            else{
                console.error('Value is undefined!');
            }
        };
    
        fetchComments();
    }, [postId]);

    return (
        <div className="homePost">
            <div className='paddingDiv'>
                <div className="postHeader">
                    <div className='profileImg'><img src={postUserInfo.profileImage || profile1Img} alt="profileImg"/></div>
                    <div className='postInfo'>
                        <div className="userName">{postUserInfo.nickname || userName}</div>
                        <div className='inGroup'>{postUserInfo.generation+'기' || companyClass+'기'}{moims.map((moim, idx)=>(<span key={idx}>{', '}{moim}</span>))}</div>
                        <div className="postedWhen">{getDayMinuteCounter(postedAt)}</div>
                    </div>
                </div>
                <PostContents contents={contents} />
            </div>
            {imgUrls.length === 0 ? null : <PostPics imgs={imgUrls} />}
            <div className='postFooter'>
                <LikeBtn
                    postId = {postId}
                    numOfLikes = {numOfLikes}
                    setNumOfLikes = {setNumOfLikes}
                    whoLikes = {whoLikes}
                    setWhoLikes = {setWhoLikes}
                />
                <CommentBtn />
            </div>
            <hr></hr>
            <div className='numOfLikes'>
                {numOfLikes===0? <span></span> : <span>{numOfLikes}명이 응원합니다 </span>}
            </div>
            <CommentsWindow comments={comments} numOfComments={comments.length}/>
            <WriteCommentContainer userProfileImage = {props.userInfo?.profile_image} postId = {postId} userId ={auth.currentUser.uid} addNewComment={addNewComment}/>
        </div>
    )
}



const Posts=({ userInfo }) =>{
    const [posts, setPosts] = useState([]);
    const [lastKey, setLastKey] = useState(0);
    const [nextPosts_loading, setNextPostsLoading] = useState(false);


    const initFetch = async () => {
        
        try {
            let posts = [];
            let lastKey = '';
            const q = query(
                collection(dbService, 'posts'),
                orderBy("postedAt", "desc"),
                limit(5)
            );
            const data = await getDocs(q);
            data.forEach((doc) => {
                posts.push({
                    ...doc.data(),
                    postId: doc.id
                });
                lastKey = doc.data().postedAt;
            })
            return { posts, lastKey };
        } catch (e) {
            console.log(e);
        }
    }
    const moreFetch = async (key) => {
        
        try {
            let posts = [];
            let lastKey = '';
            const q = query(
                collection(dbService, 'posts'),
                orderBy("postedAt", "desc"),
                startAfter(key),
                limit(1)
            );
            const data = await getDocs(q);
            data.forEach((doc) => {
                posts.push({
                    ...doc.data(),
                    postId: doc.id
                });
                lastKey = doc.data().postedAt;
            })
            return { posts, lastKey };
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        initFetch()
            .then((res) => {
                setPosts(res.posts);
                setLastKey(res.lastKey);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [])
    const fetchMorePosts = (key) => {
        console.log(key)
        if (key > 0) {
          setNextPostsLoading(true);
          moreFetch(key)
            .then((res) => {
              setLastKey(res.lastKey);
              // add new posts to old posts
              setPosts(posts.concat(res.posts));
              setNextPostsLoading(false);
            })
            .catch((err) => {
              console.log(err);
              setNextPostsLoading(false);
            });
        }
    };
    const allPosts = (
        <div>
          {posts.map((post) => {
            const date = new Date(post.postedAt*1000) // js timestamp = unix timestamp * 1000 밀리세컨드단위라 환산해야함
            
            return (
              <div key={post.postId}>
                <Post
                    contents = {post.contents}
                    postedAt = {date}
                    imgUrls = {post.imgUrls}
                    numOfLikes = {post.numOfLikes}
                    numOfComments = {post.numOfComments}
                    whoLikes = {post.whoLikes}
                    postId = {post.postId}
                    userId={post.userId}
                    userInfo={userInfo}
                />
                <div className='postFooter'>
                </div>
            
            
              </div>
              
            );
          })}
        </div>
      );
      useEffect(() => {
        const handleScroll = () => {
          const { scrollTop, offsetHeight } = document.documentElement
          if (window.innerHeight + scrollTop >= offsetHeight-1000) {
            setNextPostsLoading(true)
          }
        }
        setNextPostsLoading(true)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
      }, [])

      useEffect(() => {
        if (nextPosts_loading && lastKey>0) fetchMorePosts(lastKey)
        else if (!(lastKey>0)) setNextPostsLoading(false)
      }, [nextPosts_loading])

      return (
        <div>
            <div>{allPosts}</div>
            <div style={{ textAlign: "center" }}>
                {nextPosts_loading ? (
                    <p>Loading..</p>
                ) : lastKey > 0 ? (
                    null
                ) : (
                    <span>You are up to date!</span>
                )}
            </div>
        </div>
      );

    
}



function DndBox(props) {

    const [isDragging, setIsDragging] = useState(false);
    const [deleted, setDeleted] = useState(false);
    
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
      
      const StyledCpnt = styled.div`
        border: ${(props) => props.$isDragging ? '3px dotted #808080' : '3px solid #bbbbbb'}
      `
      
      const handleClick = (e) => {
        setDeleted(e)
      }

      useEffect(() => {
        const deleteImg = (e) => {
            let tmpImgs = contentImages;
            tmpImgs.splice(e.target.dataset.key, 1);
            setContentImages(tmpImgs);
            setDeleted(false)
        }
        if(deleted) deleteImg(deleted)
      }, [deleted])
    return(
        <div>
        {contentImages.length > 0 &&
        <div className="imgsAboveDnd">
            {contentImages.map((img, idx) => 
                <img src={img} alt='preview' className='previewImg' data-key={idx} onClick={handleClick}/>
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

function Write({ userInfo }) {

    const defaultValues = {
        contents: '',
        numOfComments: 0,
        numOfLikes: 0,
        postedAt: null,
        whoLikes: []
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
            
            addDoc(collection(dbService , "posts"), values)
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
            'postedAt': moment().unix(),
            'userId': uid,
            'imgUrls': imgUrls
        
        })
        
        

        setIsOpen(false)

        //const storage = getStorage();

        for(let i=0;i<contentImages.length;i++) {
            const fileRef = ref(storage, imgUrls[i]);
            uploadString(fileRef, contentImages[i], 'data_url');
        }

        setAsync(true)
        
    };


    return(
        <div className='homePost write'>
            <div className='postHeader'>
                <div className='profileImg'><img src={userInfo?.profile_image ||profile1Img} alt="profileImg"/></div>
                <div className='popModal' onClick={ () => setIsOpen(true) }>당신의 일상을 공유해주세요!</div>
            </div>
            {isOpen ?
                <div className='modalBG' onClick={ () => setIsOpen(false) }>
                <div onClick={ (e) => e.stopPropagation() }> {/** event 버블링 방지 */}
                    <div className='modalWrite'>
                        <div className='modalHeader'>
                            <div className='modalProfile'>
                                <div className='profileImg'><img src={userInfo?.profile_image ||profile1Img} alt="profileImg"/></div>
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

    const [users, setUsers] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => { //오른쪽 사이드 바 코드
        const fetchUsers = async () => {
            const usersCollectionRef = collection(dbService, 'users');
            const data = await getDocs(usersCollectionRef);
            // 모든 사용자 정보를 배열로 변환
            const allUsers = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            // 현재 로그인한 사용자의 uid 확인
            const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
            // 현재 로그인한 사용자를 제외한 사용자들 필터링
            const otherUsers = allUsers.filter(user => user.id !== currentUserId);
            // 랜덤하게 사용자 3명 선택
            const selectedUsers = otherUsers.sort(() => 0.5 - Math.random()).slice(0, 3);

            setUsers(selectedUsers); // 선택된 사용자들로 상태 업데이트
        };
    
        fetchUsers();
    }, []);

    useEffect(() => { // 유저 정보 코드
        const fetchUserInfo = async () => {
            if (auth.currentUser) {
                const userRef = doc(dbService, "users", auth.currentUser.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setUserInfo(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            }
        };

        fetchUserInfo();
    }, []);

    return(
        <div className='home'>
            <aside className="left-sidebar">
                <div className="background-img-container">
                    <img src={userInfo?.imgUrls || profile1Img} alt="background" className="background-img"/> 
                    {/*임시*/}
                </div>
                <img src={userInfo?.profile_image} alt="profile" className="profile-img1" />
                <div className="profile-info">
                    <h3>{userInfo?.nickname || 'undefined'}</h3>
                </div>
                <button>내 그룹</button>
            </aside>
            
            <div className='postsContainer'>
                <Write userInfo={userInfo}/>
                <Posts userInfo={userInfo}/>
            </div>

            <aside className="right-sidebar">
                <ul className="interestList">
                    {users.map(user => (
                        <li key={user.id} className="interestItem">
                            <img src={user.imgUrls || profile1Img} alt={user.nickname || 'User'}/>
                            <span className="interestTitle">{user.nickname || 'Unknown User'}</span>
                            <PlusBtn/>
                        </li>
                    ))}
                </ul>
            </aside>

        </div>
    )

}