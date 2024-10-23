import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "store/rootReducer";
import { Provider } from "react-redux";
import MainRouter from "routers/MainRouter";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

import "styles/reset.scss";
import "styles/index.scss";

const store = configureStore({
  reducer: rootReducer,
  middleware: (defaultMiddleware: any) => defaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <MainRouter />
    </PersistGate>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
