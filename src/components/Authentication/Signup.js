import {
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    VStack,
    useToast
} from '@chakra-ui/react';
import React, { useState } from 'react';
import axios from 'axios';
import {useHistory} from  "react-router-dom";


const Signup = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [confirmpassword, setConfirmpassword] = useState();
    const [password, setPassword] = useState();
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const history = useHistory();

    const handleClick = () => setShow(!show);
    
    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return;
        }


        if (pics.type === 'image/jpeg' || pics.type === 'image/png' || pics.type === 'image/jpg') {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "walkie-talkie")
            data.append("cloud_name", "dmnwzwtne")

            fetch("https://api.cloudinary.com/v1_1/dmnwzwtne/image/upload", {
                method: "post",
                body: data
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data)
                    setPic(data.url.toString())
                    setLoading(false);
                });
        }
        else {
            toast({
                title: "Please select valid type of image .jpg/.jpeg/.png",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top"
            })
            return;

        }
    }
    const submitHandler = async() => {
        setLoading(true);
        if(!name || !email || !password || !confirmpassword){
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return;
        }
        if(password !== confirmpassword){
            toast({
                title: "Passwords donot match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            return;
        }

        try{
            const config={
                headers : {
                    "Content-type" : "application/json",
                },
            };
            const {data} =await axios.post(
            "/api/user",
            {name,email,password,pic},
            config
            );
            
            toast({
                title: "Registration successfull",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            sessionStorage.setItem("userInfo",JSON.stringify(data))
            setLoading(false);
            history.push('/chats');
            window.location.reload(false);
        }
        catch(err){
            toast({
                title: "Error occured",
                description : err.response.data.message ,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            })
            setLoading(false);
            return;
        }
     }

    return (
        <VStack spacing='5px'>
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input placeholder='Enter Your Name'
                    border='1px' borderColor='black'

                    onChange={
                        (e) => setName(e.target.value)
                    } />
            </FormControl>

            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='--Enter Your Email--'
                    border='1px' borderColor='black'
                    onChange={
                        (e) => setEmail(e.target.value)
                    } />
            </FormControl>

            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input type={
                        show ? "text" : "password"
                    }
                        placeholder='Enter Your Password'
                        border='1px' borderColor='black'

                        onChange={
                            (e) => setPassword(e.target.value)
                        } />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" colorScheme='blue'
                            onClick={handleClick}>
                            {
                                show ? "Hide" : "Show"
                            } </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='password' isRequired="isRequired">

                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input type={
                        show ? "text" : "password"
                    }
                        placeholder='Confirm Password'
                        border='1px' borderColor='black'

                        onChange={
                            (e) => setConfirmpassword(e.target.value)
                        } />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" colorScheme='blue'
                            onClick={handleClick}>
                            {
                                show ? "Hide" : "Show"
                            } </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <FormControl id='pic'>
                <FormLabel>Upload Your Picture</FormLabel>
                <Input type="file"
                    p={1.5}
                    accept="image/*"
                    border='1px' borderColor='black'

                    onChange={
                        (e) => postDetails(e.target.files[0])
                    } />


            </FormControl>

            <Button colorScheme='blue' width="100%"
                style={
                    { marginTop: 15 }
                }
                isLoading={
                    loading
                }

                onClick={submitHandler}>
                Sign Up
            </Button>
        </VStack>
    )
}
export default Signup;