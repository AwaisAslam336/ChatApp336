import React, { useEffect, useState } from "react";
import PrimarySearchAppBar from "../components/Navbar";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileDialogBox from "../components/ProfileDialogBox";
import { Alert, Avatar, Box, Snackbar } from "@mui/material";
import { socket } from "../socket";

function ChatPage() {
  const { accessToken, setAccessToken } = React.useContext(AuthContext);
  const [toastMessage, setToastMessage] = useState();
  const [toast, setToast] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [conversations, setConversations] = useState();
  const [currentConversation, setCurrentConversation] = useState();
  const [allMessages, setAllMessages] = useState();
  const [textMessage, setTextMessage] = useState();
  const [socketConnection, setSocketConnection] = useState(false);
  const [value, setValue] = React.useState(0);
  const navigate = useNavigate();
  const currentUser = JSON.parse(window.localStorage.getItem("userInfo"));

  useEffect(() => {
    socket.emit("setup", currentUser?._id);
    socket.on("onMsgReceive", (newMsg) => {
      setAllMessages((msgs) => [...msgs, { ...newMsg }]);
    });
  }, []);

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
  }, [value, accessToken]);

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
      //socket.emit("disconnect");
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
  const handleConversationClick = async (conversation) => {
    if (!conversation.conversation_id || !accessToken) {
      return;
    }
    try {
      const messages = await axios({
        method: "get",
        url: `http://localhost:8000/api/message/get/${conversation.conversation_id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setAllMessages(messages.data);
      setCurrentConversation(conversation);
      socket.emit("join chat", conversation.conversation_id);
    } catch (error) {
      //add toast error here
    }
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentConversation.conversation_id || !textMessage || !accessToken) {
      return;
    }
    try {
      const result = await axios({
        method: "post",
        data: {
          conversationId: currentConversation.conversation_id,
          content: textMessage,
        },
        url: `http://localhost:8000/api/message/create`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setTextMessage("");
      const receiverUserId = currentConversation.member._id;
      const data = {
        newMsg: result.data.newMsg,
        receiverUserId,
      };
      socket.emit("sendMsg", data);
      setAllMessages((msgs) => [...msgs, { ...result.data.newMsg }]);
    } catch (error) {
      console.log(error);
      //add toast error here
    }
  };

  return (
    <div className="bg-slate-200 h-screen flex flex-col">
      {/* ****navbar**** */}
      <PrimarySearchAppBar
        handleLogout={logout}
        handleProfile={handleUserProfile}
        refreshPage={refreshPage}
      />
      <Box className="flex flex-row h-90vh">
        {/* ****Converstaions List**** */}
        <Box className="h-full basis-1/4 bg-slate-100 rounded-lg p-1">
          {conversations &&
            conversations.map((conversation) => {
              return (
                <Box
                  type="Submit"
                  onClick={() => {
                    handleConversationClick(conversation);
                  }}
                  className="flex items-center rounded-md border-2 active:bg-blue-400 hover:bg-blue-200  m-1 pl-5"
                >
                  <Avatar
                    alt="Profile Picture"
                    src={`http://localhost:8000/${conversation?.member?.pic}`}
                    sx={{ width: 46, height: 46 }}
                  />
                  <Box className="flex flex-col ml-5 p-1">
                    <text className="text-xl font-semibold">
                      {conversation?.member?.username?.charAt(0).toUpperCase() +
                        conversation?.member?.username?.slice(1)}
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
        <Box className="h-full basis-2/4 flex flex-col">
          <Box className=" basis-11/12 bg-slate-100 m-2 rounded-lg flex flex-col overflow-auto">
            {Array.isArray(allMessages) &&
              allMessages.map((msg) => {
                if (msg.senderId == currentUser._id) {
                  return (
                    <div>
                      <Box className="bg-blue-300 text-gray-900 rounded-lg p-2 m-2 w-fit float-right">
                        <text className="block font-semibold">you</text>
                        {msg.content}
                      </Box>
                    </div>
                  );
                } else {
                  return (
                    <Box className="bg-green-300 text-gray-900 rounded-lg p-2 m-2 w-fit">
                      <text className="block font-semibold">User 1</text>
                      {msg.content}
                    </Box>
                  );
                }
              })}
          </Box>

          <form className="basis-1/12 mt-1 mb-3 mx-2">
            <label for="chat" className="sr-only">
              Your message
            </label>
            <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50 ">
              <button
                type="button"
                className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 "
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 18"
                >
                  <path
                    fill="currentColor"
                    d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z"
                  />
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18 1H2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
                  />
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM7.565 7.423 4.5 14h11.518l-2.516-3.71L11 13 7.565 7.423Z"
                  />
                </svg>
                <span className="sr-only">Upload image</span>
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 "
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z"
                  />
                </svg>
                <span className="sr-only">Add emoji</span>
              </button>
              <textarea
                id="chat"
                rows="1"
                value={textMessage}
                onChange={(e) => {
                  setTextMessage(e.target.value);
                }}
                className="block mx-4 p-3 w-full text-md text-gray-900 bg-white rounded-lg border focus:border-blue-400 border-gray-300"
                placeholder="Your message..."
              ></textarea>
              <button
                type="submit"
                onClick={handleSendMessage}
                className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 "
              >
                <svg
                  className="w-5 h-5 rotate-90"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 20"
                >
                  <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
                </svg>
                <span className="sr-only">Send message</span>
              </button>
            </div>
          </form>
        </Box>
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
