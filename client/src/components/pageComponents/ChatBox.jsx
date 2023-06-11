import React from "react";
import { Box, Button, useToast } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setfetchAgain }) => {
  const { selectedchat } = ChatState();
  return (
    <Box
      display={{ base: selectedchat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDirection="column"
      p={3}
      // bg="white"
      backgroundColor="#d950d9"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />
    </Box>
  );
};

export default ChatBox;
