import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Button,
  useToast,
  Box,
  FormControl,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import UserBadge from "./UserBadge";
import axios from "axios";
import UserList from "./UserList";
const UpdateGroupModal = ({ fetchAgain, setfetchAgain, fetchMsgs }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedchat, setselectedchat, user } = ChatState();

  //for storing the updated info
  const [groupName, setgroupName] = useState("");
  const [loading, setloading] = useState(false);
  const [search, setsearch] = useState("");
  const [searchResult, setsearchResult] = useState([]);

  const [renameLoader, setrenameLoader] = useState(false);

  const toast = useToast();

  // to remove the group members
  const handleRemove = async (userToRemove) => {
    if (
      selectedchat.groupAdmin._id !== user._id &&
      userToRemove._id !== user._id
    ) {
      toast({
        title: "Only Admin can remove users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    //   logic to remove the user
    try {
      setloading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "https://talktime-87ms.onrender.com/api/chat/groupremove",
        {
          chatId: selectedchat._id,
          userId: userToRemove._id,
        },
        config
      );

      userToRemove._id === user._id ? setselectedchat() : setselectedchat(data);
      setfetchAgain(!fetchAgain);
      fetchMsgs();
      setloading(false);
    } catch (error) {
      toast({
        title: "Failed to remove the user",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setloading(false);
    }
  };

  // to handle the add user functionality
  const handleAddUser = async (userToAdd) => {
    if (selectedchat.users.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User already present in the group",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedchat.groupAdmin._id !== user._id) {
      toast({
        title: "Only Admin can add users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      setloading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "https://talktime-87ms.onrender.com/api/chat/groupadd",
        {
          chatId: selectedchat._id,
          userId: userToAdd._id,
        },
        config
      );
      setselectedchat(data);
      setfetchAgain(!fetchAgain);
      setloading(false);
    } catch (error) {
      toast({
        title: "Failed to add the user",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  // to handle the user search
  const searchHandler = async (search) => {
    setsearch(search);
    if (!search) {
      return;
    }
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
        title: "Couldn't search the users",
        description: "Error fetching the users",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  // to update the group name
  const renameHandler = async () => {
    if (!groupName) {
      toast({
        title: "Enter new group name to update",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      setrenameLoader(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "https://talktime-87ms.onrender.com/api/chat/renamegroup",
        {
          chatId: selectedchat._id,
          chatName: groupName,
        },
        config
      );

      setselectedchat(data);
      setfetchAgain(!fetchAgain);
      setrenameLoader(false);
    } catch (error) {
      toast({
        title: "Failed to update group name",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      setrenameLoader(false);
    }
    setgroupName("");
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedchat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedchat.users.map((u) => (
                <UserBadge
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Enter new group name"
                mb={3}
                value={groupName}
                onChange={(e) => setgroupName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoader}
                onClick={renameHandler}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add users to group"
                mb={1}
                onChange={(e) => searchHandler(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner ml="auto" display="flex" />
            ) : (
              searchResult?.map((user) => (
                <UserList
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupModal;
