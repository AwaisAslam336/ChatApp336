import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert, CircularProgress, Snackbar } from "@mui/material";

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function LoginComponent() {
  const { setAccessToken } = React.useContext(AuthContext);
  const [loader, setLoader] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState();
  const navigate = useNavigate();

  //close toast by clicking away
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const userCredentials = {
      email: data.get("email"),
      password: data.get("password"),
    };
    try {
      setLoader(true);
      const result = await axios.post(
        "http://localhost:8000/api/user/login",
        userCredentials
      );
      setAccessToken(result?.data?.AccessToken);
      navigate("/chat");
      setLoader(false);
    } catch (error) {
      setLoader(false);
      setToastMessage(error?.response?.data);
      setToast(true);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {loader ? (
                <CircularProgress color="inherit" size={"1.5rem"} />
              ) : (
                "Sign In"
              )}
            </Button>
            <Grid container justifyContent={"center"}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
          </Box>
        </Box>
        <Snackbar open={toast} autoHideDuration={3000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}
