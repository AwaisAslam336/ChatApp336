import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MoreIcon from "@mui/icons-material/MoreVert";
import SearchDialog from "./SearchDialogBox";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { socket } from "../socket";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function PrimarySearchAppBar(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [searchValue, setSearchValue] = React.useState();
  const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
  const [users, setUsers] = React.useState();
  const { accessToken } = React.useContext(AuthContext);
  const [loader, setLoader] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState();
  const [severity, setSeverity] = React.useState("error");

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast(false);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const handleProfileClose = () => {
    props.handleProfile();
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogoutClose = () => {
    props.handleLogout();
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleSearchDialogOpen = () => {
    setOpenSearchDialog(true);
  };

  const handleSearchDialogClose = () => {
    setOpenSearchDialog(false);
  };

  const handleSelectedSearchUser = async (user) => {
    handleSearchDialogClose();
    const currentUser = JSON.parse(window.localStorage.getItem("userInfo"));

    if (accessToken && user._id && currentUser._id) {
      try {
        const result = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/conversation/create`,
          [currentUser._id, user._id],
          { headers: { Authorization: `Bearer ${accessToken}` } },
          { withCredentials: true }
        );
        console.log(result.data);
        socket.emit("new Conversation Created", result.data);
        props.refreshPage();
        setToastMessage("Conversation Successfully Created");
        setSeverity("success");
        setToast(true);
      } catch (error) {
        error?.message && setToastMessage(error.message);
        error?.response?.statusText &&
          setToastMessage(error?.response?.statusText);
        error?.response?.data && setToastMessage(error?.response?.data);
        setSeverity("error");
        setToast(true);
      }
    } else {
      setToastMessage("Unable to create conversation.");
      setSeverity("error");
      setToast(true);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (accessToken && searchValue) {
      try {
        setLoader(true);
        const result = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/user?search=${searchValue}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
          { withCredentials: true }
        );
        if (result.data?.length > 0) {
          setUsers(result.data);
          handleSearchDialogOpen();
          setLoader(false);
        } else {
          setLoader(false);
          setToastMessage("No such user found.");
          setSeverity("info");
          setToast(true);
        }
      } catch (error) {
        setLoader(false);
        error?.message && setToastMessage(error.message);
        error?.response?.statusText &&
          setToastMessage(error?.response?.statusText);
        error?.response?.data && setToastMessage(error?.response?.data);
        setSeverity("error");
        setToast(true);
      }
    } else {
      setToastMessage("Unable to search user.");
      setSeverity("error");
      setToast(true);
    }
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileClose}>Profile</MenuItem>
      <MenuItem onClick={handleLogoutClose}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "rgb(59 130 246)" }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Chat App
          </Typography>
          <Search>
            <SearchIconWrapper>
              {loader ? (
                <CircularProgress color="inherit" size={"1rem"} />
              ) : (
                <SearchIcon />
              )}
            </SearchIconWrapper>
            <form onSubmit={handleSearch}>
              <StyledInputBase
                placeholder="Search for friends…"
                inputProps={{ "aria-label": "search" }}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>
          </Search>
          <SearchDialog
            open={openSearchDialog}
            handleClose={handleSearchDialogClose}
            users={users}
            handleSelectedUser={handleSelectedSearchUser}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {/* <IconButton
              size="large"
              aria-label="show 4 new mails"
              color="inherit"
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton> */}
            {/* <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={handleSnackBarClose}
      >
        <Alert
          onClose={handleSnackBarClose}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
