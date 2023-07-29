import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Avatar, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../AuthContext";

export default function ProfileDialogBox({ handleClose, open }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { accessToken } = React.useContext(AuthContext);
  const [loader, setLoader] = React.useState(false);
  const [img, setImg] = React.useState();
  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    setCurrentUser(JSON.parse(window.localStorage.getItem("userInfo")));
  }, []);

  const handlePictureUpload = async () => {
    if (img && accessToken) {
      try {
        setLoader(true);
        let data = new FormData();
        data.append("img", img);
        const result = await axios({
          method: "post",
          url: "http://localhost:8000/api/user/img",
          data: data,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const CUser = { ...currentUser, pic: result?.data?.img };
        setCurrentUser(CUser);
        window.localStorage.setItem("userInfo", JSON.stringify(CUser));
        setLoader(false);
      } catch (error) {
        setLoader(false);
        console.log(error);
      }
    }
  };
  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <Box className="flex justify-center items-center p-2">
          <Avatar
            alt="Profile Picture"
            src={`http://localhost:8000/${currentUser?.pic}`}
            key={Date.now()}
            sx={{ width: 56, height: 56 }}
          />
          <DialogTitle className="text-blue-600" id="responsive-dialog-title">
            {currentUser?.username}
          </DialogTitle>
        </Box>

        <DialogContent>
          <form onSubmit={handlePictureUpload}>
            <label
              class="block mb-2 text-sm font-medium text-gray-900"
              for="file_input"
            >
              Upload New Profile Picture
            </label>
            <input
              class="block p-1 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              id="file_input"
              type="file"
              accept="image/png, image/gif, image/jpeg"
              onChange={(e) => setImg(e.target.files[0])}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={handlePictureUpload}
            variant="contained"
            disabled={loader}
          >
            {loader ? (
              <CircularProgress color="inherit" size={"1.5rem"} />
            ) : (
              "Update"
            )}
          </Button>
          <Button variant="outlined" onClick={handleClose} autoFocus>
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
