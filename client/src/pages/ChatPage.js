import React, { useEffect, useState } from "react";
import PrimarySearchAppBar from "../components/Navbar";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileDialogBox from "../components/ProfileDialogBox";
import { Alert, Avatar, Box, DialogTitle, Snackbar } from "@mui/material";

function ChatPage() {
  const { accessToken, setAccessToken } = React.useContext(AuthContext);
  const [toastMessage, setToastMessage] = useState();
  const [toast, setToast] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [conversations, setConversations] = useState();
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    /* handling accessToken after page refresh */
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
          //console.log(error?.response?.data);
        });
    }
  }, []);
  useEffect(() => {
    /* get all the conversations of current user */
    if (!accessToken) {
      return () => {};
    }
    axios({
      method: "get",
      url: "http://localhost:8000/api/conversation/get",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((result) => {
        setConversations(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [value]);

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
  const refreshPage = () => {
    setValue((value) => value + 1);
  };

  const handleUserProfile = () => {
    setOpenDialog(true);
  };
  const handleProfileClose = () => {
    setOpenDialog(false);
  };

  return (
    <div className="bg-slate-200 h-screen">
      {/* ****navbar**** */}
      <PrimarySearchAppBar
        handleLogout={logout}
        handleProfile={handleUserProfile}
        refreshPage={refreshPage}
      />
      <Box className="flex flex-row">
        {/* ****Converstaions List**** */}
        <Box className="basis-1/4 bg-slate-100 h-screen">
          {conversations &&
            conversations.map((conversation) => {
              console.log(conversation?.member?.pic);
              return (
                <Box className="flex items-center rounded-md border-2 active:bg-violet-700 hover:bg-blue-400  m-1 pl-5">
                  <Avatar
                    alt="Profile Picture"
                    src={`http://localhost:8000/${conversation?.member?.pic}`}
                    sx={{ width: 46, height: 46 }}
                  />
                  <Box className="flex flex-col ml-5 p-1">
                    <text className="text-xl">
                      {conversation?.member?.username.charAt(0).toUpperCase() +
                        conversation?.member?.username.slice(1)}
                    </text>
                    <text className="text-gray-500">
                      {conversation?.member?.email}
                    </text>
                  </Box>
                </Box>
              );
            })}
        </Box>
        {/* ****Chat Box**** */}
      </Box>

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
