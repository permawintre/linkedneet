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
import defaultProfileImg from '../images/default_profile_image.jpg'

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
    const [calendar, setCalendar] = useState({
        month: "January 2022",
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        // ... 달력의 날짜 데이터 등 ...
    });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const generateCalendarDays = (date) => {
        const startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        const daysArray = [];
        for (let i = 0; i < startDay; i++) {
            // 이전 달의 날짜를 추가할 수 있습니다.
            daysArray.push(<td key={`prev${i}`} className="calendar-day other-month"></td>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push(
                <td key={i} className="calendar-day">
                    {i}
                    {/* 여기에 출석 상태를 나타내는 로직을 추가할 수 있습니다. */}
                </td>
            );
        }

        // 총 칸수를 35(5주)나 42(6주)로 맞추기 위해 다음 달의 날짜를 추가할 수 있습니다.
        const totalSlots = startDay + daysInMonth;
        const nextMonthDays = totalSlots > 35 ? 42 - totalSlots : 35 - totalSlots;
        for (let i = 1; i <= nextMonthDays; i++) {
            // 다음 달의 날짜를 추가할 수 있습니다.
            daysArray.push(<td key={`next${i}`} className="calendar-day other-month"></td>);
        }

        return daysArray;
    };
    const calendarDays = generateCalendarDays(currentMonth);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const getSelectedDateInfo = () => {
        // API 호출 또는 상태에서 정보를 가져오는 로직
        // 예시로 하드코딩된 데이터를 사용합니다.
        return {
            events: ["팀 미팅", "프로젝트 마감일"],
            notes: "오후 3시부터 원격 근무",
            holidays: "신정",
        };
    };
    const selectedDateInfo = getSelectedDateInfo();



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
                <div className="calendar">
                    <header className="calendar-header">
                        <span>{calendar.month}</span>
                        <div className="navigation">
                            <button>&lt;</button>
                            <button>&gt;</button>
                        </div>
                    </header>
                    <table className="calendar-days">
                        <thead>
                            <tr>
                                {calendar.days.map(day => (
                                    <th key={day}>{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {calendarDays}
                        </tbody>
                    </table>
                    <div className="calendar-info">
                        <h3>{selectedDate.toLocaleDateString()}의 일정</h3>
                        {selectedDateInfo.holidays && <p>공휴일: {selectedDateInfo.holidays}</p>}
                        <ul>
                            {selectedDateInfo.events.map((event, index) => (
                                <li key={index}>{event}</li>
                            ))}
                        </ul>
                        <p>노트: {selectedDateInfo.notes}</p>
                    </div>
                </div>
            </aside>
        </div>
    )
}