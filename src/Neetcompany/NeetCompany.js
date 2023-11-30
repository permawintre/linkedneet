import React from "react";
import "./NeetCompany.css"
import { ShowPosts } from "../Home/Home"
import "./NeetCompany.css"
import { dbService, auth } from "../firebase"
import { Link, useParams, useNavigate } from "react-router-dom"
import moment from 'moment';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    query,
    where
} from "firebase/firestore"
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { useEffect, useState } from 'react'
import defaultBackground from '../images/default_background.jpg'




export const whoCheckedF = async (unixtimestamp) => {

    let ans = [];
    
    const targetDate = unixtimestamp+32400;
    const dayStart = targetDate - targetDate%86400 - 32400;

    const dayEnd = dayStart+86400;
    console.log(dayStart, dayEnd)
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
                   <div style={{ color: 'black' }}>{generationNumber}기</div>
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
        const unixtimestamp = moment().unix();
        const targetDate = unixtimestamp+32400;
        const todayStart = targetDate - targetDate%86400 - 32400;
        const todayEnd = todayStart+86400;
        const check = (element) => {
            if(todayStart<=element && element<todayEnd) return true;
            else return false;
        }
        if(tmp.findIndex(check)>=0) {
            setChecked(true)
        }
    }, [ncCheckTimes])

    const [eventText, setEventText] = useState('');

    const handleEventSubmit = async () => {
        console.log(dbService);
        const eventText = document.querySelector('.event-creation input').value;
        if (eventText) {
            try {
                await addDoc(collection(dbService, "calendar"), {
                    content: eventText,
                    date: selectedDate.toISOString().split('T')[0],
                    userId: auth.currentUser.uid,
                    where: "individual"
                });
                setEventText(''); // 입력 필드 초기화
            } catch (error) {
                console.error("Error adding document: ", error);
            }
        }
      };

    const [events, setEvents] = useState([]);
    // 선택된 날짜에 맞는 일정을 가져오는 함수
    const fetchEvents = async () => {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        console.log(`Searching for events on date: ${selectedDate}`);
        try {
            const q = query(collection(dbService, "calendar"), where("date", "==", formattedDate));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                console.log('No matching documents.');
                setEvents([]);
                return;
            }
            const fetchedEvents = [];
            querySnapshot.forEach((doc) => {
                console.log(doc.id, '=>', doc.data());
                console.log(selectedDate.toISOString().split('T')[0]);
                fetchedEvents.push(doc.data()); // 데이터를 배열에 추가
            });
            setEvents(fetchedEvents); 
    
        } catch (error) {
            console.error("Error fetching events: ", error);
        }
    };

    useEffect(() => {
        if(selectedDate) {
            fetchEvents();
        }
        console.log('selectedDate changed, called fetchEvents');
    }, [selectedDate]);
    useEffect(() => {
        console.log('Events state updated:', events);
    }, [events]);

// 선택된 날짜를 하루 뒤로 설정하는 함수
const setNextDay = () => {
  setSelectedDate(prevDate => {
    const nextDay = new Date(prevDate);
    nextDay.setDate(prevDate.getDate() + 1);
    return nextDay;
  });
};

useEffect(() => {
  // 컴포넌트가 마운트되면 선택된 날짜를 하루 뒤로 설정
  setNextDay();
}, []);




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
                            
                        {events.map((event, index) => (
                            <li key={index}>{event.content}</li> // 'content'는 Firestore에 저장된 필드 이름이어야 함
                        ))}
                        </ul>
                    </div>
                    <div className="event-creation">
                        <input 
                            type="text" 
                            placeholder="일정 추가..." 
                            value={eventText}
                            onChange={(e) => setEventText(e.target.value)} // 입력 필드 값 관리
                        />
                        <div className="submit-event" onClick={handleEventSubmit}>등록</div>
                    </div>
                </aside>
            </div>

        </div>
    )
}