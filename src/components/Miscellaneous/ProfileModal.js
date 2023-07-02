import { IconButton} from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/hooks';
import { ViewIcon } from '@chakra-ui/icons';
import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Image,
    Text,
} from '@chakra-ui/react';

const ProfileModal = ({user,children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
    {
        children ? (<span onClick={onOpen}>{children}</span>
        ):(
            <IconButton d={{ base: "flex" }} icon={<ViewIcon  />} onClick={onOpen} />
        )
    }
          <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
              <ModalOverlay />
              <ModalContent h="410px">
                  <ModalHeader
                    fontSize="40px"
                    fontFamily="Work sans"
                    d="flex"
                    justifyContent="center"
                  >
                    {user.name}
                </ModalHeader>
                  <ModalCloseButton />
                  <ModalBody
                    display='flex'
                    flexDirection='column'
                    justifyContent='space-between'
                    alignItems="center"

                  >
                     <Image 
                      borderRadius="full"
                      boxSize="150px"
                      src={user.pic}
                      alt={user.name} />
                      <Text fontSize={{base:'28px',md:'32px'}}
                        fontFamily="Work sans">
                            Email : {user.email}
                      </Text>
                  </ModalBody>

                  <ModalFooter>
                      <Button  mr={3} onClick={onClose}>
                          Close
                      </Button>

                  </ModalFooter>
              </ModalContent>
          </Modal>
    </>
  )
}

export default ProfileModal;