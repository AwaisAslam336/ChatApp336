import React, { useEffect, useState } from "react";
import PrimarySearchAppBar from "../components/Navbar";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileDialogBox from "../components/ProfileDialogBox";
import { Alert, Snackbar } from "@mui/material";

function ChatPage() {
  const { accessToken, setAccessToken } = React.useContext(AuthContext);
  const [toastMessage, setToastMessage] = React.useState();
  const [toast, setToast] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    /* handling accessToken after page refresh */
    const getNewAccessToken = () => {
      if (!accessToken) {
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
      getNewAccessToken();
    };
  }, []);

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

  const handleUserProfile = () => {
    setOpenDialog(true);
  };
  const handleProfileClose = () => {
    setOpenDialog(false);
  };

  return (
    <div className="bg-slate-200 h-screen">
      <PrimarySearchAppBar
        handleLogout={logout}
        handleProfile={handleUserProfile}
      />

      <Snackbar open={toast} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
      <ProfileDialogBox handleClose={handleProfileClose} open={openDialog} />
    </div>
  );
}

export default ChatPage;
