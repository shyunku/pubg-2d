import Home from "pages/Home";
import Login from "pages/Login";
import { HashRouter, Route, Routes } from "react-router-dom";
import AuthRouter from "./AuthRouter";
import Game from "pages/Game";
import MapEditor from "pages/MapEditor";

const MainRouter = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AuthRouter />}>
          <Route path="*" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/map-editor" element={<MapEditor />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div>404 Page</div>} />
      </Routes>
    </HashRouter>
  );
};

export default MainRouter;
