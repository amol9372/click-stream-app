import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Center,
} from "@chakra-ui/react";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would typically handle the signup logic,
    // e.g., sending the data to a server or using Firebase Authentication
    console.log("Email:", email, "Password:", password);
  };

  return (
    <ChakraProvider>
      <Center>
        <Box p={4} w={400} alignItems={"center"} marginTop={150}>
          <VStack spacing={4} align="stretch">
            <Heading>Sign Up</Heading>
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
                Sign Up
              </Button>
            </form>

            <Text mt={2}>
              Already have an account? <a href="/login">Login</a>
            </Text>
          </VStack>
        </Box>
      </Center>
    </ChakraProvider>
  );
}

export default Signup;
