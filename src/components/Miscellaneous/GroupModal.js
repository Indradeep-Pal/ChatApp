import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    Input,
    Box,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/hooks';
import { Button } from '@chakra-ui/button';
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { ChatState } from '../../Context/ChatProvider';
import axios from 'axios';
import UserListItem from '../../UserAvatar/UserListItem';
import UserBadgeItem from '../../UserAvatar/UserBadgeItem';


const GroupModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName, setGroupChatName] = useState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const { user, chats, setChats } = ChatState();


    const handleSearch=async(query)=>{
        setSearch(query)
        if(!query){
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

    const handleSubmit = async () => {
            if (!groupChatName || !selectedUsers) {
                toast({
                    title: "Please fill all the feilds",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.post(
                    `/api/chat/group`,
                    {
                        name: groupChatName,
                        users: JSON.stringify(selectedUsers.map((u) => u._id)),
                    },
                    config
                );
                setChats([data, ...chats]);
                onClose();
                toast({
                    title: "New Group Chat Created!",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } catch (error) {
                toast({
                    title: "Failed to Create the Chat!",
                    description: "More than 2 members needed",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                });
            }
        };

    const handleGroup=(userToAdd)=>{
        if(selectedUsers.includes(userToAdd)){
            toast({
                title: "User Already added",
                description: "Failed to load search results",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            return
        }
        setSelectedUsers([...selectedUsers,userToAdd]);
    }

    const handleDelete=(delUser)=>{
        setSelectedUsers(selectedUsers.filter(sel=>sel._id !== delUser._id))
    }


  return (
    <>  
          <span onClick={onOpen}>{children}</span>
              <Modal isOpen={isOpen} onClose={onClose} isCentered>
                  <ModalOverlay />
                  <ModalContent>
                      <ModalHeader
                        fontSize="35px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"

                      >Create Group Chat</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody
                      display="flex" flexDirection="column" mr={3} alignItems="center"
                      >
                      <FormControl>
                          <Input
                              placeholder="Chat Name"
                              isRequired
                              mb={3}
                              onChange={(e) => setGroupChatName(e.target.value)}
                          />
                      </FormControl>
                      <FormControl>
                          <Input
                              placeholder="Add Users eg: Indradeep , Ushasi"
                              mb={1}
                              onChange={(e) => handleSearch(e.target.value)}
                          />
                      </FormControl>
                    <Box display="flex" flexWrap="wrap">
                        {selectedUsers.map(u=>(
                            <UserBadgeItem
                                key={user._id}
                                user={u}
                                handleFunction={()=>handleDelete(u)}
                            />
                        ))}
                    </Box>
                        {loading ? <div>loading</div> : (
                          searchResult.map(user => (
                              <UserListItem
                                  key={user._id}
                                  user={user}
                                  handleFunction={() => handleGroup(user)} />
                          ))
                        )
                        
                        }

                      </ModalBody>

                      <ModalFooter>
                          <Button colorScheme='blue' mr={2} onClick={handleSubmit}>
                              Create
                          </Button>
                         
                      </ModalFooter>
                  </ModalContent>
              </Modal>

    </>
  )
}

export default GroupModal