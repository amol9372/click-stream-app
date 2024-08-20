import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Center,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
} from "@chakra-ui/react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically handle the login logic,
    // e.g., sending the data to a server or using Firebase Authentication
    console.log("Email:", email, "Password:", password);
  };

  return (
    <ChakraProvider>
      <Center h="100vh">
        <Box p={4} w="350px">
          <VStack spacing={4} align="stretch">
            <Heading>Login</Heading>
            <form onSubmit={handleSubmit}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired mt={4}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>

              <Button type="submit" colorScheme="blue" mt={6}>
                Login
              </Button>
            </form>

            <Text mt={2}>
              Don't have an account? <a href="/sign-up">Sign Up</a>
            </Text>
          </VStack>
        </Box>
      </Center>
    </ChakraProvider>
  );
}

export default Login;
