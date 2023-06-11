import { Box } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/pageComponents/SideDrawer";
import MyChats from "../components/pageComponents/MyChats";
import ChatBox from "../components/pageComponents/ChatBox";
import { useState } from "react";
const Chat = () => {
  const myStyle = {
    // color: "white",
    width: "100%",
  };
  const { user } = ChatState();
  const [fetchAgain, setfetchAgain] = useState(false);
  return (
    <div style={myStyle}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        flex-direction="row"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chat;
