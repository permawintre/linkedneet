import React from "react"
import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn, PlusBtn, CommentsWindow, WriteCommentContainer } from './supportFunctions'
import './Home.css'
import { Link, useNavigate } from "react-router-dom"
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
    where,
    updateDoc,
    deleteDoc
} from "firebase/firestore"
import { useEffect, useState, useRef } from 'react'
import close from '../images/close.png'
import moment from 'moment'
import styled from 'styled-components'
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid'; // 랜덤 식별자를 생성해주는 라이브러리
import { storage } from '../firebase.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';


import profile1Img from '../images/profile1Img.jpg'

const userName = "홍길동"
const companyClass = 14
const moims = ['모임 a', '모임 b', '모임 c']


function Post(props) {
    //console.log('사진여러장로딩문제', props.imgUrls)
    const userId = props.userId;
    const postId = props.postId
    const postedAt = props.postedAt
    const [comments, setComments] = useState([]);
    const [numOfLikes, setNumOfLikes] = useState(props.numOfLikes);
    const [whoLikes, setWhoLikes] = useState(props.whoLikes);
    const [imgUrls, setImgUrls] = useState([])
    const contents = props.contents
    const [postUserInfo, setPostUserInfo] = useState({ profileImage: '', nickname: '' });
    const postWhere = props.postWhere;

    const addNewComment = (newComment) => {
        setComments(prevComments => [...prevComments, newComment]);
    };
    const [showDropdown, setShowDropdown] = useState(false);
    const [isWriteOpen, setIsWriteOpen] = useState(false);
    const navigate = useNavigate();
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
        //console.log(props.imgUrls.length)
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

    const postWriteEditBtnClick = ()=> {
        setShowDropdown(!showDropdown);
        //console.log('아이콘 클릭!');
        // 추가적인 핸들러 로직
    }

    const deleteComments = async () => {

        const q = query(collection(dbService, "comments"), where("postId", "==", postId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach( async (document) => {
            // doc.data() is never undefined for query doc snapshots
            await deleteDoc(doc(dbService, 'comments', document.id));
            console.log('commentsid: ', document.id)
        });
    }

    const handleDelete = async () => {
        //console.log('삭제 클릭');
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (confirmDelete) {
            // Firebase에서 게시물 삭제
            try {
                await deleteDoc(doc(dbService, "posts", postId));
                await deleteComments();
                // UI 업데이트 로직 (예: 상태 업데이트 또는 부모 컴포넌트에 알림)
            } catch (error) {
                console.error("Error removing document: ", error);
            }
            // storage deletion

            for(let i=0;i<=props.imgUrls.length;i++){
                const Ref = ref(storage, `/${props.imgUrls[i]}`);
                try {
                    await deleteObject(Ref)
                } catch (error) {
                    console.log("error in file deletion", error)
                }
            }
            navigate(0);
        }
      };
      
      const handleEdit = () => {
        //console.log('수정 클릭');
        setIsWriteOpen(true);
        // 수정 관련 로직
      };
    
    const dropDownRef = useRef(null);
    useEffect(() => {
        const handleClick = (e) => {
            if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, [dropDownRef]);

    return (
        <div className="homePost">
            <div className='paddingDiv'>
                <div className="postHeader">
                    <Link to={`/profiledetail?uid=${props.userId}`}>
                        <div className='profileImg'><img src={postUserInfo.profileImage || profile1Img} alt="profileImg"/></div>
                    </Link>
                    <div className='postInfo'>
                        <Link to={`/profiledetail?uid=${props.userId}`}>
                            <div className="userName">{postUserInfo.nickname || userName}<div className="postWhere">▸{postWhere}</div></div>
                            <div className='inGroup'>
                                    {postUserInfo.generation+'기' || companyClass+'기'}{moims.map((moim, idx)=>(<span key={idx}>{', '}{moim}</span>))}
                            </div>
                            <div className="postedWhen">{getDayMinuteCounter(postedAt)}</div>
                        </Link>
                    </div>
                    {auth.currentUser.uid === userId && (
                        <div className="menuIcon" onClick={postWriteEditBtnClick} ref={dropDownRef}>
                            <FontAwesomeIcon icon={faEllipsisV} className="dropDownBtn"/>
                            {showDropdown && (
                                <div className="dropdownMenu">
                                    <div className="menuItem" onClick={handleDelete}>삭제</div>
                                    <div className="menuItem" onClick={handleEdit}>수정</div>
                                </div>
                            )}
                        </div>
                    )}
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
            <Write
                isOpen={isWriteOpen}
                setIsOpen={setIsWriteOpen}
                existingPost={{
                    contents: contents,
                    imgIds: props.imgUrls,
                    postId: postId,
                    postWhere: postWhere,
                    whoLikes: whoLikes,
                    numOfLikes: numOfLikes,
                }}
                showHeader={false}
            />
            
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
        //console.log(key)
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
                    userId= {post.userId}
                    postWhere = {post.postWhere}
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
            <div className="addmargin" style={{ textAlign: "center" }}>
                {nextPosts_loading ? (
                    <p>Loading..</p>
                ) : (
                    <span>You are up to date!</span>
                )}
            </div>
        </div>
      );

    
}


const StyledCpnt = styled.div`
    border: ${(props) => props.$isDragging ? '3px dotted #808080' : '3px solid #bbbbbb'}
`
function DndBox(props) {

    const [isDragging, setIsDragging] = useState(false);
    const [deleted, setDeleted] = useState(false);
    
    // 부모 컴포넌트에서 내려준 contentImage state
    const contentImages = props.contentImages;
    const setContentImages = props.setContentImages;
    const imgIds = props.imgIds;
    const [imgUrls, setImgUrls] = useState(false)
    const isOpen = props.isOpen;
    const setImgDeleted = props.setImgDeleted;

    const readImage = (image) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = (e) => {
            
            setContentImages(contentImages => [...contentImages, String(e.target?.result)]);
        };
        
    };




    const loadImage = async () => {

        try {
            const urls = [];
            for (let i = 0; i < imgIds.length; i++) {
                const downloadUrl = await getDownloadURL(ref(storage, imgIds[i]));
                urls.push(downloadUrl);
            }
            setImgUrls(urls);
          } catch (error) {
            console.error('이미지를 불러오는 도중 에러 발생:', error);
          }

    }


    useEffect(() => {
        loadImage()
    }, [isOpen, imgIds])
    
    



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
      
      
      
    const handleClick = (e) => {
        setDeleted(e)
    }

    useEffect(() => {
        setContentImages([])
        setImgDeleted([])
    }, [isOpen])

    useEffect(() => {
        const deleteImg = (e) => {
            if(e.target.dataset.value === 'added'){
                let tmpImgs = contentImages;
                tmpImgs.splice(e.target.dataset.key, 1);
                setContentImages(tmpImgs);
                setDeleted(false)
                //console.log('추가데이터', e.target.dataset.key)
            }
            else{
                let tmpImgs = imgUrls;
                tmpImgs.splice(e.target.dataset.key, 1);
                setImgUrls(tmpImgs);
                setDeleted(false);
                setImgDeleted(prev => ([
                    ...prev,
                    e.target.dataset.value
                ]))
                //console.log('기존데이터', e.target.dataset.key)
            }
        }
        if(deleted) deleteImg(deleted)
    }, [deleted])

    return(
        <div>
        <div className="imgsAboveDnd">
            {imgUrls && imgUrls.map((img, idx) =>
                <img src={img} alt='preview' className='previewImg' key={idx} data-key={idx} data-value={imgIds[idx]} onClick={handleClick}/>
            )}
            {contentImages.map((img, idx) => 
                <img src={img} alt='preview' className='previewImg' key={idx} data-key={idx} data-value={'added'} onClick={handleClick}/>
            )}
        </div>
        
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

function Write({ userInfo, isOpen, setIsOpen, existingPost,showHeader }) {

    const defaultValues = {
        contents: '',
        numOfComments: 0,
        numOfLikes: 0,
        postedAt: null,
        whoLikes: [],
        postWhere: 'profile',
    }
    let [values, setValues] = useState(defaultValues)
    let [async, setAsync] = useState(false)
    let [contentImages, setContentImages] = useState([])
    let [uid, setUid] = useState("")
    let [imgIds, setImgIds] = useState(false)
    let [imgDeleted, setImgDeleted] = useState([])

    useEffect(() => {
        if (existingPost) {
            setValues({
                contents: existingPost.contents, 
                imgUrls: existingPost.imgUrls,  
                postId: existingPost.postId,
                postWhere: existingPost.postWhere,
                whoLikes: existingPost.whoLikes,
                numOfLikes: existingPost.numOfLikes,
            });
            setImgIds(existingPost.imgIds)
            //console.log('imgIds: ', existingPost.imgIds)
        }
    }, [isOpen]);

    let [selectBar, setSelectBar] = useState(false)




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
    }, [async])

    const handleChange = (e) => {
        setValues({
          ...values,
          [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault();
    
        const imgUrls = contentImages.map(() => uuidv4());
        const modifiedImgs = (origins, dels, adds) => {
            if(origins.length>0){
                const filtered = origins.filter((value, index, arr) => {
                    return !dels.includes(value)
                })
                return filtered.concat(adds)
            }
            else{
                return imgUrls
            }
            
        }
        const postData = {
            ...values,
            'postedAt': moment().unix(),
            'userId': uid,
            'imgUrls': modifiedImgs(imgIds, imgDeleted, imgUrls),
        };
    
        const handleUploadImages = async () => {
            for (let i = 0; i < contentImages.length; i++) {
                const fileRef = ref(storage, imgUrls[i]);
                await uploadString(fileRef, contentImages[i], 'data_url');
            }
        };
        const handleDeleteImgs = async () => {

            for(let i=0;i<=imgDeleted.length;i++){
                const Ref = ref(storage, `/${imgDeleted[i]}`);
                try {
                    await deleteObject(Ref)
                } catch (error) {
                    console.log("error in file deletion", error)
                }
            }
        }

    
        if (existingPost.postId) {
            const postRef = doc(dbService, "posts", existingPost.postId);
            updateDoc(postRef, postData)
                .then(() => {
                    handleUploadImages()
                    handleDeleteImgs()
                    .then(() => {
                        navigate(0)
                    })
                    .catch(error => {
                        console.log("Img Upload Error: ", error)
                    })
                })
                .catch(error => {
                    console.error("Error updating document: ", error);
                });
        } else {
            addDoc(collection(dbService, "posts"), postData)
                .then(() => {
                    handleUploadImages()
                    .then(() => {
                        navigate(0)
                    })
                    .catch(error => {
                        console.log("Img Upload Error: ", error)
                    })
                })
                .catch(error => {
                    console.error("Error adding document: ", error);
                });

        }
    
        setIsOpen(false);
        setValues(defaultValues);
        setContentImages([]);
    };
    


    return(
        <div className='homePost write'>
            {showHeader && (
                <div className='postHeader'>

                <div className='profileImg'><img src={userInfo?.profile_image || profile1Img} alt="profileImg"/></div>
                <div className='popModal' onClick={ () => setIsOpen(true) }>당신의 일상을 공유해주세요!</div>
                </div>
            )}
            {isOpen && (
                <div className='modalBG' onClick={ () => setIsOpen(false) }>
                <div onClick={ (e) => e.stopPropagation() }> {/** event 버블링 방지 */}
                    <div className='modalWrite'>
                        <div className='modalHeader'>
                            <div className='modalProfile' onClick={ () => setSelectBar(!selectBar) }>
                                <div className='profileImg'><img src={userInfo?.profile_image || profile1Img} alt="profileImg"/></div>
                                <div>
                                    <div className="userName">{userName}</div>
                                    <div className="postWhere">게시 위치 ▸{values.postWhere}</div>
                                </div>
                            </div>
                            {selectBar ? 
                                <div className="selectBar">
                                    <div onClick={ () => {setValues((prev) =>
                                        ({...prev,
                                        'postWhere': 'profile',})
                                    );
                                    setSelectBar(!selectBar)
                                    }}>profile</div>
                                    <div onClick={ () => {setValues((prev) =>
                                        ({...prev,
                                        'postWhere': 'neetCompany',})
                                    );
                                    setSelectBar(!selectBar)
                                    }}>neetCompany</div>
                                    <div onClick={ () => {setValues((prev) =>
                                        ({...prev,
                                        'postWhere': 'project',})
                                    );
                                    setSelectBar(!selectBar)
                                    }}>project</div>{/*가입한 그룹이랑 연동하는것 구현필요*/}
                                </div>
                                :
                                null
                            }
                            <img src={close} alt='x' className='close' onClick={ () => setIsOpen(false) }/>
                        </div>
                        
                        <form onSubmit={handleSubmit} className='modalForm'>
                            <textarea type='text' name='contents' value={values.contents} onChange={handleChange} placeholder='나누고 싶은 생각이 있으세요?'/>
                            <DndBox
                                contentImages={ contentImages }
                                setContentImages={ setContentImages }
                                imgIds={ imgIds }
                                isOpen={ isOpen }
                                setImgDeleted={ setImgDeleted }
                            />
                            <button type='submit'>게시</button>
                        </form>
                    </div>
                </div>
                </div>
            )

            
            }
            
        </div>
    )
}



export const Home = () => {

    const [users, setUsers] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [isWriteOpen, setIsWriteOpen] = useState(false);

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
            <Link to={`/profiledetail?uid=${auth.currentUser.uid}`}>
                <aside className="left-sidebar">
                    <div className="background-img-container">
                        <img src={userInfo?.imgUrls || profile1Img} alt="background" className="homeProfile-background-img"/> 
                    </div>
                    <img src={userInfo?.profile_image} alt="profile" className="profile-img1" />
                    <div className="profile-info">
                        <h3>{userInfo?.nickname || 'undefined'}</h3>
                    </div>
                    <button>내 프로필</button>
                </aside>
            </Link>
            
            <div className='postsContainer'>
                <Write isOpen={isWriteOpen} setIsOpen={setIsWriteOpen} existingPost={false} showHeader={true}/>
                <Posts userInfo={userInfo}/>
            </div>

            <aside className="right-sidebar">
                <ul className="interestList">
                    {users.map(user => (
                        <li key={user.id} className="interestItem">
                            <Link to={`/profiledetail?uid=${user.id}`}>
                                <img src={user.imgUrls || profile1Img} alt={user.nickname || 'User'}/>
                            </Link>
                            <span className="interestTitle">{user.nickname || 'Unknown User'}</span>
                            <PlusBtn/>
                        </li>
                    ))}
                </ul>
            </aside>

        </div>
    )

}