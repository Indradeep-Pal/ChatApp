import React, { useState } from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useToast,
    Box,
    FormControl,
    Input,
    Spinner,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/hooks'
import {Button} from '@chakra-ui/button'
import { IconButton } from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../../UserAvatar/UserBadgeItem'
import axios from "axios";
import UserListItem from '../../UserAvatar/UserListItem'


const UpdateGroupModal = ({fetchAgain,setFetchAgain,fetchMessages}) => {
    
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameLoading] = useState(false);
    const toast = useToast();


    const {selectedChat,setSelectedChat,user}=ChatState()
  

    const handleAddUser=async(user1)=>{
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: "Only admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                "/api/chat/groupadd",
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.put(
                `/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                },
                config
            );

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    };

    const handleRename=async()=>{
        if(!groupChatName) return
        try {
            setRenameLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            const { data } = await axios.put('/api/chat/rename',{
                chatId : selectedChat._id,
                chatName : groupChatName
            },
            config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
            
        } catch (error) {
            toast({
                title: "Error Occured !",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            setRenameLoading(false)
        }
        setGroupChatName("")
    }

    const handleSearch=async(query)=>{
        setSearch(query)
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);

        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to load search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
        }
    }
  
   return (
    <>
          <IconButton onClick={onOpen} display={{base : "flex"}} icon={<ViewIcon />}  />
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
              <ModalOverlay />
              <ModalContent>
                  <ModalHeader
                    fontSize="35px"
                    fontFamily="Work sans"
                    display="flex"
                    justifyContent="center"
                  >{selectedChat.chatName}</ModalHeader>
                  <ModalCloseButton />
                    <ModalBody display="flex" flexDirection="column" alignItems="center">
                    <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                       {selectedChat.users.map(u=>(
                           <UserBadgeItem
                               key={u._id}
                               user={u}
                               handleFunction={() => handleRemove(u)}
                           />
                       ))}
                      </Box>
                        <FormControl display="flex">
                            <Input
                                placeholder="New Group Name"
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme="teal"
                                ml={1}
                                isLoading={renameloading}
                                onClick={handleRename}
                            >
                                Update
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder="Add User to group"
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {loading ? (
                            <Spinner size="lg" />
                        ) : (
                                searchResult.map(user => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleAddUser(user)} />
                                ))
                        )}


                  </ModalBody>

                  <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red" mr={3}>
                            Leave Group
                        </Button>
                      <Button colorScheme='blue'  onClick={onClose}>
                          Close
                      </Button>
                     
                  </ModalFooter>
              </ModalContent>
          </Modal>
    </>
  )
}

export default UpdateGroupModal