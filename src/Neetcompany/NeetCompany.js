import { ShowPosts, RightSideBar } from "../Home/Home"
import "./NeetCompany.css"

export const NeetCompany = () => {

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
            <RightSideBar/>
        </div>
    )
}