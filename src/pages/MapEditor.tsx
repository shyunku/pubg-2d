import { IoChevronBack } from "react-icons/io5";
import "./MapEditor.scss";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const MapEditor = () => {
  const navigate = useNavigate();

  const goBack = () => {
    // ask user

    navigate("/");
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("unload");
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="map-editor page">
      <div className="top-bar">
        <div className="back-button" onClick={goBack}>
          <div className="icon">
            <IoChevronBack />
          </div>
          <div className="label">뒤로가기</div>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;
