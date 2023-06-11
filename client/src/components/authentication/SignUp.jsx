import React from "react";
import { useState } from "react";
import dotenv from "dotenv";
import axios from "axios";
import background from "./background.jpg";
import { useNavigate } from "react-router-dom";
import "./login.css";
// https://api.cloudinary.com/v1_1//image/upload
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
const SignUp = () => {
  const [name, setname] = useState();
  const [email, setemail] = useState();
  const [password, setpassword] = useState();
  const [confirmPassword, setconfirmPassword] = useState();
  const [pic, setpic] = useState();
  const [show, setshow] = useState(false);
  const [loading, setloading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = async () => {
    setshow(show ? false : true);
  };

  const postDetails = async (pics) => {
    setloading(true);
    if (pics === undefined) {
      toast({
        title: "Please select an image",
        description: "Please select an image to upload",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      const preset = import.meta.env.VITE_PRESET_KEY;
      const cloudName = import.meta.env.VITE_CLOUD_NAME;
      data.append("file", pics);
      data.append("upload_preset", preset);
      data.append("cloud_name", cloudName);
      fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setpic(data.url.toString());
          setloading(false);
        })
        .catch((err) => {
          console.log(err);
          setloading(false);
        });
    } else {
      toast({
        title: "Please select an image",
        description: "Please select jpeg or png image",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const submitForm = async () => {
    setloading(true);
    if (!name || !password || !confirmPassword || !email) {
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
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do no match",
        description: "Password and Confirm password doesn't match",
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
        "https://talktime-87ms.onrender.com/api/user",
        { name, email, password, pic },
        config
      );
      toast({
        title: "Registration is Successfull",
        description: "User Successfully created",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setloading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error occured",
        description: error.response.data.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      setloading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl isRequired id="first-name">
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setname(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired id="email">
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => setemail(e.target.value)}
        />
      </FormControl>

      <FormControl isRequired id="password">
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl isRequired id="confirm-password">
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setconfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        ></Input>
      </FormControl>
      <Button
        backgroundColor="#ea07fb"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitForm}
        isLoading={loading}
        id="signUpBtn"
        color="white"
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
