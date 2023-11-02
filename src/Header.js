import { Link } from "react-router-dom"
import { logOut } from "./firebase.js"

export const Header = () => {

    return(

        <div className='header'>
        <div className='header__inner'>
            <ul className="header__left">
                    <Link to="/" className="header__item link">home</Link>
                    <Link to="/project" className="header__item link">project</Link>
                    <Link to="/neetCompany" className="header__item link">neetCompany</Link>
                    <Link to="/profile" className="header__item link">profile</Link>
            </ul>
            <div className='header__mid'>
                <Link to="/" className="link">
                    <h1 className="logo">linked<span className="color1">neet</span></h1>
                </Link>
            </div>
            <div className="header__right">
                <div className='header__searchbar'>searchbar</div>
                <div className='header__notice'>notice</div>
                <button className='header__loginout' onClick={ logOut }>login/out</button>
            </div>
        </div>
        </div>
    )
}

