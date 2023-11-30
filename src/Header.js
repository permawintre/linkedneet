import React,  { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { logOut } from "./firebase.js"

export const Header = ({isLoggedIn, approved}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [isFocused, setIsFocused] = useState(false);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        // 검색 로직이나 페이지 이동 로직
        // 예시: 검색어에 따라 다른 페이지로 이동
        window.location = `/search?q=${encodeURIComponent(searchTerm)}`;
    };

    return(

        <div className='header'>
        <div className='header__inner'>
            <ul className="header__left">
                    <Link to="/" className="header__item link">홈</Link>
                    <Link to="/project" className="header__item link">소모임</Link>
                    <Link to="/neetCompany" className="header__item link">니트컴퍼니</Link>
                    <Link to="/profiledetail" className="header__item link">프로필</Link>
            </ul>
            <div className='header__mid'>
                <Link to="/" className="link">
                    <h1 className="linkedneet_logo">linked<span className="color1">neet</span></h1>
                </Link>
            </div>
            <div className="header__right">
                <form onSubmit={handleSearchSubmit}>
                    <div className={`header__search-container ${isFocused || searchTerm ? 'active' : ''}`}>
                        <input 
                            type="text" 
                            className='header__searchbar' 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                        {searchTerm === '' && <span className='fake-placeholder'>검색</span>}
                    </div>
                </form>
                <Link to="/notice" className="header__notice link">공지</Link>
                {approved === 2? (<Link to="/manage" className='header__notice link'>관리</Link>) : null}
                <button className='header__loginout' onClick={ logOut }>
                    {isLoggedIn? 'logout' : 'login'}
                </button>
            </div>
        </div>
        </div>
    )
}
export const Footer = () => {

    return (
    <div className='Footer'>
        <Link to="/" className="link">
            <div className='FooterLogo'>
                <h1 className="linkedneet_logo">linked<span className="color1">neet</span></h1>
            </div>
        </Link>
            <div className='color1'>
                made by
            </div>
            <div>
                {'김서경, 김호준(20), 김호준(21), 이다래, 이영도, 이영진'} 
            </div>
            <div className='color1'>
                contact
            </div>
            <div>
                seokyung1114@kaist.ac.kr
            </div>
            <div>
                khf7000@kaist.ac.kr
            </div>
            <div>
                juns0220@kaist.ac.kr
            </div>
            <div>
                2darae@kaist.ac.kr
            </div>
            <div>
                lyd0531@kaist.ac.kr
            </div>
            <div>
                ligobservatory@kaist.ac.kr
            </div>
            
    </div>
    )
}