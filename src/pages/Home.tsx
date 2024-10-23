import {
  IoChatboxEllipses,
  IoChevronBack,
  IoChevronForward,
  IoClose,
  IoMan,
  IoPeople,
  IoSearch,
} from "react-icons/io5";
import "./Home.scss";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const goToMapEditor = () => {
    navigate("/map-editor");
  };

  const handlePlay = () => {
    navigate("/game");
  };

  return (
    <div className="home page">
      <div className="top-bar">
        <div className="label pubg">PUBG 2D</div>
        <div className="menus">
          <div className="menu selected">플레이</div>
          <div className="menu" onClick={goToMapEditor}>
            맵 에디터
          </div>
        </div>
        <div></div>
      </div>
      <div className="content">
        <div className="bottom">
          <div className="config">
            <div className="config-list">
              <div className="config-item match-type">
                <div className="icon solo selected">
                  <IoMan />
                </div>
                <div className="icon duo">
                  <IoMan />
                  <IoMan />
                </div>
                <div className="icon squad">
                  <IoMan />
                  <IoMan />
                  <IoMan />
                  <IoMan />
                </div>
                <div className="icon solo-squad">
                  <IoMan />
                  <IoClose className="empty" />
                  <IoClose className="empty" />
                  <IoClose className="empty" />
                </div>
              </div>
              <div className="config-item maps">
                <div className="prev">
                  <IoChevronBack />
                </div>
                <div className="map-select">
                  <div className="label pubg">ERENGEL</div>
                  <div className="slots">
                    <div className="slot selected"></div>
                    <div className="slot"></div>
                    <div className="slot"></div>
                  </div>
                </div>
                <div className="next">
                  <IoChevronForward />
                </div>
              </div>
              <div className="config-item play" onClick={handlePlay}>
                플레이
              </div>
            </div>
          </div>
        </div>
        <div className="chat-box">
          <div className="chat-list"></div>
          <div className="chat-input">
            <input type="text" placeholder="메시지를 입력하세요." />
          </div>
        </div>
      </div>
      <div className="bottom-bar">
        <div className="submenus">
          <div className="submenu chat">
            <IoChatboxEllipses />
          </div>
          <div className="submenu find">
            <IoSearch />
          </div>
          <div className="submenu teammates">
            <div className="teammate">
              <div className="default-avatar pubg">PUBG</div>
            </div>
            <div className="teammate"></div>
            <div className="teammate"></div>
            <div className="teammate"></div>
          </div>
          <div className="submenu teammate-num">
            <div className="icon">
              <IoPeople />
            </div>
            <div className="number">1</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
