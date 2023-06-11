import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
const Login = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [show, setshow] = useState(false);
  const [loading, setloading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => {
    setshow(show ? false : true);
  };

  const submitForm = async () => {
    setloading(true);
    if (!password || !email) {
      toast({
        title: "Please Fill all the Fields",
        description: "Please fill all the fields to continue",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setloading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "https://talktime-87ms.onrender.com/api/user/login",
        { email, password },
        config
      );
      toast({
        title: "Login Successful",
        description: "Please fill all the fields to continue",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setloading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setloading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl isRequired id="email">
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => setemail(e.target.value)}
          value={email}
        />
      </FormControl>

      <FormControl isRequired id="password">
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setpassword(e.target.value)}
            value={password}
          />
          // for the right button of show and hide
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        // colorScheme="blue"
        backgroundColor="#6a0ad8 "
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitForm}
        isLoading={loading}
        color="white"
        id="loginBtn"
      >
        Login
      </Button>

      <Button
        variant="solid"
        // colorScheme="red"
        backgroundColor="#ea07fb"
        color="white"
        width="100%"
        onClick={() => {
          setemail("guest@example.com");
          setpassword("guest@pass");
        }}
        id="getGuestBtn"
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;
