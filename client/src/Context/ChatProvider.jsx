import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setuser] = useState();
  const [selectedchat, setselectedchat] = useState(undefined);
  const [chats, setchats] = useState([]);
  const [notification, setnotification] = useState([]);

  useEffect(() => {
    //setting the user state by fetching the userInfo stored in the localstorage
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setuser(userInfo);

    //if the userInfo is not present, the redirect to login
    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setuser,
        selectedchat,
        setselectedchat,
        chats,
        setchats,
        notification,
        setnotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
