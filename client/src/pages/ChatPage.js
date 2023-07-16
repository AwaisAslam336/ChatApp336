import React, { useEffect, useState } from "react";
import PrimarySearchAppBar from "../components/Navbar";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";

function ChatPage() {
  const { accessToken, setAccessToken } = React.useContext(AuthContext);
  const [secret, setSecret] = useState("");
  const [toastMessage, setToastMessage] = React.useState();
  const [toast, setToast] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    /* handling accessToken after page refresh ---
     --- access authorized_routes & if accessToken is
     not there; get new accessToken */
    const getSecretPage = () => {
      if (accessToken) {
        const configuration = {
          method: "get",
          url: `http://localhost:8000/`,
          headers: { Authorization: "Bearer " + accessToken },
        };
        // make the API call
        axios(configuration)
          .then((result) => {
            setSecret(result?.data);
          })
          .catch((error) => {
            setToastMessage(error?.response?.data);
            setToast(true);
          });
      } else {
        axios
          .get("http://localhost:8000/api/user/token", {
            withCredentials: true,
          })
          .then((result) => {
            setAccessToken(result?.data?.AccessToken);
          })
          .catch((error) => {
            navigate("/");
            console.log(error?.response?.data);
          });
      }
    };

    return () => {
      getSecretPage();
    };
  }, [accessToken]);

  //close toast
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast(false);
  };

  const logout = async () => {
    //setLoader(true);
    try {
      await axios.get("http://localhost:8000/api/user/logout", {
        withCredentials: true,
      });
      navigate("/");
    } catch (error) {
      // setLoader(false);
      setToastMessage(error?.response?.data);
      setToast(true);
    }
  };

  return (
    <div className="bg-slate-200 h-screen">
      <PrimarySearchAppBar handleLogout={logout} />
      {secret}
      <Snackbar open={toast} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ChatPage;
