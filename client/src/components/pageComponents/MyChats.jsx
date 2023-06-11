import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender } from "../../logics/ChatLogics.js";
import axios from "axios";
import GroupChatModal from "./GroupChatModal";
const MyChats = ({ fetchAgain }) => {
  // const [loggedUser, setloggedUser] = useState();
  const { user, setselectedchat, selectedchat, chats, setchats } = ChatState();
  const toast = useToast();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        "https://talktime-87ms.onrender.com/api/chat",
        config
      );

      setchats(data);
    } catch (error) {
      toast({
        title: "Couldn't fetch the chats",
        description: "Error fetching the chats",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    // setloggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedchat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      p={3}
      backgroundColor="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        p={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        borderRadius="10px"
        bg="#decce3"
      >
        <Text
          fontSize={{ base: "18px", md: "20px", lg: "30px" }}
          style={{ fontWeight: "600" }}
        >
          MyChats
        </Text>
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "14px", md: "12px", lg: "15px" }}
            rightIcon={<AddIcon />}
            w={{ md: "100px", lg: "150px" }}
          >
            Create Group
          </Button>
        </GroupChatModal>
      </Box>

      {/* for the chat lits  */}
      <Box
        display="flex"
        flexDirection="column"
        p={3}
        bg="#9d27e7"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => {
                  setselectedchat(chat);
                }}
                cursor="pointer"
                bg={selectedchat === chat ? "#ff00e7" : "white"}
                color={selectedchat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text style={{ fontWeight: "600" }}>
                  {!chat.isGroupChat
                    ? getSender(
                        JSON.parse(localStorage.getItem("userInfo")),
                        chat.users
                      )
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
