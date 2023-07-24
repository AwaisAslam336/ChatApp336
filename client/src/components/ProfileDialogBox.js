import * as React from "react";
import Button, { buttonClasses } from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Avatar, Box } from "@mui/material";

export default function ProfileDialogBox({
  handleClose,
  open,
  handlePictureUpload,
  setImg,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const userInfo = JSON.parse(window.localStorage.getItem("userInfo"));

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
            src={userInfo?.pic}
            sx={{ width: 56, height: 56 }}
          />
          <DialogTitle className="text-blue-600" id="responsive-dialog-title">
            {userInfo?.username}
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
          <Button autoFocus onClick={handlePictureUpload} variant="contained">
            Update
          </Button>
          <Button variant="outlined" onClick={handleClose} autoFocus>
            Back
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
