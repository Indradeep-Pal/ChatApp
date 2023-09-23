import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom"

const Login = () => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const history = useHistory()

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: "Please Fill all the Feilds",
                status: "warning",
                duration: 4000,
                isClosable: true,
                position: "top",
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "https://webappp.onrender.com/api/user/login",
                { email, password },
                config
            );
            toast({
                title: "Login Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            sessionStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            history.push("/chats");
            window.location.reload(false)
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
    };
    return (
        <VStack spacing='5px' color='black'>

            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter Your Email'
                    border='1px' borderColor='black'
                    value={email}
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
                        value={password}
                        onChange={
                            (e) => setPassword(e.target.value)
                        } 
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" colorScheme='blue'
                            onClick={handleClick}>
                            {
                                show ? "Hide" : "Show"
                            } </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button colorScheme='blue' width="100%"
                style={
                    { marginTop: 15 }
                }
                isLoading={loading}
                onClick={submitHandler}>
                Login
            </Button>

            <Button variant="solid" colorScheme='red' width="100%"
                onClick={
                    () => {
                        setEmail("guest@example.com");
                        setPassword("123456");
                    }
                }>
                Get Guest User Credentials
            </Button>
        </VStack>
    )
}
export default Login;
