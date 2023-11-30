import React from "react";
import { getDayMinuteCounter, PostContents, PostPics, LikeBtn, CommentBtn, PlusBtn, CommentsWindow, WriteCommentContainer, addNewComment, LoadingEffect } from '../Home/supportFunctions'
import "./NeetCompany.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid';
import close from '../images/close.png';
import { ShowPosts, RightSideBar } from "../Home/Home"
import "./NeetCompany.css"
import { dbService, auth } from "../firebase"
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
import defaultProfileImg from '../images/default_profile_image.jpg'
import defaultBackground from '../images/default_background.jpg'
const moims = ['모임 a', '모임 b', '모임 c']




export const whoCheckedF = async (targetDate) => {

    let ans = [];
    const dayStart = targetDate - targetDate%86400;
    const dayEnd = dayStart+86400;
    const check = (element) => {
        if(dayStart<=element && element<dayEnd) return true;
        else return false;
    }
    const querySnapshot = await getDocs(collection(dbService, "neetCompany"));
    querySnapshot.forEach((doc) => {
        if(doc.data().checkTimes.findIndex(check)>=0){
            ans.push(doc.id);
        }
    });
    return ans;
}


export const NeetCompany = () => {
    
    const [showGenerations, setShowGenerations] = useState(false);
    const toggleGenerations = () => setShowGenerations(!showGenerations);
    const navigate = useNavigate();
    const [uid, setUid] = useState(false);
    const [checked, setChecked] = useState(false);
    const [ncCheckTimes, setNcCheckTimes] = useState([]);
    const [whoChecked, setWhoChecked] = useState([]);
    const { generation } = useParams();
    useEffect(() => {
        // 여기에서 generation 값을 사용하여 필요한 작업을 수행
        console.log(generation); // URL에서 추출된 세대 번호
    }, [generation]);
    
    const GenerationList = () => (
        <div className="generation-list">
            {Array.from({ length: 16 }, (_, i) => `${i + 1}`).map(generationNumber => (
                <Link key={generationNumber} to={`/neetCompany/${generationNumber}`}>
                    <div>{generation}기</div>
                </Link>
            ))}
        </div>
    );
    const handleSelectGeneration = (selectedGeneration) => {
    const generationNumber = selectedGeneration.match(/\d+/)[0]; // 숫자 부분 추출
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
    const [attendanceDates, setAttendanceDates] = useState([]);
    useEffect(() => {
        if (uid && ncCheckTimes.length > 0) {
            const tmp = ncCheckTimes;
            setAttendanceDates(
                tmp.map((timestamp) => {
                    // Unix timestamp를 밀리초로 변환
                    const timestampInMillis = timestamp * 1000;
                    // Date 객체 생성
                    const date = new Date(timestampInMillis);
                    return date;
                })
            );
        }
    }, [uid, ncCheckTimes]);
    const tileClassName = ({ date, view }) => {
    // 월 뷰에서만 클래스 적용
    if (view === 'month') {
        let isAttendanceDate = attendanceDates.some(attendanceDate => 
        date.getDate() === attendanceDate.getDate() &&
        date.getMonth() === attendanceDate.getMonth() &&
        date.getFullYear() === attendanceDate.getFullYear()
        );
        
        

        if (isAttendanceDate) {
        return 'attendance-date'; // 특별한 날짜에 대한 클래스 이름
        }
    }
    };
    useEffect(() => {
        setUid(auth.currentUser.uid)
        const tmpfnc = async () => {
            const newWhoChecked = await whoCheckedF(moment().unix())
            setWhoChecked(newWhoChecked)
        }
        tmpfnc()
    }, [])
    useEffect(() => {
        
        const getNcCheckTimes = async () => {
            if(uid) {
                const ncDocRef = doc(dbService, "neetCompany", uid)
                const docSnap = await getDoc(ncDocRef);
                if (docSnap.exists()) {
                    setNcCheckTimes(docSnap.data().checkTimes)
                    console.log("Document data:", docSnap.data().checkTimes);
                } else {
                    console.log("No such document!");
                }


            }
        }
        getNcCheckTimes();
    }, [uid])
    useEffect(() => {

        if(ncCheckTimes.length===0) return;
        let tmp = ncCheckTimes
        const now = moment().unix();
        const todayStart = now - now%86400;
        const todayEnd = todayStart+86400;
        const check = (element) => {
            if(todayStart<=element && element<todayEnd) return true;
            else return false;
        }
        if(tmp.findIndex(check)>=0) {
            setChecked(true)
        }
    }, [ncCheckTimes])
    return(
        <div className="neetCompanyBody">
            <div className="left-sidebar-container">
                <aside className="left-sidebar-neet">
                    <img src={defaultBackground} alt="Landscape" className="card-image"/>
                    <div className="card-content">
                    <div className="change-generation" onClick={toggleGenerations}>◂다른 기수</div>
                    <div className="generation-number">{generation}기</div>
                    <div className="neet-status">
                        <span className="neet-status-dot"></span>
                        <span className="neet-status-text">업무인증을 마친 멤버</span>
                    </div>
                    <div className="card-members">{whoChecked.length}</div>
                    {checked ?
                        <div className="card-members green">업무인증 완료!</div>
                    :
                        <div className="card-members red">업무인증 미완료</div>
                    }
                    </div>
                </aside>
                
                {showGenerations && (
                    <GenerationList onSelect={handleSelectGeneration} />
                )}
            </div>
            <div className="homePostsMarginControl">

                <ShowPosts currentLocation={'neetCompany'} neetGeneration={generation} />
            </div>
            <div className="right-sidebar-container">
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

        </div>
    )
}