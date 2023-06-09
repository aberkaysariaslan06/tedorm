import * as React from "react";
import {
  Button,
  CardMedia,
  CssBaseline,
  InputLabel,
  Select,
  FormControl,
  MenuItem,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Typography,
  Container,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import AddAddress from "./AddAddress";
import AppBarForStudents from "../AppBarForStudent";
import { AddAddressApi } from "../../api/AddAddressApi";
import { AddPermissionApi } from "../../api/AddPermissionApi";
import { useParams } from "react-router-dom";
import { StudentApi } from "../../api/StudentApi";
import PermissionImage from "./PermissionImage.png";
import { UserApi } from "../../api/UserApi";

export default function PermissionFormForStudents() {
  const permissionApi = new AddPermissionApi();
  const addAddressApi = new AddAddressApi();
  const studentApi = new StudentApi();
  const [student, setStudent] = useState(null);
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const userApi = new UserApi();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
  };

  const [addresses, setAddresses] = useState([]);
  const [address, setAddress] = useState("");
  const [isAddAddressOpen, setAddAddressOpen] = useState(false);
  const [formState, setFormState] = useState({
    permissionDates: [null, null],
    message: "",
  });

  const [formStateAddress, setFormStateAddress] = useState({});
  useEffect(() => {
    fetchAddresses();
  }, []);
  const fetchAddresses = async () => {
    const response = await addAddressApi.getAddress();
    setAddresses(response.data);
  };
  const handleChange = (event) => {
    setAddress(event.target.value);
    const selectedAddress = addresses.find(
      (addr) => addr.id === event.target.value
    );
    if (selectedAddress) {
      const newState = { ...formStateAddress, addressId: selectedAddress.id };
      setAddress(event.target.value);
      setFormStateAddress(newState);
    }
  };

  function onInputChange(event) {
    const field = event.target.name;
    const value = event.target.value;
    const newState = { ...formState };
    newState[field] = value;
    setFormState(newState);
  }

  async function addAddress(formStateAddress) {
    const responseAddress = (await addAddressApi.addAddress(formStateAddress))
      .data;
    if (responseAddress.responseType === "SUCCESS") {
      toast.success(responseAddress.message);
      setAddAddressOpen(false);
      fetchAddresses();
    }
  }

  async function addPermission(formState) {
    const { permissionDates, ...rest } = formState;
    const startDate = permissionDates[0];
    const endDate = permissionDates[1];
    const isCheckboxChecked = formState.allowExtraEmails;

    if (!isCheckboxChecked) {
      toast.error("Please accept the confidentiality of information.");
      return;
    }
    if (!address) {
      toast.warning("Please select an address.");
      return;
    }
    if (startDate === null || endDate === null || startDate > endDate) {
      toast.warning("Please select a valid date range.");
      return;
    }

    const permissionData = {
      ...rest,
      permissionDateStart: startDate,
      permissionDateEnd: endDate,
      studentId: id,
      address: "",
      addressId: formStateAddress.addressId,
    };
    console.log(permissionData);
    const response = await permissionApi.addPermissions(permissionData);
    console.log(permissionData);
    if (response.data.responseType === "SUCCESS") {
      toast.success(response.data.message);
    }

    setFormState((prevState) => ({
      ...prevState,
      message: "",
    }));
  }

  const theme = createTheme();
  const renderAddressOptions = () => {
    return addresses.map((addr) => (
      <MenuItem key={addr.id} value={addr.id}>
        {addr.address}
      </MenuItem>
    ));
  };

  return (
    <div>
      <AppBarForStudents />
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ mr: 80, fontFamily: "Arial", fontWeight: "bold", fontSize: "2rem" }}
            >
              Permission Form
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth xs={12}>
                      <InputLabel id="demo-simple-select-label">
                        Select Address
                      </InputLabel>
                      <Select
                        required
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={address}
                        label="address"
                        onChange={handleChange}
                      >
                        {renderAddressOptions()}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth xs={12}>
                      <Button
                        onClick={() => setAddAddressOpen(true)}
                        type="submit"
                        color="inherit"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 0.3, mb: 0.3 }}
                      >
                        <ControlPointIcon /> Add Address
                      </Button>
                      <AddAddress
                        isOpen={isAddAddressOpen}
                        close={() => setAddAddressOpen(false)}
                        submit={addAddress}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={["DateRangePicker"]}>
                          <DateRangePicker
                            name="permissionDates"
                            localeText={{ start: "Start day", end: "End day" }}
                            value={formState.permissionDates}
                            onChange={(newValue) => {
                              const newState = { ...formState };
                              newState.permissionDates = newValue;
                              setFormState(newState);
                            }}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>
                 <Grid item xs={12}>
                    <FormControl fullWidth xs={12}>
                      <TextField
                        onChange={onInputChange}
                        name="message"
                        id="outlined-multiline-static"
                        label="Add Message"
                        multiline
                        rows={4}
                        defaultValue=""
                        value={formState.message}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formState.allowExtraEmails}
                          onChange={(event) =>
                            setFormState((prevState) => ({
                              ...prevState,
                              allowExtraEmails: event.target.checked,
                            }))
                          }
                          value="allowExtraEmails"
                          color="primary"
                        />
                      }
                      label="I accept the confidentiality of information."
                    />
                  </Grid>
               </Grid>
                <Button
                  onClick={() => {
                    addPermission(formState)
                    setFormState({
                      ...formState,
                      allowExtraEmails: false,
                      permissionDates: [null, null],
                    });
                    setAddress("");
                  }}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={
                    !address ||
                    formState.permissionDates[0] === null ||
                    formState.permissionDates[1] === null ||
                    !formState.allowExtraEmails ||
                    formState.message.trim().length === 0
                  }
                >
                  Add
                </Button>
              </Box>
              <CardMedia
                component="img"
                sx={{
                  width: "auto",
                  height: "100%",
                  marginLeft: 20,
                }}
                image={PermissionImage}
                alt="Permission Image"
              />
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </div>
  );
}