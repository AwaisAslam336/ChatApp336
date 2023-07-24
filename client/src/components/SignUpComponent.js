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

export default function SignUpComponent() {
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

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required(),
      email: Yup.string().email("Invalid email address").required(),
      password: Yup.string().required(),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required(),
    }),
    onSubmit: async (values) => {
      const userCredentials = {
        username: values.username,
        email: values.email,
        password: values.password,
      };
      try {
        setLoader(true);
        const result = await axios.post(
          "http://localhost:8000/api/user/register",
          userCredentials
        );
        localStorage.setItem("userInfo", result?.data?.data);
        setAccessToken(result?.data?.AccessToken);
        navigate("/chat");
        setLoader(false);
      } catch (error) {
        setLoader(false);
        error?.message && setToastMessage(error.message);
        error?.response?.data && setToastMessage(error?.response?.data);
        error?.response?.statusText &&
          setToastMessage(error?.response?.statusText);
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
              id="username"
              label="User Name"
              name="username"
              autoComplete="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.username && formik.errors.username ? (
                  <text className="text-red-500">{formik.errors.username}</text>
                ) : null
              }
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.password && formik.errors.password ? (
                  <text className="text-red-500">{formik.errors.password}</text>
                ) : null
              }
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.confirmPassword &&
                formik.errors.confirmPassword ? (
                  <text className="text-red-500">
                    {formik.errors.confirmPassword}
                  </text>
                ) : null
              }
            />

            <Button
              type="submit"
              fullWidth
              onClick={formik.handleSubmit}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loader}
            >
              {loader ? (
                <CircularProgress color="inherit" size={"1.5rem"} />
              ) : (
                "Sign Up"
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
