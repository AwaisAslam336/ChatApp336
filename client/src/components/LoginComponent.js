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
import { useFormik } from "formik";
import * as Yup from "yup";

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function LoginComponent() {
  const { setAccessToken } = React.useContext(AuthContext);
  const [loader, setLoader] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState();
  const navigate = useNavigate();

  //close toast
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast(false);
  };
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required(),
      password: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      const userCredentials = {
        email: values.email,
        password: values.password,
      };
      try {
        setLoader(true);
        const result = await axios.post(
          "http://localhost:8000/api/user/login",
          userCredentials,
          { withCredentials: true }
        );
        window.localStorage.setItem(
          "userInfo",
          JSON.stringify(result?.data?.data)
        );
        setAccessToken(result?.data?.AccessToken);
        setLoader(false);
        navigate("/chat");
      } catch (error) {
        setLoader(false);
        error?.message && setToastMessage(error.message);
        error?.response?.statusText &&
          setToastMessage(error?.response?.statusText);
        error?.response?.data && setToastMessage(error?.response?.data);
        setToast(true);
      }
    },
  });

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
          <Box component="form" onSubmit={formik.handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              id="email"
              label="Email Address"
              name="email"
              helperText={
                formik.touched.email && formik.errors.email ? (
                  <text className="text-red-500">{formik.errors.email}</text>
                ) : null
              }
              autoFocus
            />

            <TextField
              margin="normal"
              required
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              name="password"
              label="Password"
              type="password"
              id="password"
              helperText={
                formik.touched.password && formik.errors.password ? (
                  <text className="text-red-500">{formik.errors.password}</text>
                ) : null
              }
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={formik.handleSubmit}
              sx={{ mt: 3, mb: 2 }}
              disabled={loader}
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
