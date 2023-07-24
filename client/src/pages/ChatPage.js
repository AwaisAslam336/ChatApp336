import React, { useEffect, useState } from "react";
import PrimarySearchAppBar from "../components/Navbar";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileDialogBox from "../components/ProfileDialogBox";
import { Alert, Snackbar } from "@mui/material";
import FormData from "form-data";

function ChatPage() {
  const { accessToken, setAccessToken } = React.useContext(AuthContext);
  const [secret, setSecret] = useState("");
  const [toastMessage, setToastMessage] = React.useState();
  const [toast, setToast] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [img, setImg] = React.useState();
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
  const handlePictureUpload = async () => {
    if (img && accessToken) {
      try {
        let data = new FormData();
        data.append("img", img);
        await axios({
          method: "post",
          url: "http://localhost:8000/api/user/pic",
          data: data,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div className="bg-slate-200 h-screen">
      <PrimarySearchAppBar
        handleLogout={logout}
        handleProfile={handleUserProfile}
      />
      {secret}
      <Snackbar open={toast} autoHideDuration={3000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
      <ProfileDialogBox
        handleClose={handleProfileClose}
        open={openDialog}
        handlePictureUpload={handlePictureUpload}
        setImg={setImg}
      />
    </div>
  );
}

export default ChatPage;
