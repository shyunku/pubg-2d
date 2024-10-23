import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { accountAuthSlice, accountInfoSlice, setAuth } from "store/accountSlice";

const AuthRouter = () => {
  // const location = useLocation();
  // console.log(location);

  const dispatch = useDispatch();

  const accountAuth = useSelector(accountAuthSlice);
  const accountInfo = useSelector(accountInfoSlice);
  // console.log(accountAuth);
  const accessToken = useMemo(() => {
    return accountAuth.accessToken;
  }, [accountAuth]);
  const userId = useMemo(() => {
    return accountInfo.uid;
  }, [accountInfo]);
  const isAuthorized = useMemo(() => {
    return accessToken != null && userId != null;
  }, [accessToken]);

  useEffect(() => {}, []);

  if (isAuthorized || true) {
    return <Outlet context={{ isAuthorized }} />;
  } else {
    console.log("not accessible");
    return <Navigate to="/login" />;
  }
};

export default AuthRouter;
