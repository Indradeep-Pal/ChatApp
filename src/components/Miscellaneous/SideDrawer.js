import React, {  useState } from 'react'
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    useToast,
} from '@chakra-ui/react'
import {Box, Tooltip,Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider} from '@chakra-ui/react';
import {BellIcon,ChevronDownIcon} from '@chakra-ui/icons';
import {Button} from '@chakra-ui/button'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import {Input} from '@chakra-ui/input';
import { useHistory } from "react-router-dom";
import { useDisclosure } from '@chakra-ui/hooks';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../../UserAvatar/UserListItem';
import { Spinner } from '@chakra-ui/spinner';
import { getSender } from '../../config/ChatLogic';
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SideDrawer = () => {
    const [search,setSearch]=useState("")
    const [searchResult,setsearchResult]=useState([])
    const [loading,setLoading]=useState(false)
    const [loadingChat,setloadingChat]=useState();

    
    const { user,setSelectedChat,chats,setChats,notification,setNotification} = ChatState()

    const history = useHistory()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const toast = useToast();

    const logoutHandler = () => {
        sessionStorage.clear();
        history.push("/")
    }

    const handleSearch=async()=>{
        if(!search){
            toast({
                title:'Please enter something to search',
                status:"warning",
                duration:5000,
                isClosable:true,
                position:"top-left"
            })
            return;
        }
        try {
            setLoading(true);
            const config={
                headers : {
                    Authorization:`Bearer ${user.token}`,
                },
            };

            const {data}=await axios.get(`https://webappp.onrender.com/api/user?search=${search}`,config);
            setLoading(false);
            setsearchResult(data); 
        } catch (error) {
            toast({
                title:"Error Occured",
                description : "Failed to load search results",
                status : "error",
                duration : 5000,
                isClosable : true,
                position : "top"
            })
        }

    }

    const accessChat =async(userId)=>{
        try {
            setloadingChat(true);
            const config = {
                headers: {
                    "Content-type" : "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const {data} = await axios.post('https://webappp.onrender.com/api/chat',{userId},config);
            
            if(!chats.find((c)=> c.id===data.id))
                setChats([data,...chats])
            
            setSelectedChat(data);
            setloadingChat(false)
            onClose();
            window.location.reload(false)


        } catch (error) {
            toast({
                title: "Error Occured fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            setloadingChat(false)
        }
    }

  return (
    <>
        <Box
            display="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="10px 10px 10px 10px" borderWidth='3px' borderColor='white'
        >
            <Tooltip label='Search users to chat'
                hasArrow
                placement='bottom-end'
            >
            <Button bg='lightgray' onClick={onOpen}>
                <i className="fas fa-search"></i>
                <Text display={{base:"none", md:"flex"}} px="4">
                    Search User
                </Text>
            </Button>
            </Tooltip>
            <Text fontWeight='bold' fontSize="2xl" fontFamily="Work sans">👀 Walkie-Talkie 👀</Text>
            <div>
                <Menu>
                    <MenuButton p="1">
                          <NotificationBadge
                              count={notification.length}
                              effect={Effect.SCALE}
                          />
                        <BellIcon  fontSize='2xl' m="1" />
                    </MenuButton>
                      <MenuList pl={2}>
                          {!notification.length && "No New Messages"}
                          {notification.map((notif) => (
                              <MenuItem
                                  key={notif._id}
                                  onClick={() => {
                                      setSelectedChat(notif.chat);
                                      setNotification(notification.filter((n) => n !== notif));
                                  }}
                              >
                                  {notif.chat.isGroupChat
                                      ? `New Message in ${notif.chat.chatName}`
                                      : `New Message from ${getSender(user, notif.chat.users)}`}
                              </MenuItem>
                          ))}
                      </MenuList>
                </Menu>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        <Avatar size='sm' cursor='pointer' name={user.name} src={user.pic}></Avatar>
                    </MenuButton>
                    <MenuList>
                        <ProfileModal user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModal>
                        <MenuDivider>

                        </MenuDivider>
                        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </Box>

        <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
            
            <DrawerBody>
                <Box display="flex" pb={2}>
                    <Input
                        placeholder='Search by name or email'
                        
                        mr={2}
                        value={search}
                        borderRadius='2px'
                        borderColor='black'
                        onChange={(e)=>setSearch(e.target.value)}
                        />
                    <Button onClick={handleSearch}>Go</Button>
                </Box>
                {loading ? (
                    <ChatLoading />

                ) : (
                        searchResult.map(user=> (
                          <UserListItem
                              key={user._id}
                              user={user}
                              handleFunction={() => accessChat(user._id)} />
                        ))
                )}
                {loadingChat && <Spinner ml="auto" display="flex"></Spinner>}
            </DrawerBody>
            </DrawerContent>
        </Drawer>
    </>
  )
}

export default SideDrawer
