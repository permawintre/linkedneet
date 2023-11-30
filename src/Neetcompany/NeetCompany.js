import React from "react";
import { ShowPosts } from "../Home/Home";
import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn, PlusBtn, CommentsWindow, WriteCommentContainer, addNewComment, LoadingEffect } from '../Home/supportFunctions'
import "./NeetCompany.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid';
import close from '../images/close.png';
import { Link, useParams, useNavigate } from "react-router-dom"
import moment from 'moment';
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
import { storage } from '../firebase.js';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { useEffect, useState, useRef } from 'react'
import { dbService , auth } from '../firebase.js'
import defaultProfileImg from '../images/default_profile_image.jpg'

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
    const modified = props.modified;

    const [loading, setLoading] = useState(false)

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
        setImgUrls([]);
        
        const fetchImageUrls = async () => {
            for (let i = 0; i < props.imgUrls.length; i++) {
            try {
                const downloadUrl = await getDownloadURL(ref(storage, props.imgUrls[i]));
                setImgUrls((prev) => [...prev, downloadUrl]);
            } catch (error) {
                console.error(`Error fetching URL for image ${i + 1}:`, error);
                // Handle error as needed
            }
            }
        };
        
        fetchImageUrls();
    }, [props.imgUrls]);
        

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
            setLoading(true)
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
                        <div className='profileImg'><img src={postUserInfo.profileImage || defaultProfileImg} alt="profileImg"/></div>
                    </Link>
                    <div className='postInfo'>
                        <Link to={`/profiledetail?uid=${props.userId}`}>
                            <div className="userName">{postUserInfo.nickname || "undefined"}
                            </div>
                            <div className='inGroup'>
                                    {postUserInfo.generation+'기' || '?기'}{moims.map((moim, idx)=>(<span key={idx}>{', '}{moim}</span>))}
                            </div>
                            <div className="postedWhen">{getDayMinuteCounter(postedAt)}{modified ? '·수정됨' : null}</div>
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
                <div className='numOfLikes'>
                {numOfLikes===0? <span>{postUserInfo.nickname}님에게 응원의 표시를 남기세요</span> : <span>{numOfLikes}명이 응원합니다 </span>}
                </div>


                {/*<CommentBtn />*/}
            </div>
{/*
            <hr></hr>
            <div className='numOfLikes'>
                {numOfLikes===0? <span></span> : <span>{numOfLikes}명이 응원합니다 </span>}
            </div>
*/}
            <CommentsWindow comments={comments} numOfComments={comments.length}/>
            <WriteCommentContainer userProfileImage = {props.userInfo?.profile_image} postId = {postId} userId ={auth.currentUser.uid} addNewComment={addNewComment} />
            <Write
                isOpen={isWriteOpen}
                setIsOpen={setIsWriteOpen}
                existingPost={{
                    postedAt: postedAt,
                    contents: contents,
                    imgIds: props.imgUrls,
                    postId: postId,
                    postWhere: postWhere,
                    whoLikes: whoLikes,
                    numOfLikes: numOfLikes,
                }}
                showHeader={false}
                currentLocation={'project'}
            />
            
            {loading ? <LoadingEffect/> : null}
        </div>

    )
}



