import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import style from './ProjectDetailComment.module.css';
import { BsThreeDots } from "react-icons/bs";

const defaultImage = 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png';

const ProjectDetailComment = ({isMember, uid, projectId}) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [displayedCommentCount, setDisplayedCommentCount] = useState(5);
    const [showAllComments, setShowAllComments] = useState(false);
    const [editCommentId, setEditCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [currentUserData, setCurrentUserData] = useState({});

  // 0> Fetch User Data
    useEffect(() => {
        const fetchCurrentUserData = async () => {
        try {
            const currentUserDocRef = doc(dbService, 'users', uid);
            const currentUserDoc = await getDoc(currentUserDocRef);
    
            if (currentUserDoc.exists()) {
            const userData = currentUserDoc.data();
            
            // Check if profile_image exists, otherwise use defaultImage
            if (userData.profile_image) {
                setCurrentUserData(userData);
            } else {
                setCurrentUserData({ ...userData, profile_image: 'defaultImage' });
            }
            } else {
            console.log('User not found');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
        };
    
        fetchCurrentUserData();
    }, []);

  // 1> Fetch Comments from firebase
    // Firebase에서 댓글 불러오기 (Fetch)
    useEffect(() => {
      const fetchComments = async () => {
        try {
          const q = query(collection(dbService, "projectComments"), where("projectId", "==", projectId));
          const querySnapshot = await getDocs(q);
          const commentPromises = querySnapshot.docs.map(async (_doc) => {
            const commentData = _doc.data();
            const userDocRef = doc(dbService, "users", commentData.userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              commentData.userProfile = userDoc.data().profile_image;
              commentData.nickname = userDoc.data().nickname;
            }
            // postedAt 필드가 Timestamp 객체인 경우 toDate()를 사용하여 Date 객체로 변환
            if (commentData.postedAt && typeof commentData.postedAt.toDate === 'function') {
              commentData.postedAt = commentData.postedAt.toDate();
            }
            // lastEditedAt 필드가 Timestamp 객체인 경우 toDate()를 사용하여 Date 객체로 변환
            if (commentData.lastEditedAt && typeof commentData.lastEditedAt.toDate === 'function') {
              commentData.lastEditedAt = commentData.lastEditedAt.toDate();
            }
            return { id: _doc.id, ...commentData };
          });
          const comments = await Promise.all(commentPromises);
          // 클라이언트 측에서 시간 순으로 정렬
          comments.sort((a, b) => a.postedAt - b.postedAt);
          setMessages(comments);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };
    
      fetchComments();
    }, [projectId]);
    

  // 2> Submit Comments
    // 댓글 Input 함수
    const handleInputChange = (event) => {
      setNewMessage(event.target.value);
    };

    // 댓글 Submit 함수
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (newMessage.trim() !== '') {
        const currentTime = new Date();
        const commentData = {
          contents: newMessage,
          postedAt: currentTime,
          projectId: projectId,
          userId: uid
        };
        try {
          const projectCommentsRef = collection(dbService, "projectComments");
          const docRef = await addDoc(projectCommentsRef, commentData);
          const newCommentWithUserInfo = {
            ...commentData,
            id: docRef.id, 
            userProfile: currentUserData.profile_image,
            nickname: currentUserData.nickname,
            postedAt: currentTime
          };
          // 새 댓글을 기존 댓글 목록에 추가
          setMessages(oldMessages => [...oldMessages, newCommentWithUserInfo]);
          setNewMessage('');
        } catch (error) {
          console.error("Error adding comment:", error);
        }
      }
    };
  
  // 3> Showmore Comments
    // 댓글 더 불러오기 함수
    const handleShowMoreComments = () => {
      if (showAllComments) {
        setDisplayedCommentCount(5);
        setShowAllComments(false);
      } else if (displayedCommentCount + 5 < messages.length) {
        setDisplayedCommentCount(displayedCommentCount + 5);
      } else {
        setDisplayedCommentCount(messages.length);
        setShowAllComments(true);
      }
    };


  // 4> Edit and Delete Comments
    // Dropdown 토글 함수
    const toggleMenu = (commentId) => {
      setActiveMenuId((prev) => (prev === commentId ? null : commentId));
    };

    // Dropdown 토글 해제 함수
    useEffect(() => {
      // Dropdown 메뉴 외부 클릭을 감지하는 함수
      const handleClickOutside = (event) => {
        // 메뉴 아이콘이나 메뉴 자체가 클릭되지 않았을 때 메뉴를 닫음
        if (activeMenuId && !event.target.closest(`.${style.messageMenu}`)) {
          setActiveMenuId(null);
        }
      };
      // 전역 클릭 이벤트 리스너 추가
      document.addEventListener('click', handleClickOutside);
      // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [activeMenuId]); // activeMenuId가 바뀔 때마다 이벤트 리스너를 다시 설정    

    // 댓글 수정 함수
    const handleEditComment = (commentId, commentText) => {
        setEditCommentId(commentId);
        setEditCommentText(commentText);
    };

    // 댓글 수정 취소 함수
    const cancelEdit = () => {
        setEditCommentId(null);
        setEditCommentText('');
    };

    // 댓글 업데이트 함수
    const updateComment = async (commentId) => {
      if (editCommentText.trim() === '') return;

      try {
        const currentTime = new Date();
        const commentDocRef = doc(dbService, "projectComments", commentId);
        await updateDoc(commentDocRef, {
          contents: editCommentText,
          lastEditedAt: currentTime // 수정 시간을 현재 시간으로 설정
        });
        // 댓글 목록 업데이트
        setMessages(messages.map(message => 
            message.id === commentId ? { ...message, contents: editCommentText, lastEditedAt: currentTime } : message
        ));
        cancelEdit();
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    };

    // 댓글 삭제 함수
    const handleDeleteComment = async (commentId) => {
      if (window.confirm("댓글을 삭제하시겠습니까?")) {
        try {
          const commentDocRef = doc(dbService, "projectComments", commentId);
          await deleteDoc(commentDocRef);
          setMessages(messages => messages.filter(message => message.id !== commentId));
        } catch (error) {
          console.error("Error deleting comment:", error);
        }
      }
  };

    const displayedMessages = showAllComments ? messages : messages.slice(-displayedCommentCount);
    const remainedCommentCount = (messages.length - displayedCommentCount)
    
    return (
      <div>
        {isMember ? (
            <div className={style.projectComment}>
                <img src={currentUserData.profile_image} alt="프로필"/>
                <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="소모임 활동은 어땠나요? 후기를 남겨주세요!"
                />
                <button type="submit">입력</button>
                </form>
            </div>
        ) : null}
        <div className={style.profileCommentToggle}>
          {messages.length > 5 && (
            <button onClick={handleShowMoreComments}>
              {displayedCommentCount >= messages.length ? '접기' : remainedCommentCount >= 5 ? '5개 더 보기' : remainedCommentCount + '개 더 보기' }
            </button>
          )}
        </div>
        <div>
          {displayedMessages.map((message, index) => (
            <div key={index} className={style.message}>
              <a href={`/profiledetail?uid=${message.userId}`}>
                <img src={message.userProfile} alt="프로필"/>
              </a>
            
              {editCommentId === message.id ? (
                <div className={style.messageEditBox}>
                    <input
                    type="text"
                    value={editCommentText}
                    onChange={(e) => setEditCommentText(e.target.value)}
                    />
                    <button onClick={() => updateComment(message.id)}>저장</button>
                    <button onClick={cancelEdit}>취소</button>
                </div>
                ) : (
                <div className={style.messageBox}>
                    <div className={style.messageHeader}>
                    <a href={`/profiledetail?uid=${message.userId}`}>
                        <h3>{message.nickname}</h3>
                    </a>
                    <p className={style.time} data-tooltip={'작성 - ' + message.postedAt.toLocaleString()}>
                      {formatDistanceToNow(message.postedAt, { addSuffix: true, locale: ko })}
                    </p>
                    <p className={style.time} data-tooltip={message.lastEditedAt && '수정 - ' + message.lastEditedAt.toLocaleString()}>
                      {message.lastEditedAt && `(수정됨)`} {/* 수정 여부 표시 */}
                    </p>
                    <div className={style.messageMenu}>
                        {uid === message.userId && (
                        <div className={style.menuIcon} onClick={() => toggleMenu(message.id)}>
                        <BsThreeDots size={18} />
                        </div>
                        )}
                        {activeMenuId === message.id && (
                        <div className={style.menuOptions}>
                            <div className={style.menuOption} onClick={() => handleEditComment(message.id, message.contents)}>수정</div>
                            <div className={style.menuOption} onClick={() => handleDeleteComment(message.id)}>삭제</div>
                        </div>
                        )}
                    </div>
                    </div>
                    <p className={style.text}>{message.contents}</p>
                </div>
                )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
export { ProjectDetailComment };