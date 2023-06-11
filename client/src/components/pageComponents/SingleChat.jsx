import React, { useEffect, useRef } from "react";
import { ChatState } from "../../Context/ChatProvider";
import "./style.css";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  background,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderObj } from "../../logics/ChatLogics";
import ProfileModal from "./ProfileModal";
import UpdateGroupModal from "./UpdateGroupModal";
import { useState } from "react";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import animationData from "../../assets/typing.json";
import Lottie from "react-lottie";
import io from "socket.io-client";
const ENDPOINT = "https://talktime-87ms.onrender.com";
var socket, selectedChatCompare;
const SingleChat = ({ fetchAgain, setfetchAgain }) => {
  //to store all the fetched messages
  const [messages, setmessages] = useState([]);
  const [loading, setloading] = useState(false);
  const [newMessage, setnewMessage] = useState("");
  const [socketConnected, setsocketConnected] = useState(false);
  const toast = useToast();
  const { user, selectedchat, setselectedchat, notification, setnotification } =
    ChatState();
  const [typing, settyping] = useState(false);
  const [isTyping, setisTyping] = useState(false);

  const scrollBottom = () => {
    setTimeout(() => {
      document.getElementById("scroll").scrollTop =
        document.getElementById("scroll").scrollHeight;
    }, 300);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setsocketConnected(true));
    socket.on("typing", () => setisTyping(true));
    socket.on("stop typing", () => setisTyping(false));
  }, []);

  const fetchMsgs2 = async () => {
    if (!selectedchat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      //  setloading(true);
      const { data } = await axios.get(
        `https://talktime-87ms.onrender.com/api/message/${selectedchat._id}`,
        config
      );

      //  setloading(false);
      setmessages(data);

      //  socket.emit("join chat", selectedchat._id);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to load messages",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const fetchMsgs = async () => {
    if (!selectedchat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setloading(true);
      const { data } = await axios.get(
        `https://talktime-87ms.onrender.com/api/message/${selectedchat._id}`,
        config
      );

      setloading(false);
      scrollBottom();
      setmessages(data);

      socket.emit("join chat", selectedchat._id);
    } catch (error) {
      toast({
        title: "Error Occured",
        description: "Failed to load messages",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    fetchMsgs();
    selectedChatCompare = selectedchat;
    setTimeout(() => {
      scrollBottom();
    }, 200);
  }, [selectedchat]);

  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessage.chat._id
      ) {
        // Notification
        if (!notification.includes(newMessage)) {
          setnotification([newMessage, ...notification]);
          setfetchAgain(!fetchAgain);

          //set scrolling bottom if needed
          // scrollBottom();
        }
      } else {
        setmessages([...messages, newMessage]);
        scrollBottom();
      }
    });
  });

  //function to send message
  const sendMsg = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedchat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setnewMessage("");
        const { data } = await axios.post(
          "https://talktime-87ms.onrender.com/api/message",
          {
            content: newMessage,
            chatId: selectedchat._id,
          },
          config
        );
        socket.emit("new message", data);
        setmessages([...messages, data]);
        fetchMsgs2();

        setTimeout(() => {
          scrollBottom();
        }, 200);
      } catch (error) {
        toast({
          title: "Error Occured",
          description: "Failed to send message",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  // function to handle the typing
  const typingHandler = (e) => {
    setnewMessage(e.target.value);

    // Implementing typing indicator logic
    if (!socketConnected) return;
    if (!typing) {
      settyping(true);
      socket.emit("typing", selectedchat._id);
    }

    let lastTyped = new Date().getTime();
    var timer = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var difference = timeNow - lastTyped;
      if (difference >= timer) {
        socket.emit("stop typing", selectedchat._id);
        settyping(false);
      }
    }, timer);
  };

  return (
    <>
      {selectedchat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setselectedchat("")}
            />
            {!selectedchat.isGroupChat ? (
              <>
                {getSender(user, selectedchat.users)}
                <ProfileModal user={getSenderObj(user, selectedchat.users)} />
              </>
            ) : (
              <>
                {selectedchat.chatName.toUpperCase()}
                <UpdateGroupModal
                  fetchAgain={fetchAgain}
                  setfetchAgain={setfetchAgain}
                  fetchMsgs={fetchMsgs}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            p={3}
            bg="white"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {/* the message window  */}
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div
                className="messageDiv"
                id="scroll"
                style={{ backgroundColor: "white" }}
              >
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl onKeyDown={sendMsg} isRequired mt={3}>
              {isTyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginLeft: 0, marginBottom: 15 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Cick user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
