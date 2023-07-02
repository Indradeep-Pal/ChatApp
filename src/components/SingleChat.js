import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import {Box,FormControl,IconButton,Input,Spinner,Text, Tooltip} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogic';
import ProfileModal from './Miscellaneous/ProfileModal';
import UpdateGroupModal from './Miscellaneous/UpdateGroupModal';
import axios from "axios";
import {useToast} from '@chakra-ui/react';
import ScrollableChat from './Miscellaneous/ScrollableChat';
import io from 'socket.io-client';
import './style.css'

const ENDPOINT = "http://localhost:5000";
var socket ,selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected,setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    const toast = useToast();

   

    const sendMessage=async(event)=>{
        if (event.key === "Enter"   && newMessage){
            socket.emit('stop typing',selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                socket.emit("new message",data);
                
                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    const sendMessageViaButton = async () => {
        if (newMessage) {
            socket.emit('stop typing', selectedChat._id)
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat,
                    },
                    config
                );
                socket.emit("new message", data);

                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            console.log(messages)
            setMessages(data);
            
            setLoading(false);
            socket.emit('join chat',selectedChat._id);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };




    const typingHandler=(e)=>{
        setNewMessage(e.target.value)

         if(!socketConnected) return;

        // if(!typing){
        //     setTyping(true)
        //     socket.emit('typing',selectedChat._id);
        // }

        // let lastTypingTime = new Date().getTime();
        // var timerlength = 3000;
        // setTimeout(()=>{
        //     var timeNow = new Date().getTime();
        //     var timeDiff = timeNow - lastTypingTime;

        //     if(timeDiff >= timerlength && typing){
        //         socket.emit('stop typing',selectedChat._id);
        //         setTyping(false);
        //     }
        // },timerlength);
    };



    useEffect(()=>{
        fetchMessages();
        selectedChatCompare = selectedChat;
        // eslint-disable-next-line
    },[selectedChat])


    useEffect(()=>{
        socket =io(ENDPOINT);
        socket.emit("setup",user);
        socket.on('connected',()=>setSocketConnected(true))
        socket.on('typing',()=>setIsTyping(true));
        socket.on('stop typing',()=> setIsTyping(false))
        
        
        //eslint-disable-next-line
    },[])

    useEffect(()=>{
        socket.on("message received",(newMessageReceived)=>{
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id){
                if(!notification.includes(newMessageReceived.chat._id)){
                    setNotification([newMessageReceived,...notification]);
                    setFetchAgain(!fetchAgain);
                }

            }else{
                setMessages([...messages,newMessageReceived]);
            }
        })
    })
    
    return (
        <>
            {
                selectedChat ? (
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
                                icon={<ArrowBackIcon bg="lightgray" />}
                                onClick={() => setSelectedChat("")}
                             />
                            {
                            (!selectedChat.isGroupChat) ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal
                                    user={getSenderFull(user, selectedChat.users)}
                                />
                            </>
                            ) : (
                            <>
                                {selectedChat.chatName}
                                <UpdateGroupModal
                                 fetchAgain={fetchAgain}
                                 setFetchAgain={setFetchAgain}
                                 fetchMessages={fetchMessages} />
                            </>
                            
                            )}

                        </Text>
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="flex-end"
                            p={3}
                            bg="#E8E8E8"
                            w="100%"
                            h="100%"
                            borderRadius="lg"
                            overflowY="hidden"
                        >
                            {loading ? (
                                <Spinner 
                                    size="xl"
                                    w={20}
                                    h={20}
                                    alignSelf="center"
                                    margin="auto"
                                />
                            ):(
                            <div className='messages'>
                                <ScrollableChat messages={messages} />
                                
                            </div>)
                            
                        }
                            
                        <FormControl  onKeyDown={sendMessage} isRequired mt={3}>
                                {/* {isTyping ? (<div className='loading'>
                                    Typing...
                                </div>) :( <></>)} */}
                                <Box display="flex">
                                <Input
                                    variant="filled"
                                    bg="white"
                                    borderColor="black"
                                    placeholder = "Enter a message here ..."
                                    onChange={typingHandler}
                                    value={newMessage}

                                />
                                <Tooltip label='Send'
                                    hasArrow
                                    placement='top'
                                >
                                    <i className="fa fa-paper-plane" aria-hidden="true" onClick={sendMessageViaButton}
                                    style={{
                                        border: "1px solid",
                                        position: "",
                                        top: "50%",
                                        left: "50%",
                                        padding: "10px"
                                    }}
        
                                ></i>
                                </Tooltip>
                            </Box>
                            </FormControl>
                        </Box>
                    </>
                ):(
                    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )

                
            }
        </>
  )
}

export default SingleChat