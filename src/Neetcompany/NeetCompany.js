import { ShowPosts } from "../Home/Home"
import "./NeetCompany.css"
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
import { Link, useNavigate } from "react-router-dom"
import { dbService , auth } from '../firebase.js'

export const NeetCompany = () => {
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

    return(
        <div className="neetCompanyBody">
            <aside className="left-sidebar-neet">
                <img src="image_url_here" alt="Landscape" className="card-image"/>
                <div className="card-content">
                <div className="card-title">다른 기사</div>
                <div className="card-number">161</div>
                <div className="card-date">2023.10.03. 37일전</div>
                <div className="card-status">
                    <span className="status-dot"></span>
                    <span className="status-text">현재 출근한 멤버</span>
                </div>
                <div className="card-members">21명</div>
                </div>
            </aside>

            <div className="homePostsMarginControl">
                <ShowPosts currentLocation={'neetCompany'}/>
            </div>
            <aside className="right-sidebar-neet">
                <h2>새로운 사람을 알아가보세요!</h2>
                <ul className="interestList">
                    {users.map(user => (
                        <li key={user.id} className="interestItem">
                            <Link to={`/profiledetail?uid=${user.id}`}>
                                <img src={user.imgUrls} alt={user.nickname || 'User'}/>
                            </Link>
                            <span className="interestTitle">{user.nickname || 'Unknown User'}</span>
                            <i className="fa fa-arrow-right" aria-hidden="true"></i>
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    )
}