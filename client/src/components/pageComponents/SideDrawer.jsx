import React, { useState } from "react";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import ChatLoading from "./ChatLoading";
import UserList from "./UserList";
import { getSender } from "../../logics/ChatLogics";
import NotificationBadge, { Effect } from "react-notification-badge";
const SideDrawer = () => {
  const [search, setsearch] = useState("");
  const [searchResult, setsearchResult] = useState([]);
  const [loading, setloading] = useState(false);
  const [loadingChat, setloadingChat] = useState(false);
  const {
    user,
    setselectedchat,
    chats,
    setchats,
    notification,
    setnotification,
  } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const boxStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    w: "100%",
    p: "5px 10px 5px 10px",
    borderWidth: "5px",
  };

  //function to logout the user
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  //function to handle the search
  const handleSearch = async () => {
    if (search) {
      try {
        setloading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.get(
          ` https://talktime-87ms.onrender.com/api/user/?search=${search}`,
          config
        );
        setloading(false);
        setsearchResult(data);
      } catch (error) {
        toast({
          title: "Failed to load the user",
          description: "Error occured while searching the user",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const openChat = async (userId) => {
    try {
      setloadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "https://talktime-87ms.onrender.com/api/chat",
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setchats([data, ...chats]);
      }
      setselectedchat(data);
      setloadingChat(false);
      document.getElementById("scroll").scrollTop =
        document.getElementById("scroll").scrollHeight;
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: "Error occured while opening the chat",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box style={boxStyle}>
        {/* for the search button  */}
        <Tooltip label="Search users" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ color: "#2db8eb" }}
            ></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search Users
            </Text>
          </Button>
        </Tooltip>

        {/* for the app title in the header  */}
        <Text
          fontFamily="Work sans"
          fontSize="2xl"
          style={{ fontWeight: "600" }}
        >
          Talk-Time
        </Text>

        {/* For Menu Button  */}
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              {/* for the bell icon  */}
              <BellIcon fontSize={20} m={1} />
            </MenuButton>
            {/* for the menu list  */}
            <MenuList pl={2}>
              {!notification.length && "No notifications"}
              {notification.map((notify) => (
                <MenuItem
                  key={notify._id}
                  onClick={() => {
                    setselectedchat(notify.chat);
                    setnotification(
                      notification.filter(
                        (n) => n.sender._id !== notify.sender._id
                      )
                    );
                  }}
                >
                  {notify.chat.isGroupChat
                    ? `Message from ${notify.chat.chatName}`
                    : `Message from ${getSender(user, notify.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* menu for profile  */}
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                //   displays the profile picture of the user
                size="sm"
                cursor="pointer"
                //   if the profile picture is not present, then display the initials
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* Drawer for the search on the left side  */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottom="1px">Search User</DrawerHeader>
          <DrawerBody>
            <Box display="flex" paddingBottom={2}>
              <Input
                placeholder="Search by email or name"
                marginRight={2}
                value={search}
                onChange={(e) => setsearch(e.target.value)}
              />
              <Button onClick={handleSearch}>
                <SearchIcon />
              </Button>
            </Box>
            {loading ? (
              //   if its loading then show the loading skeleton
              <ChatLoading />
            ) : (
              //   if its not loadin then show the search results using a chatlist comp
              searchResult?.map((user) => (
                <UserList
                  key={user._id} // for rendering unique component
                  user={user} // for displaying user info in chat list
                  handleFunction={() => openChat(user._id)} // to open the chat window with the clicked user
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