const Posts=({ userInfo, currentLocation, generation }) =>{
    const [posts, setPosts] = useState([]);
    const [lastKey, setLastKey] = useState(0);
    const [nextPosts_loading, setNextPostsLoading] = useState(false);

    const setQuery = () => {
        if(currentLocation === 'home'){
            return query(
                collection(dbService, 'posts'),
                orderBy("postedAt", "desc"),
                limit(5)
            )
        }
        if(currentLocation === 'neetCompany'){
            return query(
                collection(dbService, 'posts'),
                where("postWhere", "==", 'neetCompany'),
                orderBy("postedAt", "desc"),
                limit(5)
            )
        }
        if(currentLocation === 'profile'){
            return query(
                collection(dbService, 'posts'),
                where("postWhere", "==", "profile"),
                orderBy("postedAt", "desc"),
                limit(5)
            )
        }
        
    }

    const setQueryMore = (key) => {

        
        if(currentLocation === 'home'){
            return query(
                collection(dbService, 'posts'),
                orderBy("postedAt", "desc"),
                startAfter(key),
                limit(1)
            );
        }
        if(currentLocation === 'neetCompany'){
            return query(
                collection(dbService, 'posts'),
                where("postWhere", "==", "neetCompany"),
                orderBy("postedAt", "desc"),
                where("neetGeneration", "==", generation),
                startAfter(key),
                limit(1)
            )
        }
        if(currentLocation === 'profile'){
            return query(
                collection(dbService, 'posts'),
                where("postWhere", "==", "profile"),
                orderBy("postedAt", "desc"),
                startAfter(key),
                limit(1)
            )
        }
        
    }

    const initFetch = async () => {
        
        try {
            let posts = [];
            let lastKey = '';
            const q = setQuery();
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
            const q = setQueryMore(key);
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
                    modified = {post.modified}
                    neetGeneration = {post.neetGeneration}
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
function  DndBox(props) {

    const [isDragging, setIsDragging] = useState(false);
    const [deleted, setDeleted] = useState(false);
    
    // 부모 컴포넌트에서 내려준 contentImage state
    const contentImages = props.contentImages;
    const setContentImages = props.setContentImages;
    const imgIds = props.imgIds;
    const setImgIds = props.setImgIds;
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
                //console.log('추가데이터', e.target.dataset.key, e.target.dataset.value)
            }
            else{
                let tmpImgs = imgUrls;
                tmpImgs.splice(e.target.dataset.key, 1);
                setImgUrls(tmpImgs);
                setDeleted(false);
                const deleteImgId = (del) => {
                    const filtered = imgIds.filter((value, index, arr) => {
                        return del !== value
                    })
                    return filtered
                }
                setImgIds(deleteImgId(e.target.dataset.value))
                setImgDeleted(prev => [...prev, e.target.dataset.value])
                //console.log('기존데이터', e.target.dataset.key, e.target.dataset.value)
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

function Write({ isOpen, setIsOpen, existingPost, showHeader, currentLocation, selectedProjectId }) {

    const defaultPostWhere = () => {

        if(currentLocation === 'home' || currentLocation === 'profile' ) return 'profile';
        if(currentLocation === 'neetCompany') return 'neetCompany';
        if(currentLocation === 'project') return 'project';
    }
    const writeTxt = () => {

        if(currentLocation === 'home' || currentLocation === 'profile' ) return '당신의 일상을 공유해주세요!';
        if(currentLocation === 'neetCompany') return '오늘 진행한 업무를 공유해주세요!';
        if(currentLocation === 'project') return '활동을 팀원들과 공유해보세요!';
    }
    
    const modalTxt = () => {

        if(currentLocation === 'home' || currentLocation === 'profile' ) return '나누고 싶은 생각이 있으세요?';
        if(currentLocation === 'neetCompany') return '오늘도 열심히 일한 당신! 수고했어요.';
        if(currentLocation === 'project') return '팀원들과 어떤 내용을 공유할까요?';
    }
    
    const defaultValues = {
        contents: '',
        numOfComments: 0,
        numOfLikes: 0,
        postedAt: null,
        whoLikes: [],
        postWhere: defaultPostWhere(),
        modified: false,
    }
    let [values, setValues] = useState(defaultValues)
    let [async, setAsync] = useState(false)
    let [contentImages, setContentImages] = useState([])
    let [uid, setUid] = useState("")
    let [imgIds, setImgIds] = useState(false)
    let [imgDeleted, setImgDeleted] = useState([])

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (existingPost) {
            setValues({
                contents: existingPost.contents, 
                imgUrls: existingPost.imgUrls,  
                postId: existingPost.postId,
                postWhere: existingPost.postWhere,
                whoLikes: existingPost.whoLikes,
                numOfLikes: existingPost.numOfLikes,
                modified: true,
            });
            setImgIds(existingPost.imgIds)
            //console.log('imgIds: ', existingPost.imgIds)
        }
    }, [isOpen]);

    let [selectBar, setSelectBar] = useState(false)

    const [userInfo, setUserInfo] = useState(null);
    useEffect(() => { // 유저 정보 코드
        const fetchUserInfo = async () => {
            if (auth.currentUser) {
                setUid(auth.currentUser.uid)
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
        setLoading(true)
        e.preventDefault();
    
        const imgUrls = contentImages.map(() => uuidv4());
        console.log('handleSubmit에서 확인', imgIds, imgDeleted)
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
            'postedAt': existingPost ? existingPost.postedAt/1000 : moment().unix(),
            'userId': uid,
            'imgUrls': modifiedImgs(imgIds, imgDeleted, imgUrls),
            'neetGeneration': values.neetGeneration,
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
                    handleDeleteImgs().then(() => 
                        handleUploadImages()
                        .then(() => {
                            navigate(0)
                        })
                        .catch(error => {
                            console.log("Img Upload Error: ", error)
                        })
                    )
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
                <div className='postHeader' onClick={ () => setIsOpen(true) }>
                <div className='profileImg'><img src={userInfo?.profile_image || defaultProfileImg} alt="profileImg"/></div>
                <div className='popModal'>{writeTxt()}</div>
                </div>
            )}
            {isOpen && (
                <div className='modalBG' onClick={ () => setIsOpen(false) }>
                    <div className='modalWrite' onClick={ (e) => e.stopPropagation() }>
                        <div className='modalHeader'>
                            <div className='modalProfile' onClick={ () => setSelectBar(!selectBar) }>
                                <div className='profileImg'><img src={userInfo?.profile_image || defaultProfileImg} alt="profileImg"/></div>
                                <div>
                                    <div className="userName">{userInfo?.nickname || 'undefined'}</div>
                                    <div className="postWhere">게시 위치 ▸{values.postWhere}</div>
                                </div>
                            </div>
                            <img src={close} alt='x' className='close' onClick={ () => setIsOpen(false) }/>
                        </div>
                        
                        <form onSubmit={handleSubmit} className='modalForm'>
                            <textarea type='text' name='contents' value={values.contents} onChange={handleChange} placeholder={modalTxt()}/>
                            <DndBox
                                contentImages={ contentImages }
                                setContentImages={ setContentImages }
                                imgIds={ imgIds }
                                setImgIds = {setImgIds}
                                isOpen={ isOpen }
                                setImgDeleted={ setImgDeleted }
                            />
                            <button type='submit'>게시</button>
                        </form>
                    </div>
                </div>
            )

            
            }
            
            {loading ? <LoadingEffect/> : null}
        </div>
    )
}

export const NeetCompany = () => {
    const [users, setUsers] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [generation, setGeneration] = useState(null);
    const [showGenerations, setShowGenerations] = useState(false);
    const toggleGenerations = () => setShowGenerations(!showGenerations);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (auth.currentUser) {
                const userRef = doc(dbService, "users", auth.currentUser.uid);
                try {
                    const docSnap = await getDoc(userRef);
    
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setGeneration(userData.generation); // 세대 정보를 상태에 설정
                    } else {
                        console.log("사용자 정보를 찾을 수 없음");
                    }
                } catch (error) {
                    console.error("사용자 정보 가져오기 실패:", error);
                }
            }
        };
    
        fetchUserInfo();
    }, []);
    const GenerationList = () => (
        <div className="generation-list">
            {Array.from({ length: 16 }, (_, i) => `${i + 1}`).map(generationNumber => (
                <Link key={generationNumber} to={`/neetCompany/${generationNumber}`}>
                    <div>{generationNumber}기</div>
                </Link>
            ))}
        </div>
    );
    const handleSelectGeneration = (selectedGeneration) => {
    const generationNumber = selectedGeneration.match(/\d+/)[0]; // 숫자 부분 추출
    setGeneration(generationNumber); // 상태 업데이트
    setShowGenerations(false); // 기수 선택 후 메뉴 닫기
    console.log(`Selected: ${generationNumber}`);
    navigate(`/generation/${selectedGeneration}`);
    };
      
    
    
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const onChange = (newDate) => {
        setSelectedDate(newDate);
      };
    const getSelectedDateInfo = () => {
        return {
            events: ["팀 미팅", "프로젝트 마감일"],
            notes: "오후 3시부터 원격 근무",
            holidays: selectedDate.getDay() === 0 ? "신정" : null,
        };
    };

    const selectedDateInfo = getSelectedDateInfo();
    const attendanceDates = [
        new Date(2023, 10, 10), 
        new Date(2023, 10, 15), 
        // 추가 날짜들
      ];
    const tileClassName = ({ date, view }) => {
    // 월 뷰에서만 클래스 적용
    if (view === 'month') {
        let isAttendanceDate = attendanceDates.some(attendanceDate => 
        date.getDate() === attendanceDate.getDate() &&
        date.getMonth() === attendanceDate.getMonth() &&
        date.getFullYear() === attendanceDate.getFullYear()
        );
        console.log("타일 날짜:", date.toDateString());
        attendanceDates.forEach(d => console.log("특별 날짜:", d.toDateString(), "비교 결과:", isAttendanceDate));

        if (isAttendanceDate) {
        return 'attendance-date'; // 특별한 날짜에 대한 클래스 이름
        }
    }
    };

    const ShowPosts = (props) => {

        const [userInfo, setUserInfo] = useState(null);
        const [isWriteOpen, setIsWriteOpen] = useState(false);
        const { generationNumber } = useParams();
        console.log(generationNumber,"generationnum")
    
        const currentLocation = props.currentLocation;
        const projectId = props.id;
        const isMember = props.isMember;
    
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
    
            <div className='postsContainer'>
                { isMember ? (
                <Write
                    isOpen={isWriteOpen}
                    setIsOpen={setIsWriteOpen}
                    existingPost={false}
                    showHeader={true}
                    currentLocation={currentLocation}
                    selectedProjectId={projectId}
                />
                ) : (null)}
                <Posts userInfo={userInfo} currentLocation={currentLocation} generation={generation}/>
            </div>
        )
    }



    return(
        <div className="neetCompanyBody">
            <div className="left-sidebar-container">
                <aside className="left-sidebar-neet">
                    <img src="image_url_here" alt="Landscape" className="card-image"/>
                    <div className="card-content">
                    <div className="change-generation" onClick={toggleGenerations}>◂다른 기수</div>
                    <div className="generation-number">{generation}기</div>
                    <div className="neet-status">
                        <span className="neet-status-dot"></span>
                        <span className="neet-status-text">현재 출근한 멤버</span>
                    </div>
                    <div className="card-members">21명</div>
                    </div>
                </aside>
                
                {showGenerations && (
                    <GenerationList onSelect={handleSelectGeneration} />
                )}
            </div>


            <div className="homePostsMarginControl">
            <ShowPosts currentLocation={'neetCompany'} neetGeneration={generation} />
            </div>
            <aside className="right-sidebar-neet">
                <div className="calendar-neet">
                    <Calendar
                        onChange={onChange}
                        value={selectedDate}
                        tileClassName={tileClassName}
                        tileContent={({ date, view }) => view === 'month' && <span style={{ color: 'black' }}>{date.getDate()}</span>}
                    />
                </div>
                <div className="calendar-info">
                    <h3>{selectedDate.getDate()}일의 일정</h3>
                    {selectedDateInfo.holidays && <p>공휴일: {selectedDateInfo.holidays}</p>}
                    <ul>
                        {selectedDateInfo.events.map((event, index) => (
                            <li key={index}>{event}</li>
                        ))}
                    </ul>
                    <p>노트: {selectedDateInfo.notes}</p>
                </div>
            </aside>
        </div>
    )
}